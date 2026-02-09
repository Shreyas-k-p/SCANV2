import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { listenToMenu, addMenuItemToDB, updateMenuItemInDB, deleteMenuItemFromDB } from "../services/menuService";
import {
  addManagerToDB,
  listenToManagers,
  removeManagerFromDB
} from "../services/managerService";
import {
  addWaiterToDB,
  listenToWaiters,
  removeWaiterFromDB
} from "../services/waiterService";
import {
  addKitchenStaffToDB,
  listenToKitchenStaff,
  removeKitchenStaffFromDB
} from "../services/kitchenService";
import {
  addTableToDB,
  listenToTables,
  removeTableFromDB,
  updateTableStatusInDB
} from "../services/tableService";
import {
  addSubManagerToDB,
  listenToSubManagers,
  removeSubManagerFromDB
} from "../services/subManagerService";
import { addOrderToDB, listenToOrders, updateOrderInDB, deleteOrderFromDB } from "../services/orderService";
import { translations } from '../utils/translations';
import { playNotificationSound, playUrgentNotificationSound } from '../utils/soundUtils';


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
  const [waiters, setWaiters] = useState([]);
  // const [waiters, setWaiters] = useState(() => {
  //   const saved = localStorage.getItem('waiters');
  // return saved ? JSON.parse(saved) : [];
  //});

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

  useEffect(() => {
    const unsubscribe = listenToWaiters(setWaiters);
    return () => unsubscribe();
  }, []);
  // useEffect(() => {
  //   localStorage.setItem('waiters', JSON.stringify(waiters));
  //}, [waiters]);

  useEffect(() => {
    const unsubscribe = listenToKitchenStaff((data) => {
      if (data && data.length > 0) {
        setKitchenStaff(data);
      } else {
        // Optional: Seed a default kitchen staff if empty so the collection exists
        const defaultChef = {
          id: `KITCHEN-${Date.now()}`,
          name: "Head Chef Robot",
          secretID: "CHEF123"
        };
        addKitchenStaffToDB(defaultChef);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToSubManagers(setSubManagers);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToManagers((data) => {
      console.log("📊 Managers loaded from Firebase:", data);

      // Always ensure only ONE manager exists - Shreyas
      if (data && data.length > 0) {
        console.log("✅ Found", data.length, "manager(s) in database");

        // Check if Shreyas manager exists
        const shreyasManager = data.find(m => m.id === "MGR5710");

        if (shreyasManager) {
          // Only keep Shreyas manager
          setManagers([shreyasManager]);
          console.log("✅ Shreyas manager found and set as the only manager");
        } else {
          // Create Shreyas manager
          console.log("⚠️ Shreyas manager not found, creating...");
          const shreyasManagerData = {
            id: "MGR5710",
            name: "SHREYAS",
            secretID: "5710",
            profilePhoto: "",
            email: ""
          };
          addManagerToDB(shreyasManagerData)
            .then(() => {
              console.log("✅ Shreyas manager created successfully!");
            })
            .catch((error) => {
              console.error("❌ Error creating Shreyas manager:", error);
            });
        }
      } else {
        console.log("⚠️ No managers found, creating Shreyas manager...");
        // Create Shreyas as the only manager
        const shreyasManagerData = {
          id: "MGR5710",
          name: "SHREYAS",
          secretID: "5710",
          profilePhoto: "",
          email: ""
        };
        console.log("🔧 Creating Shreyas manager:", shreyasManagerData);
        addManagerToDB(shreyasManagerData)
          .then(() => {
            console.log("✅ Shreyas manager created successfully!");
          })
          .catch((error) => {
            console.error("❌ Error creating Shreyas manager:", error);
          });
      }
    });
    return () => unsubscribe();
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
  const login = async (userData) => {
    if (userData.role === "MANAGER") {
      const activeManager = localStorage.getItem("activeManager");
      if (activeManager && activeManager !== userData.id) {
        throw new Error("Another manager is already logged in");
      }
      localStorage.setItem("activeManager", userData.id);
    }

    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };


  const logout = () => {
    // Clear manager session if manager is logging out
    if (user?.role === 'MANAGER') {
      localStorage.removeItem('activeManager');
    }
    setUser(null);
    localStorage.removeItem('currentUser');
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

  const addWaiter = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    // Generate a simple 5-digit ID suffix
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const waiter = {
      id: `W-${shortIdSuffix}`,
      name: name.trim(),
      profilePhoto,
      secretID
    };
    await addWaiterToDB(waiter);
    return secretID;
  };

  const removeWaiter = async (docId) => {
    await removeWaiterFromDB(docId);
  };

  const addKitchenStaff = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    // Generate a simple 5-digit ID suffix
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const staff = {
      id: `K-${shortIdSuffix}`,
      name: name.trim(),
      profilePhoto,
      secretID
    };
    await addKitchenStaffToDB(staff);
    return secretID;
  };

  // Kitchen Staff Management
  //const addKitchenStaff = (name) => {
  //  const secretID = generateSecretID();
  //const newStaff = {
  //  id: `KITCHEN-${Date.now()}`,
  //name: name.trim(),
  //secretID,
  //createdAt: new Date().toISOString()
  //};
  //setKitchenStaff(prev => [...prev, newStaff]);
  //return secretID; // Return secret ID to display immediately
  //};

  //const removeKitchenStaff = (id) => {
  //  setKitchenStaff(prev => prev.filter(staff => staff.id !== id));
  //};

  const removeKitchenStaff = async (docId) => {
    await removeKitchenStaffFromDB(docId);
  };

  const addSubManager = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const subManager = {
      id: `SM-${shortIdSuffix}`,
      name: name.trim(),
      profilePhoto,
      secretID
    };
    await addSubManagerToDB(subManager);
    return secretID;
  };

  const removeSubManager = async (docId) => {
    await removeSubManagerFromDB(docId);
  };

  const addManager = async (name, profilePhoto = '') => {
    const secretID = generateSecretID();
    const shortIdSuffix = Math.floor(10000 + Math.random() * 90000);
    const manager = {
      id: `MGR-${shortIdSuffix}`,
      name: name.trim(),
      profilePhoto,
      secretID
    };
    await addManagerToDB(manager);
    return secretID;
  };

  const removeManager = async (docId) => {
    await removeManagerFromDB(docId);
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


  // Validate secret ID for login
  const validateSecretID = (role, id, secretID) => {
    console.log("🔐 Validating credentials:", { role, id, secretID });

    // Safety checks for input parameters
    if (!id || !secretID) {
      console.log("❌ Missing id or secretID");
      return null;
    }

    if (role === 'WAITER') {
      console.log("👨‍🍳 Checking waiters:", waiters);
      // Case-insensitive ID matching with null checks
      const waiter = waiters.find(w =>
        w?.id?.toUpperCase() === id.toUpperCase() &&
        w?.secretID?.toUpperCase() === secretID.toUpperCase()
      );
      console.log("Waiter found:", waiter);
      return waiter ? { name: waiter.name, id: waiter.id, profilePhoto: waiter.profilePhoto } : null;
    } else if (role === 'KITCHEN') {
      console.log("🍳 Checking kitchen staff:", kitchenStaff);
      // Case-insensitive ID matching with null checks
      const staff = kitchenStaff.find(s =>
        s?.id?.toUpperCase() === id.toUpperCase() &&
        s?.secretID?.toUpperCase() === secretID.toUpperCase()
      );
      console.log("Kitchen staff found:", staff);
      return staff ? { name: staff.name, id: staff.id, profilePhoto: staff.profilePhoto } : null;
    } else if (role === 'SUB_MANAGER') {
      console.log("🤵 Checking sub managers:", subManagers);
      const sm = subManagers.find(s =>
        s?.id?.toUpperCase() === id.toUpperCase() &&
        s?.secretID?.toUpperCase() === secretID.toUpperCase()
      );
      console.log("Sub manager found:", sm);
      return sm ? { name: sm.name, id: sm.id, profilePhoto: sm.profilePhoto } : null;
    } else if (role === 'MANAGER') {
      console.log("👔 Checking managers:", managers);
      console.log("Looking for ID:", id.toUpperCase(), "Secret:", secretID.toUpperCase());
      const manager = managers.find(m => {
        console.log("Comparing with manager:", m);
        const idMatch = m?.id?.toUpperCase() === id.toUpperCase();
        const secretMatch = m?.secretID?.toUpperCase() === secretID.toUpperCase();
        console.log("ID match:", idMatch, "Secret match:", secretMatch);
        return idMatch && secretMatch;
      });
      console.log("Manager found:", manager);
      return manager ? { name: manager.name, id: manager.id, profilePhoto: manager.profilePhoto } : null;
    }
    return null;
  };

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
      validateSecretID,
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
