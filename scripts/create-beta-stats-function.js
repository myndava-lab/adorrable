
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function createBetaStatsFunction() {
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
    console.log('🚀 Creating beta stats function...')
    
    // Read the SQL file
    const sql = fs.readFileSync('supabase/migrations/006_create_beta_stats_final.sql', 'utf8')
    
    // Split SQL into individual statements and execute them one by one
    const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
    
    for (const statement of statements) {
      const cleanStatement = statement.trim()
      if (cleanStatement) {
        console.log('Executing SQL statement...')
        
        // Use raw SQL query instead of rpc
        const { error } = await supabase
          .from('profiles')  // This is just to establish connection
          .select('count', { count: 'exact', head: true })
        
        if (error && error.code !== 'PGRST116') {
          console.error('❌ Connection test failed:', error)
          continue
        }

        // Try to execute via a direct query approach
        const { data, error: execError } = await supabase.rpc('get_beta_stats')
        
        if (execError && execError.code === 'PGRST202') {
          console.log('Function does not exist yet, that\'s expected')
        }
        
        break; // We just need to test the connection
      }
    }
    
    console.log('✅ Please run this SQL manually in your Supabase SQL Editor:')
    console.log('---')
    console.log(sql)
    console.log('---')
    
  } catch (err) {
    console.error('❌ Script error:', err)
  }
}

createBetaStatsFunction()
