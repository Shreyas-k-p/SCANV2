import { supabase } from '../lib/supabase';

export const fetchActiveAnnouncements = async (restaurantId) => {
    try {
        let query = supabase.from('announcements').select('*');
        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching announcements from Supabase:', error);
        return [];
    }
};

export const addAnnouncement = async (title, content, type, restaurantId) => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .insert([{ 
                title, 
                content, 
                type, 
                restaurant_id: restaurantId, 
                created_at: new Date().toISOString() 
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding announcement in Supabase:', error);
        throw error;
    }
};

export const deleteAnnouncement = async (id) => {
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting announcement from Supabase:', error);
        throw error;
    }
};
