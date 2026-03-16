import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';
import Logo from '../components/Logo';

const WalletPage = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions()
      ]);

      setWalletData(walletResponse.data.data);
      setTransactions(transactionsResponse.data.data.transactions || []);
    } catch (error) {
      console.error('Wallet data fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load wallet data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundWallet = async (e) => {
    e.preventDefault();
    
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await walletAPI.fundWallet(parseFloat(fundAmount));
      setFundAmount('');
      setShowFundModal(false);
      await fetchWalletData(); // Refresh data
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fund wallet');
    }
  };

  const handleWithdrawWallet = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await walletAPI.withdrawWallet(parseFloat(withdrawAmount));
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      await fetchWalletData(); // Refresh data
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to withdraw funds');
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '📈';
      case 'withdrawal':
        return '📉';
      case 'escrow_lock':
        return '🔒';
      case 'escrow_release':
        return '🔓';
      default:
        return '💰';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return 'text-green-600';
      case 'withdrawal':
      case 'escrow_lock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet data...</div>
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
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Available Balance</h3>
            <p className="text-3xl font-bold text-green-400">
              {walletData ? formatBalance(walletData.balance) : '$0.00'}
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-400">
              {transactions.length}
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Account Status</h3>
            <p className="text-xl font-bold text-green-400">Active</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Fund Wallet</h3>
            <button
              onClick={() => setShowFundModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Add Funds
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Withdraw Funds</h3>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  <div>
                    <p className="text-white font-medium capitalize">{transaction.type.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</p>
                    {transaction.description && (
                      <p className="text-gray-500 text-sm">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'deposit' || transaction.type === 'escrow_release' ? '+' : '-'}
                    {formatBalance(transaction.amount)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatBalance(transaction.new_balance)}
                  </p>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6">Fund Wallet</h3>
            <form onSubmit={handleFundWallet}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowFundModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6">Withdraw Funds</h3>
            <form onSubmit={handleWithdrawWallet}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={walletData?.balance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
