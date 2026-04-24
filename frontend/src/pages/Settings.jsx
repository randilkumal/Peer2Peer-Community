import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Bell, Shield, Eye, Monitor } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'light',
    language: 'English',
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('General settings updated successfully.');
    }, 800);
  };

  const saveSecuritySettings = async (e) => {
    e.preventDefault();
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSecuritySettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully.');
    }, 800);
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary-600" />
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your preferences, security, and account settings for your {user.role || 'user'} account.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="p-2 bg-white">
              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'general'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  General
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'security'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  Privacy
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <Card className="bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">General Preferences</h2>
                <form onSubmit={saveGeneralSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      name="language"
                      value={generalSettings.language}
                      onChange={handleGeneralChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Preference</label>
                    <select
                      name="theme"
                      value={generalSettings.theme}
                      onChange={handleGeneralChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" loading={loading}>
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Notification Settings</h2>
                <form onSubmit={saveGeneralSettings} className="space-y-6">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive important updates via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={generalSettings.emailNotifications}
                        onChange={handleGeneralChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications in your browser.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={generalSettings.pushNotifications}
                        onChange={handleGeneralChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" loading={loading}>
                      Save Notifications
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Security Settings</h2>
                <form onSubmit={saveSecuritySettings} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={securitySettings.currentPassword}
                    onChange={handleSecurityChange}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={securitySettings.newPassword}
                    onChange={handleSecurityChange}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={securitySettings.confirmPassword}
                    onChange={handleSecurityChange}
                    required
                  />
                  <div className="pt-4">
                    <Button type="submit" loading={loading}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card className="bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Privacy Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">Profile Visibility</p>
                      <p className="text-sm text-gray-500">Allow other users to view your profile details.</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                      <option>Public</option>
                      <option>Private</option>
                      <option>Connections Only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">Online Status</p>
                      <p className="text-sm text-gray-500">Show when you are active on the platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="pt-4">
                    <Button type="button" onClick={() => toast.success('Privacy settings saved.')}>
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
