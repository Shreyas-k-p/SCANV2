import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, X, Info, Trash2, Plus, Minus, ClipboardList, Clock, CheckCircle, AlertCircle, ShoppingBag, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Menu.css';

export default function CustomerMenu() {
    const { tableNo } = useParams(); // Using URL parameters instead of search params for /table/:tableNo

    const { menuItems, menuLoading, placeOrder, getMyOrders, cancelOrder, t } = useApp();
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [myLiveOrders, setMyLiveOrders] = useState([]);

    const tableNumber = tableNo || localStorage.getItem('customerTableNumber') || '';

    useEffect(() => {
        if (tableNo) localStorage.setItem('customerTableNumber', tableNo);
    }, [tableNo]);

    const [myOrderIds, setMyOrderIds] = useState(() => {
        const saved = localStorage.getItem('myOrderIds');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const refreshMyOrders = async () => {
        if (myOrderIds.length > 0) {
            try {
                const liveData = await getMyOrders(myOrderIds);
                setMyLiveOrders(liveData || []);
            } catch (err) {
                console.error("Failed to refresh orders in CustomerMenu:", err);
            }
        }
    };

    useEffect(() => {
        refreshMyOrders();
        const interval = setInterval(refreshMyOrders, 5000); // Poll every 5s for better real-time feel
        return () => clearInterval(interval);
    }, [myOrderIds]);

    if (menuLoading) {
        return <div className="loading-state">Syncing Menu...</div>;
    }

    const categories = ['All', ...new Set((menuItems || []).map(item => item.category))];
    const filteredItems = (activeCategory === 'All')
        ? (menuItems || [])
        : (menuItems || []).filter(item => item.category === activeCategory);

    const handleItemClick = (item) => {
        if (item.available !== false) setSelectedItem(item);
    };

    const addToCart = (item, quantity = 1, notes = '') => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity, notes } : i));
        } else {
            setCart([...cart, { ...item, quantity, notes }]);
        }
        setSelectedItem(null);
        toast.success(`${t(item.name)} added`);
    };

    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            const newCart = cart.filter((_, i) => i !== index);
            setCart(newCart);
            return;
        }
        const newCart = [...cart];
        newCart[index].quantity = newQuantity;
        setCart(newCart);
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const res = await cancelOrder(orderId);
            if (res.success) {
                toast.success("Order Cancelled");
                refreshMyOrders();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Network Error");
        }
    }

    const submitOrder = async () => {
        if (!tableNumber) {
            toast.error("Invalid Table Info");
            return;
        }
        if (cart.length === 0) return;

        try {
            const firstItem = menuItems[0];
            if (!firstItem) throw new Error("No menu items found");

            const newOrder = await placeOrder({
                restaurantId: firstItem.restaurantId,
                tableId: tableNumber, // Pass the ID/No
                items: cart,
                totalAmount: cart.reduce((a, b) => a + (b.price * b.quantity), 0),
                customerId: 'Session-' + Math.random().toString(36).substr(2, 5).toUpperCase()
            });

            setCart([]);
            setShowCart(false);
            const updatedIds = [...myOrderIds, newOrder.id];
            setMyOrderIds(updatedIds);
            localStorage.setItem('myOrderIds', JSON.stringify(updatedIds));
            toast.success("Order Placed!");
            setShowOrders(true);
        } catch (error) {
            console.error("Order error:", error);
            toast.error("Could not place order");
        }
    };

    return (
        <div className="menu-page-container">
            <header className="sticky-header">
                <div className="header-brand">
                    <h1 className="logo-text">Scan<span>4</span>Serve</h1>
                    <p className="table-indicator">Table {tableNumber}</p>
                </div>
                <div className="header-actions">
                    <LanguageSwitcher />
                    <button className="icon-btn" onClick={() => setShowOrders(true)}>
                        <ClipboardList size={22} />
                        {myLiveOrders.length > 0 && <span className="dot-badge"></span>}
                    </button>
                    <button className="cart-btn" onClick={() => setShowCart(true)}>
                        <ShoppingCart size={22} />
                        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
                    </button>
                </div>
            </header>

            <div className="category-scroll">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                    >
                        {t(cat) || cat}
                    </button>
                ))}
            </div>

            <main className="menu-grid">
                {filteredItems.map(item => (
                    <div key={item.id} className="menu-card" onClick={() => handleItemClick(item)}>
                        <div className="card-image">
                            <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} />
                            {item.available === false && <div className="sold-out-overlay">Sold Out</div>}
                        </div>
                        <div className="card-content">
                            <div className="card-header">
                                <h3>{t(item.name)}</h3>
                                <span className="price">₹{item.price}</span>
                            </div>
                            <p className="description">{t(item.benefits)}</p>
                        </div>
                    </div>
                ))}
            </main>

            {/* Modal Components Below */}
            {/* Same as Step 332 but with null safety on status tags */}
            <Modal isOpen={showCart} onClose={() => setShowCart(false)}>
                <div className="modal-inner">
                    <div className="modal-header">
                        <h2>Order Summary</h2>
                        <ShoppingCart size={20} />
                    </div>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <ShoppingBag size={48} color="var(--border-color)" />
                                <p>Empty Cart</p>
                            </div>
                        ) : cart.map((item, idx) => (
                            <div key={idx} className="cart-item">
                                <div className="item-details">
                                    <h4>{t(item.name)}</h4>
                                    <p>₹{item.price} x {item.quantity}</p>
                                </div>
                                <div className="item-controls">
                                    <div className="qty-stepper">
                                        <button onClick={() => updateQuantity(idx, item.quantity - 1)}><Minus size={14} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(idx, item.quantity + 1)}><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="total-row"><span>Total</span><span>₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
                            <button className="confirm-btn" onClick={submitOrder}> Place Order </button>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
                {selectedItem && (
                    <div className="modal-inner item-detail">
                        <img src={selectedItem.image} alt={selectedItem.name} />
                        <div className="detail-content">
                            <h2>{t(selectedItem.name)}</h2>
                            <p>{t(selectedItem.benefits)}</p>
                            <div className="detail-footer">
                                <span className="detail-price">₹{selectedItem.price}</span>
                                <button className="add-btn" onClick={() => addToCart(selectedItem)}> Add to Cart </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={showOrders} onClose={() => setShowOrders(false)}>
                <div className="modal-inner overflow-hidden">
                    <div className="modal-header">
                        <h2>Live Status</h2>
                        <ClipboardList size={20} />
                    </div>
                    <div className="order-list">
                        {myLiveOrders.length === 0 ? (
                            <div className="empty-orders"><p>No orders yet</p></div>
                        ) : myLiveOrders.map(order => (
                            <div key={order.id} className="order-session-card">
                                <div className="order-header">
                                    <span className="order-id">#{String(order.id).slice(-4)}</span>
                                    <span className={`status-tag ${(order.status || 'Placed').toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-footer">
                                    <span>Total: ₹{order.totalAmount || order.total_amount}</span>
                                    {(order.status === 'Placed') && <button className="cancel-text" onClick={() => handleCancelOrder(order.id)}>Cancel</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X /></button>
                {children}
            </div>
        </div>
    );
}
