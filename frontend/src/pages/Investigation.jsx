import React, { useState } from 'react';

const Investigation = () => {
    const [filter, setFilter] = useState('active');

    const mockCases = [
        { id: 'CAS-8829', subject: 'High Frequency Transfers', status: 'In Progress', analyst: 'Alex Chen', priority: 'CRITICAL', updated: '2m ago' },
        { id: 'CAS-8825', subject: 'Linked Account Velocity', status: 'Pending Review', analyst: 'Sarah Miller', priority: 'HIGH', updated: '15m ago' },
        { id: 'CAS-8812', subject: 'Geo-mismatch Authentication', status: 'Under Analysis', analyst: 'James Wilson', priority: 'MEDIUM', updated: '1h ago' },
        { id: 'CAS-8798', subject: 'Suspicious Merchant Category', status: 'In Progress', analyst: 'Alex Chen', priority: 'HIGH', updated: '3h ago' },
        { id: 'CAS-8750', subject: 'Large PEP Transaction', status: 'Awaiting Info', analyst: 'Emily Davis', priority: 'MEDIUM', updated: '5h ago' },
    ];

    const stats = [
        { label: 'Active Cases', value: '24', color: 'text-neon-cyan' },
        { label: 'Avg Closure Time', value: '4.2h', color: 'text-neon-violet' },
        { label: 'Escalation Rate', value: '12%', color: 'text-danger-400' },
        { label: 'Efficiency Index', value: '98.4', color: 'text-success-400' },
    ];

    return (
        <div className="space-y-8 animate-enter">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Investigation <span className="text-neon-violet font-light">Portal</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-mono text-sm">
                        Enterprise-grade forensics and case management suite
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(mockCases, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `sentinel_cases_export_${new Date().getTime()}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-white/10 px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase"
                    >
                        Export Cases
                    </button>
                    <button className="bg-neon-violet/20 hover:bg-neon-violet/30 text-neon-violet border border-neon-violet/30 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-all duration-300 shadow-glow-sm hover:shadow-glow-md uppercase">
                        New Investigation
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-cyber p-6 rounded-xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
                        <div className="relative z-10 text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className={`relative z-10 text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Case List - Left Side (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-cyber rounded-xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h3 className="font-bold text-white font-mono uppercase tracking-widest text-sm">Active Case Feed</h3>
                            <div className="flex gap-2">
                                {['active', 'closed', 'all'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter border transition-all ${filter === t ? 'bg-neon-violet/20 text-neon-violet border-neon-violet/30' : 'bg-slate-800 text-slate-500 border-white/5 hover:text-slate-300'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Case ID</th>
                                        <th className="px-6 py-4 font-medium">Subject</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Priority</th>
                                        <th className="px-6 py-4 font-medium">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5 font-mono">
                                    {mockCases.map((c, idx) => (
                                        <tr key={idx} className="group hover:bg-white/5 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 text-neon-cyan font-bold leading-none">{c.id}</td>
                                            <td className="px-6 py-4 text-slate-300">
                                                <div className="flex flex-col">
                                                    <span>{c.subject}</span>
                                                    <span className="text-[10px] text-slate-500 mt-1">ANALYST: {c.analyst}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-white/10 uppercase">
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold ${c.priority === 'CRITICAL' ? 'text-danger-400' :
                                                    c.priority === 'HIGH' ? 'text-warning-400' : 'text-primary-400'
                                                    }`}>
                                                    ● {c.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-[10px]">{c.updated}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Analyst Tools - Right Side (1 col) */}
                <div className="space-y-6">
                    <div className="glass-cyber rounded-xl border border-white/5 p-6 space-y-4">
                        <h3 className="font-bold text-white font-mono uppercase tracking-widest text-xs flex items-center gap-2">
                            <span className="text-neon-cyan">🛠️</span> Analysis Toolkit
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {['Graph Network Visualizer', 'Entity Relationship Map', 'Wallet Trace API', 'Historical Comparison (Backtest)', 'AI Pattern Recommender'].map((tool, idx) => (
                                <button key={idx} className="w-full text-left p-3 rounded-lg border border-white/5 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-xs text-slate-400 hover:text-white group">
                                    <div className="flex items-center justify-between">
                                        <span>{tool}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-cyber rounded-xl border border-white/5 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-neon-violet opacity-30"></div>
                        <h3 className="font-bold text-white font-mono uppercase tracking-widest text-xs mb-4">Analyst Scoreboard</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Alex Chen', resolved: 12, rating: 98 },
                                { name: 'Sarah Miller', resolved: 9, rating: 95 },
                                { name: 'Emily Davis', resolved: 7, rating: 92 },
                            ].map((analyst, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                            {analyst.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-300 font-bold">{analyst.name}</div>
                                            <div className="text-[10px] text-slate-500">{analyst.resolved} cases resolved</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-neon-cyan">{analyst.rating}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Investigation;
