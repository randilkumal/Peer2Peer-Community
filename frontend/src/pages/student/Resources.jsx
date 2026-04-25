import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import API from '../../utils/api';
import {
  FileText,
  Download,
  Upload,
  Star,
  Search,
  Sparkles,
  History,
  File,
  FileArchive,
  FileSpreadsheet,
  X,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Eye,
  Edit2
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    module: '',
    resourceType: '',
    sortBy: 'newest'
  });

  const [resources, setResources] = useState([]);
  const [modules, setModules] = useState([]);
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});
  const [counts, setCounts] = useState({ all: 0, uploads: 0, history: 0 });

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    moduleCode: '',
    resourceType: 'Lecture Notes',
    file: null
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    moduleCode: '',
    resourceType: 'Lecture Notes'
  });

  const resourceTypes = ['Lecture Notes', 'Assignments', 'Past Papers', 'Textbooks', 'Other'];

  const getModuleName = (code) => {
    const module = modules.find(m => m.code === code);
    return module ? module.name : '';
  };

  useEffect(() => {
    if (user?._id || user?.id) {
      console.log('✅ User loaded, fetching resources for user:', user._id || user.id);
      fetchResources();
      fetchModules();
      loadEnrolledModules();
      fetchCounts();
    } else {
      console.log('⏳ Waiting for user to load...');
    }
  }, [activeTab, filters, user]); // Change from user?._id to user

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'my-uploads', 'history', 'ai-suggestions'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // AI Suggestions when search changes
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2 && activeTab === 'ai-suggestions') {
      fetchAISuggestions();
    }
  }, [searchQuery, activeTab]);

  // Load full module objects for the student's enrolledModules list
  const loadEnrolledModules = async () => {
    try {
      const codes = user?.enrolledModules || [];
      if (!codes.length) {
        setEnrolledModules([]);
        return;
      }
      const response = await API.get('/modules');
      const allModules = response.data.modules || [];
      const myModules = allModules.filter((m) => codes.includes(m.code));
      setEnrolledModules(myModules);
    } catch (error) {
      console.error('Error loading enrolled modules for resources:', error);
      setEnrolledModules([]);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await API.get('/modules');
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchResources = async () => {
  try {
    setLoading(true);
    
    if (!user?._id) {
      console.log('⏳ User ID not available yet');
      setLoading(false);
      return;
    }
    
    let endpoint = '/resources?';

    if (activeTab === 'my-uploads') {
      // My Uploads tab - show user's resources (all statuses)
      endpoint += `uploader=${user._id}&`;
      console.log('📤 Fetching my uploads for user:', user._id);
    } else if (activeTab === 'history') {
      // History tab - show downloaded resources
      endpoint = '/resources/my-downloads?';
      console.log('📜 Fetching download history');
    } /* else if (activeTab === 'ai-suggestions') {
      setResources([]);
      setLoading(false);
      return;
    } */ else {
      // All Resources tab - IMPORTANT: Add status=approved parameter
      endpoint += 'status=approved&';
      console.log('🌐 Fetching all approved resources');
    }

    // Add filters
    if (filters.module) endpoint += `module=${filters.module}&`;
    if (filters.resourceType) endpoint += `type=${filters.resourceType}&`;
    if (filters.sortBy) endpoint += `sort=${filters.sortBy}&`;

    console.log('🔍 API Request:', endpoint);
    const response = await API.get(endpoint);
    console.log('✅ Resources received:', response.data.resources?.length || 0);
    setResources(response.data.resources || []);
  } catch (err) {
    console.error('Error fetching resources:', err);
  } finally {
    setLoading(false);
  }
};

  const fetchCounts = async () => {
    try {
      if (!user?._id) return;
      const [allRes, uploadsRes, historyRes] = await Promise.all([
        API.get('/resources?status=approved'),
        API.get(`/resources?uploader=${user._id}`),
        API.get('/resources/my-downloads')
      ]);

      setCounts({
        all: allRes.data.resources?.length || 0,
        uploads: uploadsRes.data.resources?.length || 0,
        history: historyRes.data.resources?.length || 0
      });
    } catch (err) {
      console.error('Error fetching resource counts:', err);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      setLoadingAI(true);
      const response = await API.get(`/ai/suggest-resources?query=${encodeURIComponent(searchQuery)}`);
      setAiSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setAiSuggestions([]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleUpload = async () => {
    // Reset errors
    setUploadErrors({});

    // Basic field verification
    const errors = {};
    if (!uploadForm.title.trim()) errors.title = 'Title is required';
    if (!uploadForm.moduleCode.trim()) errors.moduleCode = 'Module is required';
    if (!uploadForm.file) errors.file = 'Please select a file to upload';

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    // File type verification
    const fileName = uploadForm.file.name.toLowerCase();
    const forbiddenExts = ['.mp3', '.mp4'];
    if (forbiddenExts.some(ext => fileName.endsWith(ext))) {
      toast.error('Audio and video files (MP3, MP4) are not allowed.');
      return;
    }

    const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
    const hasAllowedExt = allowedExts.some(ext => fileName.endsWith(ext));
    if (!hasAllowedExt) {
      toast.error('File type not supported. Please upload documents, images, or archives.');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('moduleCode', uploadForm.moduleCode);
      formData.append('resourceType', uploadForm.resourceType);
      formData.append('file', uploadForm.file);

      await API.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Resource uploaded successfully! Pending admin approval.');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        moduleCode: '',
        resourceType: 'Lecture Notes',
        file: null
      });
      
      setActiveTab('my-uploads');
      setTimeout(() => {
        fetchResources();
        fetchCounts();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    setUploadErrors({});
    const errors = {};
    if (!editForm.title.trim()) errors.title = 'Title is required';
    if (!editForm.moduleCode.trim()) errors.moduleCode = 'Module is required';

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      await API.put(`/resources/${selectedResource._id}`, {
        title: editForm.title?.trim(),
        description: editForm.description ?? '',
        moduleCode: editForm.moduleCode?.trim().toUpperCase(),
        type: editForm.resourceType
      });

      toast.success('Update submitted successfully! Pending admin approval.');
      setShowEditModal(false);
      setSelectedResource(null);
      setTimeout(() => {
        fetchResources();
        fetchCounts();
      }, 500);
    } catch (error) {
      console.error('Edit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit update');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteResource = async () => {
    try {
      setDeleteLoading(true);
      await API.delete(`/resources/${selectedResource._id}`);
      toast.success('Resource deleted successfully');
      setShowDeleteModal(false);
      setSelectedResource(null);
      fetchResources();
      fetchCounts();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Open download URL in a new tab which triggers the browser's download manager
      window.open(`${apiBase.replace(/\/$/, '')}/resources/${resourceId}/download?token=${token}`, '_blank');

      toast.success('Download started');
      
      // Refresh resources after a short delay to reflect incremented download count
      setTimeout(() => fetchResources(), 1500);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handleRateResource = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!selectedResource?._id) return;

    try {
      setRatingSubmitLoading(true);
      await API.post('/reviews/resource', {
        resourceId: selectedResource._id,
        rating: Number(rating),
        comment: ratingComment
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      setSelectedResource(null);
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  const getFileIcon = (fileType, className) => {
    const defaultClasses = className || "w-8 h-8";
    if (!fileType) return <File className={defaultClasses} />;

    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className={defaultClasses} />;
    if (type.includes('doc')) return <FileText className={defaultClasses} />;
    if (type.includes('xls') || type.includes('sheet')) return <FileSpreadsheet className={defaultClasses} />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className={defaultClasses} />;
    return <File className={defaultClasses} />;
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

  const filteredResources = resources.filter(resource => {
    if (!searchQuery) return true;
    return (
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const ResourceCard = ({ resource, showActions = true }) => {
    // Type-based color tokens for badges and accents
    const typeConfigs = {
      'Lecture Notes': { 
        bg: 'bg-blue-50', 
        text: 'text-blue-900', 
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      'Assignments': { 
        bg: 'bg-green-50', 
        text: 'text-green-900', 
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      'Past Papers': { 
        bg: 'bg-red-50', 
        text: 'text-red-900', 
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      },
      'Textbooks': { 
        bg: 'bg-purple-50', 
        text: 'text-purple-900', 
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      'Study Guides': { 
        bg: 'bg-amber-50', 
        text: 'text-amber-900', 
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
      },
      'Other': { 
        bg: 'bg-slate-50', 
        text: 'text-slate-900', 
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600'
      }
    };

    const config = typeConfigs[resource.resourceType] || typeConfigs['Other'];
    const uploaderId = resource.uploader?._id || resource.uploader;
    const isOwner = uploaderId?.toString() === user?._id?.toString();

    return (
      <Card className="flex flex-col h-full border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group grayscale-[0.1] hover:grayscale-0">
        {/* Top Section: Icon and Type Badge */}
        <div className="p-4 pb-4">
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
              {getFileIcon(resource.fileType, `w-5 h-5 ${config.iconColor}`)}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} tracking-wide shadow-sm font-medium`}>
                {resource.resourceType}
              </div>
              {resource.pendingUpdate && (
                <div className="px-3 py-1 rounded-full text-[10px] bg-yellow-100 text-yellow-700 tracking-wide font-bold shadow-sm whitespace-nowrap flex items-center gap-1">
                   <Clock className="w-3 h-3" /> Update Pending
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 pt-0 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 transition-colors">
            {resource.title}
          </h3>
          <p className="text-[10px] text-[#3c6382] uppercase tracking-widest mb-1.5">
            {resource.moduleCode}
          </p>
          
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
            {resource.description || "Comprehensive academic resource shared by peers to enhance your learning experience."}
          </p>

          {/* rating display */}
          <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 bg-gray-50 rounded-lg w-fit">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-3.5 h-3.5 ${s <= Math.round(resource.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-xs font-black text-gray-700">
              {resource.averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>

          <div className="h-px bg-gray-100 mb-2" />

          {/* Footer Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                {resource.uploader?.profilePicture ? (
                  <img src={resource.uploader.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-700 font-black text-sm">
                    {resource.uploader?.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {resource.uploader?.fullName || 'Academic Member'}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {formatDate(resource.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && activeTab === 'my-uploads' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResource(resource);
                      setEditForm({
                        title: resource.title,
                        description: resource.description,
                        moduleCode: resource.moduleCode,
                        resourceType: resource.resourceType
                      });
                      setShowEditModal(true);
                    }}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                    title="Edit Resource"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResource(resource);
                      setShowDeleteModal(true);
                    }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50/50 px-2 py-1 rounded-lg border border-gray-100">
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs font-black">{resource.downloadCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-auto pt-6">
            <Button
              variant="primary"
              icon={Download}
              iconPosition="left"
              className="flex-1 !rounded-xl font-bold py-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs tracking-wide bg-blue-600 hover:bg-blue-700"
              onClick={() => handleDownload(resource._id)}
            >
              Get
            </Button>
            <Button
              variant="outline"
              icon={Eye}
              iconPosition="left"
              className="flex-1 !rounded-xl font-bold py-2 border-gray-100 text-gray-500 hover:bg-gray-50 transition-all text-xs"
              onClick={() => navigate(`/student/resources/${resource._id}`)}
            >
              View
            </Button>
          </div>

          {/* Contextual actions */}
          {showActions && activeTab === 'history' && !resource.userRated && !isOwner && (
            <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Star}
                  iconPosition="left"
                  className="flex-1 text-amber-500 hover:bg-amber-50 font-bold text-xs py-1.5 !rounded-lg border border-amber-100"
                  onClick={() => {
                    setSelectedResource(resource);
                    setShowRatingModal(true);
                  }}
                >
                  Rate Now
                </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Resources', icon: FileText, count: counts.all },
    { id: 'my-uploads', label: 'My Uploads', icon: Upload, count: counts.uploads },
    { id: 'history', label: 'Download History', icon: History, count: counts.history },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
  ];

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
              <p className="text-gray-600 mt-1">
                Browse, upload, and download academic resources
              </p>
            </div>
          </div>
          <Button
            icon={Upload}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Resource
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="space-y-6">
            {/* Top Row: Search, Module, Sort */}
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Search Bar */}
              <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Search Resources</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, description, or module..."
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm group-hover:border-primary-300"
                  />
                </div>
              </div>

              {/* Module Filter */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Module</label>
                <select
                  value={filters.module}
                  onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm shadow-sm"
                >
                  <option value="">All Modules</option>
                  {modules.map(m => (
                    <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>

              {/* Clear Button */}
              {(filters.module || filters.resourceType !== '') && (
                <div className="w-full lg:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setFilters({ ...filters, module: '', resourceType: '', sortBy: 'newest' })}
                    className="text-gray-400 hover:text-red-500 py-2.5"
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Access */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Access:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filters.resourceType === '' ? 'primary' : 'outline'}
                  onClick={() => setFilters({ ...filters, resourceType: '' })}
                  className={filters.resourceType !== '' ? '!border-gray-300 !text-blue-900 hover:!border-gray-400' : ''}
                >
                  All Types
                </Button>
                {resourceTypes.map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filters.resourceType === type ? 'primary' : 'outline'}
                    onClick={() => setFilters({ ...filters, resourceType: type })}
                    className={filters.resourceType !== type ? '!border-gray-300 !text-blue-900 hover:!border-gray-400' : ''}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
        })}
      </div>

      {/* AI Suggestions Tab Implementation */}
      {activeTab === 'ai-suggestions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600/10 to-primary-600/10 border border-blue-100 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
                <p className="text-gray-600 text-sm">Personalized recommendations for your studies</p>
              </div>
            </div>
            {!searchQuery && (
              <div className="bg-white/60 backdrop-blur-sm border border-blue-50 rounded-2xl p-4 mt-4">
                <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search for topics to get AI suggestions.
                </p>
              </div>
            )}
          </div>

          {loadingAI ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <p className="text-gray-500 font-medium animate-pulse">Analyzing matches...</p>
            </div>
          ) : !searchQuery ? (
            <Card className="p-12 border-dashed border-2 border-gray-200 shadow-none rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to explore?</h3>
              <p className="text-gray-500 max-w-md italic">
                Search by module or keyword to see AI recommendations.
              </p>
            </Card>
          ) : aiSuggestions.length === 0 ? (
            <Card className="p-12 border-dashed border-2 border-gray-200 shadow-none rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 max-w-md">
                Try different keywords to see more suggestions.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiSuggestions.filter(s => s.isGeneric).map((suggestion, index) => (
                <Card 
                  key={index} 
                  className="flex flex-col h-full border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white group relative"
                >
                  <div className="p-4 pt-2 flex-1 flex flex-col">
                    <div className="w-10 h-10 mb-3 rounded-xl flex items-center justify-center shadow-inner bg-blue-50 text-blue-600">
                      {suggestion.isGeneric ? (
                        <Globe className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" className="text-[10px] uppercase font-black px-2.5 py-1">
                          {suggestion.type}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                        {suggestion.title}
                      </h3>
                      
                      <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-4 font-medium">
                        {suggestion.description}
                      </p>
                    </div>

                    <div className="h-px bg-gray-50 my-3" />

                    <div className="flex items-center justify-between mt-auto pt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400">AI</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {suggestion.isGeneric ? "Web Suggestion" : "Resource"}
                        </span>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        className="!rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-2 shadow-md shadow-blue-100 active:scale-scale-95 transition-transform"
                        onClick={() => {
                          if (suggestion.resourceId) {
                            window.open(`/student/resources/${suggestion.resourceId}?view=true`, '_blank');
                          } else if (suggestion.externalUrl) {
                            window.open(suggestion.externalUrl, '_blank');
                          }
                        }}
                      >
                        Explore
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {activeTab !== 'ai-suggestions' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" text="Loading resources..." />
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No resources found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : activeTab === 'my-uploads'
                    ? 'You haven\'t uploaded any resources yet'
                    : activeTab === 'history'
                    ? 'You haven\'t downloaded any resources yet'
                    : 'No approved resources available'}
                </p>
                {(activeTab === 'all' || activeTab === 'my-uploads') && (
                  <Button onClick={() => setShowUploadModal(true)} icon={Upload}>
                    Upload Resource
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          )}
        </>
      )}
    </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Resource"
        size="lg"
        closeOnOverlay={false}
        showCloseButton={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="upload-resource-form" loading={uploadLoading} icon={Upload}>
              Upload Resource
            </Button>
          </>
        }
      >
        <form id="upload-resource-form" onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={uploadForm.title}
            onChange={(e) => {
               setUploadForm({ ...uploadForm, title: e.target.value });
               if (uploadErrors.title) setUploadErrors(prev => ({ ...prev, title: null }));
            }}
            placeholder="e.g., Midterm Revision Notes 2023"
            error={uploadErrors.title}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Brief description of the resource..."
            />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module <span className="text-red-500">*</span>
              </label>
            <div className="relative">
              <input
                type="text"
                value={uploadForm.moduleCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setUploadForm({ ...uploadForm, moduleCode: value.toUpperCase() });
                  if (uploadErrors.moduleCode) setUploadErrors(prev => ({ ...prev, moduleCode: null }));
                }}
                onFocus={() => setShowModuleDropdown(true)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${
                  uploadErrors.moduleCode 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Search modules... (e.g., IT3120)"
                autoComplete="off"
              />
              {uploadErrors.moduleCode && (
                <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                  {uploadErrors.moduleCode}
                </p>
              )}

              {showModuleDropdown && uploadForm.moduleCode && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModuleDropdown(false);
                    }}
                  />

                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {(enrolledModules.length ? enrolledModules : modules)
                      .filter(module =>
                        !uploadForm.moduleCode || 
                        module.code.toLowerCase().includes(uploadForm.moduleCode.toLowerCase()) ||
                        module.name.toLowerCase().includes(uploadForm.moduleCode.toLowerCase())
                      )
                      .map((module) => (
                        <button
                          key={module.code}
                          type="button"
                          onClick={() => {
                            setUploadForm({ ...uploadForm, moduleCode: module.code });
                            setShowModuleDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-primary-700 min-w-[70px]">{module.code}</span>
                            <span className="text-sm text-gray-600 line-clamp-1">{module.name}</span>
                          </div>
                        </button>
                      ))}

                    {(enrolledModules.length ? enrolledModules : modules).filter(module =>
                      !uploadForm.moduleCode ||
                      module.code.toLowerCase().includes(uploadForm.moduleCode.toLowerCase()) ||
                      module.name.toLowerCase().includes(uploadForm.moduleCode.toLowerCase())
                    ).length === 0 && (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No modules found
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
            {uploadForm.moduleCode && getModuleName(uploadForm.moduleCode) && (
              <div className="mt-2 p-2 bg-primary-50 rounded-lg border border-primary-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                <p className="text-sm font-medium text-primary-900">
                  {uploadForm.moduleCode} - {getModuleName(uploadForm.moduleCode)}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search for your module
            </p>
          </div>

          <Select
            label="Resource Type"
            value={uploadForm.resourceType}
            onChange={(e) => setUploadForm({ ...uploadForm, resourceType: e.target.value })}
            options={resourceTypes.map(type => ({ value: type, label: type }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => {
                setUploadForm({ ...uploadForm, file: e.target.files[0] });
                if (uploadErrors.file) setUploadErrors(prev => ({ ...prev, file: null }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${
                uploadErrors.file 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              }`}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif"
            />
            {uploadErrors.file && (
              <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                {uploadErrors.file}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported: PDF, PPTX, ZIP, RAR, DOCX, TXT, Images (Max 50MB). MP3/MP4 strictly prohibited.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your upload will be reviewed by an admin before being published.
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resource"
        size="lg"
        closeOnOverlay={false}
        showCloseButton={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-resource-form" loading={editLoading} icon={Upload}>
              Submit Update
            </Button>
          </>
        }
      >
        <form id="edit-resource-form" onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={editForm.title}
            onChange={(e) => {
               setEditForm({ ...editForm, title: e.target.value });
               if (uploadErrors.title) setUploadErrors(prev => ({ ...prev, title: null }));
            }}
            placeholder="e.g., Midterm Revision Notes 2023"
            error={uploadErrors.title}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Brief description of the resource..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={editForm.moduleCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm({ ...editForm, moduleCode: value.toUpperCase() });
                  if (uploadErrors.moduleCode) setUploadErrors(prev => ({ ...prev, moduleCode: null }));
                }}
                onFocus={() => setShowModuleDropdown(true)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${
                  uploadErrors.moduleCode 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Search modules... (e.g., IT3120)"
                autoComplete="off"
              />
              {uploadErrors.moduleCode && (
                <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                  {uploadErrors.moduleCode}
                </p>
              )}

              {showModuleDropdown && editForm.moduleCode && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModuleDropdown(false);
                    }}
                  />
                  <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
                    {modules
                      .filter(m => m.code.toLowerCase().includes(editForm.moduleCode.toLowerCase()) || 
                                 m.name.toLowerCase().includes(editForm.moduleCode.toLowerCase()))
                      .map((module) => (
                        <button
                          key={module._id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col transition-colors border-b border-gray-50 last:border-0"
                          onClick={() => {
                            setEditForm({ ...editForm, moduleCode: module.code });
                            setShowModuleDropdown(false);
                            if (uploadErrors.moduleCode) setUploadErrors(prev => ({ ...prev, moduleCode: null }));
                          }}
                        >
                          <span className="font-semibold text-gray-900">{module.code}</span>
                          <span className="text-xs text-gray-500 truncate">{module.name}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search for your module
            </p>
          </div>

          <Select
            label="Resource Type"
            value={editForm.resourceType}
            onChange={(e) => setEditForm({ ...editForm, resourceType: e.target.value })}
            options={resourceTypes.map(type => ({ value: type, label: type }))}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Update changes will be stored as pending and go live once approved by an admin.
            </p>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedResource(null);
        }}
        title="Delete Resource"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteResource} loading={deleteLoading}>
              Delete
            </Button>
          </>
        }
      >
        {selectedResource && (
          <div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{selectedResource.title}</p>
              <p className="text-sm text-gray-600">{selectedResource.moduleCode}</p>
            </div>
          </div>
        )}
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
        {selectedResource && (
          <div>
            <p className="text-gray-600 mb-4">
              How useful was "{selectedResource.title}"?
            </p>

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
                      className={`w-10 h-10 ${star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Share your thoughts about this resource..."
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default StudentResources;