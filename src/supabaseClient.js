import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;

try {
    if (supabaseUrl && supabaseAnonKey) {
        client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
            },
        });
    } else {
        throw new Error('Supabase Config Missing');
    }
} catch (error) {
    console.error('Supabase Init Failed:', error);
    // Minimal dummy
    client = {
        from: () => ({
            select: () => Promise.resolve({ error: { message: 'Supabase Not Connected' }, data: [] }),
            insert: () => Promise.resolve({ error: { message: 'Supabase Not Connected' }, data: null }),
            update: () => Promise.resolve({ error: { message: 'Supabase Not Connected' }, data: null }),
            delete: () => Promise.resolve({ error: { message: 'Supabase Not Connected' }, data: null }),
            eq: function () { return this; },
            order: function () { return this; },
            limit: function () { return this; },
            single: function () { return Promise.resolve({ error: { message: 'Supabase Not Connected' }, data: null }); }
        }),
        channel: () => ({
            on: function () { return this; },
            subscribe: () => ({ unsubscribe: () => { } })
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        }
    };
}

export const supabase = client;

export const checkSupabaseConnection = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout to allow wake-up

        const { error } = await supabase.from('profiles').select('count', { head: true, count: 'exact' })
            .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) {
            console.warn('Supabase Connection Heartbeat Error:', error);
            // If it's a specific auth error but the server replied, it's technically "online"
            if (error.code && error.code.startsWith('PGRST')) return true;
            return false;
        }
        return true;
    } catch (_e) {
        console.warn('Supabase Connection Heartbeat Failed (Exception)');
        return false;
    }
};
