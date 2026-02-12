/**
 * Main dashboard page
 */
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCountUp } from '../hooks/useCountUp';
import { api } from '../utils/api';
import ScenarioControls from '../components/ScenarioControls';
import TransactionFeed from '../components/TransactionFeed';
import AlertQueue from '../components/AlertQueue';
import { downloadSystemReport } from '../utils/reportGenerator';

// Stats card component for cleaner code
const StatCard = ({ title, value, subValue, type = 'neutral', delay = 0, icon }) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const animatedValue = useCountUp(numericValue, 2000);

    // Format display value
    let displayValue = animatedValue;
    if (title.includes('Rate')) displayValue = animatedValue.toFixed(1) + '%';
    else displayValue = Math.round(animatedValue).toLocaleString();

    const getColors = () => {
        switch (type) {
            case 'success': return 'text-success-400 from-success-500/10 to-transparent border-success-500/20 shadow-[0_0_15px_rgba(74,222,128,0.05)]';
            case 'warning': return 'text-warning-400 from-warning-500/10 to-transparent border-warning-500/20 shadow-[0_0_15px_rgba(250,204,21,0.05)]';
            case 'danger': return 'text-danger-400 from-danger-500/10 to-transparent border-danger-500/20 shadow-[0_0_15px_rgba(248,113,113,0.05)]';
            case 'primary': return 'text-primary-400 from-primary-500/10 to-transparent border-primary-500/20 shadow-[0_0_15px_rgba(67,97,238,0.05)]';
            default: return 'text-slate-200 from-slate-800/40 to-slate-900/40 border-slate-700/50';
        }
    };

    const colors = getColors();

    return (
        <div
            className={`glass-cyber rounded-xl p-6 relative overflow-hidden bg-gradient-to-br ${colors} animate-enter hover:shadow-neon-border transition-all duration-300 group`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</div>
                    {icon && <div className="text-lg opacity-80 group-hover:scale-110 transition-transform duration-300 text-neon-cyan">{icon}</div>}
                </div>
                <div className={`text-4xl font-bold tracking-tight font-mono ${type === 'neutral' ? 'text-white' : ''} drop-shadow-lg`}>
                    {displayValue}
                </div>
                {subValue && (
                    <div className="mt-2 text-xs text-slate-500 font-medium border-t border-white/5 pt-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-neon-blue"></span>
                        {subValue}
                    </div>
                )}
            </div>

            {/* Decorative background glow */}
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${type === 'success' ? 'bg-success-500' :
                type === 'warning' ? 'bg-warning-500' :
                    type === 'danger' ? 'bg-danger-500' :
                        type === 'primary' ? 'bg-primary-500' : 'bg-slate-500'
                }`}></div>
        </div>
    );
};

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);

    // WebSocket connection for real-time updates
    const { isConnected } = useWebSocket('/ws/live', (message) => {
        if (message.type === 'transaction') {
            setTransactions(prev => [message.data, ...prev].slice(0, 100)); // Keep last 100
        } else if (message.type === 'alert') {
            loadAlerts(); // Reload alerts when new one arrives
            loadStats(); // Update stats
        }
    });

    // Load initial data
    useEffect(() => {
        loadTransactions();
        loadAlerts();
        loadStats();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await api.getTransactions({ limit: 50 });
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const loadAlerts = async () => {
        try {
            const data = await api.getAlerts({ limit: 50 });
            setAlerts(data);
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const loadStats = async () => {
        try {
            const data = await api.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleSimulationStart = (result) => {
        console.log('Simulation started:', result);
        // Optionally show a notification
    };
    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Security <span className="text-neon-cyan font-light">Operations Center</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-mono text-sm uppercase tracking-wider">
                        Real-time AML Surveillance & Threat Detection
                    </p>
                </div>
                <button
                    onClick={() => downloadSystemReport()}
                    className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white border border-white/10 hover:border-neon-cyan/50 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 group shadow-lg"
                >
                    <span className="text-neon-cyan group-hover:animate-pulse">📥</span>
                    Download System Report
                </button>
            </div>

            {/* Header Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-cyber rounded-xl p-6 relative overflow-hidden animate-enter hover:shadow-neon-border transition-all duration-300" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Status</div>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-danger-500'} animate-pulse`}></div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`}></div>
                        <div className="text-2xl font-bold text-white tracking-tight font-mono">
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 border-t border-white/5 pt-2">
                        {isConnected ? 'Secure WebSocket Channel Active' : 'Attempting Reconnection...'}
                    </div>

                    {/* Animated background line */}
                    {isConnected && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-success-500 to-transparent opacity-50 animate-pulse-slow"></div>
                    )}
                </div>

                <StatCard
                    title="Total Transactions"
                    value={stats?.total_transactions || 0}
                    type="primary"
                    delay={100}
                    icon="💳"
                    subValue="PROCESSED SESSION"
                />

                <StatCard
                    title="Active Alerts"
                    value={stats?.total_alerts || 0}
                    type="warning"
                    delay={200}
                    icon="⚠️"
                    subValue="ACTION REQUIRED"
                />

                <StatCard
                    title="Detection Rate"
                    value={stats?.detection_rate || 0}
                    type="success"
                    delay={300}
                    icon="🎯"
                    subValue="MODEL ACCURACY"
                />
            </div>

            {/* Scenario Controls */}
            <div className="animate-enter" style={{ animationDelay: '400ms' }}>
                <ScenarioControls onSimulationStart={handleSimulationStart} />
            </div>

            {/* Main Grid: Data Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
                {/* Transaction Feed - Uses 7 columns */}
                <div className="lg:col-span-7 h-full animate-enter" style={{ animationDelay: '500ms' }}>
                    <TransactionFeed transactions={transactions} />
                </div>

                {/* Alert Queue - Uses 5 columns */}
                <div className="lg:col-span-5 h-full animate-enter" style={{ animationDelay: '600ms' }}>
                    <AlertQueue alerts={alerts} />
                </div>
            </div>

            {/* Alert Level Distribution */}
            {stats && stats.alerts_by_level && (
                <div className="glass-cyber rounded-xl p-8 animate-enter relative overflow-hidden" style={{ animationDelay: '700ms' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-violet/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-neon-cyan">📊</span> Alert Distribution
                        </h3>
                        <div className="text-xs text-slate-500 font-mono">WINDOW: LAST 24H</div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 relative z-10">
                        {Object.entries(stats.alerts_by_level).map(([level, count], idx) => (
                            <div key={level} className="relative group p-4 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-md">
                                <div className={`text-3xl font-bold mb-1 tracking-tight font-mono ${level === 'CRITICAL' ? 'text-danger-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                    level === 'HIGH' ? 'text-warning-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                                        level === 'MEDIUM' ? 'text-yellow-400' :
                                            'text-primary-400'
                                    }`}>
                                    {count}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{level}</div>

                                {/* Bottom bar indicator */}
                                <div className={`absolute bottom-0 left-0 h-1 rounded-bl-lg rounded-br-lg transition-all duration-500 w-full opacity-50 group-hover:opacity-100 ${level === 'CRITICAL' ? 'bg-danger-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                    level === 'HIGH' ? 'bg-warning-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                        level === 'MEDIUM' ? 'bg-yellow-500' :
                                            'bg-primary-500'
                                    }`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
