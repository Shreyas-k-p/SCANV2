import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot
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
      id: doc.id,
      ...doc.data()
    }));
    setMenuItems(data);
  });
};
