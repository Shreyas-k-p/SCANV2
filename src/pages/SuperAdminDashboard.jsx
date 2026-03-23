import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
    Activity, Users, Store, ShoppingCart, DollarSign,
    Search, Shield, CheckCircle, XCircle, Clock
} from 'lucide-react';
import './ManagerDashboard.css'; // Leverage existing dashboard styles

const SuperAdminDashboard = () => {
    const { user, t } = useApp();
    const [stats, setStats] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchPlatformData = async () => {
        try {
            // Fetch all restaurants
            const { data: restData, error: restError } = await supabase
                .from('restaurants')
                .select('*');
            
            if (restError) throw restError;
            setRestaurants(restData || []);

            // Fetch global counts (Simplifying for frontend demo)
            const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { data: ordersData } = await supabase.from('orders').select('totalAmount');

            const totalRevenue = ordersData?.reduce((acc, o) => acc + (o.totalAmount || 0), 0) || 0;
            const activeTenants = restData?.filter(r => r.isActive).length || 0;

            setStats({
                totalRestaurants: restData?.length || 0,
                activeRestaurants: activeTenants,
                totalUsers: usersCount || 0,
                totalRevenue: totalRevenue
            });
        } catch (error) {
            console.error('Error fetching platform data from Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Super Admin' || user?.role === 'SUPERADMIN') {
            fetchPlatformData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const toggleRestaurantStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('restaurants')
                .update({ isActive: !currentStatus })
                .eq('id', id);
            
            if (error) throw error;
            // Refresh list
            fetchPlatformData();
        } catch (error) {
            console.error('Error toggling status in Supabase:', error);
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        (r.name || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-state">Loading Platform Overlord View...</div>;

    return (
        <div className="manager-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <Shield className="header-icon" />
                    <h1>Scan4Serve Platform Control</h1>
                    <p>Global Governance & Analytics</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <Store className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Total Restaurants</span>
                        <span className="stat-value">{stats?.totalRestaurants}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Activity className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Active Tenants</span>
                        <span className="stat-value">{stats?.activeRestaurants}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Users className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Total Staff</span>
                        <span className="stat-value">{stats?.totalUsers}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <DollarSign className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Platform GMV</span>
                        <span className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="content-section">
                    <div className="section-header">
                        <h2>Registered Restaurants</h2>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search restaurants..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="staff-grid">
                        {filteredRestaurants.map(restaurant => (
                            <div key={restaurant.id} className="staff-card">
                                <div className="staff-info">
                                    <h3>{restaurant.name}</h3>
                                    <p className="role-badge">{(restaurant.plan || 'Free').toUpperCase()} Plan</p>

                                    <div className="status-indicators">
                                        <div className={`status-pill ${restaurant.subscriptionStatus || 'active'}`}>
                                            {(restaurant.subscriptionStatus || 'active') === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {(restaurant.subscriptionStatus || 'active').toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="staff-actions">
                                    <button
                                        className={`btn-toggle ${restaurant.isActive ? 'active' : 'inactive'}`}
                                        onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                                    >
                                        {restaurant.isActive ? 'Suspend' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredRestaurants.length === 0 && <p className="empty-state">No restaurants found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
