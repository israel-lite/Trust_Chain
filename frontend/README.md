# TrustChain Frontend

A professional fintech frontend application for the TrustChain escrow payment platform.

## Tech Stack

- **React** - Modern UI framework
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## Features

- 🔐 **Secure Authentication** - Login, registration, and password management
- 📧 **Email Verification** - OTP-based email verification system
- 💰 **Wallet Dashboard** - Real-time balance and transaction tracking
- 🎨 **Professional UI** - Clean fintech-inspired design
- 📱 **Responsive Design** - Works on all devices
- 🔒 **JWT Authentication** - Secure token-based authentication

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── PasswordStrengthBar.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── RegisterPage.jsx
│   ├── OTPVerificationPage.jsx
│   ├── LoginPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   └── DashboardPage.jsx
├── services/           # API services
│   └── api.js
├── utils/              # Utility functions
│   └── passwordValidator.js
├── styles/             # Custom styles
├── App.jsx             # Main app component
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running at http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the TrustChain backend API:

- **Base URL**: http://localhost:3000/api
- **Authentication**: JWT Bearer tokens
- **Auto-refresh**: Tokens automatically refresh on protected routes

## Complete User Flow

1. **Landing Page** → Introduction to TrustChain
2. **Register** → Create account with email verification
3. **OTP Verification** → Verify email with 6-digit code
4. **Login** → Sign in with credentials
5. **Dashboard** → View wallet and manage transactions
6. **Forgot Password** → Reset password with OTP
7. **Reset Password** → Set new password with verification

## Password Security

- **Minimum 8 characters**
- **Uppercase letter required**
- **Lowercase letter required**
- **Number required**
- **Special character required**
- **Real-time strength indicator** (Weak/Fair/Strong/Very Strong)
- **Color-coded feedback** (Red/Yellow/Green/Blue)

## Design System

### Colors
- **Primary**: Deep Blue (#1e3a8a)
- **Secondary**: Dark Slate (#334155)
- **Accent**: Emerald Green (#10b981)
- **Background**: Soft Gray (#f8fafc)

### Components
- Modern input fields with focus states
- Rounded buttons with hover effects
- Card-based layouts
- Smooth transitions and animations
- Professional fintech styling

## Environment Variables

The frontend uses Vite's proxy configuration to connect to the backend API. No additional environment variables are required for development.

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server
3. Update the API base URL in production
4. Ensure HTTPS is enabled for security

## Security Features

- JWT token storage in localStorage
- Automatic token refresh
- Protected route authentication
- Input validation and sanitization
- XSS protection
- CSRF protection via same-site cookies

## Contributing

1. Follow the existing code style
2. Use meaningful component names
3. Add proper error handling
4. Test all user flows
5. Ensure responsive design

## Support

For issues and questions:
- Check the backend API documentation at http://localhost:3000/api/docs
- Review the console for error messages
- Ensure the backend server is running
