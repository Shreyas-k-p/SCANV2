import { supabase } from "../supabaseClient";
import toast from 'react-hot-toast';

/**
 * Order Service - Production-Ready Supabase Implementation
 * Includes state machine validation and comprehensive error handling
 */

// Valid order status transitions
const VALID_TRANSITIONS = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served', 'cancelled'],
    served: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
};

/**
 * Validate status transition
 */
const isValidTransition = (currentStatus, newStatus) => {
    if (currentStatus === newStatus) return true;
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

/**
 * ADD ORDER
 */
export const addOrderToDB = async (order) => {
    try {
        if (!order || !order.items || order.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (!order.totalAmount || order.totalAmount <= 0) {
            throw new Error('Order total must be greater than zero');
        }

        const { data, error } = await supabase
            .from('orders')
            .insert([{
                order_id: order.id,
                table_number: order.tableNo || '',
                customer_name: order.customerInfo?.name || '',
                customer_mobile: order.customerInfo?.mobile || '',
                items: order.items || [],
                total_amount: order.totalAmount || 0,
                status: 'pending', // Always start as pending
                assigned_waiter: order.assignedWaiter || '',
                notes: order.notes || ''
            }])
            .select()
            .single();

        if (error) {
            console.error("❌ Error adding order:", error);
            toast.error('Failed to create order');
            throw new Error(`Failed to create order: ${error.message}`);
        }

        console.log("✅ Order created successfully:", data.id);
        toast.success('Order placed successfully!');
        return data.id;
    } catch (error) {
        console.error("❌ Error in addOrderToDB:", error);
        toast.error(error.message || 'Failed to create order');
        throw error;
    }
};

/**
 * UPDATE ORDER STATUS (with validation)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        // Fetch current order
        const { data: currentOrder, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (fetchError) {
            console.error("❌ Error fetching order:", fetchError);
            toast.error('Failed to fetch order');
            throw new Error(`Failed to fetch order: ${fetchError.message}`);
        }

        // Validate transition
        if (!isValidTransition(currentOrder.status, newStatus)) {
            const errorMsg = `Invalid status transition: ${currentOrder.status} → ${newStatus}`;
            console.error("❌", errorMsg);
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }

        // Update status
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error("❌ Error updating order status:", error);
            toast.error('Failed to update order status');
            throw new Error(`Failed to update status: ${error.message}`);
        }

        console.log(`✅ Order ${orderId} status updated: ${currentOrder.status} → ${newStatus}`);
        toast.success(`Order status updated to ${newStatus}`);
        return data;
    } catch (error) {
        console.error("❌ Error in updateOrderStatus:", error);
        if (!error.message.includes('Invalid status transition')) {
            toast.error('Failed to update order');
        }
        throw error;
    }
};

/**
 * LISTEN TO ORDERS (REAL-TIME)
 */
export const listenToOrders = (setOrders) => {
    // Initial fetch
    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("❌ Error fetching orders:", error);
                setOrders([]);
                return;
            }

            // Transform to match Firebase format
            const transformedOrders = (data || []).map(order => ({
                docId: order.id,
                id: order.order_id,
                tableNo: order.table_number,
                customerInfo: {
                    name: order.customer_name,
                    mobile: order.customer_mobile
                },
                items: order.items || [],
                totalAmount: order.total_amount,
                status: order.status,
                assignedWaiter: order.assigned_waiter,
                notes: order.notes,
                createdAt: order.created_at
            }));

            setOrders(transformedOrders);
        } catch (error) {
            console.error("❌ Error in fetchOrders:", error);
            setOrders([]);
        }
    };

    fetchOrders();

    // Subscribe to real-time changes
    const subscription = supabase
        .channel('orders_channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders'
            },
            (payload) => {
                console.log('📡 Order change detected:', payload);
                fetchOrders(); // Refresh all orders
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        subscription.unsubscribe();
    };
};

/**
 * DELETE ORDER
 */
export const deleteOrder = async (orderId) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error("❌ Error deleting order:", error);
            throw new Error(`Failed to delete order: ${error.message}`);
        }

        console.log("✅ Order deleted successfully:", orderId);
    } catch (error) {
        console.error("❌ Error in deleteOrder:", error);
        throw error;
    }
};

/**
 * GET ORDER BY ID
 */
export const getOrderById = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error("❌ Error fetching order:", error);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }

        return {
            success: true,
            data: {
                docId: data.id,
                id: data.order_id,
                tableNo: data.table_number,
                customerInfo: {
                    name: data.customer_name,
                    mobile: data.customer_mobile
                },
                items: data.items || [],
                totalAmount: data.total_amount,
                status: data.status,
                assignedWaiter: data.assigned_waiter,
                notes: data.notes,
                createdAt: data.created_at
            }
        };
    } catch (error) {
        console.error("❌ Error in getOrderById:", error);
        return { success: false, error: error.message };
    }
};

/**
 * GET ORDERS BY STATUS
 */
export const getOrdersByStatus = async (status) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ Error fetching orders by status:", error);
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }

        return { success: true, data };
    } catch (error) {
        console.error("❌ Error in getOrdersByStatus:", error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * ASSIGN WAITER TO ORDER
 */
export const assignWaiterToOrder = async (orderId, waiterId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ assigned_waiter: waiterId })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error("❌ Error assigning waiter:", error);
            throw new Error(`Failed to assign waiter: ${error.message}`);
        }

        console.log("✅ Waiter assigned successfully");
        return { success: true, data };
    } catch (error) {
        console.error("❌ Error in assignWaiterToOrder:", error);
        return { success: false, error: error.message };
    }
};
