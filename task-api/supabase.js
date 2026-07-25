const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
}

// One shared Supabase client for the whole app (anon key — never service_role)
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
