/**
 * Local Cache Service
 * Handles offline data caching using localStorage
 */

const CACHE_KEYS = {
    MENU: 'menu_cache',
    ORDERS: 'orders_cache',
    TABLES: 'tables_cache',
    STAFF: 'staff_cache',
    PENDING_ORDERS: 'pending_orders_queue'
};

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save data to cache with timestamp
 */
export const saveToCache = (key, data) => {
    try {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
        return true;
    } catch (error) {
        console.error('Error saving to cache:', error);
        return false;
    }
};

/**
 * Get data from cache if not expired
 */
export const getFromCache = (key) => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        // Check if expired
        if (Date.now() - timestamp > CACHE_EXPIRY) {
            localStorage.removeItem(key);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
    }
};

/**
 * Clear specific cache
 */
export const clearCache = (key) => {
    localStorage.removeItem(key);
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
    Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};

/**
 * Cache menu items
 */
export const cacheMenu = (menuItems) => {
    return saveToCache(CACHE_KEYS.MENU, menuItems);
};

/**
 * Get cached menu
 */
export const getCachedMenu = () => {
    return getFromCache(CACHE_KEYS.MENU);
};

/**
 * Add order to pending queue (for offline submission)
 */
export const queuePendingOrder = (order) => {
    try {
        const queue = getPendingOrders();
        queue.push({
            ...order,
            queuedAt: Date.now()
        });
        localStorage.setItem(CACHE_KEYS.PENDING_ORDERS, JSON.stringify(queue));
        return true;
    } catch (error) {
        console.error('Error queuing order:', error);
        return false;
    }
};

/**
 * Get pending orders queue
 */
export const getPendingOrders = () => {
    try {
        const queue = localStorage.getItem(CACHE_KEYS.PENDING_ORDERS);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Error getting pending orders:', error);
        return [];
    }
};

/**
 * Clear pending orders queue
 */
export const clearPendingOrders = () => {
    localStorage.removeItem(CACHE_KEYS.PENDING_ORDERS);
};

/**
 * Remove specific order from queue
 */
export const removePendingOrder = (orderId) => {
    try {
        const queue = getPendingOrders();
        const filtered = queue.filter(o => o.id !== orderId);
        localStorage.setItem(CACHE_KEYS.PENDING_ORDERS, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error removing pending order:', error);
        return false;
    }
};

export { CACHE_KEYS };
