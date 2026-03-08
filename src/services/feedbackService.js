import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.FEEDBACKS;

export const addFeedbackToDB = async (feedbackData) => {
    try {
        const response = await databases.createDocument(
            db,
            collection,
            ID.unique(),
            {
                ...feedbackData,
                createdAt: new Date().toISOString()
            }
        );
        return response;
    } catch (error) {
        console.error("Error adding feedback:", error);
        throw error;
    }
};

export const getFeedbacksFromDB = async () => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.orderDesc('$createdAt')]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        return [];
    }
};
