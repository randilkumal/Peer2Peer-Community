import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FileViewer from '../../components/common/FileViewer';
import API from '../../utils/api';
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Calendar,
  User,
  Star,
  MessageSquare,
  Clock,
  File,
  Sparkles,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Eye,
  Globe
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoView = searchParams.get('view') === 'true';
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Viewer state
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    fileType: '',
    downloadUrl: ''
  });

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  useEffect(() => {
    if (resource && autoView) {
      handleView();
    }
  }, [resource, autoView]);

  const fetchResourceDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await API.get(`/resources/${id}`);
      setResource(response.data.resource);
      
      const reviewsResponse = await API.get(`/reviews/resource/${id}`);
      setReviews(reviewsResponse.data.reviews || []);
      
      const resData = response.data.resource;
      if (resData?.title) {
        fetchAISuggestions(resData.title);
      }
    } catch (error) {
      toast.error('Failed to load resource details');
      navigate('/resources');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchAISuggestions = async (query) => {
    try {
      setLoadingAI(true);
      const response = await API.get(`/ai/suggest-resources?query=${encodeURIComponent(query)}`);
      setAiSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setAiSuggestions([]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      window.open(`${apiBase.replace(/\/$/, '')}/resources/${id}/download?token=${token}`, '_blank');
      setResource(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleView = async () => {
    if (!resource) return;
    setViewerState({
      isOpen: true,
      fileUrl: `/resources/${id}/view`,
      fileName: resource.fileName,
      fileType: resource.fileType,
      downloadUrl: `/resources/${id}/download`
    });
  };


  const getFileIcon = (fileType, resourceType) => {
    const typeThemes = {
      'Lecture Notes': { text: 'text-blue-500', bar: 'bg-blue-500', hover: 'bg-blue-50' },
      'Assignments':   { text: 'text-green-500', bar: 'bg-green-500', hover: 'bg-green-50' },
      'Past Papers':   { text: 'text-red-500', bar: 'bg-red-500', hover: 'bg-red-50' },
      'Textbooks':     { text: 'text-purple-500', bar: 'bg-purple-500', hover: 'bg-purple-50' },
      'Study Guides':  { text: 'text-amber-500', bar: 'bg-amber-500', hover: 'bg-amber-50' },
      'Other':         { text: 'text-slate-500', bar: 'bg-slate-500', hover: 'bg-slate-50' },
    };
    const theme = typeThemes[resourceType] || typeThemes['Other'];

    return (
      <div className="w-20 min-w-[5rem] h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className={`absolute inset-0 ${theme.hover} opacity-0 group-hover:opacity-100 transition-opacity`} />
        <FileText className={`w-10 h-10 ${theme.text} relative z-10`} />
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.bar}`} />
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Fetching resource details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!resource) return null;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100 : 0
  }));

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Main Content Layout - 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column - Main Details & Reviews */}
          <div className="flex-1 space-y-6">
            {/* Back Breadcrumb */}
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Resources
            </button>

            {/* Main Resource Card */}
            <Card className="p-8 border-gray-200/60 shadow-sm rounded-xl overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Visual Icon */}
                {getFileIcon(resource.fileType, resource.resourceType)}

                {/* Header Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info" className="!bg-blue-100 !text-blue-600 font-normal px-3 py-1 rounded-lg">
                      {resource.moduleCode}
                    </Badge>
                    <Badge variant="danger" className="!bg-red-50 !text-red-500 font-normal px-3 py-1 rounded-lg">
                      {resource.fileType?.split('/')?.pop()?.toUpperCase() || 'PDF'}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {resource.title}
                  </h1>

                  <div className="inline-block">
                    {(() => {
                      const typeColors = {
                        'Lecture Notes': 'bg-blue-50 text-blue-900',
                        'Assignments':   'bg-green-50 text-green-900',
                        'Past Papers':   'bg-red-50 text-red-900',
                        'Textbooks':     'bg-purple-50 text-purple-900',
                        'Study Guides':  'bg-amber-50 text-amber-900',
                        'Other':         'bg-slate-50 text-slate-900',
                      };
                      const colors = typeColors[resource.resourceType] || 'bg-slate-50 text-slate-900';
                      return (
                        <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${colors}`}>
                          {resource.resourceType}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{resource.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{resource.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400 text-xs mt-0.5">({reviews.length})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                  {resource.description || resource.title}
                </p>
              </div>

              {/* File Information Box */}
              <div className="mt-8 bg-gray-50/50 rounded-xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Information</p>
                  <p className="text-xs font-bold text-gray-400">File Name</p>
                  <p className="text-sm font-medium text-gray-700 break-all">{resource.fileName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] hidden md:block">&nbsp;</p>
                  <p className="text-xs font-bold text-gray-400">Uploaded</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(resource.createdAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  icon={Download}
                  iconPosition="left"
                  onClick={handleDownload}
                  className="flex-1 !rounded-lg font-bold py-3.5 bg-blue-600 hover:bg-blue-700 shadow-md transition-all text-sm justify-center"
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  icon={Eye}
                  iconPosition="left"
                  onClick={handleView}
                  className="flex-1 !rounded-lg font-bold py-3.5 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all text-sm justify-center"
                >
                  View Content
                </Button>
              </div>
            </Card>

            {/* Reviews & Ratings Section */}
            <Card className="p-8 border-gray-200/60 shadow-sm rounded-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-8 font-primary">Reviews & Ratings</h2>
              
              <div className="flex flex-col lg:flex-row gap-12 items-start bg-gray-50/30 rounded-2xl p-8 border border-gray-100">
                {/* Score Display */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 lg:w-48 self-center">
                  <span className="text-7xl font-bold text-gray-900 tracking-tight">
                    {resource.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-6 h-6 ${s <= Math.round(resource.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-500">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                </div>

                {/* Distribution Bar */}
                <div className="flex-1 w-full space-y-3">
                  {ratingDistribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-4 group">
                      <span className="text-sm font-bold text-gray-500 w-4 tracking-tighter">{item.star} ★</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-400 w-4 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="mt-12 space-y-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-6 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                          {rev.reviewer?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{rev.reviewer?.fullName || 'Academic Member'}</p>
                          <p className="text-xs font-medium text-gray-400">{formatDate(rev.createdAt, true) || 'Mar 20, 2026'}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-medium">No reviews yet for this resource.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full lg:w-[350px] space-y-6 flex-shrink-0">
            {/* Uploaded By Card */}
            <Card className="p-6 border-gray-200/60 shadow-sm rounded-xl relative overflow-hidden group bg-white">
              <GraduationCap className="absolute -right-6 -top-6 w-32 h-32 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-5">
                  <GraduationCap className="w-4 h-4 text-gray-500" /> Uploaded By
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xl border-2 border-white shadow-sm">
                    {resource.uploader?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 leading-tight">
                      {resource.uploader?.fullName || 'Academic Member'}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 capitalize mt-1">
                      {resource.uploader?.role || 'Student'}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pt-5 border-t border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {resource.uploader?.academicYear || 'Year 1'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialization</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {resource.uploader?.specialization || 'IT'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* File Viewer Modal */}
        <FileViewer
          isOpen={viewerState.isOpen}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
          fileUrl={viewerState.fileUrl}
          fileName={viewerState.fileName}
          fileType={viewerState.fileType}
          downloadUrl={viewerState.downloadUrl}
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentResourceDetail;