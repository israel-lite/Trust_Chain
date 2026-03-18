import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Logo from '../components/Logo';

const BusinessAccountPage = () => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [fraudScore, setFraudScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    businessName: '',
    businessType: 'retail',
    registrationNumber: '',
    paymentCurrency: 'USD',
    paymentAmount: 3000
  });

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const [businessResponse, walletResponse, fraudResponse] = await Promise.all([
        userAPI.getBusinessAccount(),
        userAPI.getMultiCurrencyWallet(),
        userAPI.getAdvancedFraudScore()
      ]);

      setBusinessData(businessResponse.data.data);
      setWalletData(walletResponse.data.data.balances);
      setFraudScore(fraudResponse.data.data);
    } catch (error) {
      console.error('Business data fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load business data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToBusiness = async (e) => {
    e.preventDefault();
    
    if (!upgradeForm.businessName || !upgradeForm.registrationNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (upgradeForm.paymentAmount < 3000) {
      setError('Payment amount must be at least 3,000');
      return;
    }

    // Check if user has sufficient balance
    if (walletData && walletData[upgradeForm.paymentCurrency] < upgradeForm.paymentAmount) {
      setError(`Insufficient ${upgradeForm.paymentCurrency} balance for business upgrade`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.upgradeToBusinessAccount(
        upgradeForm.businessName,
        upgradeForm.businessType,
        upgradeForm.registrationNumber,
        upgradeForm.paymentCurrency,
        upgradeForm.paymentAmount
      );
      
      setSuccessMessage('Business account upgrade paid successfully! Your application is being reviewed.');
      setUpgradeModal(false);
      setUpgradeForm({
        businessName: '',
        businessType: 'retail',
        registrationNumber: '',
        paymentCurrency: 'USD',
        paymentAmount: 3000
      });
      await fetchBusinessData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upgrade to business account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBusiness = async () => {
    if (!businessData?.is_business) {
      setError('No business account found');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Mock document upload
      const documents = {
        business_registration: 'mock_document.pdf',
        tax_clearance: 'mock_tax.pdf',
        address_proof: 'mock_address.pdf'
      };

      const response = await userAPI.verifyBusinessAccount(documents);
      setSuccessMessage('Business account verified successfully! You now have access to API and higher limits.');
      await fetchBusinessData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify business account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.generateApiKey();
      setSuccessMessage('API key generated successfully!');
      await fetchBusinessData(); // Refresh data
      setApiKeyModal(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      NGN: '₦',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };
    return symbols[currency] || currency;
  };

  const getCurrencyFlag = (currency) => {
    const flags = {
      USD: '🇺🇸',
      NGN: '🇳🇬',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵'
    };
    return flags[currency] || '🌍';
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'unverified':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unverified':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskLevelBadge = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && !businessData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading business account data...</div>
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
                onClick={() => navigate('/multi-currency-wallet')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Multi-Currency
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
                onClick={() => navigate('/business-account')}
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Business
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
          <h1 className="text-3xl font-bold text-white mb-2">Business Account</h1>
          <p className="text-gray-400">Manage your business account, API access, and advanced features</p>
        </div>

        {/* Business Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getVerificationStatusColor(businessData?.verification_status || 'unverified')}`}>
                {businessData?.is_business ? 'Business' : 'Personal'}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerificationStatusBadge(businessData?.verification_status || 'unverified')}`}>
                {businessData?.verification_status || 'Unverified'}
              </span>
              {businessData?.verification_status === 'verified' && (
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-green-400">✔ Verified Business</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getRiskLevelColor(fraudScore?.risk_level || 'low')}`}>
                {fraudScore?.risk_level || 'Low'} Risk
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadge(fraudScore?.risk_level || 'low')}`}>
                Score: {fraudScore?.score || 0}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">API Access</h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${businessData?.api_access ? 'text-green-600' : 'text-gray-600'}`}>
                {businessData?.api_access ? 'Enabled' : 'Disabled'}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${businessData?.api_access ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {businessData?.api_access ? 'API Key Active' : 'No API Access'}
              </span>
            </div>
          </div>
        </div>

        {/* Business Account Actions */}
        {!businessData?.is_business && (
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Upgrade to Business Account</h3>
            <div className="space-y-4">
              <p className="text-gray-400">
                Upgrade to a business account to access higher transaction limits, API integration, and verified business badge.
              </p>
              
              {/* Upgrade Fee Notice */}
              <div className="bg-blue-900 border border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-200">
                    <strong>Business Upgrade Fee:</strong> 3,000 in any currency (USD, NGN, EUR, GBP, JPY)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Personal Account</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• $10,000 daily escrow limit</li>
                    <li>• Basic transaction features</li>
                    <li>• No API access</li>
                  </ul>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Business Account</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• $50,000 daily escrow limit</li>
                    <li>• API integration</li>
                    <li>• Verified business badge</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Upgrade to Business Account
              </button>
            </div>
          </div>
        )}

        {/* Business Account Details */}
        {businessData?.is_business && (
          <div className="space-y-8">
            {/* Business Information */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Business Name</p>
                  <p className="text-white font-medium">{businessData?.business_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Business Type</p>
                  <p className="text-white font-medium capitalize">{businessData?.business_type || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Registration Number</p>
                  <p className="text-white font-medium">{businessData?.registration_number || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Verification Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerificationStatusBadge(businessData?.verification_status || 'unverified')}`}>
                    {businessData?.verification_status || 'Unverified'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created At</p>
                  <p className="text-white font-medium">
                    {businessData?.created_at ? new Date(businessData.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Verified At</p>
                  <p className="text-white font-medium">
                    {businessData?.verified_at ? new Date(businessData.verified_at).toLocaleDateString() : 'Not verified'}
                  </p>
                </div>
              </div>
              
              {/* Upgrade Fee Info */}
              {businessData?.upgrade_fee_paid && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">Upgrade Fee Paid</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatCurrency(businessData.upgrade_fee_paid, businessData.upgrade_fee_currency)}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Limits */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-4">Business Transaction Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Daily Escrow Limit</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${businessData?.business_limits?.daily_escrow_limit || 0}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Single Escrow Limit</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${businessData?.business_limits?.single_escrow_limit || 0}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Monthly Withdrawal Limit</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${businessData?.business_limits?.monthly_withdrawal_limit || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* API Access */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-4">API Access</h3>
              {businessData?.api_access ? (
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">API Key</p>
                    <div className="flex items-center justify-between">
                      <code className="text-green-400 text-sm font-mono">
                        {businessData?.api_key?.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => setApiKeyModal(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View Full Key
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Create Escrow</p>
                      <span className="text-green-400">✓ Enabled</span>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Release Funds</p>
                      <span className="text-green-400">✓ Enabled</span>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Check Status</p>
                      <span className="text-green-400">✓ Enabled</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Get API access to integrate TrustChain escrow services into your platform.
                  </p>
                  {businessData?.verification_status === 'verified' ? (
                    <button
                      onClick={handleGenerateApiKey}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      {isLoading ? 'Generating...' : 'Generate API Key'}
                    </button>
                  ) : (
                    <div className="bg-yellow-900 border border-yellow-800 rounded-lg p-4">
                      <p className="text-yellow-200">
                        ⚠️ Business account must be verified to access API features.
                      </p>
                      <button
                        onClick={handleVerifyBusiness}
                        disabled={isLoading}
                        className="mt-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
                      >
                        {isLoading ? 'Verifying...' : 'Verify Business'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Risk Assessment */}
            {fraudScore && (
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <h3 className="text-xl font-semibold text-white mb-4">Advanced Risk Assessment</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadge(fraudScore.risk_level)}`}>
                      {fraudScore.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Score</span>
                    <span className="text-white font-medium">{fraudScore.score}/100</span>
                  </div>
                  {fraudScore.factors && fraudScore.factors.length > 0 && (
                    <div>
                      <p className="text-gray-400 mb-2">Risk Factors</p>
                      <div className="space-y-2">
                        {fraudScore.factors.map((factor, index) => (
                          <div key={index} className="bg-slate-800 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm">⚠️ {factor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Upgrade to Business Account</h3>
              <button
                onClick={() => setUpgradeModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpgradeToBusiness} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <input
                  type="text"
                  value={upgradeForm.businessName}
                  onChange={(e) => setUpgradeForm({...upgradeForm, businessName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                <select
                  value={upgradeForm.businessType}
                  onChange={(e) => setUpgradeForm({...upgradeForm, businessType: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="retail">Retail</option>
                  <option value="service">Service</option>
                  <option value="technology">Technology</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Registration Number</label>
                <input
                  type="text"
                  value={upgradeForm.registrationNumber}
                  onChange={(e) => setUpgradeForm({...upgradeForm, registrationNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business registration number"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Currency</label>
                  <select
                    value={upgradeForm.paymentCurrency}
                    onChange={(e) => setUpgradeForm({...upgradeForm, paymentCurrency: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(walletData || {}).filter(c => c !== 'last_updated').map(currency => (
                      <option key={currency} value={currency}>
                        {getCurrencyFlag(currency)} {currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={upgradeForm.paymentAmount}
                    onChange={(e) => setUpgradeForm({...upgradeForm, paymentAmount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3000"
                    min="3000"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              {/* Balance Check */}
              {walletData && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {getCurrencyFlag(upgradeForm.paymentCurrency)} {formatCurrency(walletData[upgradeForm.paymentCurrency] || 0, upgradeForm.paymentCurrency)}
                    </span>
                    <span className={`text-sm ${walletData[upgradeForm.paymentCurrency] >= upgradeForm.paymentAmount ? 'text-green-400' : 'text-red-400'}`}>
                      {walletData[upgradeForm.paymentCurrency] >= upgradeForm.paymentAmount ? '✓ Sufficient' : '✗ Insufficient'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUpgradeModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (walletData && walletData[upgradeForm.paymentCurrency] < upgradeForm.paymentAmount)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Pay & Upgrade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {apiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">API Key</h3>
              <button
                onClick={() => setApiKeyModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your API Key</p>
                <code className="text-green-400 text-sm font-mono break-all">
                  {businessData?.api_key}
                </code>
              </div>
              
              <div className="bg-yellow-900 border border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Keep this API key secure. Do not share it publicly or commit it to version control.
                </p>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">API Endpoint</p>
                <code className="text-blue-400 text-sm font-mono">
                  https://api.trustchain.com/v1/escrow
                </code>
              </div>
              
              <button
                onClick={() => setApiKeyModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAccountPage;
