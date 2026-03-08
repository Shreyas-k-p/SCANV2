import { client, APPWRITE_CONFIG } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.ORDERS;

export const subscribeOrders = (callback) => {
    // Only subscribe if db and collection IDs exist
    if (!db || !collection) {
        console.warn("Realtime: Missing Database or Collection ID for orders subscription.");
        return () => { };
    }

    const channel = `databases.${db}.collections.${collection}.documents`;

    console.log(`🔌 Realtime: Subscribing to ${channel}`);

    const unsubscribe = client.subscribe(channel, (response) => {
        // Filter events: create, update, delete
        const eventType = response.events[0]; // e.g., databases.*.collections.*.documents.*.create
        console.log(`📡 Realtime Event: ${eventType}`, response.payload);
        callback(response);
    });

    return unsubscribe;
};
