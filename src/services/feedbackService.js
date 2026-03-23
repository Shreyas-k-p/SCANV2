import { supabase } from '../lib/supabase';

export const addFeedbackToDB = async (feedbackData) => {
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .insert([{
                // restaurant_id: feedbackData.restaurantId,
                table_no: feedbackData.tableNo,
                customer_name: feedbackData.customerName,
                rating: feedbackData.rating,
                message: feedbackData.message,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error adding feedbacks in Supabase:", error);
        throw error;
    }
};

export const getFeedbacksFromDB = async (restaurantId) => {
    try {
        let query = supabase.from('feedbacks').select('*');
        // if (restaurantId) {
        //     query = query.eq('restaurant_id', restaurantId);
        // }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching feedbacks from Supabase:', error);
        return [];
    }
};
