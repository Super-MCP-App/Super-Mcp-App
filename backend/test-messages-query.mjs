import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_USER_ID = '49c64998-8d11-4ba1-8de1-f0bb5d12c059'; // Nitheeraj Admin

async function main() {
  console.log(`[Test] Querying connected_apps for user ${TARGET_USER_ID}...`);
  
  const { data, error } = await supabase
    .from('connected_apps')
    .select('provider, status, access_token')
    .eq('user_id', TARGET_USER_ID);

  if (error) {
    console.error('Query error:', error);
  } else {
    console.log('Query successful! Connections found:', data.length);
    console.log(JSON.stringify(data, null, 2));
  }

  process.exit();
}
main();
