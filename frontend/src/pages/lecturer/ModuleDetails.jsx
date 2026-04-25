
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { BookOpen, Users, CalendarClock, ArrowLeft, PlusCircle, ClipboardList, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';




// Main component for module details page
const ModuleDetail = () => {
  // Get module code from URL
  const { code } = useParams();

  // Navigation hook
  const navigate = useNavigate();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Store all projects/assignments for selected module
  const [projects, setProjects] = useState([]);

  // Current selected tab
  const [tab, setTab] = useState('register');

  // Track deleting item
  const [deletingId, setDeletingId] = useState(null);

  // Fetch data when component loads or code changes
  useEffect(() => {
    fetchModuleData();
  }, [code]);

  // Fetch assignments from backend and filter by module code
  const fetchModuleData = async () => {
    try {
      setLoading(true);

      const res = await API.get('/groups/projects');

      const allProjects = res.data.projects || [];

      const c = String(code || '').trim().toUpperCase();

      // Filter only selected module assignments
      const moduleProjects = allProjects.filter(
        (p) => String(p.module || '').trim().toUpperCase() === c
      );

      setProjects(moduleProjects);
    } catch (error) {
      console.error('Error fetching module projects:', error);
      toast.error('Failed to load group assignments for this module.');
    } finally {
      setLoading(false);
    }
  };

  // Open assignments (not published)
  const openAssignments = useMemo(() => projects.filter((p) => p.status !== 'published'), [projects]);

  // Published assignments
  const publishedAssignments = useMemo(() => projects.filter((p) => p.status === 'published'), [projects]);

  // Show data based on selected tab
  const tabList = tab === 'published' ? publishedAssignments : openAssignments;

  // Delete assignment function
  const handleDeleteProject = async (e, project) => {
    e.stopPropagation();

    const ok = window.confirm(
      `Delete "${project.assignmentTitle}"? All groups for this assignment will be removed. This cannot be undone.`
    );

    if (!ok) return;

    try {
      setDeletingId(project._id);

      await API.delete(`/groups/project/${project._id}`);

      toast.success('Group assignment deleted.');

      // Remove deleted item from UI
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  // Show loader while fetching data
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text={`Loading ${code}...`} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">

        {/* Top header section */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">

            {/* Back button */}
            <button
              onClick={() => navigate('/lecturer/modules')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            {/* Module title */}
            <div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">{code}</h1>
              </div>
              <p className="text-gray-600 mt-1 ml-11">Module group assignments</p>
            </div>
          </div>

          {/* Create new assignment button */}
          <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups/create')}>
            New Group Table
          </Button>
        </div>

        {/* Tabs section */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-shrink-0">

          {/* Open assignments tab */}
          <button
            type="button"
            onClick={() => setTab('register')}
          >
            Join group assignments
          </button>

          {/* Published assignments tab */}
          <button
            type="button"
            onClick={() => setTab('published')}
          >
            Final published groups
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 overflow-y-auto pb-8">

          {/* If no assignments */}
          {projects.length === 0 ? (
            <div>
              No Assignments Found
            </div>

          /* If selected tab has no data */
          ) : tabList.length === 0 ? (
            <div>
              No Data in This Tab
            </div>

          /* Show cards */
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {tabList.map((project) => {
                const diffDays = Math.ceil(
                  (new Date(project.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24)
                );

                const isClosedContext = diffDays <= 0;

                return (
                  <Card
                    key={project._id}
                    onClick={() => navigate(`/lecturer/groups/${project._id}`)}
                  >

                    {/* Title and delete button */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <h3>{project.assignmentTitle}</h3>

                      <button
                        type="button"
                        disabled={deletingId === project._id}
                        onClick={(e) => handleDeleteProject(e, project)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Footer info */}
                    <div>

                      {/* Group count */}
                      <div>
                        {project.numberOfGroups} Groups | Size: {project.groupSize}
                      </div>

                      {/* Deadline and status */}
                      <div>
                        {formatDate(project.registrationDeadline)}

                        <Badge>
                          {project.status === 'published'
                            ? 'Published'
                            : isClosedContext
                            ? 'Closed'
                            : 'Registration'}
                        </Badge>
                      </div>

                    </div>
                  </Card>
                );
              })}

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};


export default ModuleDetail;