
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-url.supabase.co';
// This would typically come from environment variables, but for this MVP,
// we'll use a dummy key since we're assuming public anon access is enabled.
const supabaseAnonKey = 'dummy-key-for-mvp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
