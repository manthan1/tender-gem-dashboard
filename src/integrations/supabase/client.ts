
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zmwtsbrynlzqnfiqigip.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptd3RzYnJ5bmx6cW5maXFpZ2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3Mzk3NTIsImV4cCI6MjA2MTMxNTc1Mn0.D2XLA8PFJz-McDFDNqauttzEw4PMWqId6uNbBqIVCWs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
