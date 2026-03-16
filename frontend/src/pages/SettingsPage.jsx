import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Logo from '../components/Logo';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRestrictions, setUserRestrictions] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    notifications: true,
    twoFactor: false
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileResponse, restrictionsResponse, auditResponse] = await Promise.all([
        userAPI.getProfile(),
        userAPI.checkAccountRestrictions(1),
        userAPI.getAuditLogs()
      ]);

      setUserData(profileResponse.data.data);
      setUserRestrictions(restrictionsResponse.data.data);
      setAuditLogs(auditResponse.data.data.audit_logs || []);
      
      setFormData({
        email: profileResponse.data.data.email || '',
        phone: profileResponse.data.data.phone || '',
        notifications: true,
        twoFactor: false
      });
    } catch (error) {
      console.error('Settings data fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load settings. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      // Mock profile update
      setUserData({...userData, email: formData.email, phone: formData.phone});
      // Show success message
      setError('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskScoreColor = (score) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    if (score < 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskScoreLabel = (score) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    if (score < 80) return 'High Risk';
    return 'Very High Risk';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <nav className="flex space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Wallet
              </button>
              <button
                onClick={() => navigate('/escrow')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Escrow
              </button>
              <button
                onClick={() => navigate('/transactions')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Transactions
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            error.includes('success') 
              ? 'bg-green-900 border-green-800' 
              : 'bg-red-900 border-red-800'
          }`}>
            <p className={error.includes('success') ? 'text-green-200' : 'text-red-200'}>
              {error}
            </p>
          </div>
        )}

        {/* Settings Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Audit Logs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      email: userData?.email || '',
                      phone: userData?.phone || '',
                      notifications: true,
                      twoFactor: false
                    })}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
              
              {/* Account Status */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Account Status</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Risk Score</p>
                      <p className={`text-2xl font-bold ${getRiskScoreColor(userRestrictions?.risk_score || 0)}`}>
                        {userRestrictions?.risk_score || 0}/100
                      </p>
                      <p className="text-gray-400 text-sm">{getRiskScoreLabel(userRestrictions?.risk_score || 0)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userRestrictions?.is_restricted 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userRestrictions?.is_restricted ? 'Restricted' : 'Active'}
                      </span>
                      {userRestrictions?.is_restricted && (
                        <p className="text-red-400 text-sm mt-2">
                          Cannot: {userRestrictions.restrictions.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">2FA Status</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Password</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-gray-400 text-sm">Last changed: Never</p>
                    </div>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive email notifications about your account activity</p>
                  </div>
                  <button
                    onClick={() => setFormData({...formData, notifications: !formData.notifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.notifications ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">SMS Notifications</p>
                    <p className="text-gray-400 text-sm">Receive SMS notifications for important updates</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Receive push notifications in your browser</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Audit Logs</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Details</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8">
                          <p className="text-gray-400">No audit logs found</p>
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-800">
                          <td className="py-4 px-4">
                            <span className="text-white font-medium capitalize">
                              {log.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 text-sm">
                              {log.details}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 text-sm">
                              {log.ip_address}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 text-sm">
                              {formatDate(log.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
