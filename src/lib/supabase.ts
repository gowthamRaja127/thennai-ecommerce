import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/*
 * Browser Supabase client for the admin area. It uses the public anon key only; what an
 * admin may read or change is enforced by row-level security in the database
 * (see supabase/migrations). The service-role key stays on the server.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export const PRODUCT_IMAGE_BUCKET = 'product-images';
