import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = "https://usaqywugirnsworksgyx.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
