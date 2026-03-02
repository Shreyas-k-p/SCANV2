const SUPABASE_URL = "https://ohkrzxcmueodijbhxxgx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK";

async function checkEndpoint() {
    console.log(`🔍 Pinging ${SUPABASE_URL}/rest/v1/ ...`);
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Response Data (Success!):", JSON.stringify(data).substring(0, 100) + "...");
    } catch (err) {
        console.error("❌ Connection failed!");
        console.error("Error Details:", err.message);
    }
}

checkEndpoint();
