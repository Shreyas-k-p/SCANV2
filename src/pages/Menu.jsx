import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Filter, X, Info, MessageSquare, Trash2, Plus, Minus, ClipboardList, Clock, CheckCircle } from 'lucide-react';

import LanguageSwitcher from '../components/LanguageSwitcher';
import Modal from '../components/Modal';


import './Menu.css';

export default function Menu() {
    const { menuItems, menuLoading, placeOrder, addFeedback, t, tables, orders } = useApp();
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // For detail modal
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const [searchParams] = useSearchParams();
    const tableIdFromUrl = searchParams.get('table');

    const [tableNumber, setTableNumber] = useState(() => {
        if (tableIdFromUrl) {
            localStorage.setItem('customerTableNumber', tableIdFromUrl);
            return tableIdFromUrl;
        }
        return localStorage.getItem('customerTableNumber') || '';
    });

    const [myOrderIds, setMyOrderIds] = useState(() => {
        const saved = localStorage.getItem('myOrderIds');
        return saved ? JSON.parse(saved) : [];
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

    const addToCart = (item, quantity, notes) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity, notes } : i));
        } else {
            setCart([...cart, { ...item, quantity, notes }]);
        }
        setSelectedItem(null);
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
        const trimmedTableNumber = tableNumber.trim();
        if (!trimmedTableNumber) {
            alert('Please enter your table number');
            return;
        }

        // Validate table number against active tables
        // Tables from Appwrite use 'tableNumber' (number type), so compare with both Number and String
        const validTable = tables.find(t =>
            String(t.tableNumber) === trimmedTableNumber ||
            String(t.tableNo) === trimmedTableNumber ||
            String(t.number) === trimmedTableNumber
        );
        if (!validTable) {
            // If no tables loaded yet, allow order to proceed (avoid blocking on network delay)
            if (!tables || tables.length === 0) {
                console.warn('No tables loaded yet — skipping table validation');
            } else {
                alert(`Invalid Table Number: ${trimmedTableNumber}. Please check the number on your table.`);
                return;
            }
        }

        if (validTable && validTable.status === 'billed') {
            alert(`This table has already been billed. Please ask the waiter to clear the table or start a new session.`);
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        try {
            // Place the order
            const newOrder = await placeOrder(trimmedTableNumber, cart);

            // Clear form only on success
            setCart([]);
            setShowCart(false);
            setInstructions('');

            // Persist table number and order ID
            localStorage.setItem('customerTableNumber', trimmedTableNumber);

            const updatedOrderIds = [...myOrderIds, newOrder.id];
            setMyOrderIds(updatedOrderIds);
            localStorage.setItem('myOrderIds', JSON.stringify(updatedOrderIds));

            alert(`${t('orderPlaced')} ${trimmedTableNumber} !`);
        } catch (error) {
            console.error('Order submission error:', error);
            alert('Failed to place order. Please try again.');
        }
    };


    // Scroll Lock is now handled by the Modal component

    const submitFeedback = (feedbackData) => {
        addFeedback({
            ...feedbackData,
            tableNo: tableNumber || null
        });
        setShowFeedbackModal(false);
        alert('Thank you for your feedback!');
    };

    return (
        <div className="menu-page-container">
            <header className="sticky-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'var(--gradient-accent)',
                        borderRadius: '12px',
                        marginBottom: '0.5rem',
                        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)'
                    }}>
                        <h1 style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            margin: 0,
                            color: '#000000ff',
                            letterSpacing: '-1px',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                        }}>
                            🍽️ {t('ourMenu')}
                        </h1>
                    </div>
                    <p style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.9rem',
                        marginTop: '0.2rem',
                        fontWeight: '500'
                    }}>
                        {filteredItems.length} {t('items')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <LanguageSwitcher />



                    <button
                        className="btn interactive-btn"
                        onClick={() => setShowOrders(true)}
                        style={{
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                            fontWeight: 'bold'
                        }}
                    >
                        <ClipboardList size={20} />
                        <span style={{ marginLeft: '8px' }}>My Orders</span>
                    </button>
                    <button
                        className="btn btn-secondary interactive-btn"
                        onClick={() => setShowFeedbackModal(true)}
                        style={{
                            borderRadius: '12px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-light)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <MessageSquare size={18} />
                    </button>
                    <button
                        className="btn btn-primary interactive-btn cart-float-btn"
                        onClick={() => setShowCart(true)}
                        style={{
                            borderRadius: '12px',
                            position: 'relative',
                            padding: '0.75rem 1.25rem'
                        }}
                    >
                        <ShoppingCart size={20} />
                        <span style={{ marginLeft: '8px' }}>{t('cart')}</span>
                        {cart.length > 0 && (
                            <span className="cart-count-badge" style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--error)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Categories */}
            <div className="category-scroll-container">
                {categories.map((cat, idx) => {
                    const gradients = [
                        'linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)',
                        'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                        'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
                    ];
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`btn interactive - btn ${isActive ? 'btn-primary' : 'btn-secondary'} `}
                            style={{
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                borderRadius: '30px',
                                padding: '0.7rem 1.5rem',
                                animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`,
                                background: isActive
                                    ? gradients[idx % gradients.length]
                                    : 'var(--card-bg)',
                                color: isActive ? 'white' : 'var(--text-light)',
                                border: isActive ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {cat === 'All' ? t('all') : cat}
                        </button>
                    );
                })}
            </div>

            {/* Syncing Indicator */}
            {menuLoading && menuItems.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', zIndex: 100,
                    background: 'var(--glass-bg)', padding: '8px 15px', borderRadius: '30px',
                    fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: 'var(--shadow-md)', border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }} />
                    Syncing menu...
                </div>
            )
            }

            {/* Grid */}
            <div className="card-grid menu-mobile-1col" style={{ gap: '2rem' }}>
                {menuLoading && filteredItems.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }} />
                        <p>{t('loading')}...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-dim)'
                    }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No items found</p>
                        <p>Try selecting a different category</p>
                    </div>
                ) : (
                    filteredItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className="dynamic-card fade-in"
                            onClick={() => handleItemClick(item)}
                            style={{
                                cursor: item.available !== false ? 'pointer' : 'not-allowed',
                                opacity: item.available !== false ? 1 : 0.7,
                                animationDelay: `0s`
                            }}
                        >
                            <div className="card-image-container">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                {item.available === false && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(2px)'
                                    }}>
                                        <span className="badge badge-error" style={{
                                            fontSize: '1rem',
                                            padding: '12px 24px',
                                            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)'
                                        }}>
                                            {t('soldOut')}
                                        </span>
                                    </div>
                                )}
                                {item.available !== false && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'var(--gradient-accent)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '8px 14px',
                                        borderRadius: '25px',
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}>
                                        ₹{item.price}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        lineHeight: '1.3'
                                    }}>
                                        {t(item.name)}
                                    </h3>
                                </div>
                                <p style={{
                                    color: 'var(--text-dim)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    margin: 0
                                }}>
                                    {t(item.benefits)}
                                </p>
                                {item.available !== false && (
                                    <div style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '2px solid var(--accent-light)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.05) 0%, transparent 100%)',
                                        margin: '1rem -1.25rem -1.25rem',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '0 0 16px 16px'
                                    }}>
                                        <span style={{
                                            background: 'var(--gradient-accent)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            fontWeight: '800',
                                            fontSize: '1.3rem'
                                        }}>
                                            ₹{item.price}
                                        </span>
                                        <span style={{
                                            fontSize: '0.9rem',
                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                            color: 'white',
                                            fontWeight: '700',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            ✓ Available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>



            {/* --- MODALS --- */}

            {/* Cart Modal */}
            <Modal
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                maxWidth="550px"
            >
                <div className="glass-modal-content">
                    <div className="modal-header-gradient" style={{
                        padding: '1.25rem',
                        background: 'var(--gradient-accent)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                            🛒 {t('yourOrder')}
                        </h2>
                        <button onClick={() => setShowCart(false)} className="close-btn-circle" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                                <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>{t('cartEmpty')}</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    marginBottom: '10px',
                                    background: 'var(--glass-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--text-light)' }}>{t(item.name)}</h4>
                                        <span style={{ color: 'var(--accent)', fontWeight: '700' }}>₹{item.price * item.quantity}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="qty-btn-small"><Minus size={12} /></button>
                                        <span style={{ minWidth: '20px', textAlign: 'center', color: 'var(--text-light)' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="qty-btn-small"><Plus size={12} /></button>
                                        <button onClick={() => removeItem(idx)} style={{ marginLeft: '10px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>{t('tableNumber')} *</label>
                                <input
                                    className="input-field"
                                    placeholder={t('tableNumber')}
                                    value={tableNumber}
                                    onChange={e => setTableNumber(e.target.value)}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Special Instructions</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Any allergies or spice level?"
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                                <span>{t('total')}:</span>
                                <span>₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
                            </div>
                            <button
                                onClick={submitOrder}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}
                                disabled={!tableNumber || cart.length === 0}
                            >
                                ✅ {t('placeOrder')}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Item Details Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
            >
                {selectedItem && (
                    <ItemModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onAdd={(item, qty, note) => {
                            addToCart(item, qty, note);
                            setSelectedItem(null);
                        }}
                    />
                )}
            </Modal>

            {/* My Orders (Summary) Modal */}
            <Modal
                isOpen={showOrders}
                onClose={() => setShowOrders(false)}
            >
                <div className="glass-modal-content">
                    <div style={{
                        padding: '1.25rem',
                        background: 'var(--gradient-accent)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
                            📋 {t('myOrders')}
                        </h2>
                        <button onClick={() => setShowOrders(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                        {(() => {
                            const myOrders = orders.filter(o =>
                                myOrderIds.includes(o.$id || o.id) ||
                                String(o.tableNumber || o.tableNo) === String(tableNumber)
                            );

                            if (myOrders.length === 0) {
                                return <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>{t('noOrders')}</p>;
                            }

                            return myOrders.map(order => (
                                <div key={order.$id || order.id} style={{
                                    padding: '1rem',
                                    marginBottom: '10px',
                                    background: 'var(--glass-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: `5px solid ${order.status === 'ready' ? '#fbbf24' : order.status === 'completed' ? '#10b981' : '#3b82f6'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-light)' }}>#{String(order.$id || order.id).slice(-4)}</span>
                                        <span className={`badge badge-${order.status === 'ready' ? 'warning' : order.status === 'completed' ? 'success' : 'primary'}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {(order.items || []).map((it, i) => (
                                        <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                            • {it.name} x{it.quantity}
                                        </div>
                                    ))}
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                maxWidth="500px"
            >
                <FeedbackModal
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={(feedback) => {
                        addFeedback(feedback);
                        setShowFeedbackModal(false);
                    }}
                    tableNumber={tableNumber}
                />
            </Modal>
        </div>
    );
}

function ItemModal({ item, onClose, onAdd }) {
    const { t } = useApp();
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');

    if (item.available === false) return null;

    return (
        <div style={{ position: 'relative' }}>
            <img
                src={item.image}
                style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    display: 'block'
                }}
            />
            <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'var(--gradient-accent)',
                padding: '10px 18px',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '800',
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(233, 69, 96, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
                ₹{item.price}
            </div>
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'var(--glass-bg)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease'
                }}
            >
                <X />
            </button>

            <div style={{ padding: '30px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
                        {t(item.name)}
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        {t(item.description)}
                    </p>
                </div>

                <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '20px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-light)', fontSize: '1rem' }}>
                        {t('quantity') || 'Quantity'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="btn btn-secondary"
                            style={{ width: '50px', height: '50px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            disabled={qty <= 1}
                        >
                            −
                        </button>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)', minWidth: '40px', textAlign: 'center' }}>
                            {qty}
                        </span>
                        <button
                            onClick={() => setQty(qty + 1)}
                            className="btn btn-primary"
                            style={{ width: '50px', height: '50px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            +
                        </button>
                    </div>
                </div>

                <input
                    className="input-field"
                    placeholder={`📝 ${t('specialInstructions')} `}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{ marginBottom: '2rem' }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem', fontWeight: '800' }}
                        onClick={onClose}
                    >
                        {t('back') || 'Back'}
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '1.25rem', fontSize: '1.1rem', fontWeight: '800' }}
                        onClick={() => onAdd(item, qty, note)}
                    >
                        🛒 {t('addToOrder')} - ₹{item.price * qty}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeedbackModal({ onClose, onSubmit, tableNumber }) {
    const { t } = useApp();
    const [formData, setFormData] = useState({
        customerName: '',
        message: '',
        rating: 5,
        tableNo: tableNumber || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.message.trim()) {
            alert('Please enter your feedback message');
            return;
        }
        onSubmit(formData);
        setFormData({ customerName: '', message: '', rating: 5, tableNo: '' });
    };

    return (
        <div className="glass-panel" style={{ width: '100%', padding: '30px', margin: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>{t('shareFeedback')}</h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    <X />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    className="input-field"
                    placeholder={`${t('name')} (${t('optional') || 'Optional'})`}
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
                <input
                    className="input-field"
                    placeholder={`${t('tableNumber')} (${t('optional') || 'Optional'})`}
                    value={formData.tableNo}
                    onChange={e => setFormData({ ...formData, tableNo: e.target.value })}
                />
                <div>
                    <label style={{ display: 'block', marginBottom: '10px' }}>{t('rating') || 'Rating'}</label>
                    <div style={{ display: 'flex', gap: '5px', fontSize: '1.5rem' }}>
                        {[1, 2, 3, 4, 5].map(rating => (
                            <span
                                key={rating}
                                onClick={() => setFormData({ ...formData, rating })}
                                style={{
                                    cursor: 'pointer',
                                    color: rating <= formData.rating ? '#f1c40f' : '#555',
                                    transition: 'color 0.2s'
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <textarea
                    className="input-field"
                    placeholder={t('feedback')}
                    rows="5"
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit">
                    {t('submitFeedback')}
                </button>
            </form>
        </div>
    );
}
