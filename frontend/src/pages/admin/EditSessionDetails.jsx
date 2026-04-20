import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import API from "../../utils/api";
import { ArrowLeft, RotateCcw, CalendarDays, MapPin, Link2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminEditSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    description: "",
    requiredStudents: 25,
    requiredExperts: 1,
    date: "",
    startTime: "",
    endTime: "",
    isOnline: false,
    venue: "",
    meetingLink: "",
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/sessions/${id}`);
        const s = res.data.session;

        const mappedForm = {
          title: s.title || "",
          moduleCode: s.moduleCode || "",
          description: s.description || "",
          requiredStudents: s.requiredStudents ?? 25,
          requiredExperts: s.requiredExperts ?? 1,
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

  const validateForm = () => {
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
      toast.error(error.response?.data?.message || "Failed to update session");
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
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                min={1}
              />
              <Input
                type="number"
                label="Required Experts"
                value={form.requiredExperts}
                onChange={(e) =>
                  handleChange(
                    "requiredExperts",
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                min={1}
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Input
                label="Start Time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                placeholder="e.g. 14:00"
              />
              <Input
                label="End Time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                placeholder="e.g. 16:00"
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isOnline}
                  onChange={(e) => handleChange("isOnline", e.target.checked)}
                  className="rounded"
                />
                Online Session
              </label>

              {form.isOnline ? (
                <div>
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
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} className="text-primary-600" />
                    Venue
                  </label>
                  <Input
                    label=""
                    value={form.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    placeholder="Room / Location"
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
    </DashboardLayout>
  );
};

export default AdminEditSessionDetails;