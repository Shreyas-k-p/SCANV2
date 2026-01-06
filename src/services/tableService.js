import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

const tableRef = collection(db, "tables");

// ADD TABLE
export const addTableToDB = async (tableNo) => {
  await addDoc(tableRef, {
    tableNo: Number(tableNo),
    active: true,
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

// REMOVE TABLE
export const removeTableFromDB = async (docId) => {
  await deleteDoc(doc(db, "tables", docId));
};
