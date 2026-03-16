import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI, userAPI } from '../services/api';
import Logo from '../components/Logo';

const EscrowPage = () => {
  const navigate = useNavigate();
  const [escrows, setEscrows] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRestrictions, setUserRestrictions] = useState(null);
  const [createEscrowModal, setCreateEscrowModal] = useState(false);
  const [newEscrow, setNewEscrow] = useState({
    recipient_email: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchEscrowData();
    fetchUserRestrictions();
  }, []);

  const fetchEscrowData = async () => {
    try {
      const walletResponse = await walletAPI.getWallet();
      const transactionsResponse = await walletAPI.getTransactions();
      
      setWalletData(walletResponse.data.data);
      
      // Extract escrow transactions from transaction history
      const escrowTransactions = transactionsResponse.data.data.transactions.filter(
        t => t.type === 'escrow_lock' || t.type === 'escrow_release'
      );
      
      // Create escrow objects from transactions
      const escrowData = escrowTransactions.map(t => ({
        id: t.escrow_id,
        recipient_email: t.description?.includes('for ') ? t.description.split('for ')[1] : 'Unknown',
        amount: t.amount,
        status: t.type === 'escrow_lock' ? 'active' : 'completed',
        created_at: t.created_at,
        expires_at: new Date(new Date(t.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setEscrows(escrowData);
    } catch (error) {
      console.error('Escrow data fetch error:', error);
      setError('Failed to load escrow data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRestrictions = async () => {
    try {
      const response = await userAPI.checkAccountRestrictions(1);
      setUserRestrictions(response.data.data);
    } catch (error) {
      console.error('User restrictions fetch error:', error);
    }
  };

  const handleCreateEscrow = async (e) => {
    e.preventDefault();
    
    if (!newEscrow.recipient_email || !newEscrow.amount || parseFloat(newEscrow.amount) <= 0) {
      setError('Please fill in all fields with valid values');
      return;
    }

    if (walletData && parseFloat(newEscrow.amount) > walletData.balance) {
      setError('Insufficient balance');
      return;
    }

    if (userRestrictions?.is_restricted && userRestrictions.restrictions.includes('create_escrow')) {
      setError('Account restricted. Cannot create escrow transactions.');
      return;
    }

    try {
      setError('');
      await walletAPI.createEscrow(
        parseFloat(newEscrow.amount),
        newEscrow.recipient_email,
        newEscrow.description
      );
      
      setNewEscrow({ recipient_email: '', amount: '', description: '' });
      setCreateEscrowModal(false);
      await fetchEscrowData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create escrow');
    }
  };

  const handleReleaseEscrow = async (escrowId) => {
    try {
      await walletAPI.releaseEscrow(escrowId);
      await fetchEscrowData(); // Refresh data
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to release escrow');
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(balance);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'active':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'disputed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading escrow data...</div>
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
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

        {/* Account Restrictions Alert */}
        {userRestrictions?.is_restricted && (
          <div className="mb-6 p-4 bg-yellow-900 border border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-200">
                ⚠️ Account Restricted: You cannot {userRestrictions.restrictions.join(', ')}.
              </p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 border border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Escrows</p>
                <p className="text-3xl font-bold text-white">
                  {escrows.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 border border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white">
                  {escrows.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 border border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Locked</p>
                <p className="text-3xl font-bold text-white">
                  {formatBalance(escrows.filter(e => e.status === 'active').reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
              <div className="bg-purple-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 border border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Available Balance</p>
                <p className="text-3xl font-bold text-white">
                  {formatBalance(walletData?.balance || 0)}
                </p>
              </div>
              <div className="bg-orange-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create Escrow Button */}
        <div className="mb-8">
          <button
            onClick={() => setCreateEscrowModal(true)}
            disabled={userRestrictions?.is_restricted && userRestrictions.restrictions.includes('create_escrow')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Escrow Transaction
            </div>
          </button>
        </div>

        {/* Escrow List */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-2">Escrow Transactions</h3>
            <p className="text-gray-400 text-sm">Manage and monitor your escrow transactions</p>
          </div>
          
          {escrows.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg mb-2">No escrow transactions found</p>
              <p className="text-gray-500 text-sm">Create your first escrow transaction to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {escrows.map((escrow) => (
                <div key={escrow.id} className="p-6 hover:bg-slate-800 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">Escrow #{escrow.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(escrow.status)}`}>
                          {escrow.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          {escrow.recipient_email}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeRemaining(escrow.expires_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{formatBalance(escrow.amount)}</p>
                      <p className="text-sm text-gray-400">Locked Amount</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Created</p>
                      <p className="text-sm text-white font-medium">{formatDate(escrow.created_at)}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Expires</p>
                      <p className="text-sm text-white font-medium">{formatDate(escrow.expires_at)}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Reference</p>
                      <p className="text-sm text-white font-medium">ESC-{escrow.id}</p>
                    </div>
                  </div>
                  
                  {escrow.status === 'active' && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Funds are locked and secure</span>
                      </div>
                      <button
                        onClick={() => handleReleaseEscrow(escrow.id)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow hover:shadow-lg"
                      >
                        Release Funds
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Escrow Modal */}
      {createEscrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create Escrow Transaction</h3>
              <button
                onClick={() => setCreateEscrowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateEscrow} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={newEscrow.recipient_email}
                  onChange={(e) => setNewEscrow({...newEscrow, recipient_email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recipient email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={walletData?.balance || 0}
                    value={newEscrow.amount}
                    onChange={(e) => setNewEscrow({...newEscrow, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Available balance: {formatBalance(walletData?.balance || 0)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEscrow.description}
                  onChange={(e) => setNewEscrow({...newEscrow, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCreateEscrowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Create Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowPage;
