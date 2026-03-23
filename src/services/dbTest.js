import { supabase } from '../lib/supabase';

export const testConnection = async () => {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log("✅ Supabase connection verified, profiles count:", count);
    } catch (error) {
        console.error("❌ Supabase connection failed:", error.message);
    }
};
