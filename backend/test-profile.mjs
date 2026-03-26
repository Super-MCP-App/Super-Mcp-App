import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const userId = '9ddd2243-fcbc-42bd-93b7-3b9c68a72d1d'; // the user creating empty chats
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  console.log('Profile:', profile);

  // Check recent tasks or messages to see if anything else is failing
  const { data: errLogs } = await supabase.from('messages').select('*').eq('conversation_id', 'c5ae2124-117c-4bec-b9ee-bdd80744b595');
  console.log('Messages for latest chat:', errLogs);
  process.exit();
}
main();
