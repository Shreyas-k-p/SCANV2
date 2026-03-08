import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.TABLES;

export const getTablesFromDB = async () => {
  try {
    const response = await databases.listDocuments(db, collection);
    return response.documents;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

export const addTableToDB = async (tableNumber) => {
  try {
    const response = await databases.createDocument(
      db,
      collection,
      ID.unique(),
      {
        tableNumber: Number(tableNumber),
        status: "available",
        isCalling: false,
        createdAt: new Date().toISOString()
      }
    );
    return response;
  } catch (error) {
    console.error("Error adding table:", error);
    throw error;
  }
};

export const updateTableInDB = async (docId, updatedData) => {
  try {
    const response = await databases.updateDocument(
      db,
      collection,
      docId,
      updatedData
    );
    return response;
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
};

export const removeTableFromDB = async (docId) => {
  try {
    await databases.deleteDocument(db, collection, docId);
    return true;
  } catch (error) {
    console.error("Error removing table:", error);
    throw error;
  }
};
