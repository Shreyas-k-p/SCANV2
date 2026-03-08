import { databases, APPWRITE_CONFIG, ID, Query } from "../lib/appwrite";

const db = APPWRITE_CONFIG.DATABASE_ID;
const collection = APPWRITE_CONFIG.COLLECTIONS.MENU;

export const getMenuItemsFromDB = async () => {
  try {
    const response = await databases.listDocuments(db, collection);
    return response.documents;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};

export const addMenuItemToDB = async (item) => {
  try {
    const response = await databases.createDocument(
      db,
      collection,
      ID.unique(),
      {
        ...item,
        price: Number(item.price),
        available: item.available ?? true,
        createdAt: new Date().toISOString()
      }
    );
    return response;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

export const updateMenuItemInDB = async (docId, updatedItem) => {
  try {
    const response = await databases.updateDocument(
      db,
      collection,
      docId,
      {
        ...updatedItem,
        price: updatedItem.price ? Number(updatedItem.price) : undefined
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

export const deleteMenuItemFromDB = async (docId) => {
  try {
    await databases.deleteDocument(db, collection, docId);
    return true;
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};
