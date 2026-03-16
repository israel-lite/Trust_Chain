// Mock API service for testing when backend is not available
import { authAPI, userAPI, walletAPI, healthAPI } from './api';

// Mock data
const mockUsers = [];
const mockWallets = {};
const mockOTPs = {};
const resendCooldowns = {}; // Track resend cooldowns per email
const loginAttempts = {}; // Track login attempts per email
const transactions = []; // Transaction history - proper ledger
const escrowContracts = []; // Active escrow contracts
const notifications = []; // User notifications
const auditLogs = []; // System audit logs
const userRiskScores = {}; // User risk scoring

// TrustChain V3 - Identity Verification & Trust System
const verificationLevels = {}; // User verification levels (0-3)
const trustScores = {}; // User trust scores
const suspiciousActivities = {}; // Suspicious activity tracking
const failedLoginAttempts = {}; // Failed login attempts per user
const userDevices = {}; // User device tracking
const userReports = {}; // User fraud reports

// Helper functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = () => 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
const getOTPExpiry = () => new Date(Date.now() + 60 * 1000); // 60 seconds
const hashPassword = (password) => 'hashed_' + password + '_' + Date.now(); // Simple mock hashing

// TrustChain V3 Helper Functions
const calculateTrustScore = (userId) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return 0;
  
  let score = 50; // Base score
  
  // Verification level bonus
  const verification = verificationLevels[userId];
  if (verification) {
    score += verification.level * 10; // +10 per level
  }
  
  // Transaction history
  const userTransactions = transactions.filter(t => 
    mockWallets[t.wallet_id]?.user_id === userId
  );
  
  const successfulEscrows = userTransactions.filter(t => 
    t.type === 'escrow_release' && t.status === 'completed'
  ).length;
  
  const disputes = userReports[userId]?.disputes || 0;
  const fraudReports = userReports[userId]?.fraud_reports || 0;
  
  score += successfulEscrows * 5; // +5 per successful escrow
  score -= disputes * 10; // -10 per dispute
  score -= fraudReports * 20; // -20 per fraud report
  
  // Account age bonus
  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
  score += Math.min(accountAge / 30, 10); // +10 max for account age
  
  return Math.max(0, Math.min(100, score)); // Clamp between 0-100
};

const getTransactionLimits = (verificationLevel) => {
  switch (verificationLevel) {
    case 0: // Unverified
      return {
        daily_escrow_limit: 100,
        single_escrow_limit: 50,
        daily_withdrawal_limit: 200,
        monthly_withdrawal_limit: 500
      };
    case 1: // Phone & Email Verified
      return {
        daily_escrow_limit: 1000,
        single_escrow_limit: 500,
        daily_withdrawal_limit: 1000,
        monthly_withdrawal_limit: 5000
      };
    case 2: // Facial Verified
      return {
        daily_escrow_limit: 5000,
        single_escrow_limit: 2000,
        daily_withdrawal_limit: 2500,
        monthly_withdrawal_limit: 10000
      };
    case 3: // Government ID Verified
      return {
        daily_escrow_limit: 10000,
        single_escrow_limit: 5000,
        daily_withdrawal_limit: 5000,
        monthly_withdrawal_limit: 25000
      };
    default:
      return getTransactionLimits(0);
  }
};

const detectSuspiciousActivity = (userId, activity) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return false;
  
  const trustScore = trustScores[userId]?.score || 0;
  const verification = verificationLevels[userId];
  
  // Check for suspicious patterns
  if (activity.type === 'rapid_transactions') {
    const recentTransactions = transactions.filter(t => 
      mockWallets[t.wallet_id]?.user_id === userId &&
      new Date(t.created_at) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );
    
    if (recentTransactions.length > 5) {
      return true;
    }
  }
  
  if (activity.type === 'unusual_device') {
    const devices = userDevices[userId] || [];
    if (!devices.includes(activity.deviceId)) {
      return true;
    }
  }
  
  if (activity.type === 'large_transaction') {
    const limits = getTransactionLimits(verification?.level || 0);
    if (activity.amount > limits.single_escrow_limit * 2) {
      return true;
    }
  }
  
  return false;
};

const initializeVerificationLevel = (userId) => {
  if (!verificationLevels[userId]) {
    verificationLevels[userId] = {
      level: 0, // Unverified
      phone_verified: false,
      email_verified: false,
      facial_verified: false,
      government_id_verified: false,
      phone: null,
      government_id: null,
      facial_recognition_id: null,
      verification_date: null
    };
  }
};

