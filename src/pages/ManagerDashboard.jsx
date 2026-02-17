import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, TrendingUp, Users, Plus, X, MessageSquare, Calendar, Edit, Settings, UserPlus, ChefHat, Copy, Trash2 } from 'lucide-react';
import { extractGradientContent } from '../utils/gradientUtils';

import { onMQTTMessage } from "../services/mqttClient";
import { toast } from "react-hot-toast";
import DeviceMonitor from '../components/DeviceMonitor';

import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ManagerDashboard() {
    const {
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        orders,
        feedbacks,
        waiters,
        addWaiter,
        removeWaiter,
        kitchenStaff,
        addKitchenStaff,
        removeKitchenStaff,
        tables,
        addTable,
        removeTable,
        t,
        subManagers,
        addSubManager,
        removeSubManager,
        managers,
        addManager,
        removeManager
    } = useApp();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, orders, feedback

    // Get today's date
    const today = new Date().toDateString();

    // Daily Stats
    const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp).toDateString();
        return orderDate === today && o.status === 'completed';
    });
    const dailyRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const dailyCustomers = new Set(todayOrders.map(o => o.tableNo)).size;

    // Total Stats
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCustomers = new Set(orders.filter(o => o.status === 'completed').map(o => o.tableNo)).size;

    // Most Ordered Item (All Time)
    const itemCounts = {};
    orders.forEach(o => o.items.forEach(i => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
    }));
    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const topItem = sortedItems.length > 0 ? `${sortedItems[0][0]} (${sortedItems[0][1]}x)` : 'N/A';

    const tabGradients = {
        overview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        orders: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        feedback: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        waiters: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        kitchen: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    };

    const [showAddWaiterModal, setShowAddWaiterModal] = useState(false);
    const [showAddKitchenModal, setShowAddKitchenModal] = useState(false);
    const [showAddSubManagerModal, setShowAddSubManagerModal] = useState(false);
    const [showAddManagerModal, setShowAddManagerModal] = useState(false);
    const [newSecretID, setNewSecretID] = useState(null);
    const [newKitchenSecretID, setNewKitchenSecretID] = useState(null);
    const [newSubManagerSecretID, setNewSubManagerSecretID] = useState(null);
    const [newManagerSecretID, setNewManagerSecretID] = useState(null);
    const [subManagerPhoto, setSubManagerPhoto] = useState('');
    const [managerPhoto, setManagerPhoto] = useState('');

    const handleSubManagerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 800 * 1024) {
                alert('Image size should be less than 800KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSubManagerPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleManagerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 800 * 1024) {
                alert('Image size should be less than 800KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setManagerPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // MQTT Listener
    React.useEffect(() => {
        const unsubscribe = onMQTTMessage((topic, msg) => {
            if (msg.type === "CALL_WAITER") {
                toast.success(`🔔 Table ${msg.table} is calling waiter`, {
                    duration: 6000,
                    icon: '🔔',
                    style: {
                        background: '#333',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--gradient-accent)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-glow)'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        letterSpacing: '-1px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}>
                        👔 Manager Dashboard
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <LanguageSwitcher />
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                        style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={18} /> {t('addItem')}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('menu')}
                        style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
                        }}
                    >
                        <Edit size={18} /> {t('manageMenu')}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'overview', label: `📊 ${t('dashboard')}`, gradient: tabGradients.overview },
                    { key: 'orders', label: `📋 ${t('activeOrders')}`, gradient: tabGradients.orders },
                    { key: 'menu', label: `🍽️ ${t('manageMenu')}`, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                    { key: 'tables', label: `🪑 ${t('tables')}`, gradient: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)' },
                    { key: 'devices', label: `📶 Devices`, gradient: 'linear-gradient(135deg, #647dee 0%, #7f53ac 100%)' },
                    { key: 'waiters', label: `👨‍🍳 ${t('manageStaff')} (${waiters.length})`, gradient: tabGradients.waiters },
                    { key: 'kitchen', label: `🍳 ${t('kitchenStaff')} (${kitchenStaff.length})`, gradient: tabGradients.kitchen },
                    { key: 'subManagers', label: `🤵 Sub Managers (${subManagers.length})`, gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' },
                    { key: 'managers', label: `👔 Managers (${managers.length})`, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
                    { key: 'feedback', label: `💬 ${t('feedback')} (${feedbacks.length})`, gradient: tabGradients.feedback }
                ].map(tab => (

                    <button
                        key={tab.key}
                        className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.5rem',
                            background: activeTab === tab.key ? tab.gradient : 'var(--card-bg)',
                            color: activeTab === tab.key ? 'white' : 'var(--text-light)',
                            border: activeTab === tab.key ? 'none' : '2px solid var(--border-color)',
                            boxShadow: activeTab === tab.key ? `0 4px 20px ${extractGradientContent(tab.gradient)}40` : 'var(--shadow-sm)',
                            fontWeight: '600'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Daily Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <StatCard
                            icon={<Calendar color="#10b981" />}
                            title="Today's Revenue"
                            value={`₹ ${dailyRevenue}`}
                            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        />
                        <StatCard
                            icon={<Users color="#3b82f6" />}
                            title="Today's Customers"
                            value={dailyCustomers}
                            gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
                        />
                        <StatCard
                            icon={<TrendingUp color="#f59e0b" />}
                            title="Total Revenue"
                            value={`₹ ${totalRevenue}`}
                            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                        />
                        <StatCard
                            icon={<Users color="#8b5cf6" />}
                            title="Total Customers"
                            value={totalCustomers}
                            gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
                        />
                        <StatCard
                            icon={<BarChart color="#e94560" />}
                            title="Most Ordered Item"
                            value={topItem}
                            gradient="var(--gradient-accent)"
                        />
                    </div>

                    {/* Active Orders & Waiters */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{
                            padding: '1.5rem',
                            background: 'var(--glass-bg)',
                            border: '2px solid rgba(233, 69, 96, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'radial-gradient(circle, rgba(233, 69, 96, 0.2) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)'
                            }} />
                            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-light)' }}>
                                🔔 {t('activeOrders')}
                            </h3>
                            <h2 style={{
                                fontSize: '3rem',
                                margin: '0.5rem 0',
                                background: 'var(--gradient-accent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontWeight: '800'
                            }}>
                                {orders.filter(o => o.status !== 'completed').length}
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontWeight: '500', margin: 0 }}>Pending & Ready</p>
                        </div>
                        <div className="glass-panel" style={{
                            padding: '1.5rem',
                            background: 'var(--glass-bg)',
                            border: '2px solid rgba(16, 185, 129, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)'
                            }} />
                            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-light)' }}>
                                ✅ {t('completedOrders')}
                            </h3>
                            <h2 style={{
                                fontSize: '3rem',
                                margin: '0.5rem 0',
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontWeight: '800'
                            }}>
                                {todayOrders.length}
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontWeight: '500', margin: 0 }}>Orders completed</p>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h2 style={{
                        marginBottom: '1.5rem',
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        background: 'var(--gradient-accent)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        📋 All Orders
                    </h2>
                    {orders.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No orders yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {orders.slice().reverse().map(order => (
                                <div key={order.id} className="glass-panel" style={{
                                    padding: '1.5rem',
                                    background: 'var(--card-bg)',
                                    border: '2px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        padding: '0.5rem 1rem',
                                        background: order.status === 'completed'
                                            ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                            : order.status === 'ready'
                                                ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                                                : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        borderBottomLeftRadius: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {order.status}
                                    </div>
                                    <div style={{ marginBottom: '1rem', paddingRight: '100px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-dim)',
                                                fontWeight: '600',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ORDER #{order.id.slice(-6).toUpperCase()}
                                            </span>
                                            <span style={{
                                                fontSize: '1.5rem',
                                                fontWeight: '800',
                                                background: 'var(--gradient-accent)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text'
                                            }}>
                                                ₹{order.totalAmount}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                                            <span style={{ marginRight: '1rem' }}>🪑 Table {order.tableNo}</span>
                                            <span>🕐 {new Date(order.timestamp).toLocaleString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            ITEMS:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem',
                                                    background: 'rgba(0, 0, 0, 0.1)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <span style={{ color: 'var(--text-light)', fontWeight: '500' }}>
                                                        {item.name}
                                                    </span>
                                                    <span style={{
                                                        color: 'var(--accent)',
                                                        fontWeight: '700',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'menu' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            background: 'var(--gradient-accent)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            🍽️ Menu Management
                        </h2>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                            style={{
                                borderRadius: '12px',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }}
                        >
                            <Plus size={18} style={{ marginRight: '8px' }} /> {t('addItem')}
                        </button>
                    </div>
                    {menuItems.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No menu items yet. Add your first item!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {menuItems.map(item => (
                                <div key={item.id} className="glass-panel" style={{
                                    padding: '1.25rem',
                                    background: 'var(--card-bg)',
                                    border: item.available !== false
                                        ? '2px solid rgba(16, 185, 129, 0.3)'
                                        : '2px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: item.available !== false
                                            ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                            : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {item.available !== false ? 'Available' : 'Unavailable'}
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                width: '100%',
                                                height: '180px',
                                                objectFit: 'cover',
                                                borderRadius: '12px',
                                                marginBottom: '1rem',
                                                border: '2px solid var(--glass-border)'
                                            }}
                                        />
                                        <h3 style={{
                                            margin: 0,
                                            marginBottom: '0.5rem',
                                            fontSize: '1.25rem',
                                            fontWeight: '700',
                                            color: 'var(--text-light)'
                                        }}>
                                            {item.name}
                                        </h3>
                                        <div style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            marginBottom: '0.5rem',
                                            background: 'var(--gradient-accent)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}>
                                            ₹{item.price}
                                        </div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--text-dim)',
                                            marginBottom: '0.75rem',
                                            padding: '0.5rem',
                                            background: 'rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px'
                                        }}>
                                            <strong>Category:</strong> {item.category}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-light)',
                                            lineHeight: '1.5'
                                        }}>
                                            {item.benefits}
                                        </div>
                                    </div>
                                    <div style={{
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        gap: '0.75rem'
                                    }}>
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                            }}
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
                                                    deleteMenuItem(item.id);
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'tables' && (
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>
                        🪑 Table Management
                    </h2>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const num = prompt(t('tableNumber'));
                            if (!num) return;
                            addTable(Number(num));
                        }}
                    >
                        ➕ {t('addTable')}
                    </button>

                    <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                        {tables.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                                No tables added yet
                            </div>
                        ) : (
                            tables.map(table => (
                                <div
                                    key={table.docId}
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <strong>Table {table.tableNo}</strong>

                                    <button
                                        onClick={() => removeTable(table.docId)}
                                        style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 10px',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}


            {activeTab === 'devices' && (
                <DeviceMonitor tables={tables} />
            )}

            {
                activeTab === 'feedback' && (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3>Customer Feedback</h3>
                        {feedbacks.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No feedback yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                {feedbacks.slice().reverse().map(feedback => (
                                    <div key={feedback.id} style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid var(--accent)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div>
                                                <strong>{feedback.customerName || 'Anonymous'}</strong>
                                                {feedback.tableNo && <span style={{ color: 'var(--text-dim)', marginLeft: '10px' }}>Table {feedback.tableNo}</span>}
                                            </div>
                                            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                                {new Date(feedback.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, lineHeight: '1.6' }}>{feedback.message}</p>
                                        {feedback.rating && (
                                            <div style={{ marginTop: '10px' }}>
                                                <span style={{ color: '#f1c40f' }}>
                                                    {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'waiters' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                background: 'var(--gradient-accent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                👨‍🍳 Waiter Management
                            </h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddWaiterModal(true)}
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <UserPlus size={18} /> Add Waiter
                            </button>
                        </div>
                        {waiters.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No waiters added yet. Add your first waiter!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {waiters.map(waiter => (
                                    <div key={waiter.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        background: 'var(--card-bg)',
                                        border: '2px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '16px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {waiter.profilePhoto && <img src={waiter.profilePhoto} alt={waiter.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                                    {waiter.name}
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                    ID: {waiter.id}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove "${waiter.name}"?`)) {
                                                        removeWaiter(waiter.docId);

                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0, 0, 0, 0.05)',
                                            borderRadius: '12px',
                                            border: '2px dashed rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                                                Secret ID (Show this to waiter only):
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <code style={{
                                                    padding: '0.75rem',
                                                    background: 'var(--card-bg)',
                                                    borderRadius: '8px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '2px',
                                                    color: 'var(--accent)',
                                                    border: '2px solid var(--accent-light)'
                                                }}>
                                                    {waiter.secretID}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(waiter.secretID);
                                                        alert('Secret ID copied to clipboard!');
                                                    }}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: 'var(--gradient-accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'kitchen' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                background: 'var(--gradient-accent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                🍳 Kitchen Staff Management
                            </h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddKitchenModal(true)}
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <ChefHat size={18} /> Add Kitchen Staff
                            </button>
                        </div>
                        {kitchenStaff.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No kitchen staff added yet. Add your first kitchen member!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {kitchenStaff.map(staff => (
                                    <div key={staff.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        background: 'var(--card-bg)',
                                        border: '2px solid rgba(245, 158, 11, 0.3)',
                                        borderRadius: '16px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {staff.profilePhoto && <img src={staff.profilePhoto} alt={staff.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                                    {staff.name}
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                    ID: {staff.id}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove "${staff.name}"?`)) {
                                                        removeKitchenStaff(staff.docId);

                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0, 0, 0, 0.05)',
                                            borderRadius: '12px',
                                            border: '2px dashed rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                                                Secret ID (Show this to kitchen staff only):
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <code style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: 'var(--card-bg)',
                                                    borderRadius: '8px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '2px',
                                                    color: 'var(--accent)',
                                                    border: '2px solid var(--accent-light)'
                                                }}>
                                                    {staff.secretID}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(staff.secretID);
                                                        alert('Secret ID copied to clipboard!');
                                                    }}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: 'var(--gradient-accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'subManagers' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                background: 'var(--gradient-accent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                🤵 Sub Manager Management
                            </h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddSubManagerModal(true)}
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <UserPlus size={18} /> Add Sub Manager
                            </button>
                        </div>
                        {subManagers.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No Sub Managers added yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {subManagers.map(sm => (
                                    <div key={sm.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        background: 'var(--card-bg)',
                                        border: '2px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '16px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {sm.profilePhoto && <img src={sm.profilePhoto} alt={sm.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                                    {sm.name}
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                    ID: {sm.id}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove "${sm.name}"?`)) {
                                                        removeSubManager(sm.docId);

                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0, 0, 0, 0.05)',
                                            borderRadius: '12px',
                                            border: '2px dashed rgba(99, 102, 241, 0.3)'
                                        }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                                                Secret ID:
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <code style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: 'var(--card-bg)',
                                                    borderRadius: '8px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '2px',
                                                    color: 'var(--accent)',
                                                    border: '2px solid var(--accent-light)'
                                                }}>
                                                    {sm.secretID}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(sm.secretID);
                                                        alert('Secret ID copied to clipboard!');
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.75rem' }}
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'managers' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                background: 'var(--gradient-accent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                👔 Manager Management
                            </h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddManagerModal(true)}
                                style={{
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <UserPlus size={18} /> Add Manager
                            </button>
                        </div>
                        {managers.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No Managers added yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {managers.map(mgr => (
                                    <div key={mgr.id} className="glass-panel" style={{
                                        padding: '1.5rem',
                                        background: 'var(--card-bg)',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '16px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {mgr.profilePhoto && <img src={mgr.profilePhoto} alt={mgr.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                                    {mgr.name}
                                                </h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                    ID: {mgr.id}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to remove "${mgr.name}"?`)) {
                                                        removeManager(mgr.docId);

                                                    }
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0, 0, 0, 0.05)',
                                            borderRadius: '12px',
                                            border: '2px dashed rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                                                Secret ID:
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <code style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: 'var(--card-bg)',
                                                    borderRadius: '8px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '2px',
                                                    color: 'var(--accent)',
                                                    border: '2px solid var(--accent-light)'
                                                }}>
                                                    {mgr.secretID}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(mgr.secretID);
                                                        alert('Secret ID copied to clipboard!');
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.75rem' }}
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {
                showAddModal && (
                    <AddMenuModal
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingItem(null);
                        }}
                        onSave={addMenuItem}
                    />
                )
            }
            {
                editingItem && (
                    <AddMenuModal
                        item={editingItem}
                        onClose={() => setEditingItem(null)}
                        onSave={(updatedItem) => {
                            updateMenuItem(editingItem.id, updatedItem);
                            setEditingItem(null);
                        }}
                    />
                )
            }
            {
                showAddWaiterModal && (
                    <AddWaiterModal
                        onClose={() => {
                            setShowAddWaiterModal(false);
                            setNewSecretID(null);
                        }}
                        onAdd={async (name, photo) => {
                            const secretID = await addWaiter(name, photo);
                            setNewSecretID(secretID);
                        }}
                        secretID={newSecretID}
                    />
                )
            }
            {
                showAddKitchenModal && (
                    <AddKitchenModal
                        onClose={() => {
                            setShowAddKitchenModal(false);
                            setNewKitchenSecretID(null);
                        }}
                        onAdd={async (name, photo) => {
                            const secretID = await addKitchenStaff(name, photo);
                            setNewKitchenSecretID(secretID);
                        }}
                        secretID={newKitchenSecretID}
                    />
                )
            }
            {
                showAddSubManagerModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                            {!newSubManagerSecretID ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Add Sub Manager</h3>
                                        <button onClick={() => setShowAddSubManagerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const name = e.target.elements.name.value;
                                        if (!name.trim()) return;
                                        const secret = await addSubManager(name, subManagerPhoto);
                                        setNewSubManagerSecretID(secret);
                                        setSubManagerPhoto('');
                                        e.target.reset();
                                    }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                                            <input
                                                name="name"
                                                type="text"
                                                className="input-field"
                                                placeholder="Enter Name"
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Profile Photo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSubManagerImageChange}
                                                className="input-field"
                                                style={{ padding: '0.5rem' }}
                                            />
                                            {subManagerPhoto && (
                                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                                    <img src={subManagerPhoto} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                            Create Account
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '60px', height: '60px', background: '#10b981', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'
                                    }}>
                                        <span style={{ fontSize: '30px', color: 'white' }}>✓</span>
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Sub Manager Added!</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Share these credentials containing the Secret ID.</p>

                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px border var(--border-color)' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '4px', color: '#6366f1' }}>
                                            {newSubManagerSecretID}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>SECRET ID</div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setNewSubManagerSecretID(null);
                                            setShowAddSubManagerModal(false);
                                        }}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {
                showAddManagerModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                            {!newManagerSecretID ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Add Manager</h3>
                                        <button onClick={() => setShowAddManagerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const name = e.target.elements.name.value;
                                        if (!name.trim()) return;
                                        const secret = await addManager(name, managerPhoto);
                                        setNewManagerSecretID(secret);
                                        setManagerPhoto('');
                                        e.target.reset();
                                    }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                                            <input
                                                name="name"
                                                type="text"
                                                className="input-field"
                                                placeholder="Enter Manager Name"
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Profile Photo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleManagerImageChange}
                                                className="input-field"
                                                style={{ padding: '0.5rem' }}
                                            />
                                            {managerPhoto && (
                                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                                    <img src={managerPhoto} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                            Create Manager Account
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '60px', height: '60px', background: '#10b981', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'
                                    }}>
                                        <span style={{ fontSize: '30px', color: 'white' }}>✓</span>
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Manager Added!</h3>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Share these credentials with the manager. They will need the Secret ID to login.</p>

                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '4px', color: '#8b5cf6' }}>
                                            {newManagerSecretID}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>SECRET ID</div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setNewManagerSecretID(null);
                                            setShowAddManagerModal(false);
                                        }}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

function StatCard({ icon, title, value, gradient }) {
    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: gradient
                ? `linear-gradient(135deg, ${extractGradientContent(gradient)}15, rgba(255, 255, 255, 0.95))`
                : 'var(--glass-bg)',
            border: gradient ? `2px solid ${extractGradientContent(gradient)}30` : '2px solid var(--glass-border)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                background: gradient || 'var(--gradient-accent)',
                padding: '1rem',
                borderRadius: '16px',
                boxShadow: `0 4px 15px ${gradient ? extractGradientContent(gradient) : 'rgba(233, 69, 96, 0.3)'}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '60px',
                height: '60px'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{
                    margin: 0,
                    marginBottom: '0.5rem',
                    color: 'var(--text-dim)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {title}
                </h4>
                <h2 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    background: gradient || 'var(--gradient-accent)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {value}
                </h2>
            </div>
        </div>
    );
}

function AddMenuModal({ onClose, onSave, item }) {
    const isEditMode = !!item;
    const standardCategories = ['South Indian', 'Chinese', 'Japanese', 'North Indian'];
    const itemCategory = item?.category || 'South Indian';
    const isCustomCategory = item && !standardCategories.includes(itemCategory);

    const [formData, setFormData] = useState({
        name: item?.name || '',
        price: item?.price || '',
        category: isCustomCategory ? 'Other' : itemCategory,
        image: item?.image || '',
        benefits: item?.benefits || '',
        available: item?.available !== false // Default true for new items
    });
    const [imagePreview, setImagePreview] = useState(item?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [customCategory, setCustomCategory] = useState(isCustomCategory ? itemCategory : '');
    const isOtherCategory = formData.category === 'Other';

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImagePreview(base64String);
                setFormData({ ...formData, image: base64String });
            };
            reader.onerror = () => {
                alert('Error reading image file');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isEditMode && !formData.image) {
            alert('Please select an image');
            return;
        }
        if (isOtherCategory && !customCategory.trim()) {
            alert('Please enter a custom category');
            return;
        }
        onSave({
            ...formData,
            category: isOtherCategory ? customCategory.trim() : formData.category,
            price: Number(formData.price),
            available: formData.available // Use the form value
        });
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    flexShrink: 0,
                    width: '100%'
                }}>
                    <h2 style={{ margin: 0, color: 'var(--text-light)' }}>
                        {isEditMode ? '✏️ Edit Menu Item' : '➕ Add New Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(233, 69, 96, 0.2)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="add-menu-form"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minHeight: 0,
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                >
                    <input
                        className="input-field"
                        placeholder="Food Name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                        className="input-field"
                        type="number"
                        placeholder="Price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />

                    {/* Availability Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}>
                        <input
                            type="checkbox"
                            checked={formData.available !== false}
                            onChange={e => setFormData({ ...formData, available: e.target.checked })}
                            id="available-check"
                            style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                        />
                        <label htmlFor="available-check" style={{ color: 'var(--text-light)', fontWeight: '600', cursor: 'pointer' }}>
                            Item is Available
                        </label>
                    </div>
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                        <select
                            className="input-field"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                            <option>South Indian</option>
                            <option>Chinese</option>
                            <option>Japanese</option>
                            <option>North Indian</option>
                            <option>Other</option>
                        </select>
                        {isOtherCategory && (
                            <input
                                className="input-field"
                                placeholder="Enter custom category"
                                required
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    marginTop: '10px'
                                }}
                            />
                        )}
                    </div>

                    {/* Image Upload Section */}
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-light)',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            Food Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                boxSizing: 'border-box'
                            }}
                            required={!isEditMode}
                        />
                        {isEditMode && imagePreview && (
                            <p style={{
                                marginTop: '8px',
                                fontSize: '0.85rem',
                                color: 'var(--text-dim)',
                                fontStyle: 'italic'
                            }}>
                                Leave empty to keep current image
                            </p>
                        )}
                        {imagePreview && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                />
                                <p style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    {imageFile?.name}
                                </p>
                            </div>
                        )}
                    </div>

                    <textarea
                        className="input-field"
                        placeholder="Benefits / Description"
                        required
                        rows="6"
                        value={formData.benefits}
                        onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            minHeight: '120px',
                            lineHeight: '1.5'
                        }}
                    />

                    <button
                        className="btn btn-primary"
                        style={{
                            justifyContent: 'center',
                            marginTop: '10px',
                            flexShrink: 0,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                        type="submit"
                    >
                        {isEditMode ? '💾 Update Item' : '💾 Save Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AddWaiterModal({ onClose, onAdd, secretID }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 800 * 1024) {
                alert('Image size should be less than 800KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter waiter name');
            return;
        }
        onAdd(name, image);
        setName('');
        setImage('');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '30px',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-light)' }}>
                        {secretID ? '✅ Waiter Added!' : '👨‍🍳 Add New Waiter'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {secretID ? (
                    <div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '2px solid rgba(16, 185, 129, 0.3)',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                                ⚠️ Save this Secret ID! It will only be shown once.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <code style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    letterSpacing: '3px',
                                    color: 'var(--accent)',
                                    border: '2px solid var(--accent-light)',
                                    textAlign: 'center'
                                }}>
                                    {secretID}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(secretID);
                                        alert('Secret ID copied to clipboard!');
                                    }}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--gradient-accent)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            className="input-field"
                            placeholder="Waiter Name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Profile Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="input-field"
                                style={{ padding: '0.5rem' }}
                            />
                            {image && <img src={image} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', marginTop: '10px', objectFit: 'cover' }} />}
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            type="submit"
                        >
                            Add Waiter
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

function AddKitchenModal({ onClose, onAdd, secretID }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 800 * 1024) {
                alert('Image size should be less than 800KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter kitchen staff name');
            return;
        }
        onAdd(name, image);
        setName('');
        setImage('');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '30px',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-light)' }}>
                        {secretID ? '✅ Kitchen Staff Added!' : '🍳 Add Kitchen Staff'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {secretID ? (
                    <div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '2px solid rgba(245, 158, 11, 0.3)',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                                ⚠️ Save this Secret ID! It will only be shown once.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <code style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    letterSpacing: '3px',
                                    color: 'var(--accent)',
                                    border: '2px solid var(--accent-light)',
                                    textAlign: 'center'
                                }}>
                                    {secretID}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(secretID);
                                        alert('Secret ID copied to clipboard!');
                                    }}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--gradient-accent)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            className="input-field"
                            placeholder="Kitchen Staff Name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Profile Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="input-field"
                                style={{ padding: '0.5rem' }}
                            />
                            {image && <img src={image} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', marginTop: '10px', objectFit: 'cover' }} />}
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            type="submit"
                        >
                            Add Kitchen Staff
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}


