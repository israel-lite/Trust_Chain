import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Logo from '../components/Logo';

const MultiCurrencyWalletPage = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [conversionModal, setConversionModal] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [conversionAmount, setConversionAmount] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [crossBorderModal, setCrossBorderModal] = useState(false);
  const [fundModal, setFundModal] = useState(false);
  const [fundForm, setFundForm] = useState({
    currency: 'USD',
    amount: ''
  });
  const [crossBorderForm, setCrossBorderForm] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'NGN',
    recipientEmail: '',
    description: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await userAPI.getMultiCurrencyWallet();
      setWalletData(response.data.data.balances);
      setExchangeRates(response.data.data.exchange_rates);
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

  const handleCurrencyConversion = async () => {
    if (!conversionAmount || parseFloat(conversionAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (fromCurrency === toCurrency) {
      setError('Please select different currencies');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.convertCurrency(fromCurrency, toCurrency, parseFloat(conversionAmount));
      setConversionResult(response.data.data);
      setSuccessMessage('Conversion calculated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to convert currency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundWallet = async (e) => {
    e.preventDefault();
    
    if (!fundForm.amount || parseFloat(fundForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Mock fund wallet (add to balance)
      const currentBalance = walletData[fundForm.currency] || 0;
      const newBalance = currentBalance + parseFloat(fundForm.amount);
      
      // Update local state immediately
      setWalletData(prev => ({
        ...prev,
        [fundForm.currency]: newBalance
      }));

      setSuccessMessage(`Successfully funded wallet with ${fundForm.amount} ${fundForm.currency}`);
      setFundModal(false);
      setFundForm({ currency: 'USD', amount: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fund wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrossBorderEscrow = async (e) => {
    e.preventDefault();
    
    if (!crossBorderForm.amount || parseFloat(crossBorderForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!crossBorderForm.recipientEmail) {
      setError('Please enter recipient email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await userAPI.createCrossBorderEscrow(
        parseFloat(crossBorderForm.amount),
        crossBorderForm.fromCurrency,
        crossBorderForm.toCurrency,
        crossBorderForm.recipientEmail,
        crossBorderForm.description
      );
      
      setSuccessMessage('Cross-border escrow created successfully!');
      setCrossBorderModal(false);
      setCrossBorderForm({
        amount: '',
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        recipientEmail: '',
        description: ''
      });
      await fetchWalletData(); // Refresh balances
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create cross-border escrow');
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

  const calculateTotalValue = () => {
    if (!walletData || !exchangeRates) return 0;
    
    return Object.entries(walletData).reduce((total, [currency, amount]) => {
      if (currency === 'last_updated') return total;
      // Convert to USD
      const usdAmount = amount / exchangeRates[currency];
      return total + usdAmount;
    }, 0);
  };

  if (isLoading && !walletData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading multi-currency wallet...</div>
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
                Classic Wallet
              </button>
              <button
                onClick={() => navigate('/multi-currency-wallet')}
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900 border border-green-800 rounded-lg">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Multi-Currency Wallet</h1>
          <p className="text-gray-400">Manage your funds across multiple currencies with real-time exchange rates</p>
        </div>

        {/* Total Value Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 border border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Portfolio Value</p>
              <p className="text-4xl font-bold text-white">
                {formatCurrency(calculateTotalValue(), 'USD')}
              </p>
              <p className="text-blue-200 text-sm mt-2">Across all currencies</p>
            </div>
            <div className="bg-blue-500 bg-opacity-30 rounded-full p-4">
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Currency Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {walletData && Object.entries(walletData).map(([currency, balance]) => {
            if (currency === 'last_updated') return null;
            return (
              <div key={currency} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCurrencyFlag(currency)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{currency}</h3>
                      <p className="text-sm text-gray-400">Available Balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(balance, currency)}
                    </p>
                    <p className="text-sm text-gray-400">
                      ≈ {formatCurrency(balance / exchangeRates[currency], 'USD')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFromCurrency(currency);
                      setConversionModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                  >
                    Convert
                  </button>
                  <button
                    onClick={() => {
                      setCrossBorderForm({...crossBorderForm, fromCurrency: currency});
                      setCrossBorderModal(true);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exchange Rates */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Live Exchange Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exchangeRates && Object.entries(exchangeRates).map(([currency, rate]) => {
              if (currency === 'last_updated') return null;
              return (
                <div key={currency} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCurrencyFlag(currency)}</span>
                      <span className="text-white font-medium">{currency}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {currency === 'USD' ? '1.00' : rate.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {currency === 'USD' ? 'Base' : 'per USD'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Last updated: {exchangeRates?.last_updated ? new Date(exchangeRates.last_updated).toLocaleString() : 'N/A'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setConversionModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Currency Converter
            </div>
          </button>
          <button
            onClick={() => setFundModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 0 3-2 1.657 0 3-.895 0-3-2m0 3c0 1.657-.895 3-2 3s-3 .895-3 2m0-3c0-1.657.895-3 2-3s3-.895 3-2" />
              </svg>
              Fund Wallet
            </div>
          </button>
          <button
            onClick={() => setCrossBorderModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6m0 0v-4m0 0V5a2 2 0 00-2-2h-6.5l-1-1H3l3 6 3 6" />
              </svg>
              Cross-Border Escrow
            </div>
          </button>
        </div>
      </div>

      {/* Currency Converter Modal */}
      {conversionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Currency Converter</h3>
              <button
                onClick={() => setConversionModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Currency</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Currency</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(exchangeRates || {}).filter(c => c !== 'last_updated').map(currency => (
                    <option key={currency} value={currency}>
                      {getCurrencyFlag(currency)} {currency}
                    </option>
                  ))}
                </select>
              </div>
              
              {conversionResult && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Conversion Result</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(conversionResult.converted_amount, conversionResult.to_currency)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Exchange Rate: {conversionResult.exchange_rate.toFixed(4)}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setConversionModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCurrencyConversion}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Converting...' : 'Convert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fund Wallet Modal */}
      {fundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Fund Wallet</h3>
              <button
                onClick={() => setFundModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFundWallet} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <select
                  value={fundForm.currency}
                  onChange={(e) => setFundForm({...fundForm, currency: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={fundForm.amount}
                  onChange={(e) => setFundForm({...fundForm, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFundModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Funding...' : 'Fund Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cross-Border Escrow Modal */}
      {crossBorderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Cross-Border Escrow</h3>
              <button
                onClick={() => setCrossBorderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCrossBorderEscrow} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">From Currency</label>
                  <select
                    value={crossBorderForm.fromCurrency}
                    onChange={(e) => setCrossBorderForm({...crossBorderForm, fromCurrency: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">To Currency</label>
                  <select
                    value={crossBorderForm.toCurrency}
                    onChange={(e) => setCrossBorderForm({...crossBorderForm, toCurrency: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(exchangeRates || {}).filter(c => c !== 'last_updated').map(currency => (
                      <option key={currency} value={currency}>
                        {getCurrencyFlag(currency)} {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={crossBorderForm.amount}
                  onChange={(e) => setCrossBorderForm({...crossBorderForm, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={crossBorderForm.recipientEmail}
                  onChange={(e) => setCrossBorderForm({...crossBorderForm, recipientEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recipient email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={crossBorderForm.description}
                  onChange={(e) => setCrossBorderForm({...crossBorderForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCrossBorderModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiCurrencyWalletPage;
