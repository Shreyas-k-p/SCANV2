import { supabase } from '../lib/supabase';

export const getTablesFromDB = async (restaurantId) => {
  try {
    let query = supabase.from('tables').select('*');
    // if (restaurantId) {
    //   query = query.eq('restaurant_id', restaurantId);
    // }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tables from Supabase:", error);
    return [];
  }
};

export const addTableToDB = async (tableNumber, restaurantId) => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .insert([{ 
        table_number: tableNumber, 
        // restaurant_id: restaurantId 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding table in Supabase:", error);
    throw error;
  }
};

export const updateTableInDB = async (docId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .update(updatedData)
      .eq('id', docId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating table in Supabase:", error);
    throw error;
  }
};

export const removeTableFromDB = async (docId) => {
  try {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing table from Supabase:", error);
    throw error;
  }
};
