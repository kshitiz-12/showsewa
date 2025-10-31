import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sekplvmoorurpxwpxuuv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNla3Bsdm1vb3J1cnB4d3B4dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwMDgsImV4cCI6MjA3NjI1NjAwOH0.DZktFf0G6xzQJbbU1-PGmkAGVaMPWp__WeX2x-m-FpI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

