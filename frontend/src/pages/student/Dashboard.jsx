import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { CheckCircle, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to the Student Collaboration Platform. Your dashboard is ready.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Profile Completion Card */}
          <Card className="bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {user?.profileCompletion || 0}%
                  </h3>
                  <Badge 
                    variant={user?.profileCompletion >= 80 ? 'success' : 'warning'}
                    size="sm"
                    className="mb-1"
                  >
                    {user?.profileCompletion >= 80 ? 'Great!' : 'In Progress'}
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-white">
            <div>
              <p className="text-sm text-gray-600 mb-3">Quick Actions</p>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => navigate('/sessions')}
                >
                  View Sessions
                </Button>
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => navigate('/resources')}
                >
                  Browse Resources
                </Button>
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => navigate('/groups')}
                >
                  Join Groups
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Main Content Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Your Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Welcome to your new workspace! Your recent activity will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;