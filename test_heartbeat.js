const url = "https://ohkrzxcmueodijbhxxgx.supabase.co/functions/v1/device-heartbeat";

async function run() {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": "sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK"
            },
            body: JSON.stringify({
                table_id: "T_TEST_NEW", // New ID to avoid duplicate key error
                device_id: "ESP32_TEST_DEVICE",
                battery: 88
            })
        });

        const text = await res.text();

        console.log("STATUS:", res.status);
        console.log("BODY:", text);
    } catch (err) {
        console.error("ERROR:", err);
    }
}

run();
