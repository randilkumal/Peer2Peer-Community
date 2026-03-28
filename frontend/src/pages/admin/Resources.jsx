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
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  File,
  FileArchive,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [selectedModule, setSelectedModule] = useState(searchParams.get("module") || "");
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [quickAction, setQuickAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
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
        total: all.length,
        pending: all.filter((r) => r.status === "pending").length,
        approved: all.filter((r) => r.status === "approved").length,
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

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        resource.title?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.moduleCode?.toLowerCase().includes(query) ||
        resource.uploader?.fullName?.toLowerCase().includes(query)
      );
    });
  }, [resources, searchQuery]);

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
            <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
            <p className="mt-1 text-gray-600">Review and approve uploaded resources</p>
          </div>

          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={loading || actionLoading}
          >
            Refresh
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setSelectedStatus("")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Resources</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
          </Card>

          <Card
            className="cursor-pointer border-yellow-200 bg-yellow-50 transition-shadow hover:shadow-md"
            onClick={() => setSelectedStatus("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-700">Pending</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.pending}</h3>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </Card>

          <Card
            className="cursor-pointer border-green-200 bg-green-50 transition-shadow hover:shadow-md"
            onClick={() => setSelectedStatus("approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-700">Approved</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.approved}</h3>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card
            className="cursor-pointer border-red-200 bg-red-50 transition-shadow hover:shadow-md"
            onClick={() => setSelectedStatus("rejected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-700">Rejected</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.rejected}</h3>
              </div>
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </Card>
        </div>

        <Card className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, uploader, module..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              className="w-full lg:w-48"
            />

            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              options={moduleOptions}
              className="w-full lg:w-56"
            />

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </Card>

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
          <Card padding="none">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Resource
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Module
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Uploader
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Uploaded
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredResources.map((resource) => {
                    // Type-based colors
                    const typeColors = {
                      'Lecture Notes': 'bg-blue-50 text-blue-900',
                      'Assignments':   'bg-green-50 text-green-900',
                      'Past Papers':   'bg-red-50 text-red-900',
                      'Textbooks':     'bg-purple-50 text-purple-900',
                      'Study Guides':  'bg-amber-50 text-amber-900',
                      'Other':         'bg-slate-50 text-slate-900'
                    };
                    const typeClass = typeColors[resource.resourceType] || 'bg-slate-50 text-slate-900';

                    return (
                    <tr key={resource._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                            {getFileIcon(resource.fileType)}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm">{resource.title}</p>
                            {resource.description && (
                              <p className="line-clamp-1 text-xs font-medium text-gray-400 mt-0.5 max-w-[200px]">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="inline-flex px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200">
                          {resource.moduleCode}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 border border-white shadow-sm">
                            <span className="text-sm font-black text-blue-600">
                              {resource.uploader?.fullName?.charAt(0) || "U"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {resource.uploader?.fullName || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${typeClass}`}>
                          {resource.resourceType || "Other"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-gray-500">
                        {formatDate(resource.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(resource.status)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            className="!rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs py-1.5 font-semibold"
                            onClick={() => navigate(`/admin/resources/${resource._id}`)}
                          >
                            View
                          </Button>

                          {isAdmin && resource.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={CheckCircle}
                                onClick={() => handleQuickApprove(resource)}
                                className="!rounded-xl border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 text-xs py-1.5"
                                disabled={actionLoading}
                              >
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                icon={XCircle}
                                onClick={() => handleQuickReject(resource)}
                                className="!rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs py-1.5"
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </Card>
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
    </DashboardLayout>
  );
};

export default AdminResources;