import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import API from "../../utils/api";
import {
  ArrowLeft,
  Download,
  Star,
  FileText,
  File,
  FileArchive,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Trash2,
  RefreshCw,
  Eye,
  GraduationCap
} from "lucide-react";
import { formatDate, formatDateTime, formatFileSize } from "../../utils/helpers";
import FileViewer from "../../components/common/FileViewer";
import toast from "react-hot-toast";

const AdminResourceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);


  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);

  const [viewerState, setViewerState] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: "",
    fileType: "",
    downloadUrl: "",
  });

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
      toast.error("Failed to load resource details");
      console.error("Error fetching resource:", error);
      navigate("/admin/resources");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await API.get(`/reviews/resource/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchResourceDetails(true), fetchReviews()]);
    toast.success("Resource details refreshed");
  };




  // Rating Validation
  const handleRateResource = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (ratingComment.trim().length > 500) {
      toast.error("Comment must be 500 characters or less");
      return;
    }

    try {
      setRatingSubmitLoading(true);
      await API.post("/reviews/resource", {
        resourceId: id,
        rating: Number(rating),
        comment: ratingComment.trim(),
      });
      toast.success("Rating submitted successfully");
      setShowRatingModal(false);
      setRating(0);
      setRatingComment("");
      await fetchResourceDetails(true);
      await fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  
  //Validate Approval Action
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await API.post(`/resources/${id}/approve`);
      toast.success("Resource approved successfully");
      setShowApproveModal(false);
      await fetchResourceDetails();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve resource",
      );
    } finally {
      setActionLoading(false);
    }
  };


  //Rejection Reason Validation
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      toast.error("Rejection reason should be at least 10 characters");
      return;
    }

    try {
      setActionLoading(true);
      await API.post(`/resources/${id}/reject`, {
        reason: rejectionReason.trim(),
      });
      toast.success("Resource rejected");
      setShowRejectModal(false);
      setRejectionReason("");
      await fetchResourceDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await API.delete(`/resources/${id}`);
      toast.success("Resource deleted successfully");
      navigate("/admin/resources");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete resource");
    } finally {
      setActionLoading(false);
    }
  };


  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(bytes)) return "N/A";
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="h-16 w-16" />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf"))
      return <FileText className="h-16 w-16 text-red-500" />;
    if (type.includes("doc"))
      return <FileText className="h-16 w-16 text-blue-500" />;
    if (type.includes("xls") || type.includes("sheet"))
      return <FileSpreadsheet className="h-16 w-16 text-green-500" />;
    if (type.includes("zip") || type.includes("rar"))
      return <FileArchive className="h-16 w-16 text-yellow-500" />;
    return <File className="h-16 w-16 text-gray-500" />;
  };

  const getFileTypeBadge = (fileType) => {
    if (!fileType) return "FILE";

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "PDF";
    if (type.includes("doc")) return "DOCX";
    if (type.includes("xls")) return "XLSX";
    if (type.includes("zip")) return "ZIP";
    return "FILE";
  };

  const getFileColor = (fileType) => {
    if (!fileType) return "bg-gray-100 text-gray-700";

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "bg-red-100 text-red-700";
    if (type.includes("doc")) return "bg-blue-100 text-blue-700";
    if (type.includes("xls")) return "bg-green-100 text-green-700";
    if (type.includes("zip")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
      rejected: "bg-rose-50 text-rose-600 border-rose-100",
    };
    const style = variants[status] || "bg-gray-50 text-gray-700 border-gray-100";

    return (
      <div className={`h-[42px] px-5 flex items-center rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] border ${style} shadow-sm`}>
        {status === 'pending' ? 'Pending Review' : status}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[Math.floor(review.rating)]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = useMemo(() => getRatingDistribution(), [reviews]);
  const totalReviews = reviews.length;
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
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
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Resource Not Found
              </h3>
              <p className="mb-6 text-gray-600">
                This resource doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/admin/resources")}>
                Back to Resources
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <>
        <div className="p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/admin/resources")}
          >
            Back to Resources
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              className="h-[42px] shadow-sm hover:shadow-md transition-all active:scale-95 !rounded-xl"
              disabled={actionLoading || ratingSubmitLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {(resource.status === "pending" || (resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt)) && isAdmin && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    {resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt ? "Pending Update Review" : "Pending New Resource Approval"}
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt 
                      ? "The resource owner has requested an update. Please review the changes below."
                      : "This resource is waiting for review. Please approve or reject it."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  icon={CheckCircle}
                  onClick={() => setShowApproveModal(true)}
                  className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 bg-white"
                  disabled={actionLoading}
                >
                  Accept
                </Button>
                <Button
                  icon={XCircle}
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-white"
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Display Pending Update details if applicable */}
        {resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt && isAdmin && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <h3 className="mb-4 font-bold text-blue-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Proposed Changes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Original</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 block">Title</span>
                    <p className="text-sm font-medium">{resource.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Description</span>
                    <p className="text-sm">{resource.description || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Module Code</span>
                    <p className="text-sm">{resource.moduleCode}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Type</span>
                    <p className="text-sm">{resource.resourceType || resource.type || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Proposed Update</h4>
                <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-3 relative">
                  <div>
                    <span className="text-xs text-blue-500 block">Title</span>
                    <p className="text-sm font-medium text-blue-900">{resource.pendingUpdate.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-500 block">Description</span>
                    <p className="text-sm text-blue-900">{resource.pendingUpdate.description || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-500 block">Module Code</span>
                    <p className="text-sm text-blue-900">{resource.pendingUpdate.moduleCode}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-500 block">Type</span>
                    <p className="text-sm text-blue-900">{resource.pendingUpdate.type || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {resource.status === "rejected" && resource.rejectionReason && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h3 className="mb-1 font-semibold text-red-900">
                  Rejection Reason
                </h3>
                <p className="text-sm text-red-700">
                  {resource.rejectionReason}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <div className="mb-6 flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                    {getFileIcon(resource.fileType)}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="primary">
                          {resource.moduleCode || "N/A"}
                        </Badge>
                        <div
                          className={`rounded px-2 py-1 text-xs font-bold ${getFileColor(
                            resource.fileType,
                          )}`}
                        >
                          {getFileTypeBadge(resource.fileType)}
                        </div>
                      </div>
                      <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        {resource.title}
                      </h1>
                      <Badge variant="default" size="sm">
                        {resource.resourceType || "General"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{resource.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{resource.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {resource.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span>({resource.totalRatings || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {resource.description && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">
                    Description
                  </h3>
                  <p className="whitespace-pre-line text-gray-600">
                    {resource.description}
                  </p>
                </div>
              )}

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  File Information
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-gray-500">File Name</p>
                    <p className="font-medium text-gray-900">
                      {resource.fileName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="font-medium text-gray-900">
                      {formatFileSize(resource.fileSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uploaded</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(resource.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(resource.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row flex-wrap gap-4">
                  <Button
                    variant="outline"
                    icon={Download}
                    iconPosition="left"
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                      window.open(
                        `${apiBase.replace(/\/$/, "")}/resources/${id}/download?token=${token}`,
                        "_blank",
                      );
                    }}
                    className="flex-1 min-w-[140px] !rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold py-3.5 text-sm justify-center shadow-sm"
                  >
                    Download
                  </Button>

                  <Button
                    variant="outline"
                    icon={Eye}
                    iconPosition="left"
                    onClick={() => {
                        console.log('AdminResourceDetail: Triggering preview for', id);
                        setViewerState({
                          isOpen: true,
                          fileName: resource?.fileName || 'Resource',
                          fileType: resource?.fileType || 'application/pdf',
                          fileUrl: `/resources/${id}/view`,
                          downloadUrl: `/resources/${id}/download`,
                        });
                    }}
                    className="flex-1 min-w-[140px] !rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold py-3.5 text-sm justify-center shadow-sm"
                  >
                    Review Content
                  </Button>

                  {isAdmin && resource.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        icon={CheckCircle}
                        iconPosition="left"
                        onClick={() => setShowApproveModal(true)}
                        disabled={actionLoading}
                        className="flex-1 min-w-[140px] !rounded-xl border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 font-semibold py-3.5 text-sm justify-center shadow-sm"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        icon={XCircle}
                        iconPosition="left"
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="flex-1 min-w-[140px] !rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold py-3.5 text-sm justify-center shadow-sm"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

            </Card>

            <Card>
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Reviews & Ratings
              </h2>

              <div className="mb-6 rounded-lg bg-gray-50 p-6">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                  <div className="text-center">
                    <div className="mb-2 text-5xl font-bold text-gray-900">
                      {resource.averageRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="mb-1 flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(resource.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-gray-600">
                          {star} ★
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${
                                totalReviews > 0
                                  ? (ratingDistribution[star] / totalReviews) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm text-gray-600">
                          {ratingDistribution[star]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="py-8 text-center text-gray-500">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                            <span className="text-sm font-semibold text-primary-600">
                              {review.reviewer?.fullName?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.reviewer?.fullName || "Anonymous"}
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
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                Uploaded By
              </h3>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  {resource.uploader?.profilePicture ? (
                    <img
                      src={resource.uploader.profilePicture}
                      alt={resource.uploader.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary-600">
                      {resource.uploader?.fullName?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {resource.uploader?.fullName || "Unknown User"}
                  </p>
                  <p className="text-sm capitalize text-gray-600">
                    {resource.uploader?.role || "Student"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resource.uploader?.email || "No email available"}
                  </p>
                </div>
              </div>

              {resource.uploader?.bio && (
                <p className="mb-4 text-sm text-gray-600">
                  {resource.uploader.bio}
                </p>
              )}

              <Button
                size="sm"
                variant="outline"
                fullWidth
                onClick={() =>
                  navigate(`/admin/users/${resource.uploader?._id}`)
                }
              >
                View User Profile
              </Button>
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Administrative Log
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="ml-auto font-medium text-gray-900">
                    {formatDate(resource.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-auto font-medium text-gray-900">
                    {formatDate(resource.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Resource ID:</span>
                  <span className="ml-auto text-xs font-medium text-gray-900">
                    {resource._id?.slice(-8) || "N/A"}
                  </span>
                </div>
              </div>
            </Card>


          </div>
        </div>
      </div>


      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Resource"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} loading={actionLoading}>
              Approve Resource
            </Button>
          </>
        }
      >
        <div>
          <p className="mb-4 text-gray-600">
            Are you sure you want to approve this resource?
          </p>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Once approved, this resource will be visible to all students.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
        }}
        title="Reject Resource"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
            >
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
          <p className="mb-4 text-gray-600">
            Please provide a reason for rejection:
          </p>
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Content is not relevant, file is corrupted, copyright issues, etc."
              required
            />
            <div className="mt-2 text-right text-xs text-gray-500">
              {rejectionReason.length}/500
            </div>
          </div>
        </div>
      </Modal>

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
          <div className="mb-4 flex items-center gap-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">This action cannot be undone!</p>
          </div>
          <p className="mb-4 text-gray-600">
            Are you sure you want to permanently delete this resource?
          </p>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{resource.title}</p>
            <p className="text-sm text-gray-600">{resource.moduleCode}</p>
            <p className="text-sm text-gray-600">
              By {resource.uploader?.fullName}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setRatingComment("");
        }}
        title="Rate Resource"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowRatingModal(false);
                setRating(0);
                setRatingComment("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRateResource} loading={ratingSubmitLoading}>
              Submit Rating
            </Button>
          </>
        }
      >
        <div>
          <p className="mb-4 text-gray-600">
            How useful was "{resource?.title}"?
          </p>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className={`h-10 w-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Comment (Optional)
            </label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Share your thoughts about this resource..."
            />
            <div className="mt-2 text-right text-xs text-gray-500">
              {ratingComment.length}/500
            </div>
          </div>
        </div>
      </Modal>

      <FileViewer
        isOpen={viewerState.isOpen}
        onClose={() =>
          setViewerState((prev) => ({ ...prev, isOpen: false }))
        }
        fileUrl={viewerState.fileUrl}
        fileName={viewerState.fileName}
        fileType={viewerState.fileType}
        downloadUrl={viewerState.downloadUrl}
      />
    </>
    </DashboardLayout>
  );
};

export default AdminResourceDetail;
