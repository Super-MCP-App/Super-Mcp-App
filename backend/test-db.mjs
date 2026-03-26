import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('messages').select('id, role, content, conversation_id').order('created_at', { ascending: false }).limit(5);
  if (error) console.error(error);
  else console.log('Recent messages:', data);
  
  const { data: convs } = await supabase.from('conversations').select('id, title, last_message').order('created_at', { ascending: false }).limit(2);
  console.log('Recent convs:', convs);
  process.exit();
}
main();
