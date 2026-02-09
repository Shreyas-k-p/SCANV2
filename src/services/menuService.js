import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

const menuRef = collection(db, "menuItems");

// ADD MENU ITEM (CREATES COLLECTION)
export const addMenuItemToDB = async (item) => {
  await addDoc(menuRef, {
    ...item,
    createdAt: new Date()
  });
};

// READ MENU ITEMS (REAL-TIME)
export const listenToMenu = (setMenuItems) => {
  return onSnapshot(menuRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    setMenuItems(data);
  });
};

// UPDATE MENU ITEM
export const updateMenuItemInDB = async (id, updatedData) => {
  const itemDoc = doc(db, "menuItems", id);
  await updateDoc(itemDoc, updatedData);
};

// DELETE MENU ITEM
export const deleteMenuItemFromDB = async (id) => {
  const itemDoc = doc(db, "menuItems", id);
  await deleteDoc(itemDoc);
};
