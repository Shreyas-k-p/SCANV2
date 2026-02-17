import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ohkrzxcmueodijbhxxgx.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("❌ VITE_SUPABASE_ANON_KEY is missing in .env");
    process.exit(1);
}

const FUNCTION_URL = `${SUPABASE_URL.replace('.supabase.co', '.functions.supabase.co')}/device-heartbeat`;

async function testHeartbeat() {
    console.log("Testing Heartbeat Function...");
    console.log("URL:", FUNCTION_URL);

    try {
        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "apikey": SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                table_id: "T_TEST_01",
                battery: 99
            })
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);

        if (response.ok) {
            console.log("✅ Heartbeat test passed!");
        } else {
            console.log("❌ Heartbeat test failed.");
        }
    } catch (error) {
        console.error("❌ Test error:", error);
    }
}

testHeartbeat();
