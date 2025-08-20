// Supabase client configuration - Reverted to previous working database
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://daxpmndukvyeweinamhh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MzQ0MywiZXhwIjoyMDY5MDQ5NDQzfQ.1HekGK6JEEUg7nuSz1fwPl3SeVLQNCOyZfYtmf7Eln0";

// SINGLETON PATTERN - Create only ONE instance to avoid multiple GoTrueClient warnings
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
})();

// Service role client for admin operations (use only on server-side)
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});