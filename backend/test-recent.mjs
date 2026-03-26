import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('messages').select('id, role, content, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('Very recent messages:', data);
  process.exit();
}
main();
