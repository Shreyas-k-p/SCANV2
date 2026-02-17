import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, X, Info, Trash2, Plus, Minus, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Menu.css';

export default function CustomerMenu() {
    const [searchParams] = useSearchParams();
    const tableIdFromUrl = searchParams.get('table');

    const { menuItems, placeOrder, orders } = useApp();
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);

    const [tableNumber, setTableNumber] = useState(tableIdFromUrl || '');

    useEffect(() => {
        if (tableIdFromUrl) {
            setTableNumber(tableIdFromUrl);
            localStorage.setItem('customerTableNumber', tableIdFromUrl);
        } else {
            const saved = localStorage.getItem('customerTableNumber');
            if (saved) setTableNumber(saved);
        }
    }, [tableIdFromUrl]);

    const [myOrderIds, setMyOrderIds] = useState(() => {
        const saved = localStorage.getItem('myOrderIds');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [instructions, setInstructions] = useState('');

    const categories = ['All', ...new Set((menuItems || []).map(item => item.category))];

    const filteredItems = activeCategory === 'All'
        ? (menuItems || [])
        : (menuItems || []).filter(item => item.category === activeCategory);

    const handleItemClick = (item) => {
        if (item.available !== false) {
            setSelectedItem(item);
        }
    };

    const addToCart = (item, quantity = 1, notes = '') => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity, notes } : i));
        } else {
            setCart([...cart, { ...item, quantity, notes }]);
        }
        setSelectedItem(null);
        toast.success(`${item.name} added to cart`);
    };

    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(index);
            return;
        }
        const newCart = [...cart];
        newCart[index].quantity = newQuantity;
        setCart(newCart);
    };

    const removeItem = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    const submitOrder = async () => {
        if (!tableNumber) {
            toast.error('Table number is missing!');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            const newOrder = await placeOrder(tableNumber, cart, { instructions });

            setCart([]);
            setShowCart(false);
            setInstructions('');

            const updatedOrderIds = [...myOrderIds, newOrder.id];
            setMyOrderIds(updatedOrderIds);
            localStorage.setItem('myOrderIds', JSON.stringify(updatedOrderIds));

            toast.success('Order placed successfully! Kitchen notified.');
            setShowOrders(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to place order. Please try again.');
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const myOrdersList = (orders || []).filter(o =>
        myOrderIds.includes(o.id) && String(o.tableNo) === String(tableNumber || '')
    ).sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f97316';
            case 'preparing': return '#3b82f6';
            case 'ready': return '#10b981';
            case 'served': return '#6b7280';
            default: return '#6b7280';
        }
    };

    return (
        <div className="menu-page-container">
            <header className="sticky-header" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem',
                background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', zIndex: 100
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        🍽️ Menu <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>(Table {tableNumber || '?'})</span>
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                        {filteredItems.length} items available
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowOrders(true)}
                        style={{ padding: '8px 12px', borderRadius: '12px', border: 'none', background: '#f0f9ff', color: '#0ea5e9', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <ClipboardList size={18} />
                    </button>

                    <button
                        onClick={() => setShowCart(true)}
                        style={{ position: 'relative', padding: '8px 12px', borderRadius: '12px', border: 'none', background: 'var(--gradient-primary)', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <ShoppingCart size={18} />
                        {cart.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>{cart.length}</span>}
                    </button>
                </div>
            </header>

            <div className="category-scroll-container" style={{ padding: '0 1rem 1rem 1rem', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            background: activeCategory === cat ? 'var(--gradient-primary)' : '#f3f4f6',
                            color: activeCategory === cat ? 'white' : '#374151',
                            whiteSpace: 'nowrap',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="card-grid" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        style={{
                            background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s', cursor: 'pointer', position: 'relative'
                        }}
                    >
                        <div style={{ height: '140px', overflow: 'hidden' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {item.available === false && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>SOLD OUT</div>
                        )}
                        <div style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>{item.name}</h3>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0ea5e9' }}>₹{item.price}</div>
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.benefits}
                            </p>
                        </div>
                        <button style={{
                            width: '100%', padding: '10px', border: 'none', background: '#f9fafb', color: '#0ea5e9', fontWeight: '600',
                            borderTop: '1px solid #f3f4f6'
                        }}>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {showCart && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', background: 'white', borderRadius: '24px 24px 0 0', padding: '20px', maxHeight: '80vh', overflowY: 'auto', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Your Cart</h2>
                            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none' }}><X /></button>
                        </div>

                        {cart.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Cart is empty</p>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>₹{item.price} x {item.quantity}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => updateQuantity(idx, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white' }}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(idx, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white' }}>+</button>
                                    </div>
                                </div>
                            ))
                        )}

                        {cart.length > 0 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', margin: '20px 0' }}>
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <textarea
                                    placeholder="Special instructions..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px', fontSize: '0.9rem' }}
                                />
                                <button
                                    onClick={submitOrder}
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem' }}
                                >
                                    Place Order - ₹{cartTotal}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showOrders && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', background: 'white', borderRadius: '24px 24px 0 0', padding: '20px', maxHeight: '80vh', overflowY: 'auto', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>My Orders</h2>
                            <button onClick={() => setShowOrders(false)} style={{ background: 'none', border: 'none' }}><X /></button>
                        </div>

                        {myOrdersList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                <Info size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>No active orders found.</p>
                            </div>
                        ) : (
                            myOrdersList.map((order) => (
                                <div key={order.id} style={{ marginBottom: '15px', padding: '15px', borderRadius: '12px', border: '1px solid #f3f4f6', background: '#f9fafb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Order #{typeof order.id === 'string' ? order.id.slice(-4) : order.id}</span>
                                        <span style={{
                                            background: getStatusColor(order.status), color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '10px' }}>
                                        {/* Items List */}
                                        {order.items.map((i, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{i.quantity}x {i.name}</span>
                                                <span>₹{i.price * i.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                                        <span>Total</span>
                                        <span>₹{order.totalAmount}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '5px' }}>
                                        {new Date(order.createdAt || order.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {selectedItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ height: '200px' }}>
                            <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h2 style={{ margin: '0 0 10px 0' }}>{selectedItem.name}</h2>
                            <p style={{ color: '#6b7280', lineHeight: 1.5 }}>{selectedItem.benefits}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0ea5e9' }}>₹{selectedItem.price}</div>
                                <button
                                    onClick={() => addToCart(selectedItem, 1)}
                                    style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 'bold' }}
                                >
                                    Add to Order
                                </button>
                            </div>
                            <button onClick={() => setSelectedItem(null)} style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '12px' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
