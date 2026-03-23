import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { onMQTTMessage, publishMQTT, connectMQTT } from "../services/mqttService"; // We'll keep MQTT for IoT but sync most via Socket.io
import { getMenuItemsFromDB, addMenuItemToDB, updateMenuItemInDB, deleteMenuItemFromDB, getCategoriesFromDB, addCategoryToDB } from "../services/menuService";
import {
  addTableToDB,
  getTablesFromDB,
  removeTableFromDB,
  updateTableInDB
} from "../services/tableService";
import {
  addOrderToDB,
  getOrdersFromDB,
  updateOrderStatus as updateOrderInDB,
  deleteOrder as deleteOrderFromDB,
  fetchSessionOrders as fetchOrderSession,
  cancelOrder as cancelOrderInDB
} from "../services/orderService";
import { translations } from '../utils/translations';
import {
  loginStaff,
  logoutStaff,
  createStaffAccount,
  deleteStaffAccount,
  getAllStaff
} from '../services/authService';
import {
  fetchActiveAnnouncements,
  addAnnouncement as addAnnouncementToDB,
  deleteAnnouncement as deleteAnnouncementFromDB
} from '../services/announcementService';
import { addFeedbackToDB, getFeedbacksFromDB } from "../services/feedbackService";
import { fetchDeviceStatus } from "../services/deviceService";
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
  const [user, setUser] = useState(() => {
    const sessionData = localStorage.getItem('staff_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (new Date(session.expiresAt) > new Date()) return session.user;
      } catch (e) { }
    }
    return null;
  });

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [kitchenStaff, setKitchenStaff] = useState([]);
  const [subManagers, setSubManagers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const t = useCallback((key) => translations[language]?.[key] || translations['en']?.[key] || key, [language]);

  useEffect(() => { localStorage.setItem('appLanguage', language); }, [language]);
  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Guest/Public Data (Menu & Categories)
      // If we're at a table or just viewing menu, we need these even if not logged in.
      // For now, let's try to get a restaurantId from URL or storage if guest
      const urlParams = new URLSearchParams(window.location.search);
      const tableNo = urlParams.get('table');
      // For demo, we might need a default restaurant ID or it's global
      const restId = user?.restaurantId || null;

      const [menuData, categoryData] = await Promise.all([
        getMenuItemsFromDB(restId),
        getCategoriesFromDB(restId)
      ]);

      if (Array.isArray(menuData)) {
        const mappedData = menuData.map(m => ({
          ...m,
          id: m.id || m._id,
          restaurantId: m.restaurantId || m.restaurant_id // Support both
        }));
        setMenuItems(mappedData);
      }
      setMenuLoading(false);

      // 2. Fetch Protected (Staff) Data - ONLY if logged in
      if (user) {
        const [
          staffRes,
          tableData,
          orderData,
          deviceData,
          feedbackData
        ] = await Promise.all([
          getAllStaff(),
          getTablesFromDB(restId),
          getOrdersFromDB(restId),
          fetchDeviceStatus(restId),
          getFeedbacksFromDB(restId)
        ]);

        // Staff
        if (staffRes.success) {
          const staffData = staffRes.data;
          const mapStaff = (s) => ({
            docId: s.id || s._id,
            id: s.id || s._id,
            name: s.name,
            email: s.email,
            role: s.role,
            isActive: s.isActive,
            profilePhoto: s.profile_photo || s.profilePhoto || null,
            staffId: s.staff_id,
            secretID: s.secret_id
          });

          setWaiters(staffData.filter(s => String(s.role).toUpperCase() === 'WAITER').map(mapStaff));
          setKitchenStaff(staffData.filter(s => String(s.role).toUpperCase() === 'KITCHEN').map(mapStaff));
          setSubManagers(staffData.filter(s => String(s.role).toUpperCase() === 'SUB_MANAGER').map(mapStaff));
          setManagers(staffData.filter(s => String(s.role).toUpperCase() === 'MANAGER' || String(s.role).toUpperCase() === 'SUPERADMIN').map(mapStaff));
        }

        // Tables
        if (Array.isArray(tableData)) {
          setTables(tableData.map(t => ({
            docId: t.id || t._id,
            id: t.id || t._id,
            tableNo: t.table_number || t.tableNumber || '?',
            status: (t.active ?? true) ? 'available' : 'disabled',
            isCalling: t.isCalling || t.is_calling || false
          })));
        }

        // Orders
        if (Array.isArray(orderData)) {
          setOrders(orderData.map(o => ({
            docId: o.id || o._id,
            id: o.id || o._id,
            tableNo: o.table_number || o.tableNumber || 'Unknown',
            items: typeof o.items === 'string' ? JSON.parse(o.items || "[]") : (o.items || []),
            status: o.status,
            timestamp: o.createdAt || o.created_at,
            totalAmount: o.totalAmount || o.total_amount,
            restaurantId: o.restaurant_id || o.restaurantId
          })));
        }

        // Devices, Feedbacks
        if (Array.isArray(deviceData)) setDevices(deviceData.map(d => ({ ...d, id: d.id || d._id })));
        if (Array.isArray(feedbackData)) setFeedbacks(feedbackData.map(f => ({ ...f, id: f.id || f._id })));
      }

    } catch (e) {
      console.error("Data fetch error:", e);
    }
  }, [user]);

  // Initial public data fetch
  useEffect(() => {
    if (!user) fetchData();
  }, [user, fetchData]);

  // Sync session and logic via Supabase Realtime
  useEffect(() => {
    if (user) {
      // Subscribe to relevant changes
      const channel = supabase
        .channel(`restaurant-general`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' /* filter: `restaurant_id=eq.${restId}` */ },
          (payload) => {
            console.log("🔔 Real-time: Order Update Received", payload.new.status);
            fetchData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tables' /* filter: `restaurant_id=eq.${restId}` */ },
          (payload) => {
            console.log("🔔 Real-time: Table status updated", payload.new.is_calling);
            fetchData();
          }
        )
        .subscribe();

      fetchData();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchData]);

  // Auth Expired Listener
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (role, staffId, secretId) => {
    const result = await loginStaff(role, staffId, secretId);
    if (result.success) setUser(result.user);
    return result;
  };
  const logout = () => { logoutStaff(); setUser(null); };

  const addMenuItem = async (item) => {
    const res = await addMenuItemToDB(item);
    fetchData();
    return res;
  };
  const updateMenuItem = async (id, updatedItem) => {
    const res = await updateMenuItemInDB(id, updatedItem);
    fetchData();
    return res;
  };
  const deleteMenuItem = async (id) => {
    const res = await deleteMenuItemFromDB(id);
    fetchData();
    return res;
  };

  const placeOrder = async (orderData) => {
    const dbResult = await addOrderToDB(orderData);
    // Realtime notification is handled by backend + socket.io room
    fetchData();
    return dbResult;
  };

  const updateOrderStatus = async (docId, status) => {
    const res = await updateOrderInDB(docId, status);
    fetchData();
    return res;
  };

  const cancelOrder = async (orderId) => {
    const res = await cancelOrderInDB(orderId);
    return res;
  };

  const getMyOrders = async (ids) => {
    const res = await fetchOrderSession(ids);
    return res;
  }

  const addTable = async (tableNo) => {
    const res = await addTableToDB(tableNo);
    fetchData();
    return res;
  };
  const removeTable = async (docId) => {
    const res = await removeTableFromDB(docId);
    fetchData();
    return res;
  };
  const updateTableStatus = async (docId, status) => {
    const res = await updateTableInDB(docId, { status });
    fetchData();
    return res;
  };
  const clearTableCall = async (docId) => {
    const res = await updateTableInDB(docId, { isCalling: false });
    fetchData();
    return res;
  };

  const addWaiter = async (data) => {
    const result = await createStaffAccount({ ...data, role: 'WAITER' });
    fetchData();
    return result;
  };
  const addKitchenStaff = async (data) => {
    const result = await createStaffAccount({ ...data, role: 'KITCHEN' });
    fetchData();
    return result;
  };
  const addManager = async (data) => {
    const result = await createStaffAccount({ ...data, role: 'MANAGER' });
    fetchData();
    return result;
  };

  const addAnnouncement = async (title, content, type) => {
    const res = await addAnnouncementToDB(title, content, type);
    fetchData();
    return res;
  };
  const deleteAnnouncement = async (id) => {
    const res = await deleteAnnouncementFromDB(id);
    fetchData();
    return res;
  };

  const addFeedback = async (feedbackData) => await addFeedbackToDB(feedbackData);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, menuLoading, addMenuItem, updateMenuItem, deleteMenuItem,
      orders, placeOrder, updateOrderStatus, deleteOrder: deleteOrderFromDB,
      cancelOrder, getMyOrders,
      tables, addTable, removeTable, updateTableStatus, clearTableCall,
      waiters, addWaiter, removeWaiter: deleteStaffAccount,
      kitchenStaff, addKitchenStaff, removeKitchenStaff: deleteStaffAccount,
      subManagers, addSubManager: (data) => createStaffAccount({ ...data, role: 'SUB_MANAGER' }), removeSubManager: deleteStaffAccount,
      managers, addManager, removeManager: deleteStaffAccount,
      devices,
      announcements, addAnnouncement, deleteAnnouncement,
      feedbacks, addFeedback,
      language, setLanguage, t, translations,
      theme, toggleTheme,
      fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
