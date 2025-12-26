import { Shield, Eye, Lock, Globe, Cookie, Users, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  readonly onNavigate?: (page: string, id?: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            At ShowSewa, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you access or use our website and services.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2 font-semibold">
            By using ShowSewa, you agree to the terms outlined in this Privacy Policy.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Users className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">a) Personal Information</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  When you use ShowSewa, we may collect the following information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Account details (for users and organizers)</li>
                  <li>Payment-related information (processed securely via third-party payment gateways)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">b) Usage Information</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may collect information such as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Events viewed or booked</li>
                  <li>Ticket purchase history</li>
                  <li>Browser type, device type, and basic usage data for analytics and performance improvement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Eye className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use the collected information to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Enable ticket booking and event discovery</li>
                  <li>Process payments securely</li>
                  <li>Send booking confirmations and event updates</li>
                  <li>Provide customer support</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Prevent fraud and misuse of the platform</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4 font-semibold">
                  ShowSewa does not sell, rent, or trade your personal information to third parties.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Payments and Third-Party Services</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>All payments are processed through secure third-party payment gateways.</li>
                  <li>ShowSewa does not store your card, wallet, or banking details.</li>
                  <li>Third-party services may have their own privacy policies, and users are encouraged to review them.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Globe className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may share limited user information only:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>With event organizers, strictly for event management purposes</li>
                  <li>When required by law or legal authorities</li>
                  <li>With trusted service providers for platform operations</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  We do not share personal data for advertising or marketing purposes without user consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ShowSewa takes reasonable technical and organizational measures to protect user data from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
              <li>Unauthorized access</li>
              <li>Data loss</li>
              <li>Misuse or alteration</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              While we strive to protect your information, no online platform can guarantee complete security.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Cookie className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Cookies and Analytics</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  ShowSewa may use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
                  <li>Improve website functionality</li>
                  <li>Analyze user behavior</li>
                  <li>Enhance overall browsing experience</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  Users can manage or disable cookies through their browser settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. User Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mb-4">
              <li>Access their personal information</li>
              <li>Request correction or deletion of their data</li>
              <li>Withdraw consent for communications</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Requests can be made through the official communication channels provided on the ShowSewa website.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              ShowSewa is not intended for children under the age of 13. We do not knowingly collect personal information from minors.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              ShowSewa may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-4">
              <Mail className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions, concerns, or requests related to this Privacy Policy, please contact us through the official contact details available on the ShowSewa website.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                globalThis.location.href = '/';
              }
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
