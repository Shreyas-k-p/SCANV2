import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { listenToMenu, addMenuItemToDB, updateMenuItemInDB, deleteMenuItemFromDB } from "../services/menuService";
import {
  addTableToDB,
  listenToTables,
  removeTableFromDB,
  updateTableStatusInDB
} from "../services/tableService";
import { addOrderToDB, listenToOrders, updateOrderInDB, deleteOrderFromDB } from "../services/orderService";
import { translations } from '../utils/translations';
import { playNotificationSound, playUrgentNotificationSound } from '../utils/soundUtils';
import {
  loginStaff,
  logoutStaff,
  getCurrentUser,
  getStaffSession,
  createStaffAccount,
  deleteStaffAccount,
  getStaffByRole,
  subscribeToStaffChanges
} from '../services/authService';
import { supabase } from '../supabaseClient';


const AppContext = createContext();

// Initial Menu Data - Moved outside component
const initialMenu = [
  { id: 1, name: 'Masala Dosa', price: 120, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400', available: true, benefits: 'Fermented delight' },
  { id: 2, name: 'Idli Vada', price: 90, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400', available: true, benefits: 'Steamed perfection' },
  { id: 3, name: 'Schezwan Noodles', price: 180, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400', available: true, benefits: 'Spicy kick' },
  { id: 4, name: 'Manchurian', price: 160, category: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400', available: true, benefits: 'Crunchy bites' },
  { id: 5, name: 'Sushi Roll', price: 350, category: 'Japanese', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400', available: true, benefits: 'Fresh catch' },
  { id: 6, name: 'Butter Chicken', price: 280, category: 'North Indian', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400', available: true, benefits: 'Creamy goodness' },
  { id: 7, name: 'Chicken Shawarma', price: 150, category: 'Arabic', image: 'https://images.unsplash.com/photo-1631515243349-e960b796303d?auto=format&fit=crop&w=400', available: true, benefits: 'Juicy bites' },
  { id: 8, name: 'Hummus & Pita', price: 120, category: 'Arabic', image: 'https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=400', available: true, benefits: 'Healthy dip' },
  { id: 9, name: 'Paneer Tikka', price: 220, category: 'North Indian', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400', available: true, benefits: 'Smoky flavor' },
  { id: 10, name: 'Hakka Noodles', price: 170, category: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400', available: true, benefits: 'Classic wok toss' },
  { id: 11, name: 'Gulab Jamun', price: 80, category: 'Dessert', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400', available: true, benefits: 'Sweet rose dumplings' },
  { id: 12, name: 'Mango Lassi', price: 90, category: 'Beverage', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400', available: true, benefits: 'Chilled mango yogurt' },
  { id: 13, name: 'Spring Rolls', price: 140, category: 'Chinese', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400', available: true, benefits: 'Crispy veggie pockets' },
  { id: 14, name: 'Filter Coffee', price: 40, category: 'Beverage', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400', available: true, benefits: 'Aromatic brew' },
  { id: 15, name: 'Dal Makhani', price: 200, category: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=400', available: true, benefits: 'Slow-cooked lentil' },
  { id: 16, name: 'Falafel Wrap', price: 130, category: 'Arabic', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=400', available: true, benefits: 'Crispy chickpea wrap' }
];

export function AppProvider({ children }) {
  // --- STATE ---
  //const [tables, setTables] = useState([]);
  //const addTable = (tableNo) => {
  //setTables(prev => {
  //  if (prev.includes(tableNo)) return prev;
  //return [...prev, tableNo];
  //});
  //};

  //const removeTable = (tableNo) => {
  //  setTables(prev => prev.filter(t => t !== tableNo));
  //};
  const [tables, setTables] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

  // Translation helper
  const t = (key) => {
    // console.log(`Translating ${key} to ${language}:`, translations[language]?.[key]);
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };


  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user", e);
        return null;
      }
    }
    return null;
  });

  // Handle session cleanup on mount
  useEffect(() => {
    if (user && user.role !== 'MANAGER') {
      localStorage.removeItem('activeManager');
    } else if (!user) {
      localStorage.removeItem('activeManager');
    }
  }, [user]);

  const [menuItems, setMenuItems] = useState([]);

  //const [menuItems, setMenuItems] = useState(() => {
  //  const saved = localStorage.getItem('menuItems');
  //return saved ? JSON.parse(saved) : initialMenu;
  //});

  const [orders, setOrders] = useState([]);

  //    const [tables] = useState([1, 2, 3, 4, 5, 6, 7, 8]); // Mock tables

  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('feedbacks');
    return saved ? JSON.parse(saved) : [];
  });

  // Waiters and Kitchen Staff Management
  // Staff state - now managed by Supabase
  const [waiters, setWaiters] = useState([]);
  const [kitchenStaff, setKitchenStaff] = useState([]);
  const [subManagers, setSubManagers] = useState([]);
  const [managers, setManagers] = useState([]);

  //const [kitchenStaff, setKitchenStaff] = useState(() => {
  //  const saved = localStorage.getItem('kitchenStaff');
  //return saved ? JSON.parse(saved) : [];
  //});

  // --- EFFECT: PERSISTENCE ---

  useEffect(() => {
    const unsubscribe = listenToMenu((data) => {
      if (data && data.length > 0) {
        setMenuItems(data);
      } else {
        // DB is empty, seed it!
        // We set local state immediately to avoid flicker, AND push to DB
        setMenuItems(initialMenu);
        initialMenu.forEach(item => {
          // remove id to let firestore generate it, or keep it if specific IDs needed.
          // We'll keep the custom ID field but firestore will have its own doc ID.
          addMenuItemToDB(item);
        });
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    const unsubscribe = listenToOrders(setOrders);
    return () => unsubscribe();
  }, []);

  // One-time migration of local orders to Firestore
  useEffect(() => {
    const localOrders = localStorage.getItem('orders');
    if (localOrders) {
      try {
        const parsedOrders = JSON.parse(localOrders);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          // eslint-disable-next-line no-console
          console.log("Migrating " + parsedOrders.length + " orders to Firestore...");
          parsedOrders.forEach((order) => {
            // Only add if it doesn't look like it has a firestore ID yet (though local ones definitely won't)
            addOrderToDB(order);
          });
          // Clear local storage to prevent re-migration
          localStorage.removeItem('orders');
        }
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Listen to Waiters (Supabase)
  useEffect(() => {
    const fetchWaiters = async () => {
      const result = await getStaffByRole('WAITER');
      if (result.success) {
        // Transform to match expected format
        const transformed = result.data.map(w => ({
          docId: w.id,
          id: w.staff_id,
          name: w.name,
          profilePhoto: w.profile_photo,
          secretID: w.secret_id
        }));
        setWaiters(transformed);
      }
    };

    fetchWaiters();

    // Subscribe to real-time changes
    const subscription = subscribeToStaffChanges('WAITER', () => {
      fetchWaiters();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to Kitchen Staff (Supabase)
  useEffect(() => {
    const fetchKitchenStaff = async () => {
      const result = await getStaffByRole('KITCHEN');
      if (result.success) {
        const transformed = result.data.map(k => ({
          docId: k.id,
          id: k.staff_id,
          name: k.name,
          profilePhoto: k.profile_photo,
          secretID: k.secret_id
        }));
        setKitchenStaff(transformed);
      }
    };

    fetchKitchenStaff();

    const subscription = subscribeToStaffChanges('KITCHEN', () => {
      fetchKitchenStaff();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to Sub-Managers (Supabase)
  useEffect(() => {
    const fetchSubManagers = async () => {
      const result = await getStaffByRole('SUB_MANAGER');
      if (result.success) {
        const transformed = result.data.map(sm => ({
          docId: sm.id,
          id: sm.staff_id,
          name: sm.name,
          profilePhoto: sm.profile_photo,
          secretID: sm.secret_id
        }));
        setSubManagers(transformed);
      }
    };

    fetchSubManagers();

    const subscription = subscribeToStaffChanges('SUB_MANAGER', () => {
      fetchSubManagers();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to Managers (Supabase)
  useEffect(() => {
    const fetchManagers = async () => {
      const result = await getStaffByRole('MANAGER');

      if (result.success) {
        console.log("📊 Managers loaded from Supabase:", result.data);

        if (result.data && result.data.length > 0) {
          console.log("✅ Found", result.data.length, "manager(s) in database");

          // Check if Shreyas manager exists
          const shreyasManager = result.data.find(m => m.staff_id === "MGR5710");

          if (shreyasManager) {
            // Transform and set managers
            const transformed = result.data.map(m => ({
              docId: m.id,
              id: m.staff_id,
              name: m.name,
              profilePhoto: m.profile_photo,
              secretID: m.secret_id
            }));
            setManagers(transformed);
            console.log("✅ Shreyas manager found");
          } else {
            // Create Shreyas manager
            console.log("⚠️ Shreyas manager not found, creating...");
            const shreyasManagerData = {
              staff_id: "MGR5710",
              role: "MANAGER",
              name: "SHREYAS",
              secret_id: "5710",
              profile_photo: "",
              email: ""
            };
            createStaffAccount(shreyasManagerData)
              .then(() => {
                console.log("✅ Shreyas manager created successfully!");
                fetchManagers(); // Refetch after creation
              })
              .catch((error) => {
                console.error("❌ Error creating Shreyas manager:", error);
              });
          }
        } else {
          console.log("⚠️ No managers found, creating Shreyas manager...");
          const shreyasManagerData = {
            staff_id: "MGR5710",
            role: "MANAGER",
            name: "SHREYAS",
            secret_id: "5710",
            profile_photo: "",
            email: ""
          };
          createStaffAccount(shreyasManagerData)
            .then(() => {
              console.log("✅ Shreyas manager created successfully!");
              fetchManagers();
            })
            .catch((error) => {
              console.error("❌ Error creating Shreyas manager:", error);
            });
        }
      }
    };

    fetchManagers();

    const subscription = subscribeToStaffChanges('MANAGER', () => {
      fetchManagers();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  //useEffect(() => {
  //  localStorage.setItem('kitchenStaff', JSON.stringify(kitchenStaff));
  //}, [kitchenStaff]);


  // --- NOTIFICATIONS SYSTEM ---
  const prevOrdersRef = useRef([]);
  const isFirstOrderLoad = useRef(true);

  useEffect(() => {
    // Skip if no orders yet (avoids empty checks) or if user not logged in (optional)
    // We strictly want to avoid playing sound on the very first hydration of orders.
    if (orders.length === 0) return;

    if (isFirstOrderLoad.current) {
      prevOrdersRef.current = orders;
      isFirstOrderLoad.current = false;
      return;
    }

    // Check for NEW orders (Kitchen)
    // An order is new if it's in 'orders' but not in 'prevOrdersRef'
    const newOrders = orders.filter(o => !prevOrdersRef.current.find(po => po.id === o.id));
    const hasNewPendingOrders = newOrders.some(o => o.status === 'pending');

    if (hasNewPendingOrders && user?.role === 'KITCHEN') {
      // Play "New Order" Sound
      playUrgentNotificationSound();
    }

    // Check for STATUS CHANGES (Waiter)
    // Order was pending, now is ready
    const readyOrders = orders.filter(o => {
      const prev = prevOrdersRef.current.find(po => po.id === o.id);
      return prev && prev.status !== 'ready' && o.status === 'ready';
    });

    if (readyOrders.length > 0 && user?.role === 'WAITER') {
      // Play "Order Ready" Sound
      playNotificationSound();
    }

    // Update ref
    prevOrdersRef.current = orders;

  }, [orders, user]); // Re-run when orders change or user login changes (though mostly orders)

  // --- ACTIONS ---
  // Login with Supabase
  const login = async (role, staffId, secretId = null, name = null) => {
    try {
      const result = await loginStaff(role, staffId, secretId, name);

      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error in AppContext:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout with Supabase
  const logout = () => {
    logoutStaff();
    setUser(null);
  };

  // Restore session - logic moved to useState lazy init
  // Keeping this empty or removed if no other logic needed. 
  // We already handled cleanup in the useEffect above.
  const addMenuItem = async (item) => {
    await addMenuItemToDB(item);
  };


  //const addMenuItem = (item) => {
  //  const newItem = { ...item, id: Date.now(), available: true };
  //setMenuItems([...menuItems, newItem]);
  //};

  const updateMenuItem = async (id, updatedItem) => {
    // Optimistic update
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    try {
      await updateMenuItemInDB(id, updatedItem);
    } catch (error) {
      console.error("Failed to update menu item:", error);
    }
  };

  const updateMenuItemStatus = async (id, available) => {
    // Optimistic update
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available } : item));
    try {
      await updateMenuItemInDB(id, { available });
    } catch (error) {
      console.error("Failed to update menu item status:", error);
    }
  };

  const deleteMenuItem = async (id) => {
    // Optimistic update
    setMenuItems(prev => prev.filter(item => item.id !== id));
    try {
      await deleteMenuItemFromDB(id);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const placeOrder = async (tableNo, items, customerInfo) => {
    // Validate inputs
    if (!tableNo || !items || items.length === 0) {
      console.error('Invalid order data');
      throw new Error("Invalid order data");
    }

    const newOrder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tableNo: String(tableNo).trim(),
      items: items.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })),
      customerInfo: customerInfo || {},
      status: 'pending',
      timestamp: new Date().toISOString(),
      totalAmount: items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        return sum + (price * qty);
      }, 0)
    };

    try {
      await addOrderToDB(newOrder);
      return newOrder;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.docId) {
      await updateOrderInDB(order.docId, { status });
    }
  };

  const deleteOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.docId) {
      await deleteOrderFromDB(order.docId);
    }
  };

  const addFeedback = (feedback) => {
    const newFeedback = {
      id: Date.now().toString(),
      ...feedback,
      timestamp: new Date().toISOString()
    };
    // Use functional update to avoid stale closure
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  // Generate unique secret ID (5 characters)
  const generateSecretID = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like I,1,O,0
    let secret = '';
    for (let i = 0; i < 5; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  // Staff Management with Supabase
  const addWaiter = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const staffData = {
      staff_id: `W-${shortIdSuffix}`,
      role: 'WAITER',
      name: name.trim(),
      profile_photo: profilePhoto,
      secret_id: secretID
    };
    const result = await createStaffAccount(staffData);
    if (result.success) {
      return secretID;
    } else {
      throw new Error(result.error);
    }
  };

  const removeWaiter = async (profileId) => {
    const result = await deleteStaffAccount(profileId);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const addKitchenStaff = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const staffData = {
      staff_id: `K-${shortIdSuffix}`,
      role: 'KITCHEN',
      name: name.trim(),
      profile_photo: profilePhoto,
      secret_id: secretID
    };
    const result = await createStaffAccount(staffData);
    if (result.success) {
      return secretID;
    } else {
      throw new Error(result.error);
    }
  };

  const removeKitchenStaff = async (profileId) => {
    const result = await deleteStaffAccount(profileId);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const addSubManager = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const staffData = {
      staff_id: `SM-${shortIdSuffix}`,
      role: 'SUB_MANAGER',
      name: name.trim(),
      profile_photo: profilePhoto,
      secret_id: secretID
    };
    const result = await createStaffAccount(staffData);
    if (result.success) {
      return secretID;
    } else {
      throw new Error(result.error);
    }
  };

  const removeSubManager = async (profileId) => {
    const result = await deleteStaffAccount(profileId);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const addManager = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const staffData = {
      staff_id: `MGR-${shortIdSuffix}`,
      role: 'MANAGER',
      name: name.trim(),
      profile_photo: profilePhoto,
      secret_id: secretID
    };
    const result = await createStaffAccount(staffData);
    if (result.success) {
      return secretID;
    } else {
      throw new Error(result.error);
    }
  };

  const removeManager = async (profileId) => {
    const result = await deleteStaffAccount(profileId);
    if (!result.success) {
      throw new Error(result.error);
    }
  };
  useEffect(() => {
    const unsubscribe = listenToTables(setTables);
    return () => unsubscribe();
  }, []);
  const addTable = async (tableNo) => {
    if (!tableNo) return;
    await addTableToDB(tableNo);
  };

  const removeTable = async (docId) => {
    await removeTableFromDB(docId);
  };

  const updateTableStatus = async (docId, status) => {
    await updateTableStatusInDB(docId, status);
  };



  // validateSecretID removed - now handled by Supabase authService

  return (
    <AppContext.Provider value={{
      user, login, logout,
      menuItems, addMenuItem, updateMenuItem, updateMenuItemStatus, deleteMenuItem,
      orders, placeOrder, updateOrderStatus, deleteOrder,

      tables,
      addTable,
      removeTable,
      updateTableStatus,

      feedbacks, addFeedback,
      waiters, addWaiter, removeWaiter,
      kitchenStaff, addKitchenStaff, removeKitchenStaff,
      subManagers, addSubManager, removeSubManager,
      managers, addManager, removeManager,
      language, setLanguage, t, translations,
      theme, toggleTheme
    }}>

      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
