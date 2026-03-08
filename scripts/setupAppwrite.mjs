import { Client, Databases, Storage, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
    VITE_APPWRITE_ENDPOINT,
    VITE_APPWRITE_PROJECT_ID,
    VITE_APPWRITE_DATABASE_ID,
    APPWRITE_API_KEY // Need to add this to .env for the script
} = process.env;

if (!APPWRITE_API_KEY) {
    console.error('❌ ERROR: APPWRITE_API_KEY is missing in .env file.');
    console.log('Please create an API Key in Appwrite Console with full permissions (databases, collections, attributes, indexes, storage).');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const COLLECTIONS = [
    {
        id: process.env.VITE_APPWRITE_PROFILES_ID || 'profiles',
        name: 'Profiles',
        attributes: [
            { key: 'staff_id', type: 'string', size: 255, required: true },
            { key: 'role', type: 'string', size: 50, required: true },
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'profile_photo', type: 'string', size: 1000, required: false },
            { key: 'secret_id', type: 'string', size: 50, required: true },
            { key: 'email', type: 'string', size: 255, required: false },
            { key: 'mobile', type: 'string', size: 50, required: false },
            { key: 'documents', type: 'string', size: 5000, required: false },
            { key: 'document_url', type: 'string', size: 1000, required: false }
        ],
        indexes: [
            { key: 'idx_staff_id', type: 'unique', attributes: ['staff_id'] },
            { key: 'idx_role', type: 'key', attributes: ['role'] }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_MENU_ITEMS_ID || 'menu_items',
        name: 'Menu Items',
        attributes: [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'price', type: 'float', required: true },
            { key: 'description', type: 'string', size: 2000, required: false },
            { key: 'image', type: 'string', size: 1000, required: false },
            { key: 'available', type: 'boolean', required: true, default: true },
            { key: 'benefits', type: 'string', size: 1000, required: false }
        ],
        indexes: [
            { key: 'idx_category', type: 'key', attributes: ['category'] },
            { key: 'idx_available', type: 'key', attributes: ['available'] }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_TABLES_ID || 'tables',
        name: 'Tables',
        attributes: [
            { key: 'table_number', type: 'string', size: 50, required: true },
            { key: 'capacity', type: 'integer', required: true, default: 4 },
            { key: 'status', type: 'string', size: 50, required: true, default: 'available' },
            { key: 'qr_code', type: 'string', size: 1000, required: false }
        ],
        indexes: [
            { key: 'idx_table_number', type: 'unique', attributes: ['table_number'] },
            { key: 'idx_status', type: 'key', attributes: ['status'] }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_ORDERS_ID || 'orders',
        name: 'Orders',
        attributes: [
            { key: 'order_id', type: 'string', size: 255, required: true },
            { key: 'table_number', type: 'string', size: 50, required: true },
            { key: 'customer_name', type: 'string', size: 255, required: false },
            { key: 'customer_mobile', type: 'string', size: 50, required: false },
            { key: 'items', type: 'string', size: 10000, required: true }, // Stringified JSON
            { key: 'total_amount', type: 'float', required: true },
            { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
            { key: 'assigned_waiter', type: 'string', size: 255, required: false },
            { key: 'notes', type: 'string', size: 5000, required: false },
            { key: 'customer_info', type: 'string', size: 5000, required: false }
        ],
        indexes: [
            { key: 'idx_order_id', type: 'unique', attributes: ['order_id'] },
            { key: 'idx_status', type: 'key', attributes: ['status'] },
            { key: 'idx_table_number', type: 'key', attributes: ['table_number'] }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_FEEDBACKS_ID || 'feedbacks',
        name: 'Feedbacks',
        attributes: [
            { key: 'customer_name', type: 'string', size: 255, required: false },
            { key: 'customer_email', type: 'string', size: 255, required: false },
            { key: 'rating', type: 'integer', required: true },
            { key: 'message', type: 'string', size: 5000, required: false }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_ERROR_LOGS_ID || 'error_logs',
        name: 'Error Logs',
        attributes: [
            { key: 'error_type', type: 'string', size: 100, required: true },
            { key: 'error_message', type: 'string', size: 5000, required: true },
            { key: 'stack_trace', type: 'string', size: 10000, required: false },
            { key: 'user_agent', type: 'string', size: 1000, required: true },
            { key: 'url', type: 'string', size: 1000, required: true },
            { key: 'staff_id', type: 'string', size: 255, required: true },
            { key: 'created_at', type: 'string', size: 255, required: true }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_DEVICE_STATUS_ID || 'device_status',
        name: 'Device Status',
        attributes: [
            { key: 'table_id', type: 'string', size: 255, required: true },
            { key: 'status', type: 'string', size: 50, required: true },
            { key: 'last_seen', type: 'string', size: 255, required: false }
        ],
        indexes: [
            { key: 'idx_table_id', type: 'key', attributes: ['table_id'] }
        ]
    },
    {
        id: process.env.VITE_APPWRITE_ANNOUNCEMENTS_ID || 'announcements',
        name: 'Announcements',
        attributes: [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'type', type: 'string', size: 50, required: true, default: 'info' }, // info, warning, success
            { key: 'active', type: 'boolean', required: true, default: true },
            { key: 'created_at', type: 'string', size: 255, required: true }
        ],
        indexes: [
            { key: 'idx_active', type: 'key', attributes: ['active'] }
        ]
    }
];

async function setup() {
    try {
        console.log('🚀 Starting Appwrite Setup...');

        // 1. Create Database if it doesn't exist
        try {
            await databases.get(VITE_APPWRITE_DATABASE_ID);
            console.log(`✅ Database ${VITE_APPWRITE_DATABASE_ID} already exists.`);
        } catch (e) {
            await databases.create(VITE_APPWRITE_DATABASE_ID, 'Scan4Serve Database');
            console.log(`✅ Created Database: ${VITE_APPWRITE_DATABASE_ID}`);
        }

        // 2. Create Collections and Attributes
        for (const col of COLLECTIONS) {
            try {
                await databases.getCollection(VITE_APPWRITE_DATABASE_ID, col.id);
                console.log(`ℹ️ Collection ${col.name} (${col.id}) already exists.`);
            } catch (e) {
                await databases.createCollection(VITE_APPWRITE_DATABASE_ID, col.id, col.name, ['any'], ['any']);
                console.log(`✅ Created Collection: ${col.name}`);

                // Create Attributes
                for (const attr of col.attributes) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(VITE_APPWRITE_DATABASE_ID, col.id, attr.key, attr.size, attr.required, attr.default);
                        } else if (attr.type === 'integer') {
                            await databases.createIntegerAttribute(VITE_APPWRITE_DATABASE_ID, col.id, attr.key, attr.required, 0, 1000000, attr.default);
                        } else if (attr.type === 'float') {
                            await databases.createFloatAttribute(VITE_APPWRITE_DATABASE_ID, col.id, attr.key, attr.required, -1000000, 1000000, attr.default);
                        } else if (attr.type === 'boolean') {
                            await databases.createBooleanAttribute(VITE_APPWRITE_DATABASE_ID, col.id, attr.key, attr.required, attr.default);
                        }
                        console.log(`   - Created Attribute: ${attr.key}`);
                    } catch (ae) {
                        console.error(`   ❌ Failed to create attribute ${attr.key}:`, ae.message);
                    }
                }

                // Wait for attributes to be processed (Appwrite quirk)
                console.log('   - Waiting for attributes to process...');
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Create Indexes
                if (col.indexes) {
                    for (const idx of col.indexes) {
                        try {
                            await databases.createIndex(VITE_APPWRITE_DATABASE_ID, col.id, idx.key, idx.type, idx.attributes);
                            console.log(`   - Created Index: ${idx.key}`);
                        } catch (ie) {
                            console.error(`   ❌ Failed to create index ${idx.key}:`, ie.message);
                        }
                    }
                }
            }
        }

        // 3. Create Storage Buckets
        const buckets = ['staff-documents'];
        for (const bucketId of buckets) {
            try {
                await storage.getBucket(bucketId);
                console.log(`ℹ️ Bucket ${bucketId} already exists.`);
            } catch (e) {
                await storage.createBucket(bucketId, bucketId, ['any'], ['any'], false, true);
                console.log(`✅ Created Storage Bucket: ${bucketId}`);
            }
        }

        console.log('🎉 Appwrite setup complete!');
        console.log('Next: Update your .env with the correct IDs and deploy your Appwrite function.');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setup();
