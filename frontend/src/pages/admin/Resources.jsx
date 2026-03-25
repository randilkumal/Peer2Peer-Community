import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import API from '../../utils/api';
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Clock,
  AlertCircle,
  File,
  FileArchive,
  FileSpreadsheet,
  User,
  Calendar
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedModule, setSelectedModule] = useState('');
  const [modules, setModules] = useState([]);
  
  // Quick action modal
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [quickAction, setQuickAction] = useState(''); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getModuleName = (code) => {
    const module = modules.find(m => m.code === code);
    return module ? module.name : '';
  };

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchResources();
    fetchModules();
  }, [selectedStatus, selectedModule]);

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
      let endpoint = '/resources?';
      
      if (selectedStatus) endpoint += `status=${selectedStatus}&`;
      if (selectedModule) endpoint += `module=${selectedModule}&`;

      const response = await API.get(endpoint);
      setResources(response.data.resources || []);
      
      // Calculate stats
      const all = response.data.resources || [];
      setStats({
        total: all.length,
        pending: all.filter(r => r.status === 'pending').length,
        approved: all.filter(r => r.status === 'approved').length,
        rejected: all.filter(r => r.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = (resource) => {
    setSelectedResource(resource);
    setQuickAction('approve');
    setShowQuickActionModal(true);
  };

  const handleQuickReject = (resource) => {
    setSelectedResource(resource);
    setQuickAction('reject');
    setRejectionReason('');
    setShowQuickActionModal(true);
  };

  const confirmQuickAction = async () => {
    if (quickAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      
      if (quickAction === 'approve') {
        await API.post(`/resources/${selectedResource._id}/approve`);
        toast.success('Resource approved successfully!');
      } else {
        await API.post(`/resources/${selectedResource._id}/reject`, {
          reason: rejectionReason
        });
        toast.success('Resource rejected');
      }

      setShowQuickActionModal(false);
      setSelectedResource(null);
      setRejectionReason('');
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-6 h-6" />;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('doc')) return <FileText className="w-6 h-6 text-blue-500" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-6 h-6 text-yellow-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredResources = resources.filter(resource => {
    if (!searchQuery) return true;
    return (
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploader?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-1">
            Review and approve uploaded resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedStatus('')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Resources</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-yellow-50 border-yellow-200"
            onClick={() => setSelectedStatus('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Pending</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.pending}</h3>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-green-50 border-green-200"
            onClick={() => setSelectedStatus('approved')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Approved</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.approved}</h3>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-red-50 border-red-200"
            onClick={() => setSelectedStatus('rejected')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Rejected</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.rejected}</h3>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, uploader, module..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              className="w-48"
            />

            {/* Module Filter */}
            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              options={[
                { value: '', label: 'All Modules' },
                ...modules.map(m => ({ value: m.code, label: `${m.code} - ${m.name}` }))
              ]}
              className="w-48 text-xs"
            />
          </div>
        </Card>

        {/* Resources Table */}
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
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search or filters' : 'No resources match the selected filters'}
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(resource.fileType)}
                          <div>
                            <p className="font-medium text-gray-900">{resource.title}</p>
                            {resource.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary-outline" size="sm" className="whitespace-normal text-left max-w-[180px]">
                          {getModuleName(resource.moduleCode) ? `${getModuleName(resource.moduleCode)} - ${resource.moduleCode}` : resource.moduleCode}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-xs">
                              {resource.uploader?.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">
                            {resource.uploader?.fullName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" size="sm">
                          {resource.resourceType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(resource.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(resource.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => navigate(`/admin/resources/${resource._id}`)}
                          >
                            View
                          </Button>
                          
                          {resource.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={CheckCircle}
                                onClick={() => handleQuickApprove(resource)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={XCircle}
                                onClick={() => handleQuickReject(resource)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Action Modal */}
      <Modal
        isOpen={showQuickActionModal}
        onClose={() => {
          setShowQuickActionModal(false);
          setSelectedResource(null);
          setRejectionReason('');
        }}
        title={quickAction === 'approve' ? 'Approve Resource' : 'Reject Resource'}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowQuickActionModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={quickAction === 'approve' ? 'primary' : 'danger'}
              onClick={confirmQuickAction}
              loading={actionLoading}
            >
              {quickAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        {selectedResource && (
          <div>
            <p className="text-gray-600 mb-4">
              {quickAction === 'approve' 
                ? 'Are you sure you want to approve this resource?' 
                : 'Please provide a reason for rejection:'}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">{selectedResource.title}</p>
              <p className="text-sm text-gray-600">{selectedResource.moduleCode}</p>
              <p className="text-sm text-gray-600">
                By {selectedResource.uploader?.fullName}
              </p>
            </div>

            {quickAction === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g., Content is not relevant, file is corrupted, etc."
                  required
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminResources;
