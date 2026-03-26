import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: conv } = await supabase.from('conversations').select('id, user_id').order('created_at', { ascending: false }).limit(2);
  console.log("Recent Conversations: ", conv);

  for (let c of (conv || [])) {
    const { data: messages } = await supabase.from('messages').select('id, role, content').eq('conversation_id', c.id).order('created_at', { ascending: true });
    console.log(`Messages for ${c.id}:`, messages?.length);
  }
  process.exit();
}
main();
