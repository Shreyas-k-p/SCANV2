import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.DEVICES;

export const fetchDeviceStatus = async () => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.limit(100)]
        );

        return response.documents.map(d => ({
            id: d.$id,
            device_id: d.deviceId,
            table_id: d.tableNumber,
            status: d.status,
            last_seen: d.lastPing,
            battery: d.battery || 100
        }));
    } catch (error) {
        console.error("Error fetching device status:", error);
        return [];
    }
};

export const pairDeviceWithTable = async (deviceId, tableNumber) => {
    try {
        // Check if device already exists
        const existing = await databases.listDocuments(
            db,
            collection,
            [Query.equal('deviceId', deviceId), Query.limit(1)]
        );

        const payload = {
            tableNumber: String(tableNumber),
            status: 'online',
            lastPing: new Date().toISOString()
        };

        if (existing.documents.length > 0) {
            return await databases.updateDocument(
                db,
                collection,
                existing.documents[0].$id,
                payload
            );
        } else {
            return await databases.createDocument(
                db,
                collection,
                ID.unique(),
                { ...payload, deviceId, battery: 100 }
            );
        }
    } catch (error) {
        console.error("Error pairing device:", error);
        throw error;
    }
};
