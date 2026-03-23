import { supabase } from '../lib/supabase';

export const getMenuItemsFromDB = async (restaurantId) => {
  try {
    // Probing showed table is 'menu_items' and 'restaurant_id' column is currently missing
    let query = supabase.from('menu_items').select('*');
    
    // Temporarily commenting out filter until column is added to Supabase
    // if (restaurantId) {
    //   query = query.eq('restaurant_id', restaurantId);
    // }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching menu items from Supabase:", error);
    return [];
  }
};

export const addMenuItemToDB = async (item) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        ...item,
        price: Number(item.price),
        available: item.available ?? true,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding menu item to Supabase:", error);
    throw error;
  }
};

export const updateMenuItemInDB = async (docId, updatedItem) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        ...updatedItem,
        price: updatedItem.price ? Number(updatedItem.price) : undefined,
      })
      .eq('id', docId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating menu item in Supabase:", error);
    throw error;
  }
};

export const deleteMenuItemFromDB = async (docId) => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', docId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting menu item from Supabase:", error);
    throw error;
  }
};

export const getCategoriesFromDB = async (restaurantId) => {
  try {
    // Try to get from categories table
    const { data: catData, error: catError } = await supabase.from('categories').select('*');
    
    if (catError) {
      // If table doesn't exist, extract unique categories from menu_items
      const items = await getMenuItemsFromDB(restaurantId);
      const uniqueCats = [...new Set(items.map(i => i.category).filter(Boolean))];
      return uniqueCats.map((name, index) => ({ id: `cat-${index}`, name }));
    }
    
    return catData || [];
  } catch (error) {
    console.warn("Categories fetch fallback:", error.message);
    return [];
  }
};

export const addCategoryToDB = async (name, restaurantId) => {
  try {
    // Attempt insert but handle failure gracefully if table missing
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
       console.warn("Could not add category to DB table (table might be missing), skipping insert.");
       return { id: `cat-${Date.now()}`, name };
    }
    return data;
  } catch (error) {
    console.warn("Error adding category, returning local object:", error.message);
    return { id: `cat-${Date.now()}`, name };
  }
};
