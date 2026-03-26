import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: conv } = await supabase.from('conversations').select('id, user_id').order('created_at', { ascending: false }).limit(1);
  const conversation_id = conv[0].id;
  
  console.log('Inserting into:', conversation_id);
  const { data, error } = await supabase.from('messages').insert({
    conversation_id, role: 'user', content: 'test bypass silent error'
  }).select();

  console.log('DB Insert Data:', data);
  console.log('DB Insert Error:', error);

  process.exit();
}
main();
