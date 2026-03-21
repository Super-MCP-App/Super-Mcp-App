import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://wkffqedsboeenmmfwkfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oNmEOymvuM5qoUsL9Z2RXA_WDfqoBq2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

import * as Linking from 'expo-linking';

export async function signInWithGoogle() {
  const redirectUrl = Linking.createURL('google-auth');
  console.log('Redirecting to:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase signout API failed, forcing local clear', e);
  } finally {
    await AsyncStorage.clear();
  }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
