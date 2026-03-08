import { databases, storage, APPWRITE_CONFIG, Query, ID, client, safeSubscribe } from '../lib/appwrite';

/**
 * Upload a staff document to Appwrite Storage
 */
export const uploadStaffDocument = async (file, staffId) => {
    try {
        if (!file) return null;

        const fileId = ID.unique();
        const response = await storage.createFile(
            'staff-documents', // Bucket ID (ensure this exists in Appwrite)
            fileId,
            file
        );

        // Get public URL
        const result = storage.getFileView('staff-documents', response.$id);
        return result.href;
    } catch (err) {
        console.error('uploadStaffDocument error:', err);
        return null;
    }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
    try {
        const data = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            userId
        );
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
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [Query.equal('staff_id', staffId.toUpperCase()), Query.limit(1)]
        );

        if (response.documents.length === 0) throw new Error('User not found');
        return { success: true, data: response.documents[0] };
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
        // Clean updates
        const cleanUpdates = { ...updates };
        delete cleanUpdates.$id;
        delete cleanUpdates.$createdAt;
        delete cleanUpdates.$updatedAt;
        delete cleanUpdates.$permissions;
        delete cleanUpdates.$databaseId;
        delete cleanUpdates.$collectionId;

        const data = await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            userId,
            cleanUpdates
        );
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
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [
                Query.equal('role', role.toUpperCase()),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents };
    } catch (error) {
        console.error('Error fetching users by role:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get all staff members
 */
export const getAllStaff = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [Query.orderDesc('$createdAt')]
        );
        return { success: true, data: response.documents };
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
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [
                Query.or([
                    Query.search('name', searchTerm),
                    Query.search('staff_id', searchTerm)
                ]),
                Query.orderDesc('$createdAt')
            ]
        );
        return { success: true, data: response.documents };
    } catch (error) {
        console.error('Error searching staff:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Subscribe to user profile changes
 */
export const subscribeToUserChanges = (userId, callback) => {
    const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.STAFF}.documents.${userId}`;
    const unsubscribe = safeSubscribe(channel, (response) => {
        callback(response);
    });
    return { unsubscribe };
};

/**
 * Subscribe to all staff changes
 */
export const subscribeToAllStaffChanges = (callback) => {
    const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${APPWRITE_CONFIG.COLLECTIONS.STAFF}.documents`;
    const unsubscribe = safeSubscribe(channel, (response) => {
        callback(response);
    });
    return { unsubscribe };
};

/**
 * Get staff count by role
 */
export const getStaffCountByRole = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [Query.select(['role'])]
        );

        const counts = response.documents.reduce((acc, profile) => {
            acc[profile.role] = (acc[profile.role] || 0) + 1;
            return acc;
        }, {});

        return { success: true, data: counts };
    } catch (error) {
        console.error('Error getting staff counts:', error);
        return { success: false, error: error.message };
    }
};
