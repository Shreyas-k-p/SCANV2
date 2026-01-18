import { db } from "../firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc
} from "firebase/firestore";

const subManagerRef = collection(db, "subManagers");

// ADD SUB MANAGER
export const addSubManagerToDB = async (subManager) => {
    await addDoc(subManagerRef, {
        ...subManager,
        createdAt: new Date()
    });
};

// LISTEN TO SUB MANAGERS
export const listenToSubManagers = (setSubManagers) => {
    return onSnapshot(subManagerRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));
        setSubManagers(data);
    });
};

// REMOVE SUB MANAGER
export const removeSubManagerFromDB = async (docId) => {
    await deleteDoc(doc(db, "subManagers", docId));
};
