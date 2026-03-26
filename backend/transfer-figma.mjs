import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_USER_ID = '49c64998-8d11-4ba1-8de1-f0bb5d12c059'; // Nitheeraj Admin
const SOURCE_USER_ID = '9ddd2243-fcbc-42bd-93b7-3b9c68a72d1d'; // HavocNitheesh

async function main() {
  console.log(`Transferring Figma connection from ${SOURCE_USER_ID} to ${TARGET_USER_ID}...`);
  
  // Update the row
  const { data, error } = await supabase
    .from('connected_apps')
    .update({ user_id: TARGET_USER_ID })
    .eq('user_id', SOURCE_USER_ID)
    .eq('provider', 'figma');

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update successful! Result:', data);
  }

  process.exit();
}
main();
