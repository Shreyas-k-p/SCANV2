import React, { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Wifi, WifiOff, Battery, Activity, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { pairDeviceWithTable } from "../services/deviceService";

export default function DeviceMonitor() {
    const { devices: dbDevices, tables } = useApp();
    const previousDevicesRef = useRef([]);

    // Merge DB devices with current tables to ensure we see all status even for un-entry tables
    const displayDevices = tables.map(table => {
        const statusEntry = dbDevices.find(d => String(d.tableId || d.tableNumber) === String(table.tableNo));
        return {
            id: table.docId,
            tableNo: table.tableNo,
            status: statusEntry?.status || 'offline',
            battery: statusEntry?.battery || 0,
            lastSeen: statusEntry?.lastPing || statusEntry?.last_seen || null,
            deviceId: statusEntry?.deviceId || statusEntry?.device_id || null
        };
    });

    useEffect(() => {
        displayDevices.forEach((device) => {
            const prev = previousDevicesRef.current.find(d => String(d.tableNo) === String(device.tableNo));
            if (prev && prev.status === "online" && device.status === "offline") {
                toast.error(`⚠️ Table ${device.tableNo} device went OFFLINE`);
            }
        });
        previousDevicesRef.current = displayDevices;
    }, [displayDevices]);

    const handlePairDevice = async (tableNo) => {
        const deviceId = prompt(`Enter Device ID to pair with Table ${tableNo} (e.g. ESP32_XYZ)`);
        if (!deviceId) return;
        try {
            await pairDeviceWithTable(deviceId, tableNo);
            alert("Device Paired Successfully");
        } catch (error) {
            console.error("Pairing error:", error);
            alert("Failed to pair device");
        }
    };

    return (
        <div style={{ padding: '0 0.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={24} color="#3b82f6" />
                Device Health Monitor
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                    Auto-refreshing every 5s
                </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {displayDevices.map(device => {
                    const isOnline = device.status && String(device.status).toLowerCase() === 'online';
                    return (
                        <div key={device.id || device.tableNo} className="glass-panel" style={{
                            padding: '1.25rem',
                            background: 'var(--card-bg)',
                            border: isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                            display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: isOnline ? '#10b981' : '#ef4444' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-light)' }}>Table {device.tableNo}</span>
                                {isOnline ? (
                                    <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                        <Wifi size={14} /> ONLINE
                                    </div>
                                ) : (
                                    <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                        <WifiOff size={14} /> OFFLINE
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Last Seen</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                                        <Clock size={14} />
                                        <span>{device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Never'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Device ID</span>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)' }}>{device.deviceId || "None"}</span>
                                </div>
                            </div>
                            <button onClick={() => handlePairDevice(device.tableNo)} style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Pair Device
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
