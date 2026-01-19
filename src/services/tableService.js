import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

const tableRef = collection(db, "tables");

// ADD TABLE
export const addTableToDB = async (tableNo) => {
  await addDoc(tableRef, {
    tableNo: Number(tableNo),
    active: true,
    status: 'active', // Default status
    createdAt: new Date()
  });
};

// LISTEN TO TABLES (REAL-TIME)
export const listenToTables = (setTables) => {
  return onSnapshot(tableRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    setTables(data);
  });
};

// UPDATE TABLE STATUS
export const updateTableStatusInDB = async (docId, status) => {
  const ref = doc(db, "tables", docId);
  await updateDoc(ref, { status });
};

// REMOVE TABLE
export const removeTableFromDB = async (docId) => {
  await deleteDoc(doc(db, "tables", docId));
};
