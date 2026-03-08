import { databases, APPWRITE_CONFIG, Query } from '../lib/appwrite';

/**
 * Analytics Service - Manager Dashboard Insights
 */

/**
 * Get daily revenue
 */
export const getDailyRevenue = async () => {
    try {
        // Since Appwrite doesn't have views, we'll fetch completed orders and aggregate
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.limit(100) // Adjust limit as needed
            ]
        );

        const revenueByDate = {};
        response.documents.forEach(order => {
            const date = order.$createdAt.split('T')[0];
            revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total_amount || 0);
        });

        const formattedData = Object.entries(revenueByDate).map(([date, revenue]) => ({
            date,
            revenue
        })).sort((a, b) => b.date.localeCompare(a.date));

        return { success: true, data: formattedData };
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get today's revenue
 */
export const getTodayRevenue = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.greaterThanEqual('$createdAt', `${today}T00:00:00.000Z`),
                Query.lessThanEqual('$createdAt', `${today}T23:59:59.999Z`)
            ]
        );

        const total = response.documents.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        return {
            success: true,
            data: {
                date: today,
                total_orders: response.documents.length,
                total_revenue: total,
                avg_order_value: response.documents.length > 0 ? total / response.documents.length : 0
            }
        };
    } catch (error) {
        console.error('Error fetching today revenue:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get top selling menu items
 */
export const getTopSellingItems = async (limit = 10) => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.limit(100)
            ]
        );

        const itemCounts = {};
        response.documents.forEach(order => {
            let items = order.items;
            if (typeof items === 'string') {
                try { items = JSON.parse(items); } catch (e) { items = []; }
            }
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const key = item.name || item.id;
                    if (!itemCounts[key]) {
                        itemCounts[key] = {
                            name: item.name,
                            count: 0,
                            revenue: 0
                        };
                    }
                    itemCounts[key].count += item.quantity || 1;
                    itemCounts[key].revenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });

        const topItems = Object.values(itemCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return { success: true, data: topItems };
    } catch (error) {
        console.error('Error fetching top selling items:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get order statistics by status
 */
export const getOrderStatsByStatus = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [Query.limit(100)]
        );

        const stats = response.documents.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        const formattedStats = Object.entries(stats).map(([status, count]) => ({
            status,
            order_count: count
        }));

        return { success: true, data: formattedStats };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get waiter performance metrics
 */
export const getWaiterPerformance = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.limit(100)
            ]
        );

        const performance = {};
        response.documents.forEach(order => {
            const waiter = order.assigned_waiter || 'Unassigned';
            if (!performance[waiter]) {
                performance[waiter] = {
                    waiter_name: waiter,
                    total_orders: 0,
                    total_revenue: 0
                };
            }
            performance[waiter].total_orders++;
            performance[waiter].total_revenue += parseFloat(order.total_amount || 0);
        });

        return { success: true, data: Object.values(performance) };
    } catch (error) {
        console.error('Error fetching waiter performance:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get table utilization stats
 */
export const getTableUtilization = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.TABLES,
            [Query.limit(100)]
        );

        const stats = response.documents.reduce((acc, table) => {
            acc[table.status] = (acc[table.status] || 0) + 1;
            return acc;
        }, {});

        const formattedStats = Object.entries(stats).map(([status, count]) => ({
            status,
            table_count: count
        }));

        return { success: true, data: formattedStats };
    } catch (error) {
        console.error('Error fetching table utilization:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get revenue by date range
 */
export const getRevenueByDateRange = async (startDate, endDate) => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.greaterThanEqual('$createdAt', startDate),
                Query.lessThanEqual('$createdAt', endDate),
                Query.limit(100)
            ]
        );

        const revenueByDate = {};
        response.documents.forEach(order => {
            const date = order.$createdAt.split('T')[0];
            if (!revenueByDate[date]) {
                revenueByDate[date] = {
                    date,
                    total_orders: 0,
                    total_revenue: 0
                };
            }
            revenueByDate[date].total_orders++;
            revenueByDate[date].total_revenue += parseFloat(order.total_amount || 0);
        });

        return { success: true, data: Object.values(revenueByDate) };
    } catch (error) {
        console.error('Error fetching revenue by date range:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get peak hours analysis
 */
export const getPeakHours = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [
                Query.equal('status', 'completed'),
                Query.limit(100)
            ]
        );

        const hourCounts = Array(24).fill(0);
        response.documents.forEach(order => {
            const hour = new Date(order.$createdAt).getHours();
            hourCounts[hour]++;
        });

        const peakHours = hourCounts.map((count, hour) => ({
            hour: `${hour}:00`,
            orders: count
        }));

        return { success: true, data: peakHours };
    } catch (error) {
        console.error('Error fetching peak hours:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get customer feedback summary
 */
export const getFeedbackSummary = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FEEDBACKS,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        );

        const data = response.documents;
        const totalRating = data.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        const avgRating = data.length > 0 ? totalRating / data.length : 0;

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach(feedback => {
            if (feedback.rating) ratingCounts[feedback.rating]++;
        });

        return {
            success: true,
            data: {
                total_feedbacks: data.length,
                average_rating: avgRating.toFixed(2),
                rating_distribution: ratingCounts,
                recent_feedbacks: data.slice(0, 10)
            }
        };
    } catch (error) {
        console.error('Error fetching feedback summary:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async () => {
    try {
        const [
            todayRevenue,
            orderStats,
            topItems,
            feedbackSummary
        ] = await Promise.all([
            getTodayRevenue(),
            getOrderStatsByStatus(),
            getTopSellingItems(5),
            getFeedbackSummary()
        ]);

        return {
            success: true,
            data: {
                today: todayRevenue.data,
                orders: orderStats.data,
                topItems: topItems.data,
                feedback: feedbackSummary.data
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get order completion rate
 */
export const getOrderCompletionRate = async () => {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.ORDERS,
            [Query.limit(100)]
        );

        const data = response.documents;
        const total = data.length;
        const completed = data.filter(o => o.status === 'completed').length;
        const cancelled = data.filter(o => o.status === 'cancelled').length;
        const pending = data.filter(o => ['pending', 'preparing', 'ready', 'served'].includes(o.status)).length;

        return {
            success: true,
            data: {
                total_orders: total,
                completed: completed,
                cancelled: cancelled,
                pending: pending,
                completion_rate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
                cancellation_rate: total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0
            }
        };
    } catch (error) {
        console.error('Error fetching completion rate:', error);
        return { success: false, error: error.message };
    }
};
