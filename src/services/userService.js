import { supabase } from '../lib/supabase';

export const uploadStaffDocument = async (file, staffId) => {
    try {
        if (!file) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${staffId}_${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('staff-documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
            .from('staff-documents')
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    } catch (err) {
        console.error('uploadStaffDocument error with Supabase:', err);
        return null;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("getUserProfile error:", error);
        return { success: false, error: error.message };
    }
};

export const getUserByStaffId = async (staffId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('staff_id', staffId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("getUserByStaffId error:", error);
        return { success: false, error: error.message };
    }
};

export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("updateUserProfile error:", error);
        return { success: false, error: error.message };
    }
};

export const getUsersByRole = async (role) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error("getUsersByRole error:", error);
        return { success: false, error: error.message, data: [] };
    }
};

export const getAllStaff = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error("getAllStaff error:", error);
        return { success: false, error: error.message, data: [] };
    }
};

export const searchStaff = async (searchTerm) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,staff_id.ilike.%${searchTerm}%`);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error("searchStaff error:", error);
        return { success: false, error: error.message, data: [] };
    }
};

export const subscribeToUserChanges = (userId, callback) => {
    const channel = supabase
        .channel(`user-changes-${userId}`)
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
            (payload) => callback(payload.new)
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
};

export const subscribeToAllStaffChanges = (callback) => {
    const channel = supabase
        .channel('all-staff-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => callback(payload.new || payload.old)
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
};

export const getStaffCountByRole = async () => {
    try {
        // Supabase doesn't have a direct "group by count" via simple JS client as easily as SQL
        // We'll fetch and count or use an RPC if defined. For now, simple fetch.
        const { data, error } = await supabase.from('profiles').select('role');
        if (error) throw error;
        
        const counts = data.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        return { success: true, data: counts };
    } catch (error) {
        console.error("getStaffCountByRole error:", error);
        return { success: false, error: error.message };
    }
};
