import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase Project
const SUPABASE_URL = 'https://erfbffojmysuhzbbwofm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pUonnYD5JTma3Ms2dmQFFw_WUuEjtwA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
