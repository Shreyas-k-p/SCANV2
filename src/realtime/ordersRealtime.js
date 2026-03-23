import { supabase } from '../lib/supabase';

export const subscribeOrders = (callback) => {
    console.log(`🔌 Supabase Realtime: Subscribing to all orders`);

    const channel = supabase
        .channel('orders-all-realtime')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders',
            },
            (payload) => {
                console.log(`📡 Realtime Event: ${payload.eventType}`, payload.new || payload.old);
                // Adapt payload to match what the callback expects
                // Appwrite payload was response.payload
                callback({ payload: payload.new || payload.old, events: [`databases.*.collections.*.documents.*.${payload.eventType.toLowerCase()}`] });
            }
        )
        .subscribe();

    return () => {
        console.log(`🔌 Supabase Realtime: Unsubscribing from all orders`);
        supabase.removeChannel(channel);
    };
};
