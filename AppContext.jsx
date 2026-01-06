import { createContext, useContext, useState, useEffect } from 'react';
import { listenToMenu, addMenuItemToDB } from "../services/menuService";
import { saveManagerToDB } from "../services/managerService";
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
    removeTableFromDB
  } from "../services/tableService";
     

const AppContext = createContext();

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


    const [user, setUser] = useState(null); // { name, id, role }

    // Initial Menu Data
    const initialMenu = [
        { id: 1, name: 'Masala Dosa', price: 120, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400', available: true, benefits: 'Fermented delight' },
        { id: 2, name: 'Idli Vada', price: 90, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400', available: true, benefits: 'Steamed perfection' },
        { id: 3, name: 'Schezwan Noodles', price: 180, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400', available: true, benefits: 'Spicy kick' },
        { id: 4, name: 'Manchurian', price: 160, category: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400', available: true, benefits: 'Crunchy bites' },
        { id: 5, name: 'Sushi Roll', price: 350, category: 'Japanese', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400', available: true, benefits: 'Fresh catch' },
        { id: 6, name: 'Butter Chicken', price: 280, category: 'North Indian', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400', available: true, benefits: 'Creamy goodness' },
    ];
    const [menuItems, setMenuItems] = useState([]);

    //const [menuItems, setMenuItems] = useState(() => {
      //  const saved = localStorage.getItem('menuItems');
        //return saved ? JSON.parse(saved) : initialMenu;
    //});

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    });

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

    //const [kitchenStaff, setKitchenStaff] = useState(() => {
      //  const saved = localStorage.getItem('kitchenStaff');
        //return saved ? JSON.parse(saved) : [];
    //});

    // --- EFFECT: PERSISTENCE ---
    
    useEffect(() => {
        const unsubscribe = listenToMenu(setMenuItems);
        return () => unsubscribe();
      }, []);
      useEffect(() => {
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }, [menuItems]);

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

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
        const unsubscribe = listenToKitchenStaff(setKitchenStaff);
        return () => unsubscribe();
      }, []);
      
    //useEffect(() => {
      //  localStorage.setItem('kitchenStaff', JSON.stringify(kitchenStaff));
    //}, [kitchenStaff]);

    // --- ACTIONS ---
    const login = async (userData) => {
        if (userData.role === "MANAGER") {
          const activeManager = localStorage.getItem("activeManager");
          if (activeManager && activeManager !== userData.id) {
            throw new Error("Another manager is already logged in");
          }
          localStorage.setItem("activeManager", userData.id);
      
          // 🔥 SAVE MANAGER TO FIRESTORE
          await saveManagerToDB(userData);
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

    // Restore session
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            // If restored user is not a manager, clear any stale manager session
            if (userData.role !== 'MANAGER') {
                localStorage.removeItem('activeManager');
            }
        } else {
            // If no user is logged in, clear any stale manager session
            localStorage.removeItem('activeManager');
        }
    }, []);
    const addMenuItem = async (item) => {
        await addMenuItemToDB(item);
      };
      

    //const addMenuItem = (item) => {
      //  const newItem = { ...item, id: Date.now(), available: true };
        //setMenuItems([...menuItems, newItem]);
    //};

    const updateMenuItem = (id, updatedItem) => {
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    };

    const updateMenuItemStatus = (id, available) => {
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available } : item));
    };

    const deleteMenuItem = (id) => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    const placeOrder = (tableNo, items, customerInfo) => {
        // Validate inputs
        if (!tableNo || !items || items.length === 0) {
            console.error('Invalid order data');
            return;
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
        
        // Use functional update to avoid stale closure
        setOrders(prev => [...prev, newOrder]);
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
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

    // Generate unique secret ID
    const generateSecretID = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let secret = '';
        for (let i = 0; i < 8; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    };

    const addWaiter = async (name) => {
        const secretID = generateSecretID();
        const waiter = {
          id: `WAITER-${Date.now()}`,
          name: name.trim(),
          secretID
        };
        await addWaiterToDB(waiter);
        return secretID;
      };
      // Waiter Management
    //const addWaiter = (name) => {
      //  const secretID = generateSecretID();
        //const newWaiter = {
          //  id: `WAITER-${Date.now()}`,
            //name: name.trim(),
            //secretID,
            //createdAt: new Date().toISOString()
        //};
        //setWaiters(prev => [...prev, newWaiter]);
        //return secretID; // Return secret ID to display immediately
    //};

    const removeWaiter = async (docId) => {
        await removeWaiterFromDB(docId);
      };
      
    //const removeWaiter = (id) => {
      //  setWaiters(prev => prev.filter(waiter => waiter.id !== id));
    //};

    const addKitchenStaff = async (name) => {
        const secretID = generateSecretID();
        const staff = {
          id: `KITCHEN-${Date.now()}`,
          name: name.trim(),
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
      

    // Validate secret ID for login
    const validateSecretID = (role, id, secretID) => {
        if (role === 'WAITER') {
            // Case-insensitive ID matching
            const waiter = waiters.find(w => 
                w.id.toUpperCase() === id.toUpperCase() && 
                w.secretID.toUpperCase() === secretID.toUpperCase()
            );
            return waiter ? { name: waiter.name, id: waiter.id } : null;
        } else if (role === 'KITCHEN') {
            // Case-insensitive ID matching
            const staff = kitchenStaff.find(s => 
                s.id.toUpperCase() === id.toUpperCase() && 
                s.secretID.toUpperCase() === secretID.toUpperCase()
            );
            return staff ? { name: staff.name, id: staff.id } : null;
        }
        return null;
    };

    return (
      <AppContext.Provider value={{
        user, login, logout,
        menuItems, addMenuItem, updateMenuItem, updateMenuItemStatus, deleteMenuItem,
        orders, placeOrder, updateOrderStatus,
    
        tables,
        addTable,
        removeTable,
    
        feedbacks, addFeedback,
        waiters, addWaiter, removeWaiter,
        kitchenStaff, addKitchenStaff, removeKitchenStaff,
        validateSecretID
    }}>
    
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
