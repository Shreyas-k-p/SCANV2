import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ohkrzxcmueodijbhxxgx.supabase.co"
const supabaseAnonKey = "sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { enabled: false }
})