const initializeTrustScore = (userId) => {
  if (!trustScores[userId]) {
    trustScores[userId] = {
      score: 50, // Base score
      successful_escrows: 0,
      disputes: 0,
      fraud_reports: 0,
      account_age_days: 0,
      verification_bonus: 0,
      last_updated: new Date().toISOString()
    };
  }
};

// Mock auth API
const mockAuthAPI = {
  register: async (userData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (mockUsers.find(user => user.email === userData.email)) {
      throw { response: { data: { message: 'Email already registered' } } };
    }
    
    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email: userData.email,
      password_hash: hashPassword(userData.password),
      is_verified: true, // Auto-verify for testing
      failed_login_attempts: 0,
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    
    // Initialize TrustChain V3 features
    initializeVerificationLevel(newUser.id);
    initializeTrustScore(newUser.id);
    
    // Create wallet with initial balance and transactions
    const initialBalance = 5000.00;
    const walletId = Object.keys(mockWallets).length + 1;
    const wallet = {
      id: walletId,
      user_id: newUser.id,
      balance: initialBalance,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockWallets[newUser.id] = wallet;

    // Create mock transaction history
    const mockTransactions = [
      {
        id: transactions.length + 1,
        wallet_id: wallet.id,
        type: 'deposit',
        amount: initialBalance,
        old_balance: 0.00,
        new_balance: initialBalance,
        status: 'completed',
        created_at: new Date().toISOString(),
        reference: 'INIT-DEP',
        description: 'Initial wallet funding'
      },
      {
        id: transactions.length + 2,
        wallet_id: wallet.id,
        type: 'deposit',
        amount: 500.00,
        old_balance: initialBalance,
        new_balance: initialBalance + 500.00,
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'DEP-001',
        description: 'Weekly deposit'
      },
      {
        id: transactions.length + 3,
        wallet_id: wallet.id,
        type: 'escrow_lock',
        amount: 200.00,
        old_balance: initialBalance + 500.00,
        new_balance: initialBalance + 300.00,
        status: 'completed',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'ESC-001',
        description: 'Escrow for service payment'
      },
      {
        id: transactions.length + 4,
        wallet_id: wallet.id,
        type: 'escrow_release',
        amount: 200.00,
        old_balance: initialBalance + 300.00,
        new_balance: initialBalance + 500.00,
        status: 'completed',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'REL-001',
        description: 'Escrow release - service completed'
      }
    ];
    
    // Add all transactions to the ledger
    transactions.push(...mockTransactions);

    // Update trust score based on initial transactions
    trustScores[newUser.id].successful_escrows = 1;
    trustScores[newUser.id].score = calculateTrustScore(newUser.id);
    
    // Generate token
    const token = generateToken();
    
    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: newUser.id,
      type: 'account_created',
      title: 'Welcome to TrustChain',
      message: 'Your account has been created successfully. Complete verification to unlock higher limits.',
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: newUser.id,
      action: 'account_created',
      details: `New account created for ${userData.email}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V3',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    console.log(`Mock Registration: User ${newUser.id} created with wallet balance: $${initialBalance}`); // For testing

    return {
      data: {
        success: true,
        message: 'Registration successful',
        data: {
          userId: newUser.id,
          email: newUser.email,
          token: token
        }
      }
    };
  },

  verifyOTP: async (email, otp) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const otpRecord = mockOTPs[email];
    if (!otpRecord) {
      throw { response: { data: { message: 'Invalid or expired OTP' } } };
    }

    if (otpRecord.used) {
      throw { response: { data: { message: 'OTP has already been used' } } };
    }

    if (new Date() > otpRecord.expiresAt) {
      throw { response: { data: { message: 'OTP has expired' } } };
    }

    if (otpRecord.otp !== otp) {
      throw { response: { data: { message: 'Invalid OTP' } } };
    }

    // Mark OTP as used
    otpRecord.used = true;

    // Verify user
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      user.is_verified = true;
      
      // Create wallet if not exists
      if (!mockWallets[user.id]) {
        mockWallets[user.id] = {
          id: Object.keys(mockWallets).length + 1,
          user_id: user.id,
          balance: 0.00, // Start with zero balance
          currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    return {
      data: {
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: user.id,
          email: user.email,
          isVerified: true
        }
      }
    };
  },

  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // For testing, accept any credentials (no validation)
    console.log(`Mock Login: Email=${email}, Any password accepted`); // For testing

    // Check if user exists (but don't validate password)
    const user = mockUsers.find(u => u.email === email || u.email === 'phone-user@example.com');
    if (!user) {
      // Create user if doesn't exist (for testing)
      const newUser = {
        id: mockUsers.length + 1,
        email: email,
        password_hash: hashPassword(password),
        is_verified: true,
        failed_login_attempts: 0,
        created_at: new Date().toISOString()
      };
      mockUsers.push(newUser);

      // Create wallet for new user
      mockWallets[newUser.id] = {
        id: Object.keys(mockWallets).length + 1,
        user_id: newUser.id,
        balance: 5000.00,
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Generate token for new user
      const token = generateToken();
      return {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            userId: newUser.id,
            email: newUser.email,
            token: token
          }
        }
      };
    }

    // Generate token for existing user
    const token = generateToken();
    
    return {
      data: {
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          token: token
        }
      }
    };
  },

  forgotPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mask email in response for security
    const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2');

    // Always return success for testing (no cooldown, no validation)
    console.log(`Mock Password Reset: Any 6-digit number will work for ${maskedEmail}`); // For testing

    return {
      data: {
        success: true,
        message: `We just sent an OTP to ${maskedEmail}. Please do not disclose this code to anyone.`,
        canResend: true,
        timeRemaining: 60
      }
    };
  },

  resetPassword: async (email, otp, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // For testing, accept any 6-digit OTP (no validation)
    if (!otp || otp.length !== 6) {
      throw { response: { data: { message: 'OTP must be 6 digits' } } };
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw { response: { data: { message: 'Password must be at least 8 characters long' } } };
    }

    // Find user and update password (if exists)
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      user.password_hash = hashPassword(newPassword);
      user.updated_at = new Date().toISOString();
      
      // Reset login attempts
      delete loginAttempts[email];
    }

    console.log(`Mock Password Reset: Email=${email}, Any 6-digit OTP accepted`); // For testing

    return {
      data: {
        success: true,
        message: 'Password reset successfully'
      }
    };
  }
};

// Mock user API
const mockUserAPI = {
  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // For mock, return a sample user profile
    return {
      data: {
        success: true,
        data: {
          id: 1,
          email: 'user@example.com',
          phone: '+1234567890',
          is_verified: true,
          created_at: new Date().toISOString()
        }
      }
    };
  }
};

// Mock wallet API
const mockWalletAPI = {
  getWallet: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get user from token (in real app, we'd decode JWT)
    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    // For mock, assume user ID 1 if token exists
    const userId = 1;
    const wallet = mockWallets[userId];

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = {
        id: Object.keys(mockWallets).length + 1,
        user_id: userId,
        balance: 5000.00,
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockWallets[userId] = newWallet;
      
      // Add some transactions
      const mockTransactions = [
        {
          id: transactions.length + 1,
          wallet_id: newWallet.id,
          type: 'deposit',
          amount: 5000.00,
          old_balance: 0.00,
          new_balance: 5000.00,
          status: 'completed',
          created_at: new Date().toISOString(),
          reference: 'INIT-DEP',
          description: 'Initial wallet funding'
        }
      ];
      transactions.push(...mockTransactions);
    }

    // Calculate balance from transaction ledger
    const walletTransactions = transactions.filter(t => t.wallet_id === wallet.id && t.status === 'completed');
    const calculatedBalance = walletTransactions.reduce((sum, t) => {
      if (t.type === 'deposit') return sum + t.amount;
      if (t.type === 'withdrawal') return sum - t.amount;
      if (t.type === 'escrow_lock') return sum - t.amount;
      if (t.type === 'escrow_release') return sum + t.amount;
      return sum;
    }, 0);

    return {
      data: {
        success: true,
        data: {
          id: wallet.id,
          user_id: wallet.user_id,
          balance: calculatedBalance, // From transaction ledger
          currency: wallet.currency,
          created_at: wallet.created_at,
          updated_at: wallet.updated_at,
          transaction_count: walletTransactions.length
        }
      }
    };
  },

  fundWallet: async (amount) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const wallet = mockWallets[userId];

    if (!wallet) {
      throw { response: { data: { message: 'Wallet not found' } } };
    }

    if (amount <= 0) {
      throw { response: { data: { message: 'Amount must be greater than 0' } } };
    }

    // Create transaction record
    const transaction = {
      id: transactions.length + 1,
      wallet_id: wallet.id,
      type: 'deposit',
      amount: parseFloat(amount),
      old_balance: wallet.balance,
      new_balance: wallet.balance + parseFloat(amount),
      status: 'completed',
      created_at: new Date().toISOString(),
      reference: `DEP-${Date.now()}`
    };
    transactions.push(transaction);

    // Update wallet balance (only through transactions)
    wallet.balance += parseFloat(amount);
    wallet.updated_at = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'wallet_funded',
      title: 'Wallet Funded',
      message: `Your wallet has been funded with $${parseFloat(amount).toFixed(2)}`,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'wallet_funded',
      details: `Wallet funded with amount: ${amount}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    console.log(`Mock Wallet Funded: +$${amount}, New Balance: $${wallet.balance}`); // For testing

    return {
      data: {
        success: true,
        message: 'Wallet funded successfully',
        data: {
          transaction_id: transaction.id,
          new_balance: wallet.balance
        }
      }
    };
  },

  withdrawWallet: async (amount) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const wallet = mockWallets[userId];

    if (!wallet) {
      throw { response: { data: { message: 'Wallet not found' } } };
    }

    if (amount <= 0) {
      throw { response: { data: { message: 'Amount must be greater than 0' } } };
    }

    if (wallet.balance < amount) {
      throw { response: { data: { message: 'Insufficient balance' } } };
    }

    // Check user restrictions before withdrawing
    const riskScore = userRiskScores[userId] || 0;
    if (riskScore > 75) {
      throw { response: { data: { message: 'Account restricted. Cannot withdraw funds.' } } };
    }

    // Create transaction record
    const transaction = {
      id: transactions.length + 1,
      wallet_id: wallet.id,
      type: 'withdrawal',
      amount: parseFloat(amount),
      old_balance: wallet.balance,
      new_balance: wallet.balance - parseFloat(amount),
      status: 'completed',
      created_at: new Date().toISOString(),
      reference: `WD-${Date.now()}`
    };
    transactions.push(transaction);

    // Update wallet balance (only through transactions)
    wallet.balance -= parseFloat(amount);
    wallet.updated_at = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'wallet_withdrawn',
      title: 'Withdrawal Processed',
      message: `Withdrawal of $${parseFloat(amount).toFixed(2)} processed`,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'wallet_withdrawn',
      details: `Wallet withdrawal with amount: ${amount}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    console.log(`Mock Wallet Withdrawal: -$${amount}, New Balance: $${wallet.balance}`); // For testing

    return {
      data: {
        success: true,
        message: 'Withdrawal processed successfully',
        data: {
          transaction_id: transaction.id,
          new_balance: wallet.balance
        }
      }
    };
  },

  createEscrow: async (amount, recipientEmail, description) => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const wallet = mockWallets[userId];

    if (!wallet) {
      throw { response: { data: { message: 'Wallet not found' } } };
    }

    if (amount <= 0) {
      throw { response: { data: { message: 'Amount must be greater than 0' } } };
    }

    if (wallet.balance < amount) {
      throw { response: { data: { message: 'Insufficient balance' } } };
    }

    // Check user restrictions before creating escrow
    const riskScore = userRiskScores[userId] || 0;
    if (riskScore > 75) {
      throw { response: { data: { message: 'Account restricted. Cannot create escrow transactions.' } } };
    }

    // Lock funds in escrow
    const oldBalance = wallet.balance;
    wallet.balance -= parseFloat(amount);
    wallet.updated_at = new Date().toISOString();

    const escrow = {
      id: escrowContracts.length + 1,
      sender_id: userId,
      recipient_email: recipientEmail,
      amount: parseFloat(amount),
      description: description,
      status: 'pending', // Start with pending state
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      reference: `ESC-${Date.now()}`
    };
    escrowContracts.push(escrow);

    // Create escrow lock transaction
    const transaction = {
      id: transactions.length + 1,
      wallet_id: wallet.id,
      escrow_id: escrow.id,
      type: 'escrow_lock',
      amount: parseFloat(amount),
      old_balance: oldBalance,
      new_balance: wallet.balance,
      status: 'completed',
      created_at: new Date().toISOString(),
      reference: escrow.reference
    };
    transactions.push(transaction);

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'escrow_created',
      title: 'Escrow Created',
      message: `Escrow of $${parseFloat(amount).toFixed(2)} created for ${recipientEmail}`,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'escrow_created',
      details: `Escrow created for ${recipientEmail} with amount: ${amount}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    console.log(`Mock Escrow Created: $${amount} locked for ${recipientEmail} (Status: pending)`); // For testing

    return {
      data: {
        success: true,
        message: 'Escrow created successfully',
        data: {
          escrow_id: escrow.id,
          amount: escrow.amount,
          status: escrow.status,
          expires_at: escrow.expires_at
        }
      }
    };
  },

  releaseEscrow: async (escrowId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const escrow = escrowContracts.find(e => e.id === parseInt(escrowId));
    if (!escrow) {
      throw { response: { data: { message: 'Escrow not found' } } };
    }

    // Check escrow state
    if (escrow.status !== 'pending' && escrow.status !== 'active') {
      throw { response: { data: { message: 'Escrow cannot be released from current state' } } };
    }

    if (new Date() > escrow.expires_at) {
      throw { response: { data: { message: 'Escrow has expired' } } };
    }

    // Get sender wallet
    const userId = 1;
    const senderWallet = mockWallets[userId];
    if (!senderWallet) {
      throw { response: { data: { message: 'Sender wallet not found' } } };
    }

    // Update escrow status to completed
    escrow.status = 'completed';
    escrow.released_at = new Date().toISOString();

    // Release funds to recipient wallet (for mock, create recipient wallet if needed)
    const recipientUser = mockUsers.find(u => u.email === escrow.recipient_email);
    let recipientWallet = mockWallets[recipientUser?.id];

    if (!recipientWallet) {
      // Create recipient wallet for mock
      recipientWallet = {
        id: Object.keys(mockWallets).length + 1,
        user_id: recipientUser?.id || 999,
        balance: 0,
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockWallets[recipientWallet.id] = recipientWallet;
    }

    // Add funds to recipient wallet
    const oldRecipientBalance = recipientWallet.balance;
    recipientWallet.balance += escrow.amount;
    recipientWallet.updated_at = new Date().toISOString();

    // Create release transaction for sender
    const senderTransaction = {
      id: transactions.length + 1,
      wallet_id: senderWallet.id,
      escrow_id: escrow.id,
      type: 'escrow_release',
      amount: escrow.amount,
      old_balance: senderWallet.balance,
      new_balance: senderWallet.balance,
      status: 'completed',
      created_at: new Date().toISOString(),
      reference: `REL-${Date.now()}`
    };
    transactions.push(senderTransaction);

    // Create release transaction for recipient
    const recipientTransaction = {
      id: transactions.length + 1,
      wallet_id: recipientWallet.id,
      escrow_id: escrow.id,
      type: 'escrow_release',
      amount: escrow.amount,
      old_balance: oldRecipientBalance,
      new_balance: recipientWallet.balance,
      status: 'completed',
      created_at: new Date().toISOString(),
      reference: `REC-${Date.now()}`
    };
    transactions.push(recipientTransaction);

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'escrow_released',
      title: 'Escrow Released',
      message: `Escrow of $${escrow.amount.toFixed(2)} released to ${escrow.recipient_email}`,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'escrow_released',
      details: `Escrow ${escrowId} released to ${escrow.recipient_email}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    console.log(`Mock Escrow Released: $${escrow.amount} to ${escrow.recipient_email} (Status: completed)`); // For testing

    return {
      data: {
        success: true,
        message: 'Escrow released successfully',
        data: {
          escrow_id: escrow.id,
          status: escrow.status,
          released_at: escrow.released_at
        }
      }
    };
  },

  getTransactions: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const wallet = mockWallets[userId];

    if (!wallet) {
      throw { response: { data: { message: 'Wallet not found' } } };
    }

    // Get user's transactions
    const userTransactions = transactions.filter(t => t.wallet_id === wallet.id);

    return {
      data: {
        success: true,
        data: {
          transactions: userTransactions.reverse(), // Most recent first
          total_count: userTransactions.length
        }
      }
    };
  },

  // Risk scoring system
  updateUserRiskScore: async (userId, action) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    const currentScore = userRiskScores[userId] || 0;
    let newScore = currentScore;

    // Risk scoring logic
    switch (action) {
      case 'failed_login':
        newScore += 10;
        break;
      case 'suspicious_activity':
        newScore += 25;
        break;
      case 'fraud_report':
        newScore += 50;
        break;
      case 'successful_transaction':
        newScore = Math.max(0, newScore - 5);
        break;
      case 'account_verified':
        newScore = Math.max(0, newScore - 10);
        break;
    }

    userRiskScores[userId] = newScore;

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'risk_score_updated',
      details: `Risk score updated from ${currentScore} to ${newScore} for action: ${action}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    return newScore;
  },

  // Notification system
  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const userNotifications = notifications.filter(n => n.user_id === userId);

    return {
      data: {
        success: true,
        data: {
          notifications: userNotifications.reverse(), // Most recent first
          unread_count: userNotifications.filter(n => !n.read).length
        }
      }
    };
  },

  markNotificationRead: async (notificationId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const notification = notifications.find(n => n.id === parseInt(notificationId));
    if (notification) {
      notification.read = true;
      notification.read_at = new Date().toISOString();
    }

    return {
      data: {
        success: true,
        message: 'Notification marked as read'
      }
    };
  },

  // Account restriction system
  checkAccountRestrictions: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw { response: { data: { message: 'User not found' } } };
    }

    const riskScore = userRiskScores[userId] || 0;
    const isRestricted = riskScore > 75; // High risk threshold

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'account_restriction_check',
      details: `Account restriction check. Risk score: ${riskScore}, Restricted: ${isRestricted}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V2',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    return {
      data: {
        success: true,
        data: {
          risk_score: riskScore,
          is_restricted: isRestricted,
          restrictions: isRestricted ? ['withdraw_funds', 'create_escrow', 'send_transactions'] : []
        }
      }
    };
  },

  // Get audit logs
  getAuditLogs: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    const userAuditLogs = auditLogs.filter(log => log.user_id === userId);

    return {
      data: {
        success: true,
        data: {
          audit_logs: userAuditLogs.reverse(), // Most recent first
          total_count: userAuditLogs.length
        }
      }
    };
  },

  // TrustChain V3 - Identity Verification APIs
  getVerificationLevel: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    
    return {
      data: {
        success: true,
        data: {
          verification_level: verificationLevels[userId],
          transaction_limits: getTransactionLimits(verificationLevels[userId].level)
        }
      }
    };
  },

  verifyPhone: async (phoneNumber) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    
    // Update phone verification
    verificationLevels[userId].phone_verified = true;
    verificationLevels[userId].phone = phoneNumber;
    verificationLevels[userId].level = Math.max(verificationLevels[userId].level, 1);
    
    // Update trust score
    trustScores[userId].score = calculateTrustScore(userId);
    trustScores[userId].last_updated = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'phone_verified',
      title: 'Phone Verified',
      message: 'Your phone number has been verified. Transaction limits increased.',
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'phone_verified',
      details: `Phone number ${phoneNumber} verified`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V3',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    return {
      data: {
        success: true,
        message: 'Phone number verified successfully',
        data: {
          verification_level: verificationLevels[userId],
          trust_score: trustScores[userId].score
        }
      }
    };
  },

  verifyEmail: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    
    // Update email verification
    verificationLevels[userId].email_verified = true;
    verificationLevels[userId].level = Math.max(verificationLevels[userId].level, 1);
    
    // Update trust score
    trustScores[userId].score = calculateTrustScore(userId);
    trustScores[userId].last_updated = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'email_verified',
      title: 'Email Verified',
      message: 'Your email address has been verified.',
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    return {
      data: {
        success: true,
        message: 'Email verified successfully',
        data: {
          verification_level: verificationLevels[userId],
          trust_score: trustScores[userId].score
        }
      }
    };
  },

  verifyFacial: async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    
    // Update facial verification
    verificationLevels[userId].facial_verified = true;
    verificationLevels[userId].facial_recognition_id = 'FACE-' + Date.now();
    verificationLevels[userId].level = Math.max(verificationLevels[userId].level, 2);
    
    // Update trust score
    trustScores[userId].score = calculateTrustScore(userId);
    trustScores[userId].last_updated = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'facial_verified',
      title: 'Facial Verification Complete',
      message: 'Your facial verification has been completed. Higher limits unlocked.',
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    return {
      data: {
        success: true,
        message: 'Facial verification completed successfully',
        data: {
          verification_level: verificationLevels[userId],
          trust_score: trustScores[userId].score
        }
      }
    };
  },

  verifyGovernmentID: async (idType, idNumber) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    
    // Update government ID verification
    verificationLevels[userId].government_id_verified = true;
    verificationLevels[userId].government_id = `${idType.toUpperCase()}-${idNumber}`;
    verificationLevels[userId].level = 3; // Maximum level
    verificationLevels[userId].verification_date = new Date().toISOString();
    
    // Update trust score
    trustScores[userId].score = calculateTrustScore(userId);
    trustScores[userId].last_updated = new Date().toISOString();

    // Add notification
    const notification = {
      id: notifications.length + 1,
      user_id: userId,
      type: 'government_id_verified',
      title: 'Identity Fully Verified',
      message: 'Your government ID has been verified. You now have maximum transaction limits.',
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: userId,
      action: 'government_id_verified',
      details: `Government ID verified: ${idType} ${idNumber}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V3',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    return {
      data: {
        success: true,
        message: 'Government ID verified successfully',
        data: {
          verification_level: verificationLevels[userId],
          trust_score: trustScores[userId].score
        }
      }
    };
  },

  // TrustChain V3 - Trust Score APIs
  getTrustScore: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeTrustScore(userId);
    
    // Update trust score with latest data
    trustScores[userId].score = calculateTrustScore(userId);
    trustScores[userId].last_updated = new Date().toISOString();

    return {
      data: {
        success: true,
        data: trustScores[userId]
      }
    };
  },

  getTrustProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const userId = 1;
    initializeVerificationLevel(userId);
    initializeTrustScore(userId);
    
    // Calculate current trust score
    const currentScore = calculateTrustScore(userId);
    trustScores[userId].score = currentScore;

    const userTransactions = transactions.filter(t => 
      mockWallets[t.wallet_id]?.user_id === userId
    );

    const completedEscrows = userTransactions.filter(t => 
      t.type === 'escrow_release' && t.status === 'completed'
    ).length;

    const disputes = userReports[userId]?.disputes || 0;
    const fraudReports = userReports[userId]?.fraud_reports || 0;

    return {
      data: {
        success: true,
        data: {
          trust_score: currentScore,
          verification_level: verificationLevels[userId],
          completed_transactions: completedEscrows,
          disputes: disputes,
          fraud_reports: fraudReports,
          account_age_days: Math.floor((Date.now() - new Date(mockUsers[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
          transaction_limits: getTransactionLimits(verificationLevels[userId].level),
          reputation_badge: currentScore >= 80 ? 'Trusted' : currentScore >= 60 ? 'Reliable' : 'New'
        }
      }
    };
  },

  // TrustChain V3 - Fraud Detection APIs
  reportSuspiciousActivity: async (reportedUserId, reason, description) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const token = localStorage.getItem('token');
    if (!token) {
      throw { response: { data: { message: 'Unauthorized' } } };
    }

    const reporterId = 1;
    
    // Initialize user reports if needed
    if (!userReports[reportedUserId]) {
      userReports[reportedUserId] = {
        disputes: 0,
        fraud_reports: 0,
        reports: []
      };
    }

    // Add report
    userReports[reportedUserId].reports.push({
      id: userReports[reportedUserId].reports.length + 1,
      reporter_id: reporterId,
      reason: reason,
      description: description,
      created_at: new Date().toISOString()
    });

    // Update counters
    if (reason === 'fraud') {
      userReports[reportedUserId].fraud_reports++;
    } else if (reason === 'dispute') {
      userReports[reportedUserId].disputes++;
    }

    // Update trust score for reported user
    if (trustScores[reportedUserId]) {
      trustScores[reportedUserId].score = calculateTrustScore(reportedUserId);
      trustScores[reportedUserId].last_updated = new Date().toISOString();
    }

    // Add notification to admin (mock)
    const notification = {
      id: notifications.length + 1,
      user_id: reporterId,
      type: 'report_submitted',
      title: 'Report Submitted',
      message: `Your ${reason} report has been submitted for review.`,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);

    // Add audit log
    const auditLog = {
      id: auditLogs.length + 1,
      user_id: reporterId,
      action: 'suspicious_activity_reported',
      details: `Reported user ${reportedUserId} for ${reason}: ${description}`,
      ip_address: '127.0.0.1',
      user_agent: 'TrustChain Frontend V3',
      created_at: new Date().toISOString()
    };
    auditLogs.push(auditLog);

    return {
      data: {
        success: true,
        message: 'Report submitted successfully',
        data: {
          report_id: userReports[reportedUserId].reports.length
        }
      }
    };
  }
};

// Mock health API
const mockHealthAPI = {
  check: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      data: {
        success: true,
        message: 'Mock API is running',
        timestamp: new Date().toISOString()
      }
    };
  }
};

