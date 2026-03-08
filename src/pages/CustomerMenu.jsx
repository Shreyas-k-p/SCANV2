import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, X, Info, Trash2, Plus, Minus, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Menu.css';

export default function CustomerMenu() {
    const [searchParams] = useSearchParams();
    const tableIdFromUrl = searchParams.get('table');

    const { menuItems, menuLoading, placeOrder, orders, t } = useApp();
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);

    const [tableNumber] = useState(() => {
        if (tableIdFromUrl) {
            localStorage.setItem('customerTableNumber', tableIdFromUrl);
            return tableIdFromUrl;
        }
        return localStorage.getItem('customerTableNumber') || '';
    });

    const [myOrderIds, setMyOrderIds] = useState(() => {
        const saved = localStorage.getItem('myOrderIds');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [instructions, setInstructions] = useState('');

    const categories = ['All', ...new Set((menuItems || []).map(item => item.category))];

    const filteredItems = (activeCategory === 'All')
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
        toast.success(`${t(item.name)} ${t('addedToCart') || 'added to cart'}`);
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
        const trimmedTableNumber = tableNumber?.trim();
        if (!trimmedTableNumber) {
            toast.error(t('tableNumberRequired') || 'Table number is missing!');
            return;
        }

        if (cart.length === 0) {
            toast.error(t('cartEmpty') || 'Your cart is empty');
            return;
        }

        try {
            const newOrder = await placeOrder(trimmedTableNumber, cart);
            setCart([]);
            setShowCart(false);
            setInstructions('');
            const updatedOrderIds = [...myOrderIds, newOrder.id];
            setMyOrderIds(updatedOrderIds);
            localStorage.setItem('myOrderIds', JSON.stringify(updatedOrderIds));
            toast.success(t('orderPlacedToast') || 'Order placed! Kitchen notified.');
            setShowOrders(true);
        } catch (error) {
            console.error(error);
            toast.error(t('orderFailed') || 'Order failed');
        }
    };

    return (
        <div className="menu-page-container">
            <header className="sticky-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--accent)' }}>🍽️ {t('ourMenu')}</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{filteredItems.length} {t('items')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LanguageSwitcher />
                    <button className="btn btn-secondary interactive-btn" onClick={() => setShowOrders(true)}><ClipboardList size={20} /></button>
                    <button className="btn btn-primary interactive-btn" onClick={() => setShowCart(true)} style={{ position: 'relative' }}>
                        <ShoppingCart size={20} />
                        {cart.length > 0 && <span className="cart-count-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{cart.length}</span>}
                    </button>
                </div>
            </header>

            <div className="category-scroll-container">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`btn btn-secondary ${activeCategory === cat ? 'active' : ''}`}
                        style={{ whiteSpace: 'nowrap', borderRadius: '30px', padding: '0.6rem 1.2rem', background: activeCategory === cat ? 'var(--accent)' : 'var(--card-bg)', color: activeCategory === cat ? 'white' : 'var(--text-light)', border: 'none' }}
                    >
                        {t(cat)}
                    </button>
                ))}
            </div>

            <div className="card-grid" style={{ gap: '1.5rem' }}>
                {filteredItems.map(item => (
                    <div key={item.id} className="dynamic-card" onClick={() => handleItemClick(item)} style={{ cursor: item.available !== false ? 'pointer' : 'not-allowed', opacity: item.available !== false ? 1 : 0.6 }}>
                        <img src={item.image} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '15px 15px 0 0' }} />
                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ margin: 0 }}>{t(item.name)}</h3>
                                <span style={{ fontWeight: '700', color: 'var(--accent)' }}>₹{item.price}</span>
                            </div>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{t(item.benefits)}</p>
                            {item.available === false && <p style={{ color: 'var(--error)', fontWeight: '700', marginTop: '0.5rem' }}>{t('soldOut')}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showCart} onClose={() => setShowCart(false)}>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '20px' }}>
                    <h2>🛒 {t('yourOrder')}</h2>
                    <div style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                        {cart.length === 0 ? <p style={{ textAlign: 'center', padding: '2rem' }}>{t('cartEmpty')}</p> : cart.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div>{t(item.name)} x{item.quantity}</div>
                                <div style={{ fontWeight: '700' }}>₹{item.price * item.quantity} <button onClick={() => removeItem(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none' }}><Trash2 size={16} /></button></div>
                            </div>
                        ))}
                    </div>
                    {cart.length > 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>
                                <span>{t('total')}:</span>
                                <span>₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={submitOrder}>🚀 {t('placeOrder')}</button>
                        </>
                    )}
                </div>
            </Modal>

            <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
                {selectedItem && (
                    <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '20px' }}>
                        <img src={selectedItem.image} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' }} />
                        <h2 style={{ marginTop: '1rem' }}>{t(selectedItem.name)}</h2>
                        <p style={{ color: 'var(--text-dim)' }}>{t(selectedItem.benefits)}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹{selectedItem.price}</span>
                            <button className="btn btn-primary" onClick={() => addToCart(selectedItem)}>{t('addToOrder')}</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={showOrders} onClose={() => setShowOrders(false)}>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '20px' }}>
                    <h2>📋 {t('myOrders')}</h2>
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {orders.filter(o => myOrderIds.includes(o.$id || o.id)).length === 0 ? <p>{t('noOrders')}</p> : orders.filter(o => myOrderIds.includes(o.$id || o.id)).map(order => (
                            <div key={order.$id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>#{order.$id.slice(-4)}</span>
                                    <span style={{ fontWeight: '700' }}>{order.status.toUpperCase()}</span>
                                </div>
                                {order.items.map((it, i) => <div key={i} style={{ fontSize: '0.8rem' }}>• {t(it.name)} x{it.quantity}</div>)}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ position: 'relative', maxWidth: '500px', width: '100%' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white' }}><X /></button>
                {children}
            </div>
        </div>
    );
}
