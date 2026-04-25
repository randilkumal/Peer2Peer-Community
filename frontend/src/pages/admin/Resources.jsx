import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import API from "../../utils/api";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  File,
  FileArchive,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Upload,
  X,
} from "lucide-react";
import FileViewer from "../../components/common/FileViewer";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "pending");
  const [pendingSubTab, setPendingSubTab] = useState("new"); // "new" | "updates"
  const [selectedModule, setSelectedModule] = useState(searchParams.get("module") || "");
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [quickAction, setQuickAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    moduleCode: '',
    resourceType: 'Lecture Notes',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  const [viewerState, setViewerState] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: "",
    fileType: "",
    downloadUrl: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pendingNew: 0,
    pendingUpdates: 0,
    approved: 0,
    rejected: 0,
  });

  const isAdmin = user?.role === "admin";

  const getModuleName = (code) => {
    const module = modules.find((m) => m.code === code);
    return module ? module.name : "";
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedStatus) params.status = selectedStatus;
    if (selectedModule) params.module = selectedModule;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);
  }, [selectedStatus, selectedModule, searchQuery, setSearchParams]);

  useEffect(() => {
    fetchResources();
  }, [selectedStatus, selectedModule]);

  const fetchModules = async () => {
    try {
      setModulesLoading(true);
      const response = await API.get("/modules");
      setModules(response.data.modules || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Failed to load modules");
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);

      let endpoint = "/resources?";
      if (selectedStatus) endpoint += `status=${selectedStatus}&`;
      if (selectedModule) endpoint += `module=${selectedModule}&`;

      const response = await API.get(endpoint);
      const all = response.data.resources || [];

      setResources(all);
      setStats({
        total: all.filter(r => !(r.status === "approved" && r.pendingUpdate?.status === "pending" && r.pendingUpdate?.requestedAt)).length,
        pending: all.filter((r) => r.status === "pending" || (r.pendingUpdate?.status === "pending" && r.pendingUpdate?.requestedAt)).length,
        pendingNew: all.filter((r) => r.status === "pending").length,
        pendingUpdates: all.filter((r) => r.status === "approved" && r.pendingUpdate?.status === "pending" && r.pendingUpdate?.requestedAt).length,
        approved: all.filter((r) => r.status === "approved" && !(r.pendingUpdate?.status === "pending" && r.pendingUpdate?.requestedAt)).length,
        rejected: all.filter((r) => r.status === "rejected").length,
      });
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchResources(), fetchModules()]);
    toast.success("Resources refreshed");
  };

  const handleQuickApprove = (resource) => {
    setSelectedResource(resource);
    setQuickAction("approve");
    setShowQuickActionModal(true);
  };

  const handleQuickReject = (resource) => {
    setSelectedResource(resource);
    setQuickAction("reject");
    setRejectionReason("");
    setShowQuickActionModal(true);
  };

  const closeQuickActionModal = () => {
    setShowQuickActionModal(false);
    setSelectedResource(null);
    setQuickAction("");
    setRejectionReason("");
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (uploadErrors[name]) {
      setUploadErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      setSelectedFile(file);
      if (uploadErrors.file) {
        setUploadErrors(prev => ({ ...prev, file: null }));
      }
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!uploadForm.title.trim()) errors.title = 'Title is required';
    if (!uploadForm.moduleCode) errors.moduleCode = 'Module is required';
    if (!selectedFile) errors.file = 'File is required';

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('moduleCode', uploadForm.moduleCode);
      formData.append('resourceType', uploadForm.resourceType);
      formData.append('description', uploadForm.description);
      formData.append('file', selectedFile);

      await API.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Resource uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        moduleCode: '',
        resourceType: 'Lecture Notes',
        description: ''
      });
      setSelectedFile(null);
      fetchResources();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resource');
    } finally {
      setUploadLoading(false);
    }
  };



  const handleView = (resource) => {
    navigate(`/admin/resources/${resource._id}`);
  };

  //Rejection Reason Validation
  const confirmQuickAction = async () => {
    if (!selectedResource) return;

    if (quickAction === "reject") {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }
      if (rejectionReason.trim().length < 10) {
        toast.error("Rejection reason should be at least 10 characters");
        return;
      }
    }

    try {
      setActionLoading(true);

      if (quickAction === "approve") {
        await API.post(`/resources/${selectedResource._id}/approve`);
        toast.success("Resource approved successfully");
      } else {
        await API.post(`/resources/${selectedResource._id}/reject`, {
          reason: rejectionReason.trim(),
        });
        toast.success("Resource rejected");
      }

      closeQuickActionModal();
      await fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedStatus("");
    setSelectedModule("");
    setSearchQuery("");
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="h-6 w-6" />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes("doc")) return <FileText className="h-6 w-6 text-blue-500" />;
    if (type.includes("xls") || type.includes("sheet")) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    }
    if (type.includes("zip") || type.includes("rar")) {
      return <FileArchive className="h-6 w-6 text-yellow-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const getStatusBadge = (resource) => {
    if (resource.status === "approved" && resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt) {
      return <Badge variant="warning">UPDATE PENDING</Badge>;
    }
    const variants = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return <Badge variant={variants[resource.status] || "default"}>{resource.status}</Badge>;
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Hide pending updates from "All Resources" tab as requested
      if (selectedStatus === "" && resource.status === "approved" && resource.pendingUpdate?.status === "pending") {
        return false;
      }

      // Handle sub-tabs when in "pending" status
      if (selectedStatus === "pending") {
        if (pendingSubTab === "new" && resource.status !== "pending") return false;
        if (pendingSubTab === "updates" && !(resource.status === "approved" && resource.pendingUpdate?.status === "pending" && resource.pendingUpdate?.requestedAt)) return false;
      }

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        resource.title?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.moduleCode?.toLowerCase().includes(query) ||
        resource.uploader?.fullName?.toLowerCase().includes(query)
      );
    });
  }, [resources, searchQuery, selectedStatus, pendingSubTab]);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const moduleOptions = [
    { value: "", label: modulesLoading ? "Loading modules..." : "All Modules" },
    ...modules.map((m) => ({
      value: m.code,
      label: `${m.code} - ${m.name}`,
    })),
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary-500" />
              Resource Management
            </h1>
            <p className="mt-2 text-gray-600">Review and approve uploaded resources</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={Upload}
              onClick={() => setShowUploadModal(true)}
              className="!rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100"
            >
              Upload Resource
            </Button>
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              className="h-[42px] border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
              disabled={loading || actionLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, uploader, module..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
              disabled={modulesLoading}
            >
              <option value="">
                {modulesLoading ? "Loading modules..." : "All Modules"}
              </option>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code}
                </option>
              ))}
            </select>

          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {filteredResources.length} of {resources.length} resources
          </p>
        </Card>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "", label: "All Resources", icon: FileText, count: stats.total },
              { id: "pending", label: "Pending", icon: Clock, count: stats.pending },
              { id: "approved", label: "Approved", icon: CheckCircle, count: stats.approved },
              { id: "rejected", label: "Rejected", icon: XCircle, count: stats.rejected }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-all ${
                    selectedStatus === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        selectedStatus === tab.id
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedStatus === "pending" && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setPendingSubTab("new")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pendingSubTab === "new"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              New Uploads ({stats.pendingNew})
            </button>
            <button
              onClick={() => setPendingSubTab("updates")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pendingSubTab === "updates"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Pending Updates ({stats.pendingUpdates})
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading resources..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No resources found
              </h3>
              <p className="mb-6 text-gray-600">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No resources match the selected filters"}
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Reset Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => {
              const typeClass = 'bg-gray-100 text-gray-700 border-gray-200';

              return (
                <Card
                  key={resource._id}
                  hover
                  className="cursor-pointer flex flex-col h-full"
                  onClick={() => handleView(resource)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        {getFileIcon(resource.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate" title={resource.title}>
                          {resource.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                          {resource.moduleCode} • {formatDate(resource.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {resource.description ? (
                      <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                        {resource.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic min-h-[40px]">
                        No description provided.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${typeClass}`}>
                      {resource.resourceType || "Other"}
                    </span>
                    {getStatusBadge(resource)}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 border border-white shadow-sm">
                         <span className="text-[10px] font-black text-blue-600">
                           {resource.uploader?.fullName?.charAt(0) || "U"}
                         </span>
                       </div>
                       <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]" title={resource.uploader?.fullName}>
                         {resource.uploader?.fullName || "Unknown"}
                       </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(resource)}
                      >
                        Show
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showQuickActionModal}
        onClose={closeQuickActionModal}
        title={quickAction === "approve" ? "Approve Resource" : "Reject Resource"}
        footer={
          <>
            <Button variant="outline" onClick={closeQuickActionModal}>
              Cancel
            </Button>
            <Button
              variant={quickAction === "approve" ? "primary" : "danger"}
              onClick={confirmQuickAction}
              loading={actionLoading}
            >
              {quickAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      >
        {selectedResource && (
          <div>
            <p className="mb-4 text-gray-600">
              {quickAction === "approve"
                ? "Are you sure you want to approve this resource?"
                : "Please provide a reason for rejection:"}
            </p>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">{selectedResource.title}</p>
              <p className="text-sm text-gray-600">{selectedResource.moduleCode}</p>
              <p className="text-sm text-gray-600">
                By {selectedResource.uploader?.fullName}
              </p>
            </div>

            {quickAction === "reject" && (
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
                  placeholder="e.g., Content is not relevant, file is corrupted, etc."
                  required
                />
                <div className="mt-2 text-right text-xs text-gray-500">
                  {rejectionReason.length}/500
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!uploadLoading) setShowUploadModal(false);
        }}
        title="Upload New Resource"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadResource}
              loading={uploadLoading}
            >
              Upload Resource
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={uploadForm.title}
              onChange={handleUploadChange}
              placeholder="e.g., Week 4 Lecture Slides"
              className={`w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 ${uploadErrors.title ? 'border-red-500' : ''}`}
            />
            {uploadErrors.title && <p className="text-xs text-red-500 font-bold">{uploadErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Module <span className="text-red-500">*</span>
              </label>
              <select
                name="moduleCode"
                value={uploadForm.moduleCode}
                onChange={handleUploadChange}
                className={`w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 ${uploadErrors.moduleCode ? 'border-red-500' : ''}`}
              >
                <option value="">Select Module</option>
                {modules.map(mod => (
                  <option key={mod.code} value={mod.code}>{mod.code} - {mod.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Category
              </label>
              <select
                name="resourceType"
                value={uploadForm.resourceType}
                onChange={handleUploadChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
              >
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Assignments">Assignments</option>
                <option value="Past Papers">Past Papers</option>
                <option value="Textbooks">Textbooks</option>
                <option value="Study Guides">Study Guides</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea
              name="description"
              value={uploadForm.description}
              onChange={handleUploadChange}
              rows={3}
              placeholder="Briefly explain what this resource contains..."
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">
              File Attachment <span className="text-red-500">*</span>
            </label>
            <div className={`relative group transition-all`}>
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${selectedFile ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50/30'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedFile ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 group-hover:text-blue-500'}`}>
                  {selectedFile ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-900 leading-tight">
                    {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, PPT, ZIP, DOCX (Max 50MB)'}
                  </p>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-colors z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {uploadErrors.file && <p className="text-xs text-red-500 font-bold">{uploadErrors.file}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                <Clock className="w-4 h-4" />
             </div>
             <p className="text-xs font-bold text-blue-800 leading-relaxed">
                As an admin, your uploaded resources will be automatically approved and visible to the community immediately.
             </p>
          </div>
        </form>
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
    </DashboardLayout>
  );
};

export default AdminResources;