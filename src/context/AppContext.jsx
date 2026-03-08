import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onMQTTMessage, publishMQTT, connectMQTT } from "../services/mqttService";
import { getMenuItemsFromDB, addMenuItemToDB, updateMenuItemInDB, deleteMenuItemFromDB } from "../services/menuService";
import {
  addTableToDB,
  getTablesFromDB,
  removeTableFromDB,
  updateTableInDB
} from "../services/tableService";
import { addOrderToDB, getOrdersFromDB, updateOrderStatus as updateOrderInDB, deleteOrder as deleteOrderFromDB, clearAllOrders as clearAllOrdersInDB } from "../services/orderService";
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
import { client, APPWRITE_CONFIG, safeSubscribe } from '../lib/appwrite';

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

  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('cachedMenuItems');
    return saved ? JSON.parse(saved) : [];
  });
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

  // --- DATA FETCHING & REAL-TIME RE-SYNC ---
  const fetchData = useCallback(async () => {
    try {
      // 1. Menu
      const menuData = await getMenuItemsFromDB();
      if (Array.isArray(menuData)) {
        const mappedData = menuData.map(m => ({ ...m, id: m.$id || m.id }));
        setMenuItems(mappedData);
        localStorage.setItem('cachedMenuItems', JSON.stringify(mappedData));
      }
      setMenuLoading(false);

      // 2. Staff
      const staffRes = await getAllStaff();
      if (staffRes.success) {
        const staffData = staffRes.data;
        const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;
        const bucket = APPWRITE_CONFIG.BUCKETS.STAFF_PHOTOS;

        const mapStaff = (s) => ({
          docId: s.$id,
          id: s.staffid,
          name: s.name,
          mobile: s.mobile,
          role: s.role,
          secretID: s.secertKey || s.secretKey,
          profilePhoto: s.photo ? `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucket}/files/${s.photo}/view?project=${project}` : null
        });

        setWaiters(staffData.filter(s => s.role === 'WAITER').map(mapStaff));
        setKitchenStaff(staffData.filter(s => s.role === 'KITCHEN').map(mapStaff));
        setSubManagers(staffData.filter(s => s.role === 'SUB_MANAGER').map(mapStaff));
        setManagers(staffData.filter(s => s.role === 'MANAGER').map(mapStaff));
      }

      // 3. Tables
      const tableData = await getTablesFromDB();
      if (Array.isArray(tableData)) {
        setTables(tableData.map(t => ({ docId: t.$id, id: t.$id, tableNo: t.tableNumber, status: t.status, isCalling: t.isCalling })));
      }

      // 4. Orders
      const orderData = await getOrdersFromDB();
      if (Array.isArray(orderData)) {
        setOrders(orderData.map(o => ({
          docId: o.$id,
          id: o.order_id || o.$id,
          tableNo: o.tableNumber,
          items: typeof o.items === 'string' ? JSON.parse(o.items || "[]") : (o.items || []),
          status: o.status,
          timestamp: o.createdAt || o.$createdAt,
          totalAmount: o.total || o.total_amount || 0
        })));
      }

      // 5. Devices
      const deviceData = await fetchDeviceStatus();
      if (Array.isArray(deviceData)) {
        setDevices(deviceData.map(d => ({ ...d, id: d.$id || d.device_id })));
      }

      // 6. Announcements
      const announceData = await fetchActiveAnnouncements();
      if (Array.isArray(announceData)) {
        setAnnouncements(announceData.map(a => ({ ...a, id: a.$id || a.id })));
      }

      // 7. Feedbacks
      const feedbackData = await getFeedbacksFromDB();
      if (Array.isArray(feedbackData)) {
        setFeedbacks(feedbackData.map(f => ({ ...f, id: f.$id || f.id })));
      }

    } catch (e) {
      console.error("Data fetch error:", e);
    }
  }, []);

  useEffect(() => {
    connectMQTT(); // Pre-warm the broker connection explicitly
    fetchData();

    // -- Appwrite REAL-TIME SUBSCRIPTIONS --
    const dbId = APPWRITE_CONFIG.DATABASE_ID;

    // Appwrite realtime collection sync
    const unsubscribe = safeSubscribe(`databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.*.documents`, (response) => {
      console.log("🔥 Appwrite Real-time Update:", response.events);
      fetchData();
    });

    // MQTT subscription for the Waiter Call system
    const mqttUnsub = onMQTTMessage(async (topic, msg) => {
      if (msg.type === "CALL_WAITER" || msg.type === "waiter_call") {
        console.log("🛎️ Waiter call via MQTT:", msg.table);
        const rawTableNo = msg.table ? String(msg.table).replace('T', '').padStart(2, '0') : null;
        const altTableNo = msg.table ? String(msg.table).replace('T', '') : null;

        const allTables = await getTablesFromDB();
        const table = allTables.find(t =>
          String(t.tableNumber) === String(msg.table) ||
          String(t.tableNumber) === rawTableNo ||
          String(t.tableNumber) === altTableNo
        );

        if (table) {
          await updateTableInDB(table.$id, { isCalling: true });
          fetchData();
        }
      }
    });

    return () => {
      unsubscribe();
      mqttUnsub();
    };
  }, [fetchData]);

  // --- ACTIONS ---
  const login = async (role, staffId, secretId, name) => {
    const result = await loginStaff(role, staffId, secretId, name);
    if (result.success) setUser(result.user);
    return result;
  };
  const logout = () => { logoutStaff(); setUser(null); };

  const addMenuItem = async (item) => await addMenuItemToDB(item);
  const updateMenuItem = async (id, updatedItem) => await updateMenuItemInDB(id, updatedItem);
  const deleteMenuItem = async (id) => await deleteMenuItemFromDB(id);

  const placeOrder = async (tableNo, items) => {
    const newOrder = {
      tableNo: String(tableNo),
      items: items,
      status: "pending"
    };

    const dbResult = await addOrderToDB(newOrder);

    // Broadcast sync sequence via MQTT per user instruction
    const cleanItems = items.map(item => ({
      name: item.name,
      qty: item.quantity || item.qty || 1, // Accommodate standard front-end formatting
      price: item.price
    }));

    publishMQTT(`restaurant/snmimt/table/${tableNo}`, {
      type: "ORDER_PLACED",
      order_id: dbResult.$id,
      table_id: String(tableNo),
      items: cleanItems,
      total: dbResult.total || 0
    });

    return dbResult;
  };

  const updateOrderStatus = async (docId, status) => {
    // Find table ID logic locally from the cache to alert the right IoT dashboard
    const relevantOrder = orders.find(o => o.id === docId);

    const res = await updateOrderInDB(docId, status);

    if (relevantOrder) {
      publishMQTT(`restaurant/snmimt/table/${relevantOrder.tableNo || relevantOrder.tableNumber}`, {
        type: "ORDER_STATUS",
        status: status
      });
    }
    return res;
  };
  const deleteOrder = async (id) => await deleteOrderFromDB(id);
  const clearAllOrders = async () => await clearAllOrdersInDB();

  const addTable = async (tableNo) => await addTableToDB(tableNo);
  const removeTable = async (docId) => await removeTableFromDB(docId);
  const updateTableStatus = async (docId, status) => await updateTableInDB(docId, { status });
  const clearTableCall = async (docId) => await updateTableInDB(docId, { isCalling: false });

  // Staff Management
  const addWaiter = async (name, photoFile, mobile, email) => {
    const result = await createStaffAccount({ name, photoFile, mobile, email, role: 'WAITER' });
    return result.success ? (result.staff.secertKey || result.staff.secretKey) : null;
  };
  const removeWaiter = async (id) => await deleteStaffAccount(id);
  const addKitchenStaff = async (name, photoFile, mobile, email) => {
    const result = await createStaffAccount({ name, photoFile, mobile, email, role: 'KITCHEN' });
    return result.success ? (result.staff.secertKey || result.staff.secretKey) : null;
  };
  const removeKitchenStaff = async (id) => await deleteStaffAccount(id);
  const addSubManager = async (name, photoFile, mobile, email) => {
    const result = await createStaffAccount({ name, photoFile, mobile, email, role: 'SUB_MANAGER' });
    return result.success ? (result.staff.secertKey || result.staff.secretKey) : null;
  };
  const removeSubManager = async (id) => await deleteStaffAccount(id);
  const addManager = async (name, photoFile) => {
    const result = await createStaffAccount({ name, photoFile, role: 'MANAGER' });
    return result.success ? (result.staff.secertKey || result.staff.secretKey) : null;
  };
  const removeManager = async (id) => await deleteStaffAccount(id);

  const addAnnouncement = async (title, content, type) => await addAnnouncementToDB(title, content, type);
  const deleteAnnouncement = async (id) => await deleteAnnouncementFromDB(id);

  const addFeedback = async (feedbackData) => await addFeedbackToDB(feedbackData);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, menuLoading, addMenuItem, updateMenuItem, deleteMenuItem,
      orders, placeOrder, updateOrderStatus, clearAllOrders, deleteOrder,
      tables, addTable, removeTable, updateTableStatus, clearTableCall,
      waiters, addWaiter, removeWaiter,
      kitchenStaff, addKitchenStaff, removeKitchenStaff,
      subManagers, addSubManager, removeSubManager,
      managers, addManager, removeManager,
      devices,
      announcements, addAnnouncement, deleteAnnouncement,
      feedbacks, addFeedback,
      language, setLanguage, t, translations,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
