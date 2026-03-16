import axios from 'axios';
import { enhancedApi } from './mockApi';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => enhancedApi.auth.register(userData),
  verifyOTP: (email, otp) => enhancedApi.auth.verifyOTP(email, otp),
  login: (email, password) => enhancedApi.auth.login(email, password),
  forgotPassword: (email) => enhancedApi.auth.forgotPassword(email),
  resetPassword: (email, otp, newPassword) => enhancedApi.auth.resetPassword(email, otp, newPassword),
};

// User API
export const userAPI = {
  getProfile: () => enhancedApi.user.getProfile(),
  updateUserRiskScore: (userId, action) => enhancedApi.user.updateUserRiskScore(userId, action),
  checkAccountRestrictions: (userId) => enhancedApi.user.checkAccountRestrictions(userId),
  getAuditLogs: () => enhancedApi.user.getAuditLogs(),
  // TrustChain V3 APIs
  getVerificationLevel: () => enhancedApi.user.getVerificationLevel(),
  verifyPhone: (phoneNumber) => enhancedApi.user.verifyPhone(phoneNumber),
  verifyEmail: () => enhancedApi.user.verifyEmail(),
  verifyFacial: () => enhancedApi.user.verifyFacial(),
  verifyGovernmentID: (idType, idNumber) => enhancedApi.user.verifyGovernmentID(idType, idNumber),
  getTrustScore: () => enhancedApi.user.getTrustScore(),
  getTrustProfile: () => enhancedApi.user.getTrustProfile(),
  reportSuspiciousActivity: (reportedUserId, reason, description) => enhancedApi.user.reportSuspiciousActivity(reportedUserId, reason, description),
};

// Wallet API
export const walletAPI = {
  getWallet: () => enhancedApi.wallet.getWallet(),
  fundWallet: (amount) => enhancedApi.wallet.fundWallet(amount),
  withdrawWallet: (amount) => enhancedApi.wallet.withdrawWallet(amount),
  createEscrow: (amount, recipientEmail, description) => enhancedApi.wallet.createEscrow(amount, recipientEmail, description),
  releaseEscrow: (escrowId) => enhancedApi.wallet.releaseEscrow(escrowId),
  getTransactions: () => enhancedApi.wallet.getTransactions(),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => enhancedApi.notifications.getNotifications(),
  markNotificationRead: (notificationId) => enhancedApi.notifications.markNotificationRead(notificationId),
};

// Health check
export const healthAPI = {
  check: () => enhancedApi.health.check(),
};

export default api;
