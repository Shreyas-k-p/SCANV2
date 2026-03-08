import { databases, APPWRITE_CONFIG, Query } from "../lib/appwrite";

export const testConnection = async () => {
    try {
        const res = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.STAFF,
            [Query.limit(1)]
        );
        console.log("✅ Appwrite connection verified:", res.total);
    } catch (error) {
        console.error("❌ Appwrite connection failed:", error.message);
    }
};
