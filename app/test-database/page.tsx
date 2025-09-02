import DatabaseTestButton from '@/components/DatabaseTestButton'
import CreditButton from '@/components/CreditButton'
import GenerateButton from '@/components/GenerateButton'
import PricingTestButton from '@/components/PricingTestButton'
import DebugButton from '@/components/DebugButton'
import PricingCard from '@/components/PricingCard' // Assuming PricingCard is in components/PricingCard

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Database & API Testing</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <DatabaseTestButton />
          <CreditButton />
          <GenerateButton />
          <PricingTestButton />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">🔍 Debug Analysis</h2>
          <div className="max-w-2xl mx-auto">
            <DebugButton />
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>First, sign in:</strong> Go to the main page and click "Sign in with Google" or "Sign in with LinkedIn"</li>
            <li>Then test database connection (no auth needed)</li>
            <li>Test credits API (requires authentication)</li>
            <li>Test pricing flow with mock purchase (requires authentication)</li>
            <li>Finally test AI generation (requires authentication)</li>
            <li>Check browser console for detailed logs</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
            <p className="text-sm font-medium">⚠️ Important:</p>
            <p className="text-sm">All API tests (except database) require you to be signed in first. If you see authentication errors, go back to the main page and sign in.</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Payment Integration Test</h2>
          <PricingCard />
        </div>


        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>Service Role Key:</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>OpenAI API Key:</strong> {process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>NextAuth Secret:</strong> {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>Admin Email:</strong> {process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing'}
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <p className="text-sm">
              <strong>Note:</strong> If you see environment variables as missing, make sure your .env.local file matches your Replit secrets, and restart the development server.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}