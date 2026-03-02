import { supabase } from '../supabaseClient';

/**
 * Error Logging Service
 * Logs frontend errors to Supabase for monitoring
 */

/**
 * Log error to database
 */
export const logError = async (errorType, errorMessage, stackTrace = null) => {
    try {
        const { error } = await supabase
            .from('error_logs')
            .insert([{
                error_type: errorType,
                error_message: errorMessage,
                stack_trace: stackTrace,
                user_agent: navigator.userAgent,
                url: window.location.href,
                staff_id: localStorage.getItem('currentUser') || 'anonymous'
            }]);

        if (error) {
            console.error('Failed to log error:', error);
        }
    } catch (err) {
        // Fail silently - don't break app if logging fails
        console.error('Error logging failed:', err);
    }
};

/**
 * Log login failure
 */
export const logLoginFailure = async (staffId, role, reason) => {
    await logError(
        'login_failure',
        `Login failed for ${role} - ${staffId}: ${reason}`,
        null
    );
};

/**
 * Log order failure
 */
export const logOrderFailure = async (orderId, reason, details) => {
    await logError(
        'order_failure',
        `Order ${orderId} failed: ${reason}`,
        JSON.stringify(details)
    );
};

/**
 * Log network error
 */
export const logNetworkError = async (endpoint, error) => {
    await logError(
        'network_error',
        `Network request failed: ${endpoint}`,
        error.message
    );
};

/**
 * Log state transition error
 */
export const logStateTransitionError = async (orderId, fromStatus, toStatus) => {
    await logError(
        'invalid_state_transition',
        `Invalid transition: ${fromStatus} → ${toStatus}`,
        `Order ID: ${orderId}`
    );
};

/**
 * Setup global error handler
 */
export const setupGlobalErrorHandler = () => {
    // Catch unhandled errors
    window.onerror = function (message, source, lineno, colno, error) {
        logError(
            'unhandled_error',
            message,
            error?.stack || `${source}:${lineno}:${colno}`
        );
        return false; // Let default handler run
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = function (event) {
        logError(
            'unhandled_rejection',
            event.reason?.message || 'Promise rejection',
            event.reason?.stack || JSON.stringify(event.reason)
        );
    };

    console.log('✅ Global error handler initialized');
};

/**
 * Get recent errors (for admin dashboard)
 */
export const getRecentErrors = async (limit = 50) => {
    try {
        const { data, error } = await supabase
            .from('error_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Failed to fetch error logs:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Get error statistics
 */
export const getErrorStats = async () => {
    try {
        const { data, error } = await supabase
            .from('failed_operations')
            .select('*');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Failed to fetch error stats:', error);
        return { success: false, error: error.message, data: [] };
    }
};
