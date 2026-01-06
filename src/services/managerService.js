import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// SAVE MANAGER (ONE MANAGER ONLY)
export const saveManagerToDB = async (manager) => {
  await setDoc(doc(db, "managers", manager.id), {
    name: manager.name,
    email: manager.email || "",
    createdAt: new Date()
  });
};

// GET MANAGER
export const getManagerFromDB = async (managerId) => {
  const snap = await getDoc(doc(db, "managers", managerId));
  return snap.exists() ? snap.data() : null;
};
