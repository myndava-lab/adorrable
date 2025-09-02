
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database schema...')
  
  try {
    // Create profiles table
    const { error: profilesError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          display_name TEXT,
          credits INT NOT NULL DEFAULT 4,
          avatar_url TEXT,
          timezone TEXT DEFAULT 'UTC',
          language TEXT DEFAULT 'English',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
    
    if (profilesError) {
      console.error('❌ Error creating profiles table:', profilesError)
    } else {
      console.log('✅ Profiles table created')
    }

    // Create credit_logs table
    const { error: logsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS credit_logs (
          id BIGSERIAL PRIMARY KEY,
          profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          delta INT NOT NULL,
          reason TEXT NOT NULL,
          balance_after INT NOT NULL,
          meta JSONB DEFAULT '{}'::JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
    
    if (logsError) {
      console.error('❌ Error creating credit_logs table:', logsError)
    } else {
      console.log('✅ Credit logs table created')
    }

    // Create the debug function
    const { error: funcError } = await supabase.rpc('sql', {
      query: `
        CREATE OR REPLACE FUNCTION get_public_tables()
        RETURNS TABLE(table_name text)
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT t.table_name::text
          FROM information_schema.tables t
          WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE';
        $$;
      `
    })
    
    if (funcError) {
      console.error('❌ Error creating debug function:', funcError)
    } else {
      console.log('✅ Debug function created')
    }

    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()
