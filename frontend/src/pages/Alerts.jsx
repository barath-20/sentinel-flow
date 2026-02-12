import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AlertQueue from '../components/AlertQueue';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await api.getAlerts({ limit: 100 });
                setAlerts(data);
            } catch (error) {
                console.error('Error loading alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, []);

    return (
        <div className="space-y-8 animate-enter">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Alert <span className="text-neon-cyan font-light">Management</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-mono text-sm">
                        Centralized queue for all suspicious activity detections
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-cyber px-4 py-2 rounded-lg border border-white/5 flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active Alerts</span>
                            <span className="text-xl font-bold text-white font-mono">{alerts.length}</span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan border border-neon-cyan/20">
                            ⚠️
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="h-[calc(100vh-300px)] min-h-[600px]">
                    {loading ? (
                        <div className="glass-cyber rounded-xl p-12 h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-mono text-sm animate-pulse">INITIALIZING SECURE DATA FEED...</p>
                        </div>
                    ) : (
                        <AlertQueue alerts={alerts} maxHeight="calc(100vh - 400px)" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alerts;
