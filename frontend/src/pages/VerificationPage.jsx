import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Logo from '../components/Logo';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      const [verificationResponse, trustResponse] = await Promise.all([
        userAPI.getVerificationLevel(),
        userAPI.getTrustProfile()
      ]);

      setVerificationData(verificationResponse.data.data);
      setTrustData(trustResponse.data.data);
    } catch (error) {
      console.error('Verification data fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load verification data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.verifyPhone(phoneNumber);
      setSuccessMessage('Phone number verified successfully!');
      await fetchVerificationData(); // Refresh data
      setActiveStep(1);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify phone number');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailVerification = async () => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.verifyEmail();
      setSuccessMessage('Email verified successfully!');
      await fetchVerificationData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify email');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFacialVerification = async () => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.verifyFacial();
      setSuccessMessage('Facial verification completed successfully!');
      await fetchVerificationData(); // Refresh data
      setActiveStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to complete facial verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGovernmentIDVerification = async () => {
    if (!idNumber || idNumber.length < 6) {
      setError('Please enter a valid ID number');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.verifyGovernmentID(idType, idNumber);
      setSuccessMessage('Government ID verified successfully! You now have maximum verification level.');
      await fetchVerificationData(); // Refresh data
      setActiveStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify government ID');
    } finally {
      setIsProcessing(false);
    }
  };

  const getVerificationLevelColor = (level) => {
    switch (level) {
      case 0: return 'text-gray-600';
      case 1: return 'text-blue-600';
      case 2: return 'text-purple-600';
      case 3: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getVerificationLevelLabel = (level) => {
    switch (level) {
      case 0: return 'Unverified';
      case 1: return 'Basic Verified';
      case 2: return 'Advanced Verified';
      case 3: return 'Fully Verified';
      default: return 'Unverified';
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading verification data...</div>
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
                onClick={() => navigate('/verification')}
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Verification
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="mb-6 p-4 bg-red-900 border border-red-800 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900 border border-green-800 rounded-lg">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
          <p className="text-gray-400">Complete verification to unlock higher transaction limits and build trust</p>
        </div>

        {/* Verification Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Verification Level</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getVerificationLevelColor(verificationData?.verification_level?.level || 0)}`}>
                Level {verificationData?.verification_level?.level || 0}
              </div>
              <p className="text-gray-300">{getVerificationLevelLabel(verificationData?.verification_level?.level || 0)}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Trust Score</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getTrustScoreColor(trustData?.trust_score || 0)}`}>
                {trustData?.trust_score || 0}/100
              </div>
              <p className="text-gray-300">{getTrustScoreLabel(trustData?.trust_score || 0)}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Reputation Badge</h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {trustData?.reputation_badge || 'New'}
              </div>
              <p className="text-gray-300">Keep building trust!</p>
            </div>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Current Transaction Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Daily Escrow</p>
              <p className="text-xl font-bold text-blue-400">
                ${verificationData?.transaction_limits?.daily_escrow_limit || 0}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Single Escrow</p>
              <p className="text-xl font-bold text-purple-400">
                ${verificationData?.transaction_limits?.single_escrow_limit || 0}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Daily Withdrawal</p>
              <p className="text-xl font-bold text-green-400">
                ${verificationData?.transaction_limits?.daily_withdrawal_limit || 0}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Monthly Withdrawal</p>
              <p className="text-xl font-bold text-orange-400">
                ${verificationData?.transaction_limits?.monthly_withdrawal_limit || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-6">Complete Verification Steps</h3>
          
          <div className="space-y-6">
            {/* Step 1: Phone Verification */}
            <div className={`border rounded-lg p-6 ${
              verificationData?.verification_level?.phone_verified 
                ? 'border-green-600 bg-green-900/20' 
                : 'border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationData?.verification_level?.phone_verified 
                      ? 'bg-green-600' 
                      : 'bg-gray-600'
                  }`}>
                    {verificationData?.verification_level?.phone_verified ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm">1</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Phone Verification</h4>
                    <p className="text-gray-400">Verify your phone number for Level 1 access</p>
                  </div>
                </div>
                {verificationData?.verification_level?.phone_verified && (
                  <span className="text-green-400 text-sm">Verified</span>
                )}
              </div>

              {!verificationData?.verification_level?.phone_verified && (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                  <button
                    onClick={handlePhoneVerification}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Verifying...' : 'Verify Phone'}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Email Verification */}
            <div className={`border rounded-lg p-6 ${
              verificationData?.verification_level?.email_verified 
                ? 'border-green-600 bg-green-900/20' 
                : 'border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationData?.verification_level?.email_verified 
                      ? 'bg-green-600' 
                      : 'bg-gray-600'
                  }`}>
                    {verificationData?.verification_level?.email_verified ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm">2</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Email Verification</h4>
                    <p className="text-gray-400">Confirm your email address for Level 1 access</p>
                  </div>
                </div>
                {verificationData?.verification_level?.email_verified && (
                  <span className="text-green-400 text-sm">Verified</span>
                )}
              </div>

              {!verificationData?.verification_level?.email_verified && (
                <button
                  onClick={handleEmailVerification}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Verifying...' : 'Verify Email'}
                </button>
              )}
            </div>

            {/* Step 3: Facial Verification */}
            <div className={`border rounded-lg p-6 ${
              verificationData?.verification_level?.facial_verified 
                ? 'border-green-600 bg-green-900/20' 
                : 'border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationData?.verification_level?.facial_verified 
                      ? 'bg-green-600' 
                      : 'bg-gray-600'
                  }`}>
                    {verificationData?.verification_level?.facial_verified ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm">3</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Facial Verification</h4>
                    <p className="text-gray-400">Complete facial recognition for Level 2 access</p>
                  </div>
                </div>
                {verificationData?.verification_level?.facial_verified && (
                  <span className="text-green-400 text-sm">Verified</span>
                )}
              </div>

              {!verificationData?.verification_level?.facial_verified && (
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Facial recognition will be simulated</p>
                  </div>
                  <button
                    onClick={handleFacialVerification}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Start Facial Verification'}
                  </button>
                </div>
              )}
            </div>

            {/* Step 4: Government ID Verification */}
            <div className={`border rounded-lg p-6 ${
              verificationData?.verification_level?.government_id_verified 
                ? 'border-green-600 bg-green-900/20' 
                : 'border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationData?.verification_level?.government_id_verified 
                      ? 'bg-green-600' 
                      : 'bg-gray-600'
                  }`}>
                    {verificationData?.verification_level?.government_id_verified ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm">4</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Government ID Verification</h4>
                    <p className="text-gray-400">Upload government ID for Level 3 (maximum) access</p>
                  </div>
                </div>
                {verificationData?.verification_level?.government_id_verified && (
                  <span className="text-green-400 text-sm">Verified</span>
                )}
              </div>

              {!verificationData?.verification_level?.government_id_verified && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="passport">Passport</option>
                      <option value="driver_license">Driver's License</option>
                      <option value="national_id">National ID</option>
                    </select>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ID number"
                    />
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">ID verification will be simulated</p>
                  </div>
                  <button
                    onClick={handleGovernmentIDVerification}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Verifying...' : 'Verify Government ID'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Profile Summary */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Trust Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Completed Transactions</p>
              <p className="text-xl font-bold text-white">{trustData?.completed_transactions || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Disputes</p>
              <p className="text-xl font-bold text-yellow-400">{trustData?.disputes || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Fraud Reports</p>
              <p className="text-xl font-bold text-red-400">{trustData?.fraud_reports || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Account Age</p>
              <p className="text-xl font-bold text-white">{trustData?.account_age_days || 0} days</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Verification Bonus</p>
              <p className="text-xl font-bold text-green-400">+{(verificationData?.verification_level?.level || 0) * 10}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm text-white">
                {new Date(trustData?.last_updated || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
