
import DatabaseTestButton from '@/components/DatabaseTestButton'
import CreditButton from '@/components/CreditButton'
import GenerateButton from '@/components/GenerateButton'

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Database & API Testing</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DatabaseTestButton />
          <CreditButton />
          <GenerateButton />
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
              <strong>OpenAI API Key:</strong> {process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>NextAuth Secret:</strong> {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
