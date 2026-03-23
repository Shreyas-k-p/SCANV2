import { supabase } from '../lib/supabase';

export const addOrderToDB = async (orderData) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                order_id: crypto.randomUUID(),
                table_number: String(orderData.tableId),
                items: orderData.items,
                total_amount: orderData.totalAmount,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Call MQTT Publisher Edge Function to notify kitchen/waiters
        try {
            fetch('https://ohkrzxcmueodijbhxxgx.supabase.co/functions/v1/mqtt-publisher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabase.supabaseKey}`
                },
                body: JSON.stringify({
                    type: "ORDER_PLACED",
                    restaurant_id: orderData.restaurantId,
                    table_id: String(orderData.tableId),
                    items: orderData.items,
                    total: orderData.totalAmount || 0
                })
            }).catch(err => console.error("MQTT Edge Function Error:", err));
        } catch (mqttErr) {
            console.error("Failed to trigger MQTT publisher:", mqttErr);
        }

        return data;
    } catch (error) {
        console.error("Error creating order with Supabase:", error);
        throw error;
    }
};

export const fetchSessionOrders = async (orderIds) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .in('id', orderIds);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching session orders with Supabase:", error);
        return [];
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error cancelling order with Supabase:", error);
        throw error;
    }
};

export const getOrdersFromDB = async (restaurantId) => {
    try {
        let query = supabase.from('orders').select('*');
        // if (restaurantId) {
        //     query = query.eq('restaurant_id', restaurantId);
        // }
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching orders from Supabase:", error);
        return [];
    }
};

export const updateOrderStatus = async (docId, status) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', docId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error updating order status in Supabase:", error);
        throw error;
    }
};

export const subscribeToOrders = (restaurantId, callback) => {
    console.log(`🔌 Supabase Realtime: Subscribing to orders`);
    
    const channel = supabase
        .channel(`orders-realtime`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders',
                // filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined
            },
            (payload) => {
                console.log('📡 Order Change Received:', payload);
                callback(payload.new);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            console.log(`🔌 Supabase Realtime: Unsubscribing from orders`);
            supabase.removeChannel(channel);
        }
    };
};

export const deleteOrder = async (docId) => {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', docId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error deleting order from Supabase:", error);
        throw error;
    }
};
