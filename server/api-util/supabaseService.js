const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabaseService = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.error('Supabase service client is not initialized. Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
}

module.exports = supabaseService;
