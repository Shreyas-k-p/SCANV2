import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.ANNOUNCEMENTS;

export const fetchActiveAnnouncements = async () => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.orderDesc('$createdAt'), Query.limit(5)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
};

export const addAnnouncement = async (title, content, type = "info") => {
    try {
        const payload = {
            title,
            content,
            type,
            createdAt: new Date().toISOString()
        };

        const response = await databases.createDocument(
            db,
            collection,
            ID.unique(),
            payload
        );
        return response;
    } catch (error) {
        console.error("Error adding announcement:", error);
        throw error;
    }
};

export const deleteAnnouncement = async (docId) => {
    try {
        await databases.deleteDocument(db, collection, docId);
        return true;
    } catch (error) {
        console.error("Error deleting announcement:", error);
        throw error;
    }
};
