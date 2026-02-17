const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function publishMQTT(data) {
    try {
        console.log("MQTT SEND DATA:", data);

        const res = await fetch(
            `${SUPABASE_URL}/functions/v1/mqtt-publisher`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": ANON_KEY,
                    "Authorization": `Bearer ${ANON_KEY}`
                },
                body: JSON.stringify(data)
            }
        );

        const result = await res.json();
        console.log("MQTT RESPONSE:", result);

        return result;
    } catch (err) {
        console.error("MQTT ERROR:", err);
    }
}
