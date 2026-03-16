import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import Logo from '../components/Logo';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Check if admin login
      if (isAdminLogin) {
        if (formData.email === 'eazee1804@gmail.com' && formData.password === 'Zephyr@651818') {
          // Admin login successful
          localStorage.setItem('token', 'admin-token-' + Date.now());
          localStorage.setItem('isAdmin', 'true');
          setSuccessMessage('Admin login successful! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          throw { response: { data: { message: 'Login Fail' } } };
        }
      } else {
        // Regular user login
        const isPhone = formData.email.includes('+') || formData.email.length > 15;
        const identifier = isPhone ? 'phone' : 'email';
        
        const response = await authAPI.login(
          isPhone ? 'phone-user@example.com' : formData.email,
          formData.password
        );
        
        // Store JWT token
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('isAdmin', 'false');
        
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo size="lg" />
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isAdminLogin ? 'Sign in to access admin dashboard' : 'Sign in to access your secure escrow account'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-900 border border-green-800 rounded-lg">
            <p className="text-green-200 text-center">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-red-900 border border-red-800 rounded-lg">
            <p className="text-red-200 text-center">{errors.general}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-slate-900 py-8 px-6 shadow-xl rounded-lg border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {isAdminLogin ? 'Admin Email' : 'Email Address'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder={isAdminLogin ? 'eazee1804@gmail.com' : 'Enter your email'}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder={isAdminLogin ? '••••••••' : 'Enter your password'}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Admin Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="admin-login"
                  type="checkbox"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                />
                <label htmlFor="admin-login" className="ml-2 block text-sm text-gray-300">
                  Admin Login
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8H4z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
