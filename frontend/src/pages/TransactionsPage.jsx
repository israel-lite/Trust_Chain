import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';
import Logo from '../components/Logo';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions()
      ]);

      setWalletData(walletResponse.data.data);
      setTransactions(transactionsResponse.data.data.transactions || []);
    } catch (error) {
      console.error('Transaction data fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load transaction data. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
      case 'refund':
        return '↩️';
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
      case 'refund':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = searchTerm === '' || 
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading transactions...</div>
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
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="mb-6 p-4 bg-red-900 border border-red-800 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Current Balance</h3>
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

        {/* Filters and Search */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'deposit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'withdrawal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setFilter('escrow_lock')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'escrow_lock' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Escrow Locks
              </button>
              <button
                onClick={() => setFilter('escrow_release')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'escrow_release' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                Escrow Releases
              </button>
            </div>
            
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Transaction History</h3>
            <span className="text-gray-400 text-sm">
              {filteredTransactions.length} of {transactions.length} transactions
            </span>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Transaction</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                          <div>
                            <p className="text-white font-medium capitalize">
                              {transaction.type.replace('_', ' ')}
                            </p>
                            {transaction.reference && (
                              <p className="text-gray-400 text-sm">{transaction.reference}</p>
                            )}
                            {transaction.description && (
                              <p className="text-gray-500 text-sm">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`capitalize ${getTransactionColor(transaction.type)}`}>
                          {transaction.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'deposit' || transaction.type === 'escrow_release' ? '+' : '-'}
                          {formatBalance(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400">
                          {formatBalance(transaction.new_balance)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400 text-sm">
                          {formatDate(transaction.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
