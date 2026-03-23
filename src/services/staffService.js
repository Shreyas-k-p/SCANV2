import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'staff-photos';

export const createStaff = async (data) => {
    try {
        let photoUrl = "";

        if (data.photoFile) {
            const fileExt = data.photoFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
            const filePath = `photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, data.photoFile);

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            photoUrl = publicData.publicUrl;
        }

        const { data: response, error } = await supabase
            .from('profiles')
            .insert([{
                staff_id: data.staffid || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
                name: data.name,
                mobile: data.mobile,
                email: data.email || "",
                role: data.role.toUpperCase(),
                photo: photoUrl,
                secretKey: data.secretKey || Math.random().toString(36).substring(2, 12)
            }])
            .select()
            .single();

        if (error) throw error;
        return response;
    } catch (error) {
        console.error("Error creating staff in Supabase:", error);
        throw error;
    }
};

export const getStaff = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(100);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching staff from Supabase:", error);
        return [];
    }
};

export const deleteStaff = async (docId) => {
    try {
        // Fetch document first to get photo URL for deletion if necessary
        const { data: doc, error: fetchError } = await supabase
            .from('profiles')
            .select('photo')
            .eq('id', docId)
            .single();

        if (fetchError) throw fetchError;

        if (doc.photo) {
            // Extract file path from URL to delete from storage
            try {
                const url = new URL(doc.photo);
                const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
                if (pathParts.length > 1) {
                    const filePath = pathParts[1];
                    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
                }
            } catch (e) {
                console.warn("Could not extract file path from URL for storage deletion:", e);
            }
        }

        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', docId);

        if (deleteError) throw deleteError;
        return true;
    } catch (error) {
        console.error("Error deleting staff in Supabase:", error);
        throw error;
    }
};
