import supabase from '../supabaseClient';
import toast from 'react-hot-toast';

/**
 * Authentication Service for Supabase
 * Handles ID-based login (Option 2) - maintains current UX
 */

/**
 * Validate staff credentials against Supabase database
 * @param {string} role - User role (MANAGER, SUB_MANAGER, WAITER, KITCHEN)
 * @param {string} staffId - Staff ID (e.g., MGR5710, W-12345)
 * @param {string} secretId - Secret code/password
 * @returns {Promise<Object|null>} User data if valid, null otherwise
 */
export const validateStaffCredentials = async (role, staffId, secretId) => {
    try {

        console.log(`[AUTH] Validating: Role=${role}, StaffId=${staffId}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('[AUTH] Validation timed out after 30s');
            controller.abort();
        }, 30000); // 30s timeout

        // Query profiles table for matching staff
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role.toUpperCase())
            .eq('staff_id', staffId.toUpperCase())
            .abortSignal(controller.signal)
            .single();

        clearTimeout(timeoutId);

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'User not found' };
            }
            console.error('❌ Validation error:', error);
            return { success: false, error: `Connection Error: ${error.message || 'Check your internet'}` };
        }

        if (data) {
            // Check secret_id (case insensitive for simplicity, as per docs)
            if (data.secret_id && secretId && data.secret_id.toUpperCase() === secretId.toUpperCase()) {
                return {
                    success: true,
                    user: {
                        id: data.id,
                        staffId: data.staff_id,
                        name: data.name,
                        role: data.role,
                        profilePhoto: data.profile_photo,
                        email: data.email
                    }
                };
            }
            return { success: false, error: 'Invalid secret code' };
        }

        return { success: false, error: 'Invalid credentials' };
    } catch (err) {
        console.error('❌ Validation exception:', err);
        return { success: false, error: 'Network failure' };
    }
};

/**
 * Create a custom session for staff (without Supabase Auth)
 * Stores session in localStorage
 */
export const createStaffSession = (userData) => {
    const session = {
        user: userData,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    localStorage.setItem('staff_session', JSON.stringify(session));
    return session;
};

/**
 * Get current staff session
 */
export const getStaffSession = () => {
    try {
        const sessionData = localStorage.getItem('staff_session');
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);

        // Check if session expired
        if (new Date(session.expiresAt) < new Date()) {
            clearStaffSession();
            return null;
        }

        return session;
    } catch (err) {
        console.error('Error reading session:', err);
        return null;
    }
};

/**
 * Clear staff session (logout)
 */
export const clearStaffSession = () => {
    localStorage.removeItem('staff_session');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeManager');
};

/**
 * Login staff member
 * @param {string} role - User role
 * @param {string} staffId - Staff ID
 * @param {string} secretId - Secret code
 * @param {string} name - Name (optional, for WAITER/KITCHEN without secret)
 * @returns {Promise<Object>} Login result
 */
export const loginStaff = async (role, staffId, secretId = null, name = null) => {
    try {
        console.log(`[AUTH] loginStaff called for Role=${role}, StaffId=${staffId}`);
        // For WAITER and KITCHEN without secret ID system (if they just use ID + name)
        if ((role === 'WAITER' || role === 'KITCHEN') && !secretId && name) {
            // Simple validation - just check if staff_id exists
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', role.toUpperCase())
                .eq('staff_id', staffId.toUpperCase())
                .single();

            if (error || !data) {
                throw new Error('Invalid staff ID');
            }

            const userData = {
                id: data.id,
                staffId: data.staff_id,
                name: data.name,
                role: data.role,
                profilePhoto: data.profile_photo
            };

            createStaffSession(userData);
            return { success: true, user: userData };
        }

        // For roles with secret ID (MANAGER, SUB_MANAGER, or WAITER/KITCHEN with secret)
        const loginResult = await validateStaffCredentials(role, staffId, secretId);

        if (!loginResult.success) {
            toast.error(loginResult.error);
            throw new Error(loginResult.error);
        }

        const validatedUser = loginResult.user;

        // Check for active manager session (only one manager at a time)
        if (role === 'MANAGER') {
            localStorage.setItem('activeManager', staffId.toUpperCase());
        }

        console.log(`[AUTH] loginStaff SUCCESS for User=${validatedUser.name}`);
        createStaffSession(validatedUser);
        toast.success(`Welcome back, ${validatedUser.name}!`);
        return { success: true, user: validatedUser };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Logout staff member
 */
export const logoutStaff = () => {
    const session = getStaffSession();
    if (session?.user?.role === 'MANAGER') {
        localStorage.removeItem('activeManager');
    }
    clearStaffSession();
    toast.success('Logged out successfully');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return getStaffSession() !== null;
};

/**
 * Get current user from session
 */
export const getCurrentUser = () => {
    const session = getStaffSession();
    return session?.user || null;
};

/**
 * Create a new staff account (Manager only)
 * @param {Object} staffData - Staff member data
 * @returns {Promise<Object>} Created staff data with credentials
 */
export const createStaffAccount = async (staffData) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([staffData])
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            staff: data,
            credentials: {
                staffId: data.staff_id,
                secretId: data.secret_id
            }
        };
    } catch (error) {
        console.error('Error creating staff account:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete staff account (Manager only)
 */
export const deleteStaffAccount = async (profileId) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting staff account:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all staff by role (Manager only)
 */
export const getStaffByRole = async (role) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role.toUpperCase())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching staff:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Listen to staff changes (real-time)
 */
export const subscribeToStaffChanges = (role, callback) => {
    const subscription = supabase
        .channel(`profiles_${role}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `role=eq.${role.toUpperCase()}`
            },
            (payload) => {

                callback(payload);
            }
        )
        .subscribe();

    return subscription;
};
