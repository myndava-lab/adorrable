
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Adorrable.dev',
  description: 'Privacy Policy for Adorrable.dev AI Website Builder',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                When you use Adorrable.dev, we collect the following types of information:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Account Information:</strong> Email address, name, and profile information when you sign up</li>
                <li><strong>OAuth Data:</strong> When you sign in with Google or LinkedIn, we receive your basic profile information</li>
                <li><strong>Usage Data:</strong> Information about how you use our AI website builder service</li>
                <li><strong>Payment Information:</strong> Billing details processed through our payment providers (Paystack, NOWPayments)</li>
                <li><strong>Generated Content:</strong> Websites and content you create using our AI tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and improve our AI website building services</li>
                <li>Process payments and manage your account</li>
                <li>Send you important updates about our service</li>
                <li>Provide customer support</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Service Providers:</strong> With trusted third-party services (Supabase, OpenAI, payment processors)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting with industry-standard providers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Withdraw consent for data processing</li>
                <li>Port your data to another service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze website usage through analytics services</li>
                <li>Provide customer support through chat widgets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
              <p className="mb-4">
                Our service integrates with third-party providers:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>OpenAI:</strong> AI content generation</li>
                <li><strong>Paystack/NOWPayments:</strong> Payment processing</li>
                <li><strong>Google/LinkedIn:</strong> OAuth authentication</li>
                <li><strong>Crisp:</strong> Customer support chat</li>
              </ul>
              <p className="mb-4">
                Each service has its own privacy policy governing their data handling practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="mb-4">
                We retain your information only as long as necessary to provide our services or as required by law. 
                You can request deletion of your account at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
              <p className="mb-4">
                Your data may be processed in countries other than your own. We ensure appropriate safeguards 
                are in place to protect your information during international transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@adorrable.dev</p>
                <p><strong>Address:</strong> Adorrable.dev, Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
