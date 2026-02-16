import { supabase } from "../supabaseClient";

/**
 * Menu Service - Supabase Implementation
 * Replaces Firebase menuService.js
 */

// ADD MENU ITEM
export const addMenuItemToDB = async (item) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description || '',
        image: item.image || '',
        available: item.available !== false,
        benefits: item.benefits || ''
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

// LISTEN TO MENU ITEMS (REAL-TIME)
export const listenToMenu = (setMenuItems) => {
  // Initial fetch
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching menu:", error);
      return;
    }

    setMenuItems(data || []);
  };

  fetchMenu();

  // Subscribe to real-time changes
  const subscription = supabase
    .channel('menu_items_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items'
      },
      (payload) => {

        fetchMenu(); // Refetch all items on any change
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// UPDATE MENU ITEM
export const updateMenuItemInDB = async (id, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

// DELETE MENU ITEM
export const deleteMenuItemFromDB = async (id) => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};
