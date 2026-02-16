import { supabase } from '../supabaseClient';

/**
 * User/Staff Service - Supabase Implementation
 * Handles staff profile management (separate from auth)
 */

/**
 * Get user profile by ID
 */
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
        console.error('Error fetching user profile:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user profile by staff ID
 */
export const getUserByStaffId = async (staffId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('staff_id', staffId.toUpperCase())
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching user by staff ID:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user profile
 */
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
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all users by role
 */
export const getUsersByRole = async (role) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role.toUpperCase())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching users by role:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get all staff members (all roles)
 */
export const getAllStaff = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching all staff:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Search staff by name or ID
 */
export const searchStaff = async (searchTerm) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,staff_id.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error searching staff:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeToUserChanges = (userId, callback) => {
    const subscription = supabase
        .channel(`profile_${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            },
            (payload) => {

                callback(payload);
            }
        )
        .subscribe();

    return subscription;
};

/**
 * Subscribe to all staff changes
 */
export const subscribeToAllStaffChanges = (callback) => {
    const subscription = supabase
        .channel('all_profiles')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles'
            },
            (payload) => {

                callback(payload);
            }
        )
        .subscribe();

    return subscription;
};

/**
 * Get staff count by role
 */
export const getStaffCountByRole = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role');

        if (error) throw error;

        const counts = data.reduce((acc, profile) => {
            acc[profile.role] = (acc[profile.role] || 0) + 1;
            return acc;
        }, {});

        return { success: true, data: counts };
    } catch (error) {
        console.error('Error getting staff counts:', error);
        return { success: false, error: error.message };
    }
};
