import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

const kitchenRef = collection(db, "kitchenStaff");

// ADD KITCHEN STAFF
export const addKitchenStaffToDB = async (staff) => {
  await addDoc(kitchenRef, {
    ...staff,
    createdAt: new Date()
  });
};

// LISTEN TO KITCHEN STAFF (REAL-TIME)
export const listenToKitchenStaff = (setKitchenStaff) => {
  return onSnapshot(kitchenRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      docId: doc.id,   // Firestore document ID
      ...doc.data()
    }));
    setKitchenStaff(data);
  });
};

// REMOVE KITCHEN STAFF
export const removeKitchenStaffFromDB = async (docId) => {
  await deleteDoc(doc(db, "kitchenStaff", docId));
};
