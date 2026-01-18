import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, TrendingUp, Users, Plus, X, MessageSquare, Calendar, Edit, Settings, UserPlus, ChefHat, Copy, Trash2, Shield } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function SubManagerDashboard() {
    const {
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        orders,
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
        user
    } = useApp();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('orders'); // Default to orders

    const [showAddWaiterModal, setShowAddWaiterModal] = useState(false);
    const [showAddKitchenModal, setShowAddKitchenModal] = useState(false);
    const [newSecretID, setNewSecretID] = useState(null);
    const [newKitchenSecretID, setNewKitchenSecretID] = useState(null);

    // Form States
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: 'South Indian',
        image: '',
        benefits: '',
        available: true
    });

    const [waiterName, setWaiterName] = useState('');
    const [kitchenName, setKitchenName] = useState('');
    const [waiterImage, setWaiterImage] = useState('');
    const [kitchenImage, setKitchenImage] = useState('');

    const handleImageChange = (e, setImage) => {
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

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateMenuItem(editingItem.id, newItem);
                setEditingItem(null);
            } else {
                await addMenuItem(newItem);
            }
            setShowAddModal(false);
            setNewItem({ name: '', price: '', category: 'South Indian', image: '', benefits: '', available: true });
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Failed to save item");
        }
    };

    const handleAddWaiter = async (e) => {
        e.preventDefault();
        if (!waiterName.trim()) return;
        const secret = await addWaiter(waiterName, waiterImage);
        setNewSecretID(secret);
        setWaiterName('');
        setWaiterImage('');
    };

    const handleAddKitchen = async (e) => {
        e.preventDefault();
        if (!kitchenName.trim()) return;
        const secret = await addKitchenStaff(kitchenName, kitchenImage);
        setNewKitchenSecretID(secret);
        setKitchenName('');
        setKitchenImage('');
    };

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
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 6px 25px rgba(99, 102, 241, 0.3)'
                }}>
                    {user?.profilePhoto && (
                        <img
                            src={user.profilePhoto}
                            alt="Profile"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                        />
                    )}
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Shield size={32} /> Sub Manager Dashboard
                    </h1>
                </div>
                <LanguageSwitcher />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'orders', label: `📋 ${t('activeOrders')}` },
                    { key: 'menu', label: `🍽️ ${t('manageMenu')}` },
                    { key: 'tables', label: `🪑 ${t('tables')}` },
                    { key: 'waiters', label: `👨‍🍳 ${t('manageStaff')}` },
                    { key: 'kitchen', label: `🍳 ${t('kitchenStaff')}` }
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            borderRadius: '12px',
                            padding: '0.875rem 1.5rem',
                            fontWeight: '600'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT ARAS */}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-light)' }}>
                        Order Management
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {orders.length === 0 ? <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>No orders found</div> :
                            orders.slice().reverse().map(order => (
                                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--accent)' }}>Order #{order.id.slice(-6).toUpperCase()}</span>
                                        <span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                                        <div>Table: {order.tableNo}</div>
                                        <div>Total: ₹{order.totalAmount}</div>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                                <span>{item.name}</span>
                                                <span>x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Menu Items</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} /> Add Item
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {menuItems.map(item => (
                            <div key={item.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                                <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.25rem' }}>₹{item.price}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '0.5rem' }}
                                        onClick={() => {
                                            setEditingItem(item);
                                            setNewItem(item);
                                            setShowAddModal(true);
                                        }}
                                    >Edit</button>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none' }}
                                        onClick={() => {
                                            if (window.confirm("Delete this item?")) deleteMenuItem(item.id);
                                        }}
                                    >Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* WAITER TAB */}
            {activeTab === 'waiters' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Waiter Staff</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddWaiterModal(true)}>
                            <UserPlus size={18} /> Add Waiter
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {waiters.map(waiter => (
                            <div key={waiter.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {waiter.profilePhoto && <img src={waiter.profilePhoto} alt={waiter.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />}
                                        {waiter.name}
                                    </h3>
                                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>ID: {waiter.id}</p>
                                    <code style={{ display: 'block', marginTop: '0.5rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Secret: {waiter.secretID}
                                    </code>
                                </div>
                                <button
                                    onClick={() => { if (window.confirm("Remove waiter?")) removeWaiter(waiter.docId); }}
                                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* KITCHEN TAB */}
            {activeTab === 'kitchen' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Kitchen Staff</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddKitchenModal(true)}>
                            <ChefHat size={18} /> Add Chef
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {kitchenStaff.map(staff => (
                            <div key={staff.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {staff.profilePhoto && <img src={staff.profilePhoto} alt={staff.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />}
                                        {staff.name}
                                    </h3>
                                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>ID: {staff.id}</p>
                                    <code style={{ display: 'block', marginTop: '0.5rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        Secret: {staff.secretID}
                                    </code>
                                </div>
                                <button
                                    onClick={() => { if (window.confirm("Remove kitchen staff?")) removeKitchenStaff(staff.docId); }}
                                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TABLES TAB */}
            {activeTab === 'tables' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Tables</h2>
                        <button className="btn btn-primary" onClick={() => {
                            const num = prompt(t('tableNumber'));
                            if (!num) return;
                            addTable(Number(num));
                        }}>
                            <Plus size={18} /> Add Table
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {tables.map(table => (
                            <div key={table.docId} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                                <h3 style={{ margin: 0 }}>Table {table.tableNo}</h3>
                                <button
                                    onClick={() => removeTable(table.docId)}
                                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALS */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input-field" placeholder="Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                            <input className="input-field" type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
                            <select className="input-field" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                <option>South Indian</option>
                                <option>North Indian</option>
                                <option>Chinese</option>
                                <option>Arabic</option>
                                <option>Japanese</option>
                                <option>Dessert</option>
                                <option>Beverage</option>
                            </select>
                            <input className="input-field" placeholder="Image URL" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
                            <textarea className="input-field" placeholder="Description/Benefits" value={newItem.benefits} onChange={e => setNewItem({ ...newItem, benefits: e.target.value })} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={newItem.available} onChange={e => setNewItem({ ...newItem, available: e.target.checked })} />
                                Available
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); setEditingItem(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddWaiterModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        {!newSecretID ? (
                            <>
                                <h3>Add New Waiter</h3>
                                <form onSubmit={handleAddWaiter}>
                                    <input className="input-field" placeholder="Waiter Name" value={waiterName} onChange={e => setWaiterName(e.target.value)} required />
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Profile Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, setWaiterImage)}
                                            className="input-field"
                                            style={{ padding: '0.5rem' }}
                                        />
                                        {waiterImage && (
                                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                                <img src={waiterImage} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddWaiterModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Create</button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: 'var(--success)' }}>Waiter Added!</h3>
                                <p>Secret ID: <strong>{newSecretID}</strong></p>
                                <button className="btn btn-primary" onClick={() => { setNewSecretID(null); setShowAddWaiterModal(false); }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddKitchenModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        {!newKitchenSecretID ? (
                            <>
                                <h3>Add Kitchen Staff</h3>
                                <form onSubmit={handleAddKitchen}>
                                    <input className="input-field" placeholder="Chef Name" value={kitchenName} onChange={e => setKitchenName(e.target.value)} required />
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Profile Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, setKitchenImage)}
                                            className="input-field"
                                            style={{ padding: '0.5rem' }}
                                        />
                                        {kitchenImage && (
                                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                                <img src={kitchenImage} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddKitchenModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Create</button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: 'var(--success)' }}>Staff Added!</h3>
                                <p>Secret ID: <strong>{newKitchenSecretID}</strong></p>
                                <button className="btn btn-primary" onClick={() => { setNewKitchenSecretID(null); setShowAddKitchenModal(false); }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
