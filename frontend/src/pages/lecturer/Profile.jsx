// LecturerProfile.jsx
// Component: Lecturer Profile
// Purpose: Allows authenticated lecturers to view and edit their profile details,
//          including name, position, bio, and the modules they teach.
//          Fetches the module catalog from the API for the teaching modules selector.
// Author: [Your Name]
// Last Modified: [Date]

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

// Utility: Normalizes the raw module catalog from the API into a consistent shape.
// Ensures every entry has a trimmed uppercase code and a display name.
// Filters out any entries missing a code, then sorts alphabetically by code.
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
  // Get the authenticated user and the context setter to update after save
  const { user, updateUser: setUserInContext } = useAuth();

  // loading: true while the profile update API call is in flight
  const [loading, setLoading] = useState(false);

  // isEditing: toggles the form between read-only view and editable mode
  const [isEditing, setIsEditing] = useState(false);

  // catalogModules: full list of available modules fetched from /modules
  const [catalogModules, setCatalogModules] = useState([]);

  // modulesLoading: true while the module catalog is being fetched
  const [modulesLoading, setModulesLoading] = useState(true);

  // formData: mirrors the lecturer's editable profile fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    lecturerId: '',
    department: '',
    position: '',
    bio: '',
    teachingModules: [] // Array of uppercase module codes (e.g. ["SE3020", "IT3030"])
  });

  // Fetch the full module catalog once on mount.
  // Uses a cancellation flag to avoid state updates on unmounted components.
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
    // Cleanup: prevents stale state updates if the component unmounts mid-fetch
    return () => {
      cancelled = true;
    };
  }, []);

  // Build a Map of code → module for O(1) name lookups by module code.
  // Recomputed only when catalogModules changes.
  const moduleByCode = useMemo(() => {
    const map = new Map();
    catalogModules.forEach((m) => map.set(m.code, m));
    return map;
  }, [catalogModules]);

  // Sync formData with the authenticated user whenever the user object changes
  // (e.g. after a successful profile update refreshes the context)
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        lecturerId: user.lecturerId || user.studentId || '', // Fallback to studentId if lecturerId absent
        department: user.department || '',
        position: user.position || '',
        bio: user.bio || '',
        teachingModules: (user.teachingModules || [])
          .map((c) => String(c).trim().toUpperCase())
          .filter(Boolean) // Remove any empty/null codes
      });
    }
  }, [user]);

  // Generic field change handler — does nothing if not in edit mode
  const handleChange = (e) => {
    if (!isEditing) return;
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Toggle a module code in/out of the teachingModules array.
  // Selecting an already-selected module removes it (checkbox behavior).
  const handleModuleSelection = (moduleCode) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const current = prev.teachingModules || [];
      const upper = String(moduleCode).toUpperCase();
      if (current.includes(upper)) {
        // Deselect: remove the code from the array
        return { ...prev, teachingModules: current.filter((c) => c !== upper) };
      }
      // Select: append the code to the array
      return { ...prev, teachingModules: [...current, upper] };
    });
  };

  // Submit handler: resolves the user ID, builds the update payload,
  // PUTs to the API, then refreshes the user context on success.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Resolve user ID from either _id (MongoDB) or id field
    const userId = user?._id != null ? String(user._id) : user?.id != null ? String(user.id) : '';
    if (!userId) {
      toast.error('Could not determine your account id. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      // Only send fields the API allows lecturers to update
      const payload = {
        fullName: formData.fullName?.trim(),
        position: formData.position || 'Lecturer', // Default to 'Lecturer' if blank
        bio: formData.bio?.trim() ?? '',
        teachingModules: formData.teachingModules || []
      };

      const res = await API.put(`/users/${userId}`, payload);
      toast.success('Profile updated successfully');
      setIsEditing(false);

      // Update the auth context: prefer the user object from the PUT response,
      // fall back to a fresh GET /auth/me if the response doesn't include it
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

  // Returns the display name for a module code, falling back to the code itself
  // if the module isn't found in the catalog (e.g. catalog failed to load)
  const resolveModuleName = (code) => moduleByCode.get(String(code).toUpperCase())?.name || code;

  // Don't render anything until the user is available in context
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* ── Profile Header: Cover photo + avatar + name ──────────────────── */}
        <div className="mb-8 relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">

          {/* Decorative cover photo banner */}
          <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-blue-50 via-sky-100 to-cyan-50">
            <div className="absolute inset-0 bg-white/20"></div>
          </div>

          {/* Profile details row: avatar overlaps the cover photo */}
          <div className="px-6 pb-6 relative pt-0">

            {/* Avatar circle — displays the first letter of the lecturer's name */}
            <div className="absolute -top-16 md:-top-20 left-6 z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1.5 shadow-lg">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center border border-gray-100">
                  <span className="text-5xl md:text-6xl font-bold text-blue-700">
                    {user.fullName?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Name, subtitle, and Edit/Cancel toggle button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 ml-0 md:ml-48 mt-16 md:mt-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{user.fullName || 'Lecturer Profile'}</h1>
                <p className="text-gray-600 font-medium text-lg">Lecturer Profile</p>
                <p className="text-gray-500 text-sm mt-1">Manage your public information and teaching context.</p>
              </div>

              {/* Toggle between Edit and Cancel Editing modes */}
              <div className="flex-shrink-0 mt-4 md:mt-0">
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
        </div>

        {/* ── Profile Form Card ─────────────────────────────────────────────── */}
        <Card className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Row 1: Full Name + Email (email is always read-only) ──────── */}
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
              {/* Email is permanently disabled — cannot be changed by the lecturer */}
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

            {/* ── Row 2: Lecturer ID + Department (both always read-only) ───── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lecturer ID is assigned by administration — not editable */}
              <Input
                label="Lecturer ID"
                name="lecturerId"
                icon={Briefcase}
                value={formData.lecturerId}
                disabled
                helperText="ID is issued by administration."
              />
              {/* Department is set by admin — not editable by the lecturer */}
              <Input
                label="Department"
                name="department"
                icon={Building2}
                value={formData.department}
                disabled
                helperText="Department cannot be changed."
              />
            </div>

            {/* ── Row 3: Position (dropdown in edit mode, plain input when viewing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                // Editable: dropdown with allowed position values
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
                // Read-only: plain disabled input
                <Input label="Position" name="position" value={formData.position} disabled />
              )}
            </div>

            {/* ── Bio: free-text area, disabled when not editing ────────────── */}
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

            {/* ── Teaching Modules ──────────────────────────────────────────── */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> Teaching Modules
              </h2>

              {!isEditing ? (
                // View mode: list assigned modules as badge + name rows
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
                          {/* Resolve full module name from catalog; falls back to code */}
                          <span className="font-medium text-gray-800 text-sm">{resolveModuleName(code)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : modulesLoading ? (
                // Edit mode: show loader while catalog is still fetching
                <div className="flex justify-center py-12 border border-primary-200 rounded-lg bg-primary-50/30">
                  <Loader text="Loading modules…" />
                </div>
              ) : catalogModules.length === 0 ? (
                // Edit mode: warn if catalog came back empty (API/seed issue)
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  No modules returned from the server. Check that the API is running and modules are seeded.
                </p>
              ) : (
                // Edit mode: scrollable checkbox list of all catalog modules
                <div className="border border-primary-200 rounded-lg p-4 bg-primary-50/30 max-h-[28rem] overflow-y-auto space-y-2">
                  <p className="text-xs text-primary-600 font-medium mb-3">
                    Select the modules you teach ({catalogModules.length} available from catalog).
                  </p>
                  {catalogModules.map((module) => (
                    <label
                      key={module.code}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-primary-100"
                    >
                      {/* Checkbox checked state driven by teachingModules array */}
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

            {/* ── Save Button (only visible in edit mode) ───────────────────── */}
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