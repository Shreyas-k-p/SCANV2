import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const loginStaff = async (role, staffId, secretId) => {
    try {
        console.log(`[AUTH] Supabase: Attempting login: Role=${role}, StaffId=${staffId}`);

        // 1. DIRECT DATABASE LOGIN (Bypass Email/Auth system)
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('staff_id', staffId.trim())
            .eq('secret_id', secretId.trim())
            .single();

        if (error || !profile) {
            throw new Error("Invalid Staff ID or Secret Code");
        }

        // ✅ Role check: tell user clearly if they picked the wrong role
        if (role && profile.role) {
            const selectedRole = role.toUpperCase().replace('-', '_');
            const actualRole = profile.role.toUpperCase().replace('-', '_').replace(' ', '_');
            if (selectedRole !== actualRole) {
                throw new Error(`Wrong role selected. You are a ${profile.role}. Please select the correct role and try again.`);
            }
        }

        const userData = {
            ...profile,
            id: profile.id,
            email: `${profile.staff_id.toLowerCase()}@scan4serve.com`, // legacy compatibility
            token: 'db_auth_session_' + Math.random().toString(36).slice(2),
        };

        // Persist token & session
        localStorage.setItem('token', userData.token);
        localStorage.setItem('staff_session', JSON.stringify({
            user: userData,
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString() // 24 hour session
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
        // No need to call supabase.auth.signOut() as we aren't using Auth sessions
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
        // DIRECT DATABASE CREATION (Skip Supabase Auth / Email)
        const roleUpper = data.role.toUpperCase().replace(' ', '_').replace('-', '_');

        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert([{
                name: data.name,
                role: roleUpper,
                staff_id: data.staffId.trim(),
                secret_id: data.secretId.trim(),
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, staff: newProfile };
    } catch (error) {
        console.error("Error creating staff account:", error);
        return { success: false, error: error.message };
    }
};
