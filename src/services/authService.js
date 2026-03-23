import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const loginStaff = async (role, staffId, secretId) => {
    try {
        console.log(`[AUTH] Supabase: Attempting login: Role=${role}, StaffId=${staffId}`);

        // Mapping staffId to mock email: {staffId}@scan4serve.com
        const email = staffId.includes('@') ? staffId.toLowerCase() : `${staffId.toLowerCase()}@scan4serve.com`;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: secretId,
        });

        if (error) throw error;

        const { user, session } = data;

        // Fetch additional user profile data from 'profiles' table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn("Profile fetch error, using default user data:", profileError);
        }

        const userData = {
            ...profile,
            id: user.id,
            email: user.email,
            token: session.access_token,
        };

        // Persist token & session
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('staff_session', JSON.stringify({
            user: userData,
            expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString()
        }));

        if (role === 'MANAGER') {
            localStorage.setItem('activeManager', staffId.toUpperCase());
        }

        toast.success(`Welcome back, ${userData.name || staffId}!`);
        return { success: true, user: userData };
    } catch (error) {
        console.error("Login failed:", error);
        toast.error(`Login error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export const logoutStaff = async () => {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('staff_session');
        localStorage.removeItem('activeManager');
        toast.success('Logged out successfully');
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export const getStaffByRole = async (role) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Error getting staff by role:", error);
        return { success: false, error: error.message, data: [] };
    }
};

export const getAllStaff = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Error getting all staff:", error);
        return { success: false, error: error.message, data: [] };
    }
};

export const deleteStaffAccount = async (docId) => {
    try {
        // Only deletes from 'profiles' table; for Supabase Auth, must use service_role or admin client (which we shouldn't do on frontend)
        // For now, removing the user profile.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', docId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting staff account:", error);
        return { success: false, error: error.message };
    }
};

export const createStaffAccount = async (data) => {
    try {
        // Supabase Auth signUp. For a multi-tenant or multi-staff system,
        // typically you use a server function (Edge Function) or allow open signUp if appropriate. 
        // Here, we'll try standard signUp. Note: user may need to confirm email if configured in Supabase.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: `${data.staffId.toLowerCase()}@scan4serve.com`,
            password: data.password || data.secretId,
            options: {
                data: {
                    name: data.name,
                    role: data.role,
                    restaurantId: data.restaurantId,
                }
            }
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                name: data.name,
                role: data.role,
                // restaurant_id: data.restaurantId,
                staff_id: data.staffId,
                secret_id: data.secretId
            }]);

        if (dbError) throw dbError;

        return { success: true, staff: authData.user };
    } catch (error) {
        console.error("Error creating staff account:", error);
        return { success: false, error: error.message };
    }
};
