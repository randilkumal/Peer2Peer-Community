import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import API from "../../utils/api";
import { ArrowLeft, RotateCcw, CalendarDays, MapPin, Link2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const AdminEditSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    description: "",
    requiredStudents: 0,
    requiredExperts: 0,
    date: "",
    startTime: "",
    endTime: "",
    isOnline: false,
    venue: "",
    meetingLink: "",
  });

  const scheduleFields = ["date", "startTime", "endTime", "isOnline", "venue", "meetingLink"];

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/sessions/${id}`);
        const s = res.data.session;

        const mappedForm = {
          title: s.title || "",
          moduleCode: s.moduleCode || "",
          description: s.description || "",
          requiredStudents: s.requiredStudents ?? 0,
          requiredExperts: s.requiredExperts ?? 0,
          date: s.date ? s.date.split("T")[0] : "",
          startTime: s.startTime || "",
          endTime: s.endTime || "",
          isOnline: s.isOnline || false,
          venue: s.venue || "",
          meetingLink: s.meetingLink || "",
        };

        setSession(s);
        setForm(mappedForm);
        setOriginalForm(mappedForm);
      } catch (error) {
        toast.error("Failed to load session");
        navigate("/admin/sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    // Hard guard: never allow schedule edits while locked
    if (scheduleFields.includes(field) && isScheduleDisabled()) {
      setShowWarningModal(true);
      return;
    }

    setForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === "isOnline") {
        if (value) {
          updated.venue = "";
        } else {
          updated.meetingLink = "";
        }
      }

      return updated;
    });
  };

  const handleReset = () => {
    if (originalForm) {
      setForm(originalForm);
      toast.success("Form reset to original values");
    }
  };

  const openLockedScheduleWarning = () => {
    if (isScheduleDisabled()) {
      setShowWarningModal(true);
    }
  };

  // Check if schedule fields should be disabled
  const isScheduleDisabled = () => {
    const joinedStudents = session?.participants?.length || 0;
    return (
      form.requiredStudents <= 0 ||
      form.requiredExperts <= 0 ||
      joinedStudents < form.requiredStudents
    );
  };

  // Check if user is trying to edit schedule fields
  const isScheduleBeingEdited = () => {
    if (!originalForm) return false;
    return scheduleFields.some(field => form[field] !== originalForm[field]);
  };

  const validateForm = () => {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (form.startTime && !timePattern.test(form.startTime)) {
      toast.error("Start Time must be in HH:mm format");
      return false;
    }

    if (form.endTime && !timePattern.test(form.endTime)) {
      toast.error("End Time must be in HH:mm format");
      return false;
    }

    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      toast.error("End Time must be later than Start Time");
      return false;
    }

    // Only validate Meeting Link field (as requested)
    if (!form.isOnline) return true;

    const link = form.meetingLink.trim();
    if (!link) {
      toast.error("Meeting link is required for online sessions");
      return false;
    }

    try {
      const url = new URL(link);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        toast.error("Meeting link must start with http:// or https://");
        return false;
      }
    } catch {
      toast.error("Meeting link must be a valid URL");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if trying to edit schedule fields without required students/experts
    if (isScheduleBeingEdited() && isScheduleDisabled()) {
      setShowWarningModal(true);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        moduleCode: form.moduleCode.trim(),
        description: form.description.trim(),
        venue: form.isOnline ? "" : form.venue.trim(),
        meetingLink: form.isOnline ? form.meetingLink.trim() : "",
        date: form.date || undefined,
      };

      await API.put(`/sessions/${id}`, payload);
      toast.success("Session updated successfully");
      navigate(`/admin/sessions/${id}`);
    } catch (error) {
      // Check if it's the schedule edit validation error
      if (
        error.response?.data?.errorCode === 'SCHEDULE_EDIT_REQUIRES_STUDENTS_EXPERTS' ||
        error.response?.data?.errorCode === 'SCHEDULE_EDIT_REQUIRES_STUDENT_JOINS'
      ) {
        setShowWarningModal(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to update session");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl p-8">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(`/admin/sessions/${id}`)}
          className="mb-6"
        >
          Back to Session
        </Button>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-lg">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Session Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the session information, schedule, and delivery mode.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
            <p className="-mt-3 text-xs text-gray-500">
              Title length: {form.title.trim().length} characters
            </p>

            <Input
              label="Module Code"
              value={form.moduleCode}
              onChange={(e) => handleChange("moduleCode", e.target.value)}
              required
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Give a clear explanation of the session.</span>
                <span>{form.description.length}/500</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="number"
                label="Required Students"
                value={form.requiredStudents}
                onChange={(e) =>
                  handleChange(
                    "requiredStudents",
                    Math.max(0, Number(e.target.value) || 0)
                  )
                }
                min={0}
              />
              <Input
                type="number"
                label="Required Experts"
                value={form.requiredExperts}
                onChange={(e) =>
                  handleChange(
                    "requiredExperts",
                    Math.max(0, Number(e.target.value) || 0)
                  )
                }
                min={0}
              />
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Adding date, time, and venue or meeting link will automatically
              move this announcement to <strong>Pending</strong>.
            </div>

            <hr className="my-6" />

            <div className="flex items-center gap-2 text-gray-900">
              <CalendarDays size={18} className="text-primary-600" />
              <h3 className="font-semibold">Schedule (optional)</h3>
              {isScheduleDisabled() && (
                <span className="ml-auto text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Locked: Wait for required student joins
                </span>
              )}
            </div>

            {isScheduleDisabled() && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>
                  Schedule fields are currently locked. To unlock, at least{" "}
                  <strong>{form.requiredStudents || 0}</strong> students must join this session
                  (current joined: <strong>{session?.participants?.length || 0}</strong>).
                </p>
              </div>
            )}

            <div
              className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isScheduleDisabled() ? "cursor-not-allowed" : ""}`}
              onClick={openLockedScheduleWarning}
            >
              <Input
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isScheduleDisabled()}
              />
              <Input
                type="time"
                label="Start Time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="e.g. 14:00"
                disabled={isScheduleDisabled()}
              />
              <Input
                type="time"
                label="End Time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                placeholder="e.g. 16:00"
                disabled={isScheduleDisabled()}
              />
            </div>

            <div onClick={openLockedScheduleWarning} className={isScheduleDisabled() ? "cursor-not-allowed" : ""}>
              <label className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isOnline}
                  onChange={(e) => handleChange("isOnline", e.target.checked)}
                  className="rounded"
                  disabled={isScheduleDisabled()}
                />
                Online Session
              </label>

              {form.isOnline ? (
                <div onClick={openLockedScheduleWarning}>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Link2 size={16} className="text-primary-600" />
                    Meeting Link
                  </label>
                  <Input
                    type="url"
                    label=""
                    value={form.meetingLink}
                    onChange={(e) => handleChange("meetingLink", e.target.value)}
                    placeholder="https://..."
                    required={form.isOnline}
                    disabled={isScheduleDisabled()}
                  />
                </div>
              ) : (
                <div onClick={openLockedScheduleWarning}>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} className="text-primary-600" />
                    Venue
                  </label>
                  <Input
                    label=""
                    value={form.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    placeholder="Room / Location"
                    disabled={isScheduleDisabled()}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>

              <Button
                variant="outline"
                type="button"
                icon={RotateCcw}
                onClick={handleReset}
              >
                Reset
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`/admin/sessions/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        size="md"
        title="Cannot Edit Schedule"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">
                Incomplete Session Information
              </p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                To edit schedule details, this session must reach the required student joins first.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
            <p className="text-sm font-medium text-amber-900">
              ✓ Fields you can edit now:
            </p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Title</li>
              <li>• Module Code</li>
              <li>• Description</li>
              <li>• Required Students <span className="font-semibold text-red-600">(Currently Required)</span></li>
              <li>• Required Experts <span className="font-semibold text-red-600">(Currently Required)</span></li>
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900">
              🔒 Fields locked until requirements are met:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Schedule (Date, Start Time, End Time)</li>
              <li>• Online Session</li>
              <li>• Venue / Meeting Link</li>
            </ul>
          </div>

          <p className="text-xs text-gray-600 italic border-t pt-3">
            Schedule fields unlock only after required student joins are reached. Current:{" "}
            <strong>{session?.participants?.length || 0}</strong> / <strong>{form.requiredStudents || 0}</strong>.
          </p>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => setShowWarningModal(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminEditSessionDetails;