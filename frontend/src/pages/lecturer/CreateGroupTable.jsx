// CreateGroupTable.jsx
// Component: Create Group Table
// Purpose: Allows authenticated teachers to set up a new group assignment
// for a module they teach. Collects assignment details, group configuration,
// and a registration deadline, then posts to the API.
// Author: [Your Name]
// Last Modified: [Date]

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, CalendarClock, Users, FileText, AlertCircle } from 'lucide-react';
import { YEAR_LEVELS, SEMESTERS, SPECIALIZATIONS } from '../../utils/constants';

const CreateGroupTable = () => {
  const navigate = useNavigate();

  // Get the currently authenticated user (used to pre-fill teaching modules)
  const { user } = useAuth();

  // loading: tracks API submission state to show a spinner on the submit button
  const [loading, setLoading] = useState(false);

  // formData: holds all form field values with sensible defaults
  const [formData, setFormData] = useState({
    assignmentTitle: '',
    module: '',
    academicYear: new Date().getFullYear(), // Default to the current calendar year
    period: 'Jan-May',                       // Default semester period
    yearLevel: 3,
    semester: 1,
    specialization: 'All',
    numberOfGroups: 5,
    groupSize: 4,
    registrationDeadline: '',
    description: ''
  });

  // Pre-select the first teaching module assigned to the logged-in teacher
  useEffect(() => {
    if (user?.teachingModules && user.teachingModules.length > 0) {
      setFormData((prev) => ({
        ...prev,
        // Only set if no module has been chosen yet (avoids overwriting user edits)
        module: prev.module || String(user.teachingModules[0]).trim().toUpperCase()
      }));
    }
  }, [user]);

  // Normalize the teacher's module list: trim whitespace and uppercase each code
  const teachingModules = (user?.teachingModules || [])
    .map((code) => String(code || '').trim().toUpperCase())
    .filter(Boolean); // Remove any empty/null entries

  // Generic change handler — converts number inputs to Number type automatically
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Form submission: validates required fields, then POSTs to /groups/project
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation before hitting the API
    if (!formData.module) {
      toast.error('Please select a module you teach.');
      return;
    }
    if (!formData.registrationDeadline) {
      toast.error('Please select a registration deadline.');
      return;
    }

    setLoading(true);
    try {
      // Ensure the module code is normalized (trim + uppercase) before sending
      await API.post('/groups/project', {
        ...formData,
        module: String(formData.module).trim().toUpperCase()
      });
      toast.success('Group table created successfully.');
      navigate('/groups'); // Redirect back to the group assignments list on success
    } catch (error) {
      // API utility handles error toasts; log here for debugging
      console.error('Create group table error:', error);
    } finally {
      setLoading(false); // Always reset loading state after the request completes
    }
  };

  // Returns tomorrow's date as a string (YYYY-MM-DD) to enforce a future-only deadline
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          {/* Back navigation to the group assignments list */}
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Group Assignments
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Group Table</h1>
          <p className="text-gray-600 mt-1">Set up a new group assignment for a module you teach.</p>
        </div>

        {/* ── Form Card ────────────────────────────────────────────────────── */}
        <Card className="bg-white">
          {/* Placeholder for a loading skeleton (currently unused — kept for future use) */}
          {false ? null : (
            <form onSubmit={handleSubmit} className="space-y-6 p-6">

              {/* ── Section 1: Assignment Details ──────────────────────────── */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" /> Assignment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free-text title for the assignment (e.g. "Final Year Project") */}
                  <Input
                    label="Assignment Title"
                    name="assignmentTitle"
                    value={formData.assignmentTitle}
                    onChange={handleChange}
                    placeholder="e.g. Final Year Project"
                    required
                  />
                  {/* Module code the assignment belongs to */}
                  <Input
                    label="Module"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    placeholder="e.g. SE3020"
                    required
                  />
                </div>
                {/* Assignment Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Provide details about the assignment, submission instructions, etc."
                  ></textarea>
                </div>
              </div>

              {/* ── Section 2: Academic Period ─────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic year the assignment is tied to */}
                <Select
                  label="Academic Year"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  options={[2024, 2025, 2026, 2027].map((year) => ({ value: year, label: String(year) }))}
                  required
                />
                {/* Semester period: Jan-May or Jun-Nov */}
                <Select
                  label="Period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  options={[
                    { value: 'Jan-May', label: 'Jan-May' },
                    { value: 'Jun-Nov', label: 'Jun-Nov' }
                  ]}
                  required
                />
              </div>

              {/* ── Section 3: Student Cohort ──────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Target year level (e.g. Year 3) */}
                <Select
                  label="Year Level"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  options={YEAR_LEVELS.map((level) => ({ value: level, label: `Year ${level}` }))}
                  required
                />
                {/* Semester number within the academic year */}
                <Select
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  options={SEMESTERS.map((sem) => ({ value: sem, label: `Semester ${sem}` }))}
                  required
                />
                {/* Specialization filter — "All" includes every stream */}
                <Select
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  options={[
                    { value: 'All', label: 'All Specializations' },
                    ...SPECIALIZATIONS.map((spec) => ({ value: spec, label: spec }))
                  ]}
                  required
                />
              </div>

              {/* ── Section 4: Group Configuration & Deadline ─────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total number of groups to create */}
                <Input
                  label="Number of Groups"
                  name="numberOfGroups"
                  type="number"
                  min="1"
                  value={formData.numberOfGroups}
                  onChange={handleChange}
                  // Helper text dynamically shows max student capacity
                  helperText={`Maximum capacity: ${formData.numberOfGroups * formData.groupSize} students`}
                  required
                />
                {/* Max students allowed in each group */}
                <Input
                  label="Students per Group"
                  name="groupSize"
                  type="number"
                  min="1"
                  value={formData.groupSize}
                  onChange={handleChange}
                  required
                />
                {/* Registration deadline — must be at least tomorrow */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    min={getMinDate()} // Prevents selecting today or past dates
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Deadline for student group registration.</p>
                </div>
              </div>

              {/* ── Form Actions ───────────────────────────────────────────── */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {/* Cancel discards changes and returns to the groups list */}
                <Button type="button" variant="outline" onClick={() => navigate('/groups')}>
                  Cancel
                </Button>
                {/* Submit triggers handleSubmit; shows a spinner while loading */}
                <Button type="submit" loading={loading} icon={Save}>
                  Create Table
                </Button>
              </div>

            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateGroupTable;