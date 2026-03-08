import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.ORDERS;

export const addOrderToDB = async (orderData) => {
    try {
        const itemsArray = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : (orderData.items || []);
        const total = itemsArray.reduce((sum, item) => sum + (item.price * (item.quantity || item.qty || 1)), 0);

        // Strip heavy fields like image URLs or large descriptions before stringifying to keep under 1000 char Appwrite string limits
        const minimalItems = itemsArray.map(item => ({
            id: item.id || item.$id,
            name: item.name,
            qty: item.quantity || item.qty || 1,
            price: item.price,
            type: item.type
        }));

        const payload = {
            tableNumber: Number(orderData.tableNo || orderData.tableNumber),
            items: JSON.stringify(minimalItems),
            status: orderData.status || "pending",
            total: total,
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
        console.error("Error creating order:", error);
        throw error;
    }
};

export const getOrdersFromDB = async () => {
    try {
        const response = await databases.listDocuments(
            db,
            collection,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const updateOrderStatus = async (docId, status) => {
    try {
        const response = await databases.updateDocument(
            db,
            collection,
            docId,
            { status }
        );
        return response;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const deleteOrder = async (docId) => {
    try {
        await databases.deleteDocument(db, collection, docId);
        return true;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
};

export const clearAllOrders = async () => {
    try {
        const orders = await getOrdersFromDB();
        for (const order of orders) {
            await deleteOrder(order.$id);
        }
        return true;
    } catch (error) {
        console.error("Error clearing orders:", error);
        throw error;
    }
};
