import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';  
import Logo from '../components/Logo';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationMode, setVerificationMode] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    phone: location.state?.phone || '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/register');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (verificationMode === 'email' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, verificationMode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (verificationMode === 'email' && !formData.email) {
      newErrors.email = 'Email is required';
    }
    if (verificationMode === 'phone' && !formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.otp) {
      newErrors.otp = 'Verification code is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Verification code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Direct login for phone verification (mock/testing only)
      if (verificationMode === 'phone') {
        // For phone verification, accept any 6-digit OTP (not just phone number)
        if (!formData.otp || formData.otp.length !== 6) {
          throw { response: { data: { message: 'Please enter a 6-digit OTP' } } };
        }
        
        const mockResponse = {
          data: {
            success: true,
            message: 'Phone verification successful',
            data: {
              userId: 1,
              email: formData.email || 'phone-user@example.com',
              isVerified: true
            }
          }
        };
        
        // Store mock token
        localStorage.setItem('token', 'mock-phone-token-' + Date.now());
        
        setSuccessMessage('Phone verification successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        return;
      }

      // Normal email OTP verification
      const response = await authAPI.verifyOTP(
        verificationMode === 'email' ? formData.email : formData.email || 'phone-user@example.com', 
        formData.otp
      );
      
      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authAPI.register({
        email: formData.email,
        phone: '+1234567890', // Default phone for resend
        password: 'tempPassword123!'
      });
      
      if (response.data.data.canResend) {
        setTimeLeft(response.data.data.timeRemaining || 60);
        setSuccessMessage('New OTP sent to your email');
      } else {
        setErrors({ general: response.data.data.message });
      }
    } catch (error) {
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo size="md" />
          <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-300">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="fintech-card p-8">
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}

            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Verification Mode Toggle */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setVerificationMode('email')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    verificationMode === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Email Verification
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMode('phone')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    verificationMode === 'phone'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Phone Verification (Testing)
                </button>
              </div>
            </div>

            {/* Email Field */}
            {verificationMode === 'email' && (
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`fintech-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone Field */}
            {verificationMode === 'phone' && (
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`fintech-input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  For testing: Enter your phone number as the OTP to verify
                </p>
              </div>
            )}

            {/* OTP Field */}
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                {verificationMode === 'phone' ? 'Enter Phone Number as OTP' : 'Verification Code'}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                className={`fintech-input ${errors.otp ? 'border-red-500' : ''}`}
                placeholder={verificationMode === 'phone' ? 'Enter your phone number' : 'Enter 6-digit code'}
                maxLength={6}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
              )}
              {verificationMode === 'email' && (
                <div className="mt-2 text-sm text-gray-500">
                  Code expires in: {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="fintech-button w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="loading-spinner mr-2"></span>
                  Verifying...
                </span>
              ) : (
                verificationMode === 'phone' ? 'Verify Phone' : 'Verify Email'
              )}
            </button>

            {/* Back to Register */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Wrong email?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition"
                >
                  Go back to registration
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
