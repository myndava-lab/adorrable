
import DatabaseTestButton from '@/components/DatabaseTestButton'
import CreditButton from '@/components/CreditButton'
import GenerateButton from '@/components/GenerateButton'
import PricingTestButton from '@/components/PricingTestButton'

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
