import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import FileViewer from '../../components/common/FileViewer';
import API from '../../utils/api';
import {
  ArrowLeft,
  Download,
  Star,
  Eye,
  FileText,
  File,
  FileArchive,
  FileSpreadsheet,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentResourceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [modules, setModules] = useState([]);

  const getModuleName = (code) => {
    const module = modules.find(m => m.code === code);
    return module ? module.name : '';
  };

  useEffect(() => {
    fetchResourceDetails();
    fetchReviews();
    fetchModules();
  }, [id]);

  const fetchModules = async () => {
    try {
      const response = await API.get('/modules');
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  useEffect(() => {
    if (resource?.title) {
      fetchAiSuggestions();
    }
  }, [resource]);

  const fetchResourceDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await API.get(`/resources/${id}`);
      setResource(response.data.resource);
    } catch (error) {
      toast.error('Failed to load resource details');
      console.error('Error fetching resource:', error);
      navigate('/student/resources');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/reviews/resource/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchAiSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      // Use resource title + module code for better context
      const query = `${resource.title} ${resource.moduleCode || ''}`.trim();
      const response = await API.get(`/ai/suggest-resources?query=${encodeURIComponent(query)}`);
      // Filter out current resource from suggestions
      const filtered = (response.data.suggestions || []).filter(s => s.resourceId !== id);
      setAiSuggestions(filtered);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const downloadUrl = `${apiBase.replace(/\/$/, '')}/resources/${id}/download?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  const handleRateResource = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      setRatingSubmitLoading(true);
      await API.post('/reviews/resource', {
        resourceId: id,
        rating: Number(rating),
        comment: ratingComment
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      await fetchResourceDetails(true);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-16 h-16" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
    if (type.includes('doc')) return <FileText className="w-16 h-16 text-blue-500" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileSpreadsheet className="w-16 h-16 text-green-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-16 h-16 text-yellow-500" />;
    return <File className="w-16 h-16 text-gray-500" />;
  };

  const getFileTypeBadge = (fileType) => {
    if (!fileType) return 'FILE';
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc')) return 'DOCX';
    if (type.includes('xls')) return 'XLSX';
    if (type.includes('zip')) return 'ZIP';
    return 'FILE';
  };

  const getFileColor = (fileType) => {
    if (!fileType) return 'bg-gray-100 text-gray-700';
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'bg-red-100 text-red-700';
    if (type.includes('doc')) return 'bg-blue-100 text-blue-700';
    if (type.includes('xls')) return 'bg-green-100 text-green-700';
    if (type.includes('zip')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRatingDistribution = () => {
    if (!reviews.length) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[Math.floor(review.rating)]++;
      }
    });
    return distribution;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading resource details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!resource) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Not Found</h3>
              <p className="text-gray-600 mb-6">This resource doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/student/resources')}>Back to Resources</Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (resource.status !== 'approved') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Unavailable</h3>
              <p className="text-gray-600 mb-6">This resource is not available for viewing.</p>
              <Button onClick={() => navigate('/student/resources')}>Back to Resources</Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/student/resources')}>
            Back to Resources
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(resource.fileType)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary">{getModuleName(resource.moduleCode) ? `${getModuleName(resource.moduleCode)} - ${resource.moduleCode}` : resource.moduleCode}</Badge>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getFileColor(resource.fileType)}`}>
                      {getFileTypeBadge(resource.fileType)}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                  <Badge variant="default" size="sm">{resource.resourceType}</Badge>
                  <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{resource.averageRating?.toFixed(1) || '0.0'}</span>
                      <span>({resource.totalRatings || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {resource.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{resource.description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">File Name</p>
                    <p className="font-medium text-gray-900">{resource.fileName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p className="font-medium text-gray-900">{formatDate(resource.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button icon={Eye} onClick={() => setShowFileViewer(true)} fullWidth>
                  View File
                </Button>
                <Button icon={Download} onClick={handleDownload} variant="outline" fullWidth>
                  Download
                </Button>
                {!resource.userRated && resource.uploader?._id !== (user?._id || user?.id) && (
                  <Button icon={Star} variant="ghost" onClick={() => setShowRatingModal(true)} fullWidth>
                    Rate Resource
                  </Button>
                )}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {resource.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(resource.averageRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-8">{star} ★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          {ratingDistribution[star]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {review.reviewer?.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.reviewer?.fullName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">{formatDateTime(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <GraduationCap className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Uploaded By
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg border border-primary-100 shadow-sm">
                  {resource.uploader?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {resource.uploader?.fullName || 'Unknown Student'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {resource.uploader?.role?.charAt(0).toUpperCase() + resource.uploader?.role?.slice(1) || 'Student'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Academic Year</p>
                    <p className="font-semibold text-gray-900">
                      {resource.uploader?.yearLevel ? `Year ${resource.uploader.yearLevel}` : 'Not Specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Specialization</p>
                    <p className="font-semibold text-gray-900">
                      {resource.uploader?.specialization && resource.uploader.specialization !== 'None' 
                        ? resource.uploader.specialization 
                        : (resource.uploader?.yearLevel <= 2 ? 'Core Curriculum' : 'General')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Learning Assistant Card */}
            <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="w-12 h-12 text-indigo-600" />
              </div>
              
              <div className="flex items-center gap-2 mb-4 relative">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Learning Assistant</h3>
                <Badge variant="primary" size="sm" className="ml-auto text-[10px] uppercase tracking-wider">AI Powered</Badge>
              </div>

              <p className="text-xs text-indigo-700/80 mb-4 font-medium italic">
                "Based on this resource, you might find these helpful for your studies:"
              </p>

              {suggestionsLoading ? (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs">Analyzing context...</span>
                </div>
              ) : aiSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 4).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => suggestion.isGeneric ? window.open(suggestion.externalUrl, '_blank') : navigate(`/student/resources/${suggestion.resourceId}`)}
                      className="w-full text-left group transition-all"
                    >
                      <div className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all">
                        <div className="mt-1">
                          {suggestion.isGeneric ? (
                            <div className="w-7 h-7 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600">
                            {suggestion.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                              {suggestion.type}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[10px] text-indigo-600 font-bold">
                              {suggestion.relevance}% Match
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 mt-2 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4 italic">
                  Looking for more related materials...
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <FileViewer
        isOpen={showFileViewer}
        onClose={() => setShowFileViewer(false)}
        fileUrl={`/resources/${resource._id}/view`}
        fileName={resource.fileName}
        fileType={resource.fileType}
      />

      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setRatingComment('');
        }}
        title="Rate Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRateResource} loading={ratingSubmitLoading}>
              Submit Rating
            </Button>
          </>
        }
      >
        <div>
          <p className="text-gray-600 mb-4">How useful was "{resource.title}"?</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Share your thoughts about this resource..."
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default StudentResourceDetail;
