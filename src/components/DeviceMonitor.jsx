import React, { useEffect, useState, useRef } from "react";
import { fetchDeviceStatus } from "../services/deviceService";
import { Wifi, WifiOff, Battery, Activity, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeviceMonitor({ tables }) {
    const [devices, setDevices] = useState([]);
    const previousDevicesRef = useRef([]);
    const [loading, setLoading] = useState(true);

    async function loadDevices() {
        // Fetch real status from DB
        const dbData = await fetchDeviceStatus();

        // Merge DB data with existing table list to ensure all tables are shown
        // If a table has no entry in device_status, show as offline/unknown
        const mergedData = tables.map(table => {
            // Find status by table_id (assuming table_id stores 'T1', 'T2' etc.)
            // Or maybe just table number. Let's normalize. 
            // If table.tableNo is '1', we look for 'T1'.
            const tableId = `T${table.tableNo}`;
            const statusEntry = dbData.find(d => d.table_id === tableId || d.table_id === table.tableNo);

            return {
                id: table.docId,
                tableNo: table.tableNo,
                tableId: tableId,
                status: statusEntry?.status || 'offline',
                battery: statusEntry?.battery || 0,
                lastSeen: statusEntry?.last_seen || null,
                deviceId: statusEntry?.device_id || null
            };
        });

        // Detect offline change
        // Detect offline change
        mergedData.forEach((device) => {
            const prev = previousDevicesRef.current.find(d => d.tableId === device.tableId);

            // detect change from online -> offline
            if (prev && prev.status === "online" && device.status === "offline") {
                toast.error(`⚠️ Table ${device.tableNo || device.tableId} device went OFFLINE`);
            }
        });

        previousDevicesRef.current = mergedData;
        setDevices(mergedData);
        setLoading(false);
    }

    const handlePairDevice = async (tableId) => {
        const deviceId = prompt(`Enter Device ID to pair with Table ${tableId} (e.g. ESP32_XYZ)`);

        if (!deviceId) return;

        try {
            // Using fetch as requested by user, adapted for table-context
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pair-device`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    table_id: tableId
                })
            });

            alert("Device Paired Successfully");
            loadDevices(); // Refresh list
        } catch (error) {
            console.error("Pairing error:", error);
            alert("Failed to pair device");
        }
    };

    useEffect(() => {
        loadDevices();

        const interval = setInterval(() => {
            loadDevices();
        }, 5000); // refresh every 5s

        return () => clearInterval(interval);
    }, [tables]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
            <Activity className="animate-spin" style={{ marginRight: '8px' }} />
            Loading device status...
        </div>
    );

    return (
        <div style={{ padding: '0 0.5rem' }}>
            <h3 style={{
                marginBottom: '1.5rem',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Activity size={24} color="#3b82f6" />
                Device Health Monitor
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                    Auto-refreshing every 5s
                </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {devices.map(device => {
                    const isOnline = device.status === 'online';

                    return (
                        <div key={device.id || device.tableId} className="glass-panel" style={{
                            padding: '1.25rem',
                            background: 'var(--card-bg)',
                            border: isOnline
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : '1px solid rgba(239, 68, 68, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Status Indicator Stripe */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: isOnline ? '#10b981' : '#ef4444'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-light)' }}>
                                    Table {device.tableNo}
                                </span>
                                {isOnline ? (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        color: '#10b981', background: 'rgba(16, 185, 129, 0.1)',
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                                    }}>
                                        <Wifi size={14} /> ONLINE
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)',
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                                    }}>
                                        <WifiOff size={14} /> OFFLINE
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                                fontSize: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Battery</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOnline ? 'var(--text-light)' : 'var(--text-dim)' }}>
                                        <Battery size={16} color={device.battery < 20 ? '#ef4444' : '#10b981'} />
                                        <span style={{ fontWeight: '600' }}>{device.battery}%</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Last Seen</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                                        <Clock size={14} />
                                        <span style={{ fontSize: '0.8rem' }}>
                                            {device.lastSeen
                                                ? new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Device ID</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--text-light)' }}>
                                        {device.deviceId ? (device.deviceId.length > 12 ? device.deviceId.slice(0, 10) + '...' : device.deviceId) : "Not Paired"}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePairDevice(device.tableId)}
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    background: '#3b82f6',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}
                            >
                                {device.deviceId ? "Change Device" : "Pair Device"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
