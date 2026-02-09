import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Filter, X, Info, MessageSquare, Trash2, Plus, Minus, ClipboardList, Clock, CheckCircle } from 'lucide-react';

import LanguageSwitcher from '../components/LanguageSwitcher';
import PaymentModal from '../components/PaymentModal';

import './Menu.css';

export default function Menu() {
    const { menuItems, placeOrder, addFeedback, t, tables, orders } = useApp();
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // For detail modal
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const [tableNumber, setTableNumber] = useState(() => localStorage.getItem('customerTableNumber') || '');
    const [myOrderIds, setMyOrderIds] = useState(() => {
        const saved = localStorage.getItem('myOrderIds');
        return saved ? JSON.parse(saved) : [];
    });
    const [instructions, setInstructions] = useState('');

    const categories = ['All', ...new Set(menuItems.map(item => item.category))];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);





    const handleItemClick = (item) => {
        if (item.available) {
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
        const validTable = tables.find(t => String(t.tableNo) === trimmedTableNumber);
        if (!validTable) {
            alert(`Invalid Table Number: ${trimmedTableNumber}. Please check the number on your table.`);
            return;
        }

        // If table is billed, show payment modal instead of blocking
        if (validTable.status === 'billed') {
            setShowPayment(true);
            setShowCart(false);
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        try {
            // Place the order
            const newOrder = await placeOrder(trimmedTableNumber, cart, { instructions: instructions.trim() || '' });

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

                    {/* Pay Bill Button - Shows when table is billed */}
                    {(() => {
                        const currentTable = tables.find(t => String(t.tableNo) === String(tableNumber).trim());
                        if (currentTable && currentTable.status === 'billed') {
                            return (
                                <button
                                    className="btn interactive-btn"
                                    onClick={() => setShowPayment(true)}
                                    style={{
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                        fontWeight: 'bold',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💳</span>
                                    Pay Bill
                                </button>
                            );
                        }
                        return null;
                    })()}

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
                                animation: `fadeIn 0.4s ease - out ${idx * 0.1}s both`,
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

            {/* Grid */}
            <div className="card-grid" style={{ gap: '2rem' }}>
                {filteredItems.length === 0 ? (
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
                                cursor: item.available ? 'pointer' : 'not-allowed',
                                opacity: item.available ? 1 : 0.7,
                                animationDelay: `${idx * 0.05} s`
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
                                {!item.available && (
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
                                {item.available && (
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
                                {item.available && (
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



            {/* Cart Modal */}
            {showCart && (
                <div className="glass-modal-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-modal-content" style={{
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        borderRadius: '24px',
                        padding: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)'
                        }}>
                            <h2 style={{
                                margin: 0,
                                color: '#ffffff',
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}>
                                🛒 {t('yourOrder')}
                            </h2>
                            <button
                                onClick={() => setShowCart(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                    e.currentTarget.style.transform = 'rotate(90deg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.currentTarget.style.transform = 'rotate(0deg)';
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: 0 }}>
                            {cart.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    color: 'var(--text-dim)'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        Your cart is empty
                                    </p>
                                    <p style={{ fontSize: '0.9rem' }}>Add items from the menu to get started!</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                            borderRadius: '12px',
                                            border: '2px solid var(--accent-light)',
                                            animation: `fadeInUp 0.4s ease - out ${idx * 0.1}s both`,
                                            flexWrap: 'wrap',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <h4 style={{
                                                margin: 0,
                                                marginBottom: '0.5rem',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: 'var(--text-light)'
                                            }}>
                                                {t(item.name)}
                                            </h4>
                                            {item.notes && (
                                                <small style={{
                                                    color: 'var(--accent)',
                                                    fontSize: '0.85rem',
                                                    fontStyle: 'italic',
                                                    display: 'block',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    📝 {item.notes}
                                                </small>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '4px',
                                            borderRadius: '8px'
                                        }}>
                                            <button
                                                onClick={() => updateQuantity(idx, item.quantity - 1)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    color: 'var(--text-light)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={{
                                                fontWeight: '700',
                                                minWidth: '20px',
                                                textAlign: 'center',
                                                color: 'var(--text-light)'
                                            }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'var(--gradient-accent)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '4px',
                                            marginLeft: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '800',
                                                background: 'var(--gradient-accent)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}>
                                                ₹{item.price * item.quantity}
                                            </span>
                                            <button
                                                onClick={() => removeItem(idx)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.8rem',
                                                    padding: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', padding: '1.5rem', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {t('tableNumber')} <span style={{ color: 'var(--accent)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('tableNumber')}
                                    className="input-field"
                                    value={tableNumber}
                                    onChange={e => setTableNumber(e.target.value)}
                                    required
                                    style={{
                                        border: tableNumber ? '1px solid var(--glass-border)' : '2px solid var(--accent)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                    Special Instructions (Optional)
                                </label>
                                <textarea
                                    className="input-field"
                                    placeholder="Any special cooking instructions or dietary requirements?"
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                margin: '1.5rem 0',
                                padding: '1.25rem',
                                background: 'var(--gradient-accent)',
                                borderRadius: '16px',
                                color: '#ffffff',
                                boxShadow: '0 4px 20px rgba(233, 69, 96, 0.4)',
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}>
                                <span>{t('total')}:</span>
                                <span>₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    padding: '1.25rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '800',
                                    borderRadius: '16px',
                                    boxShadow: cart.length > 0 && tableNumber.trim()
                                        ? '0 6px 25px rgba(233, 69, 96, 0.5)'
                                        : 'none',
                                    opacity: cart.length === 0 || !tableNumber.trim() ? 0.6 : 1
                                }}
                                onClick={submitOrder}
                                disabled={cart.length === 0 || !tableNumber.trim()}
                            >
                                {cart.length === 0 ? `🛒 ${t('cartEmpty')} ` : !tableNumber.trim() ? `📝 ${t('tableNumber')} ` : `✅ ${t('placeOrder')} `}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAdd={addToCart}
                />
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <FeedbackModal
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={submitFeedback}
                    t={t}
                />
            )}

            {/* Order Summary Modal */}
            {showOrders && (
                <div className="glass-modal-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-modal-content" style={{
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        borderRadius: '24px',
                        padding: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)'
                        }}>
                            <h2 style={{
                                margin: 0,
                                color: '#ffffff',
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}>
                                🧾 Order Summary
                            </h2>
                            <button
                                onClick={() => setShowOrders(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: '300px' }}>
                            {myOrderIds.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                                    <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <>
                                    {(() => {
                                        // Stricter filter: Match myOrderIds AND the current table number
                                        const myOrders = orders
                                            .filter(o =>
                                                myOrderIds.includes(o.id) &&
                                                String(o.tableNo) === String(tableNumber).trim()
                                            )
                                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                                        if (myOrders.length === 0) {
                                            return (
                                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                                                    <p>No orders found for Table {tableNumber}.</p>
                                                </div>
                                            );
                                        }

                                        const grandTotal = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                                        return (
                                            <>
                                                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-dim)' }}>Session Total:</span>
                                                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--accent)' }}>₹{grandTotal}</span>
                                                </div>

                                                {myOrders.map(order => (
                                                    <div key={order.id} style={{
                                                        marginBottom: '1rem',
                                                        padding: '1rem',
                                                        borderRadius: '16px',
                                                        background: 'var(--glass-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '4px',
                                                            background: order.status === 'ready' ? '#f59e0b' : order.status === 'completed' ? '#10b981' : '#3b82f6'
                                                        }} />

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingLeft: '10px' }}>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                                {new Date(order.timestamp).toLocaleTimeString()}
                                                            </span>
                                                            <span className={`badge ${order.status === 'ready' ? 'badge-warning' : order.status === 'completed' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.75rem' }}>
                                                                {order.status.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div style={{ paddingLeft: '10px' }}>
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.95rem' }}>
                                                                    <span>{item.quantity}x {t(item.name)}</span>
                                                                    <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
                                                                </div>
                                                            ))}
                                                            {order.customerInfo?.instructions && (
                                                                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--accent)', fontStyle: 'italic' }}>
                                                                    " {order.customerInfo.instructions} "
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && (() => {
                const currentTable = tables.find(t => String(t.tableNo) === String(tableNumber).trim());
                if (!currentTable) return null;

                // Calculate total from all orders for this table
                const tableOrders = orders.filter(o => String(o.tableNo) === String(tableNumber).trim());
                const totalAmount = tableOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                const tax = totalAmount * 0.05;
                const grandTotal = totalAmount + tax;

                return (
                    <PaymentModal
                        table={currentTable}
                        totalAmount={grandTotal}
                        onClose={() => setShowPayment(false)}
                        onPaymentInitiated={() => {
                            alert('Payment initiated! Please complete the payment in your UPI app. After payment, please inform the waiter.');
                            setShowPayment(false);
                        }}
                    />
                );
            })()}


        </div >
    );
}

function ItemModal({ item, onClose, onAdd }) {
    const { t } = useApp();
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');

    if (!item.available) return null;

    return (
        <div className="glass-modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-modal-content" style={{
                width: '100%',
                maxWidth: '550px',
                padding: '0',
                overflow: 'hidden',
                borderRadius: '24px'
            }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={item.image}
                        style={{
                            width: '100%',
                            height: '280px',
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--glass-bg)';
                            e.currentTarget.style.color = 'var(--text-light)';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{
                            margin: 0,
                            marginBottom: '0.5rem',
                            fontSize: '2rem',
                            fontWeight: '800',
                            background: 'var(--gradient-accent)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {t(item.name)}
                        </h2>
                        <p style={{
                            color: 'var(--text-dim)',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            margin: 0
                        }}>
                            {t(item.benefits)}
                        </p>
                    </div>
                    <div style={{ margin: '1.5rem 0' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '1rem',
                            fontWeight: '700',
                            color: 'var(--text-light)',
                            fontSize: '1rem',
                            textAlign: 'left'
                        }}>
                            {t('quantity') || 'Quantity'}
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '1rem',
                            width: '100%'
                        }}>
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                disabled={qty <= 1}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    padding: 0,
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    background: qty <= 1
                                        ? 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                                        : 'linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)',
                                    color: qty <= 1 ? '#9ca3af' : 'white',
                                    border: 'none',
                                    cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: qty <= 1
                                        ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                                        : '0 4px 15px rgba(233, 69, 96, 0.4)',
                                    transition: 'all 0.3s ease',
                                    lineHeight: 1
                                }}
                                onMouseEnter={(e) => {
                                    if (qty > 1) {
                                        e.currentTarget.style.transform = 'scale(0.95)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 69, 96, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (qty > 1) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 69, 96, 0.4)';
                                    }
                                }}
                            >
                                −
                            </button>
                            <div style={{
                                minWidth: '80px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                borderRadius: '12px',
                                border: '2px solid var(--accent-light)',
                                padding: '0 1rem'
                            }}>
                                <span style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    background: 'var(--gradient-accent)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    textAlign: 'center',
                                    userSelect: 'none'
                                }}>
                                    {qty}
                                </span>
                            </div>
                            <button
                                onClick={() => setQty(qty + 1)}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    padding: 0,
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
                                    transition: 'all 0.3s ease',
                                    lineHeight: 1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.95)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 69, 96, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 69, 96, 0.4)';
                                }}
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
                        style={{ marginBottom: '1.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                borderRadius: '16px',
                                border: '2px solid var(--border-color)'
                            }}
                            onClick={onClose}
                        >
                            ← {t('back') || 'Back'}
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{
                                flex: 2,
                                justifyContent: 'center',
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                borderRadius: '16px'
                            }}
                            onClick={() => onAdd(item, qty, note)}
                        >
                            🛒 {t('addToOrder')} - ₹{item.price * qty}
                        </button>
                    </div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>{t('shareFeedback')}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
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
        </div>
    );
}
