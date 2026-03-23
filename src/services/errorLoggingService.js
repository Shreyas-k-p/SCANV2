import { supabase } from '../lib/supabase';

export const logError = async (errorType, errorMessage, stackTrace = null) => {
    console.error(`[Frontend Error Log] Type: ${errorType} | Message: ${errorMessage}`);
    if (stackTrace) console.error(`Stack: ${stackTrace}`);

    try {
        await supabase.from('error_logs').insert([{
            errorType,
            errorMessage,
            stackTrace,
            createdAt: new Date().toISOString()
        }]);
    } catch (e) {
        // Silently ignore logging errors to prevent infinite loops
    }
};

export const logLoginFailure = async (staffId, role, reason) => {
    await logError('login_failure', `Login failed for ${role} - ${staffId}: ${reason}`);
};

export const logOrderFailure = async (orderId, reason, details) => {
    await logError('order_failure', `Order ${orderId} failed: ${reason}`, JSON.stringify(details));
};

export const logNetworkError = async (endpoint, error) => {
    await logError('network_error', `Network request failed: ${endpoint}`, error?.message);
};

export const setupGlobalErrorHandler = () => {
    window.onerror = function (message, source, lineno, colno, error) {
        logError('unhandled_error', message, error?.stack || `${source}:${lineno}:${colno}`);
        return false;
    };
    window.onunhandledrejection = function (event) {
        logError('unhandled_rejection', event.reason?.message || 'Promise rejection', event.reason?.stack);
    };
};

export const getRecentErrors = async (limit = 50) => {
    try {
        const { data, error } = await supabase
            .from('error_logs')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return { success: true, data };
    } catch (e) {
        return { success: false, data: [] };
    }
};

export const getErrorStats = async () => ({ success: true, data: [] });
