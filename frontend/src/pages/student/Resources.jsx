import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  File,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  History,
  Sparkles
} from 'lucide-react';

import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    module: '',
    resourceType: '',
    sortBy: 'newest'
  });

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    moduleCode: '',
    resourceType: 'Lecture Notes',
    file: null
  });

  const resourceTypes = ['Lecture Notes', 'Assignments', 'Past Papers', 'Textbooks', 'Other'];
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // MOCK DATA
  const MOCK_MODULES = [
    { code: 'CS101', name: 'Introduction to Computer Science' },
    { code: 'CS102', name: 'Programming Fundamentals' },
    { code: 'CS201', name: 'Data Structures & Algorithms' },
    { code: 'EE101', name: 'Basic Electronics' },
    { code: 'MA101', name: 'Calculus I' }
  ];

  const MOCK_RESOURCES = [
    { _id: '1', title: 'Data Structures Complete Notes', moduleCode: 'CS201', resourceType: 'Lecture Notes', description: 'Comprehensive guide to all data structures used in modern computing.', uploader: { fullName: 'Alex Johnson' }, createdAt: new Date().toISOString(), status: 'approved', downloadCount: 45 },
    { _id: '2', title: 'Logic Gates Lab Report', moduleCode: 'EE101', resourceType: 'Assignments', description: 'Solved assignment for the physical electronics lab conducted in week 4.', uploader: { fullName: 'Sarah Smith' }, createdAt: new Date().toISOString(), status: 'approved', downloadCount: 12 },
    { _id: '3', title: 'Programming Fundamentals Past Paper 2023', moduleCode: 'CS102', resourceType: 'Past Papers', description: 'Final examination paper from the 2023 spring semester.', uploader: { fullName: 'Michael Chen' }, createdAt: new Date().toISOString(), status: 'approved', downloadCount: 156 },
    { _id: '4', title: 'Calculus I Workbook', moduleCode: 'MA101', resourceType: 'Textbooks', description: 'Problem set and theory for limits and derivatives.', uploader: { fullName: 'Emma Wilson' }, createdAt: new Date().toISOString(), status: 'approved', downloadCount: 89 }
  ];

  const MOCK_HISTORY = [
    { _id: '5', title: 'Python Basics Cheat Sheet', moduleCode: 'CS102', resourceType: 'Lecture Notes', description: 'Quick reference for syntax and common libraries.', uploader: { fullName: 'System Admin' }, createdAt: new Date().toISOString(), status: 'approved', downloadCount: 1024 }
  ];

  const MOCK_AI_SUGGESTIONS = [
    { title: 'Advanced Algorithms Deep Dive', moduleCode: 'CS201', type: 'Lecture Notes', relevance: 98, description: 'AI-generated recommendation based on your interest in Data Structures.' },
    { title: 'Discrete Math for Computer Science', moduleCode: 'MA101', type: 'Textbook', relevance: 85, description: 'Found in the library as highly relevant to your recent searches.' }
  ];

  const tabs = [
    { id: 'all', label: 'All Resources', icon: FileText },
    { id: 'my-uploads', label: 'My Uploads', icon: Upload },
    { id: 'history', label: 'Download History', icon: History },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
  ];

  useEffect(() => {
    // Simulate initial loading
    setLoading(true);
    const timer = setTimeout(() => {
      setModules(MOCK_MODULES);
      if (activeTab === 'all') setResources(MOCK_RESOURCES);
      else if (activeTab === 'history') setResources(MOCK_HISTORY);
      else if (activeTab === 'my-uploads') setResources([]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeTab, filters]);

  useEffect(() => {
    if (searchQuery.length > 2 && activeTab === 'ai-suggestions') {
      setLoadingAI(true);
      const timer = setTimeout(() => {
        setAiSuggestions(MOCK_AI_SUGGESTIONS);
        setLoadingAI(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab]);

  const fetchResources = () => {
    // No-op for mock version as it's handled in the useEffect
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setTimeout(() => {
      toast.success('Simulation: File uploaded! (Backend not connected)');
      setShowUploadModal(false);
      setUploadLoading(false);
      setActiveTab('my-uploads');
    }, 1500);
  };

  const handleDownload = (resource) => {
    toast.success(`Download started: ${resource.title}`);
  };


  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.moduleCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Resources</h1>
            <p className="text-gray-600">Browse and share study materials with your peers</p>
          </div>
          <Button icon={Upload} onClick={() => setShowUploadModal(true)}>
            Upload Resource
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources by title or module code..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              className="flex-1"
              value={filters.module}
              onChange={(e) => setFilters({...filters, module: e.target.value})}
              options={[
                { value: '', label: 'All Modules' },
                ...modules.map(m => ({ value: m.code, label: m.code }))
              ]}
            />
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-2 font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>


        {activeTab === 'ai-suggestions' ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Resource Discovery</h2>
            <p className="text-gray-500 text-center max-w-md mx-auto px-6 mb-8">
              We're building an advanced AI engine to automatically categorize and recommend the best academic materials based on your learning style.
            </p>
            <div className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold rounded-full uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
              To Be Implemented
            </div>
          </div>
        ) : loading ? (

          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading Academic Library..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No Resources Found</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'history' 
                ? "You haven't downloaded any resources yet." 
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource._id} className="hover:shadow-lg transition-all flex flex-col h-full group border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-100">
                      {resource.resourceType}
                    </Badge>
                    {activeTab === 'my-uploads' && getStatusBadge(resource.status)}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-[10px] font-bold text-primary-600 mb-3 uppercase tracking-widest">{resource.moduleCode}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-grow leading-relaxed">{resource.description}</p>
                
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-700">{resource.uploader?.fullName?.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-gray-800 leading-none mb-0.5">{resource.uploader?.fullName}</span>
                        <span className="text-[10px] text-gray-400 leading-none">{formatDate(resource.createdAt)}</span>
                      </div>
                    </div>
                    {resource.downloadCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                        <Download className="w-3 h-3" />
                        {resource.downloadCount}
                      </div>
                    )}
                  </div>
                  
                  {(resource.status === 'approved' || activeTab === 'history') && (
                    <Button
                      fullWidth
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownload(resource)}
                      className="group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all font-bold"
                    >
                      Download Material
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}


        <Modal
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload New Resource"
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <Input
              label="Resource Title"
              placeholder="e.g. Week 4 Lecture Notes"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Module"
                value={uploadForm.moduleCode}
                onChange={(e) => setUploadForm({...uploadForm, moduleCode: e.target.value})}
                options={[
                  { value: '', label: 'Select Module' },
                  ...modules.map(m => ({ value: m.code, label: m.code }))
                ]}
                required
              />
              <Select
                label="Type"
                value={uploadForm.resourceType}
                onChange={(e) => setUploadForm({...uploadForm, resourceType: e.target.value})}
                options={resourceTypes.map(t => ({ value: t, label: t }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 h-24"
                placeholder="Briefly describe the resource..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
              <input
                type="file"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                required
              />
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <Button variant="ghost" type="button" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={uploadLoading}>
                Upload Now
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Resources;

