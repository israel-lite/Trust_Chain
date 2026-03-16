import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Logo size="lg" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: March 14, 2026</p>
        </div>

        {/* Content */}
        <div className="fintech-card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              TrustChain is committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our escrow payment platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name and email address</li>
                  <li>Phone number for verification</li>
                  <li>Payment information (encrypted)</li>
                  <li>Government-issued ID for verification</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Transaction Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Transaction history and amounts</li>
                  <li>Escrow contract details</li>
                  <li>Payment timestamps</li>
                  <li>Counterparty information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address and location data</li>
                  <li>Device information</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and analytics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="space-y-3">
              <p className="text-gray-700">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and maintain our escrow services</li>
                <li>Process transactions and manage escrow contracts</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Communicate with you about your account</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Provide customer support</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-leading security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>End-to-end encryption</strong> for all sensitive data</li>
              <li><strong>Multi-factor authentication</strong> for account access</li>
              <li><strong>Regular security audits</strong> and penetration testing</li>
              <li><strong>Secure data centers</strong> with 24/7 monitoring</li>
              <li><strong>Blockchain technology</strong> for immutable transaction records</li>
              <li><strong>Compliance with PCI DSS</strong> and other security standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We only share data in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>With transaction counterparties for escrow fulfillment</li>
              <li>With financial institutions for payment processing</li>
              <li>With regulatory authorities when required by law</li>
              <li>With trusted service providers under strict confidentiality agreements</li>
              <li>During business transfers (mergers, acquisitions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
              <li>Object to certain data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and maintain security. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              TrustChain is not intended for users under 18 years of age. We do not knowingly 
              collect personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              significant changes by email or by posting a prominent notice on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@trustchain.com</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Blockchain Avenue, Tech City, TC 12345</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
