// src/scripts/supabase-client.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// URL y KEY de Supabase (reemplazadas desde tu captura)
const SUPABASE_URL = 'https://sgwafuoufzmtmcsjdam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnd2FmdW91ZnptdG1jczNqZGFtTi1wicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTAsInV4cCI6MjA2MDMzMTI4MH0.Pf7VaIAO0aFdTHjdBPElN-O4Ej0wuRJTYCB0dMi08Yc';

// Cliente Supabase instanciado
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);