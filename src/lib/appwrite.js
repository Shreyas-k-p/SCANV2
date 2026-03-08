import { Client, Databases, Storage, Account, ID, Query } from "appwrite";

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { ID, Query, client };

/**
 * Safe subscription wrapper to handle "Still in CONNECTING state" race conditions
 * commonly seen in React StrictMode or multiple simultaneous subscriptions.
 */
export const safeSubscribe = (channel, callback) => {
    let unsubscribe = null;
    let isCancelled = false;
    let retryTimeout = null;

    const executeSubscribe = (attempt = 0) => {
        if (isCancelled) return;

        try {
            unsubscribe = client.subscribe(channel, (response) => {
                if (!isCancelled) callback(response);
            });
        } catch (error) {
            // Specifically handling WebSocket InvalidStateError or CONNECTING state strings
            const isConnectingError =
                error.name === 'InvalidStateError' ||
                (error.message && error.message.includes('CONNECTING'));

            if (isConnectingError && attempt < 10) {
                console.warn(`📡 Appwrite Realtime: Socket connecting... retrying in 250ms (Attempt ${attempt + 1})`);
                retryTimeout = setTimeout(() => executeSubscribe(attempt + 1), 250);
            } else {
                console.error("❌ Appwrite Realtime Error:", error);
            }
        }
    };

    // Minor initial delay to let JS engine breathe before socket operations
    retryTimeout = setTimeout(() => executeSubscribe(), 50);

    return () => {
        isCancelled = true;
        if (retryTimeout) clearTimeout(retryTimeout);
        if (typeof unsubscribe === 'function') {
            try {
                unsubscribe();
            } catch (e) {
                // Ignore cleanup errors on sockets that are already closed
            }
        }
    };
};

export const APPWRITE_CONFIG = {
    DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    COLLECTIONS: {
        MENU: import.meta.env.VITE_APPWRITE_MENU_ID || "menu",
        ORDERS: import.meta.env.VITE_APPWRITE_ORDERS_ID || "orders",
        STAFF: import.meta.env.VITE_APPWRITE_STAFF_ID || "staff",
        TABLES: import.meta.env.VITE_APPWRITE_TABLES_ID || "tables",
        FEEDBACKS: import.meta.env.VITE_APPWRITE_FEEDBACKS_ID || "feedbacks",
        DEVICES: import.meta.env.VITE_APPWRITE_DEVICE_STATUS_ID || "devices",
        ANNOUNCEMENTS: import.meta.env.VITE_APPWRITE_ANNOUNCEMENTS_ID || "announcements",
        ERROR_LOGS: import.meta.env.VITE_APPWRITE_ERROR_LOGS_ID || "errorLogs"
    },
    BUCKETS: {
        STAFF_PHOTOS: import.meta.env.VITE_APPWRITE_BUCKET_STAFF || "staffPhotos"
    }
};
