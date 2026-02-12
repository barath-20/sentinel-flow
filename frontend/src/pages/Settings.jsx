import React, { useState } from 'react';
import { downloadSystemReport, downloadStatsCSV, downloadAlertsCSV, downloadTransactionsCSV } from '../utils/reportGenerator';

const Settings = () => {
    const [notifications, setNotifications] = useState({ email: true, slack: true, browser: false, sms: false });
    const [thresholds, setThresholds] = useState({ risk: 75, velocity: 10, amount: 5000 });

    return (
        <div className="space-y-8 animate-enter">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    System <span className="text-secondary font-light">Configuration</span>
                </h2>
                <p className="text-slate-400 mt-2 font-mono text-sm">
                    Manage sentinel thresholds, integration tokens, and system preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Model Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-cyber rounded-xl border border-white/5 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl pointer-events-none">⚙️</div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-neon-cyan rounded-full"></span>
                            Detection Thresholds
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-mono text-slate-300 uppercase tracking-wider">Risk Score Sensitivity</label>
                                    <span className="text-neon-cyan font-mono font-bold">{thresholds.risk}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={thresholds.risk}
                                    onChange={(e) => setThresholds({ ...thresholds, risk: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">Alerts with risk score above this value will trigger critical notifications.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-mono text-slate-300 uppercase tracking-wider">Transaction Velocity Limit</label>
                                    <span className="text-neon-violet font-mono font-bold">{thresholds.velocity} tx/min</span>
                                </div>
                                <input
                                    type="range" min="1" max="50"
                                    value={thresholds.velocity}
                                    onChange={(e) => setThresholds({ ...thresholds, velocity: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-violet"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">Maximum allowed transactions per account per minute before flagging.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-mono text-slate-300 uppercase tracking-wider">Single Transaction Ceiling</label>
                                    <span className="text-success-400 font-mono font-bold">${thresholds.amount.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range" min="100" max="50000" step="100"
                                    value={thresholds.amount}
                                    onChange={(e) => setThresholds({ ...thresholds, amount: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-success-500"
                                />
                                <p className="text-[10px] text-slate-500 font-mono">Instant flagging for transactions exceeding this amount.</p>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button className="bg-neon-cyan/80 hover:bg-neon-cyan text-slate-900 font-bold px-8 py-3 rounded-lg text-sm transition-all duration-300 shadow-glow-sm hover:shadow-glow-md uppercase tracking-wider">
                                Apply Changes
                            </button>
                            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-3 rounded-lg text-sm transition-all duration-300 uppercase tracking-wider border border-white/5">
                                Revert
                            </button>
                        </div>
                    </div>

                    <div className="glass-cyber rounded-xl border border-white/5 p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-neon-violet rounded-full"></span>
                            Connected Systems (API)
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Mainframe Gateway', status: 'Connected', uptime: '99.99%', latency: '4ms' },
                                { name: 'Card Issuer API (Visa/MC)', status: 'Connected', uptime: '99.98%', latency: '42ms' },
                                { name: 'KYC Verification Service', status: 'Standby', uptime: '100%', latency: '-' },
                                { name: 'Historical DB (Postgres)', status: 'Connected', uptime: '99.9%', latency: '2ms' },
                            ].map((api, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${api.status === 'Connected' ? 'bg-success-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-warning-400'}`}></div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{api.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Latency: {api.latency} • Uptime: {api.uptime}</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-mono text-slate-400 hover:text-white border border-white/10 px-3 py-1 rounded-md uppercase transition-colors">Configure</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Notifications & User */}
                <div className="space-y-6">
                    <div className="glass-cyber rounded-xl border border-white/5 p-6">
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-6">Notification Channels</h3>
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300 font-mono capitalize">{key} Alerts</span>
                                    <button
                                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${value ? 'bg-neon-cyan' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${value ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-cyber rounded-xl border border-white/5 p-6 relative overflow-hidden group border-neon-blue/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-neon-blue/20 transition-all duration-700"></div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-6">Security Context</h3>

                        <div className="space-y-4 relative z-10">
                            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="text-[10px] text-slate-500 font-mono uppercase">Encryption Standard</div>
                                <div className="text-xs text-slate-300 font-bold font-mono">AES-256-GCM (RSA-4096)</div>
                            </div>
                            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="text-[10px] text-slate-500 font-mono uppercase">Last Rotation</div>
                                <div className="text-xs text-slate-300 font-bold font-mono">Feb 10, 2026 00:01 UTC</div>
                            </div>
                            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="text-[10px] text-slate-500 font-mono uppercase">Session Token Stability</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-grow h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-success-500 w-[94%]"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-success-400">94%</span>
                                </div>
                            </div>
                        </div>

                        <button className="mt-8 w-full py-3 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                            Purge All Data Logs
                        </button>
                    </div>

                    <div className="glass-cyber rounded-xl border border-white/5 p-6 space-y-4">
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="text-neon-cyan">📂</span> Data Exports & Reports
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono mb-4 uppercase">Securely export system state for audit and analysis</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => downloadSystemReport()}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">Full Audit Report</div>
                                    <div className="text-[9px] text-slate-500 font-mono">COMPLETE JSON DUMP</div>
                                </div>
                                <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">📑</span>
                            </button>

                            <button
                                onClick={() => downloadStatsCSV()}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white group-hover:text-neon-violet transition-colors">Performance Stats</div>
                                    <div className="text-[9px] text-slate-500 font-mono">CSV DATABASE EXPORT</div>
                                </div>
                                <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">📊</span>
                            </button>

                            <button
                                onClick={() => downloadAlertsCSV()}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white group-hover:text-warning-400 transition-colors">Alert History</div>
                                    <div className="text-[9px] text-slate-500 font-mono">CSV INCIDENT LOGS</div>
                                </div>
                                <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">⚠️</span>
                            </button>

                            <button
                                onClick={() => downloadTransactionsCSV()}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white group-hover:text-success-400 transition-colors">Transaction Logs</div>
                                    <div className="text-[9px] text-slate-500 font-mono">CSV TRAFFIC DUMP</div>
                                </div>
                                <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">💳</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
