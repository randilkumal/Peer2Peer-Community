import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = [
    { key: "student", label: "Students" },
    { key: "expert", label: "Expert Students" },
    { key: "lecturer", label: "Lecturers" },
    { key: "admin", label: "Admins" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.role === activeTab);
  }, [users, activeTab]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          View users by role using separate tabs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => {
          const count = users.filter((u) => u.role === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-600">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-gray-600">
            No users found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{user.fullName || "N/A"}</td>
                    <td className="px-6 py-4">{user.email || "N/A"}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4 capitalize">
                      {user.status || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
