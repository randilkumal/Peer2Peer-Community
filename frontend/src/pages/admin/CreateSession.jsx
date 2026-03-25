

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import API from '../../utils/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCreateSession = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    title: '',
    moduleCode: '',
    description: '',
    requiredStudents: 25,
    requiredExperts: 1
  });

  useEffect(() => {
    API.get('/modules').then(res => setModules(res.data.modules || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.moduleCode || !form.description) {
      toast.error('Title, module code and description are required');
      return;
    }
    try {
      setLoading(true);
      await API.post('/sessions', form);
      toast.success('Session announcement created successfully');
      navigate('/admin/sessions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/sessions')} className="mb-6">
          Back to Sessions
        </Button>
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Session Announcement</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Data Structures Revision Session"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Code *</label>
              <select
                value={form.moduleCode}
                onChange={(e) => setForm({ ...form, moduleCode: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                required
              >
                <option value="">Select module</option>
                {modules.map(m => (
                  <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Describe the session topic and what students will learn"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Required Students (min)"
                value={form.requiredStudents}
                onChange={(e) => setForm({ ...form, requiredStudents: parseInt(e.target.value) || 25 })}
                min={1}
              />
              <Input
                type="number"
                label="Required Experts"
                value={form.requiredExperts}
                onChange={(e) => setForm({ ...form, requiredExperts: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>
                Create Announcement
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate('/admin/sessions')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreateSession;
