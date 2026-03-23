import { supabase } from '../lib/supabase';

export const fetchDeviceStatus = async (restaurantId) => {
    try {
        let query = supabase.from('device_status').select('*');
        // if (restaurantId) {
        //     query = query.eq('restaurant_id', restaurantId);
        // }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching device status from Supabase:', error);
        return [];
    }
};

export const updateDeviceStatus = async (deviceId, status) => {
    try {
        const { data, error } = await supabase
            .from('device_status')
            .update({ status, last_active: new Date().toISOString() })
            .eq('id', deviceId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating device status in Supabase:', error);
        throw error;
    }
};

export const pairDeviceWithTable = async (deviceId, tableNumber, restaurantId) => {
    try {
        // Use the pair-device edge function
        const response = await fetch('https://ohkrzxcmueodijbhxxgx.supabase.co/functions/v1/pair-device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.supabaseKey}`
            },
            body: JSON.stringify({ deviceId, tableNumber, restaurantId })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Edge function failed: ${errBody}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('Edge function pair-device failed, falling back to direct DB insert:', error);
        
        // Fallback to direct DB insert
        const { data, error: dbError } = await supabase
            .from('device_status')
            .upsert({ 
                id: deviceId, 
                table_number: tableNumber, 
                // restaurant_id: restaurantId,
                status: 'online',
                last_active: new Date().toISOString()
            })
            .select()
            .single();

        if (dbError) throw dbError;
        return data;
    }
};

