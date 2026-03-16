import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-white hover:text-blue-200 transition">Features</a>
              <a href="#security" className="text-white hover:text-blue-200 transition">Security</a>
              <a href="#about" className="text-white hover:text-blue-200 transition">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Secure Online Transactions with TrustChain
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the future of secure escrow payments. Protect your transactions with our enterprise-grade security and smart contract technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="fintech-button-primary bg-white text-blue-600 hover:bg-blue-50 hover:text-black px-8 py-4 text-lg font-semibold transition-all duration-200"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="fintech-button-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose TrustChain?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="fintech-card p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bank-Level Security</h3>
              <p className="text-gray-600">
                Military-grade encryption and multi-factor authentication keep your funds safe.
              </p>
            </div>
            
            <div className="fintech-card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Transactions</h3>
              <p className="text-gray-600">
                Lightning-fast escrow settlements with blockchain-powered smart contracts.
              </p>
            </div>
            
            <div className="fintech-card p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Coverage</h3>
              <p className="text-gray-600">
                Send and receive payments globally with competitive exchange rates.
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="max-w-4xl mx-auto mt-20">
          <div className="fintech-card p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Enterprise-Grade Security
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 text-sm">Add an extra layer of security to your account</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Contract Protection</h3>
                  <p className="text-gray-600 text-sm">Blockchain-based escrow ensures fair transactions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Monitoring</h3>
                  <p className="text-gray-600 text-sm">Continuous monitoring for suspicious activities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                  <p className="text-gray-600 text-sm">Your funds are protected up to $100,000</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 px-8 border-t border-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-100 mb-4">
            © 2026 TrustChain. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link
              to="/privacy-policy"
              className="text-blue-100 hover:text-white transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-blue-100 hover:text-white transition"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
