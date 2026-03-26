import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Calendar,
  User,
  Star,
  Eye,
  MessageSquare,
  Clock,
  File
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  const fetchResourceDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await API.get(`/resources/${id}`);
      setResource(response.data.resource);
      
      // Fetch reviews
      const reviewsResponse = await API.get(`/reviews/resource/${id}`);
      setReviews(reviewsResponse.data.reviews || []);
    } catch (error) {
      toast.error('Failed to load resource details');
      console.error('Error fetching resource:', error);
      navigate('/resources');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      window.open(`${apiBase.replace(/\/$/, '')}/resources/${id}/download?token=${token}`, '_blank');
      
      // Update local count
      setResource(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleView = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Open the file in a new tab to view it directly in the browser
      window.open(`${apiBase.replace(/\/$/, '')}/resources/${id}/view?token=${token}`, '_blank');
      
      // Keep track of views locally to update UI
      setResource(prev => ({ ...prev, viewCount: (prev.viewCount || 0) + 1 }));
    } catch (error) {
      toast.error('Failed to view file');
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-12 h-12" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    if (type.includes('doc')) return <FileText className="w-12 h-12 text-blue-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
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

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          icon={ArrowLeft}
          onClick={() => navigate('/resources')}
          className="mb-6"
        >
          Back to Resources
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden shadow-xl border-0 rounded-3xl">
              <div className="bg-primary-600 p-8 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      {getFileIcon(resource.fileType)}
                    </div>
                    <div>
                      <Badge variant="white" className="mb-2 text-primary-700 font-bold uppercase tracking-wider text-xs">
                        {resource.resourceType}
                      </Badge>
                      <h1 className="text-3xl font-black leading-tight">{resource.title}</h1>
                      <p className="text-primary-100 font-bold mt-1 tracking-widest">{resource.moduleCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white">
                <div className="space-y-8">
                  {/* Performance stats row */}
                  <div className="flex items-center gap-12 border-b border-gray-100 pb-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rating</span>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-black text-gray-900">{resource.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs font-bold text-gray-400">({reviews.length} reviews)</span>
                      </div>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-12">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Downloads</span>
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary-500" />
                        <span className="text-xl font-black text-gray-900">{resource.downloadCount || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-12">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Views</span>
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-gray-400" />
                        <span className="text-xl font-black text-gray-900">{resource.viewCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      {resource.description || 'No description provided for this resource.'}
                    </p>
                  </div>

                  {/* Reviews Section */}
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                      User Experience Feed <MessageSquare className="w-5 h-5 text-primary-500" />
                    </h3>
                    {reviews.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-bold">No reviews shared yet. Be the first to download and share your thoughts!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((rev) => (
                          <div key={rev._id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center font-black text-primary-600 text-sm">
                                  {rev.reviewer?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-black text-gray-900 leading-none mb-1">{rev.reviewer?.fullName || 'Academic Member'}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(rev.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-black text-gray-700">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed italic pr-4">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-lg rounded-3xl bg-slate-900 text-white">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">File Specs</h3>
              <div className="space-y-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">File Name</span>
                  <span className="text-sm font-bold truncate pr-4">{resource.fileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Size</span>
                    <span className="text-sm font-bold">{(resource.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Extension</span>
                    <span className="text-sm font-bold uppercase">{resource.fileType?.split('/')?.pop() || 'File'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-8">
                <Button
                  variant="primary"
                  icon={Eye}
                  onClick={handleView}
                  fullWidth
                  className="py-3.5 rounded-2xl font-black bg-gray-700 hover:bg-gray-600 border border-gray-600 transition-colors shadow-lg"
                >
                  View File
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={handleDownload}
                  fullWidth
                  className="py-3.5 rounded-2xl font-black bg-blue-500 hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Download Now
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-gray-100 shadow-sm rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Uploader Context</h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg shadow-sm">
                  {resource.uploader?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-none mb-1">{resource.uploader?.fullName || 'Member'}</p>
                  <p className="text-xs font-bold text-primary-600">{resource.uploader?.role || 'Student'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Uploaded {formatDate(resource.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Status: <span className="text-green-600">{resource.status}</span></span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentResourceDetail;
