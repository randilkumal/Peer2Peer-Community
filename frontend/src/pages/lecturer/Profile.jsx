import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, Briefcase, Building2, Save, Edit2, X } from 'lucide-react';

function normalizeModuleCatalog(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((m) => ({
      code: String(m.code || '').trim().toUpperCase(),
      name: (String(m.name || '').trim() || String(m.code || '').trim()) || ''
    }))
    .filter((m) => m.code)
    .sort((a, b) => a.code.localeCompare(b.code));
}

const LecturerProfile = () => {
  const { user, updateUser: setUserInContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [catalogModules, setCatalogModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    lecturerId: '',
    department: '',
    position: '',
    bio: '',
    teachingModules: []
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setModulesLoading(true);
        const res = await API.get('/modules');
        const list = normalizeModuleCatalog(res.data?.modules);
        if (!cancelled) setCatalogModules(list);
      } catch {
        if (!cancelled) {
          setCatalogModules([]);
          toast.error('Could not load the module list.');
        }
      } finally {
        if (!cancelled) setModulesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const moduleByCode = useMemo(() => {
    const map = new Map();
    catalogModules.forEach((m) => map.set(m.code, m));
    return map;
  }, [catalogModules]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        lecturerId: user.lecturerId || user.studentId || '',
        department: user.department || '',
        position: user.position || '',
        bio: user.bio || '',
        teachingModules: (user.teachingModules || [])
          .map((c) => String(c).trim().toUpperCase())
          .filter(Boolean)
      });
    }
  }, [user]);

  const handleChange = (e) => {
    if (!isEditing) return;
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModuleSelection = (moduleCode) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const current = prev.teachingModules || [];
      const upper = String(moduleCode).toUpperCase();
      if (current.includes(upper)) {
        return { ...prev, teachingModules: current.filter((c) => c !== upper) };
      }
      return { ...prev, teachingModules: [...current, upper] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?._id != null ? String(user._id) : user?.id != null ? String(user.id) : '';
    if (!userId) {
      toast.error('Could not determine your account id. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName?.trim(),
        position: formData.position || 'Lecturer',
        bio: formData.bio?.trim() ?? '',
        teachingModules: formData.teachingModules || []
      };

      const res = await API.put(`/users/${userId}`, payload);
      toast.success('Profile updated successfully');
      setIsEditing(false);

      if (res.data?.user) {
        setUserInContext(res.data.user);
      } else {
        const me = await API.get('/auth/me');
        if (me.data?.user) setUserInContext(me.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const resolveModuleName = (code) => moduleByCode.get(String(code).toUpperCase())?.name || code;

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <span className="text-4xl md:text-5xl font-bold text-blue-700">
                {user.fullName?.charAt(0)}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mt-2 md:mt-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.fullName || 'Lecturer Profile'}</h1>
              <p className="text-gray-600 font-medium text-base mt-1">Lecturer Profile</p>
              <p className="text-gray-500 text-sm mt-1">Manage your public information and teaching context.</p>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} icon={Edit2} className="w-full md:w-auto shadow-sm">
                  Edit Details
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(false)} icon={X} className="w-full md:w-auto shadow-sm">
                  Cancel Editing
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                icon={User}
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                disabled
                helperText="Email cannot be changed."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Lecturer ID"
                name="lecturerId"
                icon={Briefcase}
                value={formData.lecturerId}
                disabled
                helperText="ID is issued by administration."
              />
              <Input
                label="Department"
                name="department"
                icon={Building2}
                value={formData.department}
                disabled
                helperText="Department cannot be changed."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <Select
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  options={[
                    { value: 'Lecturer', label: 'Lecturer' },
                    { value: 'Senior Lecturer', label: 'Senior Lecturer' },
                    { value: 'Professor', label: 'Professor' }
                  ]}
                  required
                />
              ) : (
                <Input label="Position" name="position" value={formData.position} disabled />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                placeholder="Briefly describe your academic background and research interests."
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> Teaching Modules
              </h2>

              {!isEditing ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  {formData.teachingModules.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No modules currently assigned.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {formData.teachingModules.map((code) => (
                        <div
                          key={code}
                          className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                        >
                          <Badge variant="primary">{code}</Badge>
                          <span className="font-medium text-gray-800 text-sm">{resolveModuleName(code)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : modulesLoading ? (
                <div className="flex justify-center py-12 border border-primary-200 rounded-lg bg-primary-50/30">
                  <Loader text="Loading modules…" />
                </div>
              ) : catalogModules.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  No modules returned from the server. Check that the API is running and modules are seeded.
                </p>
              ) : (
                <div className="border border-primary-200 rounded-lg p-4 bg-primary-50/30 max-h-[28rem] overflow-y-auto space-y-2">
                  <p className="text-xs text-primary-600 font-medium mb-3">
                    Select the modules you teach ({catalogModules.length} available from catalog).
                  </p>
                  {catalogModules.map((module) => (
                    <label
                      key={module.code}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-primary-100"
                    >
                      <input
                        type="checkbox"
                        checked={formData.teachingModules.includes(module.code)}
                        onChange={() => handleModuleSelection(module.code)}
                        className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">
                          <span className="font-mono text-primary-700">{module.code}</span>
                          <span className="text-gray-400 mx-2">—</span>
                          <span>{module.name}</span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" loading={loading} icon={Save}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LecturerProfile;
