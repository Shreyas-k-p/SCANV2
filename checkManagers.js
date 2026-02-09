// Script to check and list all managers in Firebase
// Run this in browser console while on the app

import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/firebase/config';

async function checkManagers() {
    console.log("🔍 Checking managers in Firebase...");

    try {
        const managersRef = collection(db, 'managers');
        const snapshot = await getDocs(managersRef);

        console.log(`📊 Found ${snapshot.size} manager(s) in database`);

        if (snapshot.empty) {
            console.log("❌ No managers found in database!");
            console.log("💡 The default manager should be auto-created on app load");
        } else {
            console.log("✅ Managers in database:");
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log("---");
                console.log("Document ID:", doc.id);
                console.log("Manager ID:", data.id);
                console.log("Name:", data.name);
                console.log("Secret ID:", data.secretID);
                console.log("Profile Photo:", data.profilePhoto || "None");
            });
        }
    } catch (error) {
        console.error("❌ Error checking managers:", error);
    }
}

// Run the check
checkManagers();
