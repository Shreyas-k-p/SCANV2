import { db } from "../firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// ADD MANAGER WITH SECRET CODE
export const addManagerToDB = async (manager) => {
  const docRef = await addDoc(collection(db, "managers"), {
    id: manager.id,
    name: manager.name,
    email: manager.email || "",
    profilePhoto: manager.profilePhoto || "",
    secretID: manager.secretID,
    createdAt: new Date()
  });
  return docRef.id;
};

// LISTEN TO ALL MANAGERS
export const listenToManagers = (callback) => {
  return onSnapshot(collection(db, "managers"), (snapshot) => {
    const managers = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    callback(managers);
  });
};

// REMOVE MANAGER
export const removeManagerFromDB = async (docId) => {
  await deleteDoc(doc(db, "managers", docId));
};
