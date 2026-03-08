import { databases, account, APPWRITE_CONFIG, ID, Query, client } from "../lib/appwrite";
import toast from 'react-hot-toast';

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.STAFF;

export const loginStaff = async (role, staffId, secretId) => {
    try {
        console.log(`[AUTH] Attempting login: Role=${role}, StaffId=${staffId}`);

        const response = await databases.listDocuments(
            db,
            collection,
            [
                Query.equal('staffid', staffId),
                Query.equal('role', role.toUpperCase()),
                Query.limit(1)
            ]
        );

        if (response.documents.length === 0) {
            toast.error("Invalid credentials (staff not found)");
            return { success: false, message: "Invalid credentials" };
        }

        const staffData = response.documents[0];
        // Handle potential typo in schema ('secertKey' vs 'secretKey')
        const storedSecret = staffData.secertKey || staffData.secretKey;

        if (String(storedSecret).toUpperCase() !== String(secretId).toUpperCase()) {
            toast.error("Invalid secret code");
            return { success: false, message: "Invalid secret code" };
        }

        const user = {
            id: staffData.staffid,
            name: staffData.name || "Staff Member",
            role: staffData.role,
            docId: staffData.$id,
            profilePhoto: staffData.photo ?
                `https://fra.cloud.appwrite.io/v1/storage/buckets/${APPWRITE_CONFIG.BUCKETS.STAFF_PHOTOS}/files/${staffData.photo}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}` :
                null
        };

        // Persist session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 12);
        const session = { user, expiresAt: expiresAt.toISOString() };
        localStorage.setItem('staff_session', JSON.stringify(session));

        if (role === 'MANAGER') {
            localStorage.setItem('activeManager', staffId.toUpperCase());
        }

        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, user };
    } catch (error) {
        console.error("Login failed:", error);
        toast.error(`Login error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export const logoutStaff = () => {
    localStorage.removeItem('staff_session');
    localStorage.removeItem('activeManager');
    toast.success('Logged out successfully');
};

export const getStaffByRole = async (role) => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.equal('role', role.toUpperCase())]
        );
        return { success: true, data: response.documents };
    } catch (error) {
        return { success: false, error: error.message, data: [] };
    }
};

export const getAllStaff = async () => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.limit(100)]
        );
        return { success: true, data: response.documents };
    } catch (error) {
        return { success: false, error: error.message, data: [] };
    }
};

export const deleteStaffAccount = async (docId) => {
    try {
        await databases.deleteDocument(db, collection, docId);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createStaffAccount = async (data) => {
    // Legacy wrapper for staffService.createStaff
    const { createStaff } = await import("./staffService");
    try {
        const staff = await createStaff(data);
        return { success: true, staff };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
