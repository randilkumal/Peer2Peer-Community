import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import API from '../../utils/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEditSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({
    title: '',
    moduleCode: '',
    description: '',
    requiredStudents: 25,
    requiredExperts: 1,
    date: '',
    startTime: '',
    endTime: '',
    isOnline: false,
    venue: '',
    meetingLink: ''
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/sessions/${id}`);
        const s = res.data.session;
        setSession(s);
        setForm({
          title: s.title || '',
          moduleCode: s.moduleCode || '',
          description: s.description || '',
          requiredStudents: s.requiredStudents ?? 25,
          requiredExperts: s.requiredExperts ?? 1,
          date: s.date ? s.date.split('T')[0] : '',
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          isOnline: s.isOnline || false,
          venue: s.venue || '',
          meetingLink: s.meetingLink || ''
        });
      } catch (e) {
        toast.error('Failed to load session');
        navigate('/admin/sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        date: form.date || undefined
      };
      await API.put(`/sessions/${id}`, payload);
      toast.success('Session updated successfully');
      navigate(`/admin/sessions/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <DashboardLayout>
        <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(`/admin/sessions/${id}`)} className="mb-6">
          Back to Session
        </Button>
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Session Details</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Module Code"
              value={form.moduleCode}
              onChange={(e) => setForm({ ...form, moduleCode: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Required Students"
                value={form.requiredStudents}
                onChange={(e) => setForm({ ...form, requiredStudents: parseInt(e.target.value) || 25 })}
              />
              <Input
                type="number"
                label="Required Experts"
                value={form.requiredExperts}
                onChange={(e) => setForm({ ...form, requiredExperts: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Adding date/time and venue/meeting link will automatically move this announcement to <strong>Pending</strong>.
              </p>
            </div>
            <hr className="my-6" />
            <h3 className="font-semibold text-gray-900">Schedule (optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                label="Start Time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="e.g. 14:00"
              />
              <Input
                label="End Time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="e.g. 16:00"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={form.isOnline}
                  onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
                  className="rounded"
                />
                Online Session
              </label>
              {form.isOnline ? (
                <Input
                  label="Meeting Link (Zoom/Meet)"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  placeholder="https://..."
                />
              ) : (
                <Input
                  label="Venue"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Room / Location"
                />
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate(`/admin/sessions/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditSessionDetails;
