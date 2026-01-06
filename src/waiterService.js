import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

const waiterRef = collection(db, "waiters");

// ADD WAITER
export const addWaiterToDB = async (waiter) => {
  await addDoc(waiterRef, {
    ...waiter,
    createdAt: new Date()
  });
};

// LISTEN TO WAITERS (REAL-TIME)
export const listenToWaiters = (setWaiters) => {
  return onSnapshot(waiterRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      docId: doc.id, // Firestore document ID
      ...doc.data()
    }));
    setWaiters(data);
  });
};

// REMOVE WAITER
export const removeWaiterFromDB = async (docId) => {
  await deleteDoc(doc(db, "waiters", docId));
};
