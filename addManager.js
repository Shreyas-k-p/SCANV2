// Script to add a manager directly to Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChh60RN1rHtU4m34K0ritAeizBKfnc6gA",
    authDomain: "scan4serve-v2.firebaseapp.com",
    projectId: "scan4serve-v2",
    storageBucket: "scan4serve-v2.firebasestorage.app",
    messagingSenderId: "266510887170",
    appId: "1:266510887170:web:caa8c0d753d98b8e99ba1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Manager data
const managerData = {
    id: "MGR5710",
    name: "SHREYAS",
    email: "",
    profilePhoto: "",
    secretID: "5710",
    createdAt: new Date()
};

// Add manager to database
async function addManager() {
    try {
        console.log("🔧 Adding manager to Firebase...");
        console.log("Manager data:", managerData);

        const docRef = await addDoc(collection(db, "managers"), managerData);

        console.log("✅ Manager added successfully!");
        console.log("Document ID:", docRef.id);
        console.log("\n📋 Login Credentials:");
        console.log("Staff ID: MGR5710");
        console.log("Secret Key: 5710");
        console.log("\nYou can now login with these credentials!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding manager:", error);
        process.exit(1);
    }
}

addManager();
