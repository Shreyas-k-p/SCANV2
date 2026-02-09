import { db } from "../firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";

const ordersRef = collection(db, "orders");

// ADD ORDER
export const addOrderToDB = async (order) => {
    try {
        const docRef = await addDoc(ordersRef, {
            ...order,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding order: ", error);
    }
};

// LISTEN TO ORDERS
export const listenToOrders = (setOrders) => {
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));
        setOrders(data);
    });
};

// UPDATE ORDER STATUS
export const updateOrderInDB = async (docId, updates) => {
    try {
        const orderDoc = doc(db, "orders", docId);
        await updateDoc(orderDoc, updates);
    } catch (error) {
        console.error("Error updating order: ", error);
    }
};

// DELETE ORDER
export const deleteOrderFromDB = async (docId) => {
    try {
        const orderDoc = doc(db, "orders", docId);
        await deleteDoc(orderDoc);
    } catch (error) {
        console.error("Error deleting order: ", error);
    }
};
