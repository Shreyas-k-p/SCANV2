import { supabase } from '../supabaseClient';

/**
 * Analytics Service - Manager Dashboard Insights
 * Provides business intelligence and reporting
 */

/**
 * Get daily revenue
 */
export const getDailyRevenue = async () => {
    try {
        const { data, error } = await supabase
            .from('daily_revenue')
            .select('*')
            .limit(30);

        if (error) throw error;
        return { success: true, data };
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

        const { data, error } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (error) throw error;

        const total = data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        return {
            success: true,
            data: {
                date: today,
                total_orders: data.length,
                total_revenue: total,
                avg_order_value: data.length > 0 ? total / data.length : 0
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
        // Get all completed orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('items')
            .eq('status', 'completed');

        if (error) throw error;

        // Count items
        const itemCounts = {};
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
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

        // Convert to array and sort
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
        const { data, error } = await supabase
            .from('order_stats_by_status')
            .select('*');

        if (error) throw error;
        return { success: true, data };
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
        const { data, error } = await supabase
            .from('waiter_performance')
            .select('*');

        if (error) throw error;
        return { success: true, data };
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
        const { data, error } = await supabase
            .from('table_utilization')
            .select('*');

        if (error) throw error;
        return { success: true, data };
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
        const { data, error } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('status', 'completed')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by date
        const revenueByDate = {};
        data.forEach(order => {
            const date = order.created_at.split('T')[0];
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

        const result = Object.values(revenueByDate);
        return { success: true, data: result };
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
        const { data, error } = await supabase
            .from('orders')
            .select('created_at')
            .eq('status', 'completed');

        if (error) throw error;

        // Group by hour
        const hourCounts = Array(24).fill(0);
        data.forEach(order => {
            const hour = new Date(order.created_at).getHours();
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
        const { data, error } = await supabase
            .from('feedbacks')
            .select('rating, message')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate average rating
        const totalRating = data.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        const avgRating = data.length > 0 ? totalRating / data.length : 0;

        // Count by rating
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach(feedback => {
            if (feedback.rating) {
                ratingCounts[feedback.rating]++;
            }
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
 * Get dashboard overview (all key metrics)
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
        const { data, error } = await supabase
            .from('orders')
            .select('status');

        if (error) throw error;

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
