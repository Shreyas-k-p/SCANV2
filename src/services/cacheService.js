/**
 * Local Cache Service
 * DISABLED: Real-time Supabase makes this completely redundant and causes QuotaExceededError.
 */

export const CACHE_KEYS = {
    MENU: 'menu_cache',
    ORDERS: 'orders_cache',
    TABLES: 'tables_cache',
    STAFF: 'staff_cache',
    PENDING_ORDERS: 'pending_orders_queue'
};

export const saveToCache = (key, data) => true; 
export const getFromCache = (key) => null;
export const clearCache = (key) => {};
export const clearAllCaches = () => {};
export const cacheMenu = (menuItems) => true;
export const getCachedMenu = () => null;
export const queuePendingOrder = (order) => true;
export const getPendingOrders = () => [];
export const clearPendingOrders = () => {};
export const removePendingOrder = (orderId) => true;
