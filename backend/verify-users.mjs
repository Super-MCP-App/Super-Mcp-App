import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Connected Apps ---');
  const { data: apps } = await supabase.from('connected_apps').select('user_id, provider, status, account_name, connected_at');
  console.table(apps);

  console.log('\n--- Recent Profiles ---');
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').order('updated_at', { ascending: false }).limit(5);
  console.table(profiles);

  process.exit();
}
main();
