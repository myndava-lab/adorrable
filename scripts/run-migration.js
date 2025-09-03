
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })

  try {
    console.log('🚀 Running database migration...')
    
    // Read the complete database setup SQL
    const sql = fs.readFileSync('fix_complete_database.sql', 'utf8')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Migration failed:', error)
    } else {
      console.log('✅ Migration completed successfully!')
    }
  } catch (err) {
    console.error('❌ Migration error:', err)
  }
}

runMigration()
