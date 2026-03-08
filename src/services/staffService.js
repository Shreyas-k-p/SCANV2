import { databases, storage, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.STAFF;
const bucket = APPWRITE_CONFIG.BUCKETS.STAFF_PHOTOS;

export const createStaff = async (data) => {
    try {
        let photoId = "";

        if (data.photoFile) {
            const upload = await storage.createFile(bucket, ID.unique(), data.photoFile);
            photoId = upload.$id;
        }

        const response = await databases.createDocument(
            db,
            collection,
            ID.unique(),
            {
                staffid: data.staffid || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
                name: data.name,
                mobile: data.mobile,
                email: data.email || "",
                role: data.role.toUpperCase(),
                photo: photoId,
                secertKey: data.secretKey || Math.random().toString(36).substring(2, 10)
            }
        );

        return response;
    } catch (error) {
        console.error("Error creating staff:", error);
        throw error;
    }
};

export const getStaff = async () => {
    try {
        const response = await databases.listDocuments(db, collection, [Query.limit(100)]);
        return response.documents;
    } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
};

export const deleteStaff = async (docId) => {
    try {
        const doc = await databases.getDocument(db, collection, docId);
        if (doc.photo) {
            await storage.deleteFile(bucket, doc.photo).catch(() => { });
        }
        await databases.deleteDocument(db, collection, docId);
        return true;
    } catch (error) {
        console.error("Error deleting staff:", error);
        throw error;
    }
};
