import { supabase } from "../supabaseClient";

export async function fetchDeviceStatus() {
    try {
        const { data, error } = await supabase
            .from("device_status")
            .select("*")
            .order("table_id");

        if (error) {
            console.error("Device fetch error:", error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("Device fetch exception:", err);
        return [];
    }
}