// Export mock APIs
export const mockApi = {
  auth: mockAuthAPI,
  user: mockUserAPI,
  wallet: mockWalletAPI,
  health: mockHealthAPI
};

// Function to check if backend is available
export const isBackendAvailable = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Enhanced API service that falls back to mock
export const enhancedApi = {
  auth: {
    register: async (userData) => {
      const available = await isBackendAvailable();
      return available ? authAPI.register(userData) : mockAuthAPI.register(userData);
    },
    verifyOTP: async (email, otp) => {
      const available = await isBackendAvailable();
      return available ? authAPI.verifyOTP(email, otp) : mockAuthAPI.verifyOTP(email, otp);
    },
    login: async (email, password) => {
      const available = await isBackendAvailable();
      return available ? authAPI.login(email, password) : mockAuthAPI.login(email, password);
    },
    forgotPassword: async (email) => {
      const available = await isBackendAvailable();
      return available ? authAPI.forgotPassword(email) : mockAuthAPI.forgotPassword(email);
    },
    resetPassword: async (email, otp, newPassword) => {
      const available = await isBackendAvailable();
      return available ? authAPI.resetPassword(email, otp, newPassword) : mockAuthAPI.resetPassword(email, otp, newPassword);
    }
  },
  user: {
    getProfile: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.getProfile() : mockUserAPI.getProfile();
    },
    updateUserRiskScore: async (userId, action) => {
      const available = await isBackendAvailable();
      return available ? userAPI.updateUserRiskScore(userId, action) : mockAuthAPI.updateUserRiskScore(userId, action);
    },
    checkAccountRestrictions: async (userId) => {
      const available = await isBackendAvailable();
      return available ? userAPI.checkAccountRestrictions(userId) : mockAuthAPI.checkAccountRestrictions(userId);
    },
    getAuditLogs: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.getAuditLogs() : mockAuthAPI.getAuditLogs();
    },
    // TrustChain V3 APIs
    getVerificationLevel: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.getVerificationLevel() : mockAuthAPI.getVerificationLevel();
    },
    verifyPhone: async (phoneNumber) => {
      const available = await isBackendAvailable();
      return available ? userAPI.verifyPhone(phoneNumber) : mockAuthAPI.verifyPhone(phoneNumber);
    },
    verifyEmail: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.verifyEmail() : mockAuthAPI.verifyEmail();
    },
    verifyFacial: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.verifyFacial() : mockAuthAPI.verifyFacial();
    },
    verifyGovernmentID: async (idType, idNumber) => {
      const available = await isBackendAvailable();
      return available ? userAPI.verifyGovernmentID(idType, idNumber) : mockAuthAPI.verifyGovernmentID(idType, idNumber);
    },
    getTrustScore: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.getTrustScore() : mockAuthAPI.getTrustScore();
    },
    getTrustProfile: async () => {
      const available = await isBackendAvailable();
      return available ? userAPI.getTrustProfile() : mockAuthAPI.getTrustProfile();
    },
    reportSuspiciousActivity: async (reportedUserId, reason, description) => {
      const available = await isBackendAvailable();
      return available ? userAPI.reportSuspiciousActivity(reportedUserId, reason, description) : mockAuthAPI.reportSuspiciousActivity(reportedUserId, reason, description);
    }
  },
  wallet: {
    getWallet: async () => {
      const available = await isBackendAvailable();
      return available ? walletAPI.getWallet() : mockWalletAPI.getWallet();
    },
    fundWallet: async (amount) => {
      const available = await isBackendAvailable();
      return available ? walletAPI.fundWallet(amount) : mockWalletAPI.fundWallet(amount);
    },
    withdrawWallet: async (amount) => {
      const available = await isBackendAvailable();
      return available ? walletAPI.withdrawWallet(amount) : mockWalletAPI.withdrawWallet(amount);
    },
    createEscrow: async (amount, recipientEmail, description) => {
      const available = await isBackendAvailable();
      return available ? walletAPI.createEscrow(amount, recipientEmail, description) : mockWalletAPI.createEscrow(amount, recipientEmail, description);
    },
    releaseEscrow: async (escrowId) => {
      const available = await isBackendAvailable();
      return available ? walletAPI.releaseEscrow(escrowId) : mockWalletAPI.releaseEscrow(escrowId);
    },
    getTransactions: async () => {
      const available = await isBackendAvailable();
      return available ? walletAPI.getTransactions() : mockWalletAPI.getTransactions();
    }
  },
  notifications: {
    getNotifications: async () => {
      const available = await isBackendAvailable();
      return available ? notificationsAPI.getNotifications() : mockAuthAPI.getNotifications();
    },
    markNotificationRead: async (notificationId) => {
      const available = await isBackendAvailable();
      return available ? notificationsAPI.markNotificationRead(notificationId) : mockAuthAPI.markNotificationRead(notificationId);
    }
  },
  health: {
    check: async () => {
      const available = await isBackendAvailable();
      return available ? healthAPI.check() : mockHealthAPI.check();
    }
  }
};

export default enhancedApi;
