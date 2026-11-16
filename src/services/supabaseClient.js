import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://syrxlcjhqxvhunpebizr.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);