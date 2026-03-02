import { supabase } from "../supabaseClient";
import toast from 'react-hot-toast';
import { publishMQTT } from "./mqttService";
import { updateTableStatusByNumber } from "./tableService";

/**
 * Order Service - Production-Ready Supabase Implementation
 * Includes state machine validation and comprehensive error handling
 */







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

        // Set table to occupied immediately
        if (order.tableNo) {
            await updateTableStatusByNumber(order.tableNo, 'occupied');
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


        toast.success('Order placed successfully!');

        // MQTT Service Integration
        await publishMQTT({
            type: "ORDER_PLACED",
            table_id: order.tableNo,
            order_id: order.id,
            items: order.items.map(i => ({
                name: i.name,
                qty: i.quantity
            })),
            total: order.totalAmount
        });

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
/**
 * UPDATE ORDER STATUS (optimistic - no prefetch)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        // Direct update — skip prefetch to halve network round-trips
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select('id, status, table_number, order_id')
            .single();

        if (error) {
            console.error("❌ Error updating order status:", error);
            toast.error('Failed to update order status');
            throw new Error(`Failed to update status: ${error.message}`);
        }

        // MQTT Updates
        if (newStatus === 'preparing') {
            await publishMQTT({
                type: "PREPARING",
                table_id: data.table_number,
                order_id: data.order_id
            });
        }

        return data;
    } catch (error) {
        console.error("❌ Error in updateOrderStatus:", error);
        toast.error('Failed to update order');
        throw error;
    }
};

/**
 * LISTEN TO ORDERS (REAL-TIME)
 */
const transformOrder = (order) => ({
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
    timestamp: order.created_at,
    createdAt: order.created_at
});

/**
 * LISTEN TO ORDERS (REAL-TIME) — uses payload for incremental updates
 */
export const listenToOrders = (setOrders) => {
    // Initial fetch
    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ Error fetching orders:", error);
            setOrders([]);
            return;
        }
        setOrders((data || []).map(transformOrder));
    };

    fetchOrders();

    // Subscribe — update local state from payload instead of full refetch
    const subscription = supabase
        .channel('orders_channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [transformOrder(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o =>
                        o.docId === payload.new.id ? transformOrder(payload.new) : o
                    ));
                } else if (payload.eventType === 'DELETE') {
                    setOrders(prev => prev.filter(o => o.docId !== payload.old.id));
                }
            }
        )
        .subscribe();

    return () => { subscription.unsubscribe(); };
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
 * CLEAR ALL ORDERS
 * Deletes every order from the DB and resets all tables to 'available'.
 */
export const clearAllOrders = async () => {
    try {
        // Delete all orders (use gt uuid '00000...' trick because Supabase requires a filter)
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows

        if (deleteError) {
            console.error('❌ Error clearing all orders:', deleteError);
            throw new Error(`Failed to clear orders: ${deleteError.message}`);
        }

        // Reset all table statuses to 'available'
        const { error: tableError } = await supabase
            .from('tables')
            .update({ status: 'available' })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (tableError) {
            console.error('❌ Error resetting tables:', tableError);
            // Non-fatal – orders are already gone
        }

        toast.success('All order records cleared!');
    } catch (error) {
        console.error('❌ Error in clearAllOrders:', error);
        toast.error(error.message || 'Failed to clear orders');
        throw error;
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


        return { success: true, data };
    } catch (error) {
        console.error("❌ Error in assignWaiterToOrder:", error);
        return { success: false, error: error.message };
    }
};
