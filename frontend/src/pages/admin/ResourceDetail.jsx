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
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminResourceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // File viewer
  const [showFileViewer, setShowFileViewer] = useState(false);
  
  // Action modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);

  useEffect(() => {
    fetchResourceDetails();
    fetchReviews();
  }, [id]);

  const fetchResourceDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await API.get(`/resources/${id}`);
      setResource(response.data.resource);
    } catch (error) {
      toast.error('Failed to load resource details');
      console.error('Error fetching resource:', error);
      navigate('/resources');
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

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await API.post(`/resources/${id}/approve`);
      toast.success('Resource approved successfully!');
      setShowApproveModal(false);
      fetchResourceDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve resource');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await API.post(`/resources/${id}/reject`, {
        reason: rejectionReason
      });
      toast.success('Resource rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchResourceDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject resource');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await API.delete(`/resources/${id}`);
      toast.success('Resource deleted successfully');
      navigate('/resources');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resource');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewFile = () => {
    setShowFileViewer(true);
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

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'warning', icon: Clock, text: 'Pending' },
      approved: { color: 'success', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'danger', icon: XCircle, text: 'Rejected' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getRatingDistribution = () => {
    if (!reviews.length) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resource Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                This resource doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/admin/resources')}>
                Back to Resources
              </Button>
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
        {/* Header with back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            icon={ArrowLeft}
            onClick={() => navigate('/resources')}
          >
            Back to Resources
          </Button>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {getStatusBadge(resource.status)}
          </div>
        </div>

        {/* Status Banner for Pending Resources */}
        {resource.status === 'pending' && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Pending Review</h3>
                  <p className="text-sm text-yellow-700">
                    This resource is waiting for your review. Please approve or reject it.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  icon={CheckCircle}
                  onClick={() => setShowApproveModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  icon={XCircle}
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Rejection Reason Banner */}
        {resource.status === 'rejected' && resource.rejectionReason && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Rejection Reason</h3>
                <p className="text-sm text-red-700">{resource.rejectionReason}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Info Card */}
            <Card>
              <div className="flex items-start gap-6 mb-6">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(resource.fileType)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary">{resource.moduleCode}</Badge>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${getFileColor(resource.fileType)}`}>
                          {getFileTypeBadge(resource.fileType)}
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {resource.title}
                      </h1>
                      <Badge variant="default" size="sm">{resource.resourceType}</Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{resource.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{resource.averageRating?.toFixed(1) || '0.0'}</span>
                      <span>({resource.totalRatings || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {resource.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {resource.description}
                  </p>
                </div>
              )}

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">File Name</p>
                    <p className="font-medium text-gray-900">{resource.fileName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-medium text-gray-900">
                      {resource.fileSize ? (resource.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p className="font-medium text-gray-900">{formatDate(resource.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(resource.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-3">
                <Button 
                  icon={Eye}
                  onClick={handleViewFile}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View File
                </Button>
                <Button 
                  icon={Download}
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    window.open(`${apiBase.replace(/\/$/, '')}/resources/${id}/download?token=${token}`, '_blank');
                  }}
                  variant="outline"
                  fullWidth
                >
                  Download
                </Button>
                
                {resource.status === 'pending' && (
                  <>
                    <Button 
                      icon={CheckCircle}
                      onClick={() => setShowApproveModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                      fullWidth
                    >
                      Approve
                    </Button>
                    <Button 
                      icon={XCircle}
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      fullWidth
                    >
                      Reject
                    </Button>
                  </>
                )}

                {resource.status !== 'pending' && (
                  <Button 
                    icon={Trash2}
                    variant="outline"
                    onClick={() => setShowDeleteModal(true)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    fullWidth
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Reviews & Ratings
              </h2>

              {/* Rating Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {resource.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
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

                  {/* Rating Distribution */}
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
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          {ratingDistribution[star]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div 
                      key={review._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
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
                            <p className="text-xs text-gray-500">
                              {formatDateTime(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Uploader Info */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Uploaded By</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  {resource.uploader?.profilePicture ? (
                    <img 
                      src={resource.uploader.profilePicture} 
                      alt={resource.uploader.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-bold text-lg">
                      {resource.uploader?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {resource.uploader?.fullName || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {resource.uploader?.role || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resource.uploader?.email}
                  </p>
                </div>
              </div>

              {resource.uploader?.bio && (
                <p className="text-sm text-gray-600 mb-4">
                  {resource.uploader.bio}
                </p>
              )}

              <Button 
                size="sm" 
                variant="outline" 
                fullWidth
                onClick={() => navigate(`/admin/users/${resource.uploader?._id}`)}
              >
                View User Profile
              </Button>
            </Card>

            {/* Metadata Card */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="text-gray-900 font-medium ml-auto">
                    {formatDate(resource.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-900 font-medium ml-auto">
                    {formatDate(resource.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Resource ID:</span>
                  <span className="text-gray-900 font-medium ml-auto text-xs">
                    {resource._id.slice(-8)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  icon={Eye}
                  onClick={handleViewFile}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View File
                </Button>
                {!resource.userRated && resource.status === 'approved' && (
                  <Button
                    size="sm"
                    icon={Star}
                    onClick={() => setShowRatingModal(true)}
                    fullWidth
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Rate Resource
                  </Button>
                )}
                {resource.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => setShowApproveModal(true)}
                      fullWidth
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve Resource
                    </Button>
                    <Button
                      size="sm"
                      icon={XCircle}
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      fullWidth
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Reject Resource
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  icon={Trash2}
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  fullWidth
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete Resource
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      <FileViewer
        isOpen={showFileViewer}
        onClose={() => setShowFileViewer(false)}
        fileUrl={`/resources/${resource._id}/view`}
        fileName={resource.fileName}
        fileType={resource.fileType}
      />

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} loading={actionLoading}>
              Approve Resource
            </Button>
          </>
        }
      >
        <div>
          <p className="text-gray-600 mb-4">
            Are you sure you want to approve this resource?
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Once approved, this resource will be visible to all students.
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
            >
              Reject Resource
            </Button>
          </>
        }
      >
        <div>
          <p className="text-gray-600 mb-4">
            Please provide a reason for rejection:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Content is not relevant, file is corrupted, copyright issues, etc."
              required
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <div>
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <p className="font-semibold">This action cannot be undone!</p>
          </div>
          <p className="text-gray-600 mb-4">
            Are you sure you want to permanently delete this resource?
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
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
          <p className="text-gray-600 mb-4">How useful was "{resource?.title}"?</p>
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

export default AdminResourceDetail;