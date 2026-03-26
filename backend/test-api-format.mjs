import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Get recent conv
  const { data: conv } = await supabase.from('conversations').select('id, user_id').order('created_at', { ascending: false }).limit(1);
  if (!conv || !conv[0]) return console.log('No conv');

  const id = '61561fa3-cf5d-4422-8e91-9d6c4c94c441';
  
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  const finalRes = { ...conversation, messages: messages || [] };
  console.log(JSON.stringify(finalRes, null, 2));

  process.exit();
}
main();
