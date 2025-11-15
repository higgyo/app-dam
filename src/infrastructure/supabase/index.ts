import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = "https://usaqywugirnsworksgyx.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        storage: {
            getItem: SecureStore.getItemAsync,
            setItem: SecureStore.setItemAsync,
            removeItem: SecureStore.deleteItemAsync,
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
