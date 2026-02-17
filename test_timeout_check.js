const url = "https://ohkrzxcmueodijbhxxgx.supabase.co/functions/v1/device-timeout-check";

async function run() {
    try {
        console.log("Testing device-timeout-check...");
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Using the same apikey as before since it worked for device-heartbeat
                "apikey": "sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK"
            }
        });

        const text = await res.text();

        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);

    } catch (err) {
        console.error("ERROR:", err);
    }
}

run();
