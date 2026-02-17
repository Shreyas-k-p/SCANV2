import { supabase } from "../supabaseClient";

/**
 * Table Service - Supabase Implementation
 * Replaces Firebase tableService.js
 */

// ADD TABLE
export const addTableToDB = async (tableNo) => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .insert([{
        table_number: String(tableNo),
        capacity: 4,
        status: 'available'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding table:", error);
    throw error;
  }
};

// LISTEN TO TABLES (REAL-TIME)
export const listenToTables = (setTables) => {
  // Initial fetch
  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error) {
      console.error("Error fetching tables:", error);
      return;
    }

    // Transform to match Firebase format
    const transformedTables = (data || []).map(table => ({
      docId: table.id,
      tableNo: table.table_number,
      capacity: table.capacity,
      status: table.status,
      qrCode: table.qr_code
    }));

    setTables(transformedTables);
  };

  fetchTables();

  // Subscribe to real-time changes
  const subscription = supabase
    .channel('tables_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tables'
      },
      (payload) => {

        fetchTables();
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// UPDATE TABLE STATUS
export const updateTableStatusInDB = async (docId, status) => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('id', docId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating table status:", error);
    throw error;
  }
};

// UPDATE TABLE STATUS BY NUMBER
export const updateTableStatusByNumber = async (tableNo, status) => {
  try {
    const { data, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('table_number', String(tableNo))
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating table status by number:", error);
    // Don't throw, just log, to avoid blocking order creation flow
    return null;
  }
};

// REMOVE TABLE
export const removeTableFromDB = async (docId) => {
  try {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', docId);

    if (error) throw error;
  } catch (error) {
    console.error("Error removing table:", error);
    throw error;
  }
};
