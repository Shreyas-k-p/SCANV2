import { Client, Databases, Storage, Account, ID, Query } from "appwrite";

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { ID, Query, client };

export const APPWRITE_CONFIG = {
    DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    COLLECTIONS: {
        MENU: import.meta.env.VITE_APPWRITE_MENU_ID || "menu",
        ORDERS: import.meta.env.VITE_APPWRITE_ORDERS_ID || "orders",
        STAFF: import.meta.env.VITE_APPWRITE_STAFF_ID || "staff",
        TABLES: import.meta.env.VITE_APPWRITE_TABLES_ID || "tables",
        FEEDBACKS: import.meta.env.VITE_APPWRITE_FEEDBACKS_ID || "feedbacks",
        DEVICES: import.meta.env.VITE_APPWRITE_DEVICE_STATUS_ID || "devices",
        ANNOUNCEMENTS: import.meta.env.VITE_APPWRITE_ANNOUNCEMENTS_ID || "announcements"
    },
    BUCKETS: {
        STAFF_PHOTOS: import.meta.env.VITE_APPWRITE_BUCKET_STAFF || "staffPhotos"
    }
};
