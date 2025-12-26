import { useState } from 'react';
import { FileText, Scale, AlertCircle, CreditCard, XCircle, Users } from 'lucide-react';

interface TermsAndConditionsProps {
  readonly onNavigate?: (page: string, id?: string) => void;
}

export function TermsAndConditions({ onNavigate }: TermsAndConditionsProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'organizers'>('users');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              For Users
            </button>
            <button
              onClick={() => setActiveTab('organizers')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'organizers'
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              For Organizers
            </button>
          </div>
        </div>

        {/* Users Terms */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By using ShowSewa, you confirm that you have read, understood, and agreed to these Terms and Conditions.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Platform Description</h2>
              <p className="text-gray-700 dark:text-gray-300">
                ShowSewa is an online platform that helps users discover events and book tickets. ShowSewa does not organize events and is not responsible for event execution.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Ticket Booking and Entry</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Tickets purchased through ShowSewa are valid only for the specified event, date, and time.</li>
                <li>Tickets are non-transferable unless explicitly mentioned by the organizer.</li>
                <li>Entry to events is subject to the organizer's rules and venue policies.</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Payments and Pricing</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Ticket prices are set by event organizers.</li>
                    <li>Payments are processed through secure third-party payment gateways.</li>
                    <li>ShowSewa does not store payment card or wallet information.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Refunds and Cancellations</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Refunds depend on the event organizer's refund policy.</li>
                    <li>ShowSewa is not responsible for refunds unless clearly stated.</li>
                    <li>In case of event cancellation or rescheduling, users will be informed when possible.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Event Changes</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Event details such as venue, time, performers, or schedule may change. ShowSewa is not liable for such changes made by organizers.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <Users className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. User Responsibilities</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">Users must:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Provide accurate information</li>
                    <li>Not misuse the platform</li>
                    <li>Not attempt fraud, ticket duplication, or system abuse</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mt-4">
                    Violation may result in account suspension.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">ShowSewa is not responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Event quality or execution</li>
                <li>Personal injury, loss, or damage at events</li>
                <li>Disputes between users and organizers</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Account Termination</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    ShowSewa reserves the right to suspend or terminate user accounts that violate these terms.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Organizers Terms */}
        {activeTab === 'organizers' && (
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Organizer Eligibility</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By listing events on ShowSewa, organizers confirm they have legal authority to host and sell tickets for the event.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Organizer Responsibilities</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Organizers are fully responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Event accuracy and authenticity</li>
                <li>Venue permissions and safety</li>
                <li>Compliance with local laws and regulations</li>
                <li>Audience management and security</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Event Listings</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>All event details must be accurate and updated.</li>
                <li>Misleading or false information may result in event removal.</li>
                <li>ShowSewa reserves the right to review and approve listings.</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Ticket Sales and Pricing</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Organizers set ticket prices and availability.</li>
                    <li>ShowSewa may charge a service or platform fee.</li>
                    <li>Ticket revenue settlements are handled as per agreed timelines.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Refunds and Cancellations</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Organizers must clearly define refund and cancellation policies.</li>
                    <li>Organizers are responsible for refund fulfillment when applicable.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Payments and Settlements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Organizer payouts are processed after deducting applicable fees.</li>
                <li>ShowSewa is not responsible for delays caused by third-party payment providers.</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Content Usage</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Organizers grant ShowSewa the right to use event names, images, posters, and descriptions for promotional and marketing purposes.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Prohibited Activities</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">Organizers must not:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>List fake or unauthorized events</li>
                    <li>Sell illegal or restricted content</li>
                    <li>Engage in fraudulent activities</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mt-4">
                    Violation may result in account termination and removal from the platform.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Termination of Organizer Account</h2>
              <p className="text-gray-700 dark:text-gray-300">
                ShowSewa reserves the right to suspend or permanently remove organizers who violate platform policies.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                ShowSewa may update these Terms and Conditions at any time. Continued use of the platform indicates acceptance of updated terms.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Contact</h2>
              <p className="text-gray-700 dark:text-gray-300">
                For any questions regarding these Terms and Conditions, please contact ShowSewa through the official communication channels listed on the website.
              </p>
            </section>
          </div>
        )}

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
