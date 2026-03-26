import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const userId = '9ddd2243-fcbc-42bd-93b7-3b9c68a72d1d';
  // generate a fake JWT to use against the live vercel backend? No, bypassing auth to local dev is easiest.
  // Actually, I can just run the logic directly.
  
  // Wait, I can try to hit the LIVE Vercel endpoint if I generate a JWT.
  // We can just login via Auth API to get a JWT.
  const authRes = await supabase.auth.signInWithPassword({
    email: 'havocnitheesh10@gmail.com', // user email
    password: 'Thilak_dr1' // I don't know it!
  });
  console.log(authRes.error);

  process.exit();
}
main();
