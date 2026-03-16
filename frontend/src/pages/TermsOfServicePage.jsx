import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Logo size="lg" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: March 14, 2026</p>
        </div>

        {/* Content */}
        <div className="fintech-card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using TrustChain, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TrustChain provides secure escrow payment services including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Secure payment escrow for online transactions</li>
              <li>Smart contract-based payment processing</li>
              <li>Identity verification and fraud prevention</li>
              <li>Transaction dispute resolution</li>
              <li>Cross-border payment processing</li>
              <li>Multi-currency support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Responsibilities</h2>
            <div className="space-y-3">
              <p className="text-gray-700">As a TrustChain user, you must:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>Use the platform for legitimate transactions only</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or illegal activities</li>
                <li>Respect the rights of other users</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction Terms</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Escrow Services</h3>
                <p className="text-gray-700">
                  TrustChain acts as a neutral third-party escrow agent. We hold funds until 
                  transaction conditions are met, then release them according to the agreed terms.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fees</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Transaction fees: 2.5% of transaction amount</li>
                  <li>Currency conversion: 1.5% above market rate</li>
                  <li>International transfers: Additional $10 flat fee</li>
                  <li>Dispute resolution: $25 processing fee</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Processing</h3>
                <p className="text-gray-700">
                  All payments are processed through secure payment gateways. We support 
                  credit cards, bank transfers, and cryptocurrency payments.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not use TrustChain for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Illegal activities or transactions</li>
              <li>Fraudulent or deceptive practices</li>
              <li>Money laundering or terrorist financing</li>
              <li>Sanctioned countries or individuals</li>
              <li>Intellectual property infringement</li>
              <li>Hate speech or discriminatory content</li>
              <li>Malware, viruses, or malicious code</li>
              <li>Spam or unsolicited communications</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                In case of disputes, we follow this resolution process:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Both parties submit evidence and documentation</li>
                <li>TrustChain mediates between parties</li>
                <li>Decision based on transaction terms and evidence</li>
                <li>Funds released according to resolution outcome</li>
                <li>Appeals process available within 30 days</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All TrustChain content, trademarks, and intellectual property remain the exclusive 
              property of TrustChain. You may not use our intellectual property without prior 
              written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              TrustChain's liability is limited to the amount of fees paid for the specific transaction 
              in question. We are not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold TrustChain harmless from any claims, damages, 
              or expenses arising from your use of the platform or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may suspend or terminate your account for violations of these terms, 
              illegal activities, or at our discretion with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by the laws of the jurisdiction where TrustChain is incorporated. 
              Any disputes will be resolved through binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these terms at any time. Continued use of the platform constitutes 
              acceptance of any changes. We will notify users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms of Service, please contact:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@trustchain.com</p>
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

export default TermsOfServicePage;
