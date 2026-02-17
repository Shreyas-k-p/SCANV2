const url = "https://ohkrzxcmueodijbhxxgx.supabase.co/functions/v1/device-heartbeat";
const API_KEY = "sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK";

async function sendHeartbeat() {
    try {
        console.log("Sending heartbeat...");
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": API_KEY,
                // "Authorization": `Bearer ${API_KEY}` // JWT verification is OFF, so this is not needed and potentially harmful if not a valid JWT
            },
            body: JSON.stringify({
                table_id: "T01",
                device_id: "ESP32_TEST_DEVICE",
                battery: 88
            })
        });

        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch (err) {
        console.error("ERROR:", err);
    }
}

sendHeartbeat();
