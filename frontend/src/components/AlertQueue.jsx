/**
 * Alert queue component with filtering and sorting
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AlertQueue = ({ alerts }) => {
    const [filter, setFilter] = useState('all'); // all, NEW, HIGH, CRITICAL
    const [sortBy, setSortBy] = useState('recent'); // recent, risk

    // Filter alerts
    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        if (filter === 'NEW') return alert.status === 'NEW';
        return alert.alert_level === filter;
    });

    // Sort alerts
    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.risk_score - a.risk_score;
    });

    const getAlertColor = (level) => {
        const colors = {
            CRITICAL: 'from-danger-600 to-danger-800 border-danger-500',
            HIGH: 'from-warning-600 to-warning-800 border-warning-500',
            MEDIUM: 'from-yellow-600 to-yellow-800 border-yellow-500',
            LOW: 'from-primary-600 to-primary-800 border-primary-500'
        };
        return colors[level] || 'from-slate-600 to-slate-800 border-slate-500';
    };

    const getBadgeStyle = (level) => {
        const badges = {
            CRITICAL: 'bg-danger-500/20 text-danger-300 border-danger-500/30',
            HIGH: 'bg-warning-500/20 text-warning-300 border-warning-500/30',
            MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            LOW: 'bg-primary-500/20 text-primary-300 border-primary-500/30'
        };
        return badges[level] || 'bg-slate-700 text-slate-300 border-slate-600';
    };

    const getStatusBadge = (status) => {
        const badges = {
            NEW: 'bg-success-500/20 text-success-400 border border-success-500/30 shadow-glow-sm',
            REVIEWED: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
            ESCALATED: 'bg-danger-500/20 text-danger-400 border border-danger-500/30 shadow-glow-sm',
            CLEARED: 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
        };
        return badges[status] || 'bg-slate-700 text-slate-300';
    };

    return (
        <div className="glass-cyber rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-violet/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

            {/* Header */}
            <div className="mb-6 z-10 relative">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neon-violet animate-pulse"></span>
                        Alert Queue
                    </h3>
                    <div className="bg-slate-800/50 px-2 py-1 rounded text-xs border border-white/5 text-slate-400 font-mono">
                        {alerts.length} PENDING
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'NEW', 'CRITICAL', 'HIGH'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-200 border uppercase tracking-wider ${filter === f
                                    ? 'bg-primary-600/20 text-primary-300 border-primary-500/30 shadow-glow-sm'
                                    : 'bg-slate-800/30 text-slate-400 border-white/5 hover:bg-slate-700/50'
                                    }`}
                            >
                                {f === 'all' ? 'ALL' : f}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span>SORT BY:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-900/50 text-slate-300 border border-white/10 rounded px-2 py-0.5 outline-none focus:border-primary-500/50 uppercase"
                        >
                            <option value="recent">RECENT</option>
                            <option value="risk">RISK SCORE</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar z-10 relative" style={{ maxHeight: '400px' }}>
                {sortedAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 border border-slate-700/50">
                            <span className="text-xl opacity-50">🔍</span>
                        </div>
                        <p className="text-xs font-mono uppercase tracking-widest">No alerts matching criteria</p>
                    </div>
                ) : (
                    sortedAlerts.map((alert, index) => (
                        <Link
                            key={alert.alert_id}
                            to={`/alert/${alert.alert_id}`}
                            className="group block relative pl-[3px] rounded-r-lg bg-slate-800/20 hover:bg-slate-800/40 transition-all duration-300 animate-enter hover:translate-x-1 border border-white/5 hover:border-white/10"
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            {/* Colorful left border gradient */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${getAlertColor(alert.alert_level)} rounded-l-lg shadow-glow-sm opacity-80 group-hover:opacity-100`}></div>

                            <div className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${getBadgeStyle(alert.alert_level)}`}>
                                            {alert.alert_level}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getStatusBadge(alert.status)}`}>
                                            {alert.status}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-xl font-bold tabular-nums tracking-tighter font-mono ${alert.risk_score >= 80 ? 'text-danger-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]' :
                                                alert.risk_score >= 60 ? 'text-warning-400' : 'text-primary-400'
                                            }`}>
                                            {Math.round(alert.risk_score)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-slate-300">
                                        <div className="font-bold text-white group-hover:text-primary-300 transition-colors mb-0.5 font-mono text-xs">ID: {alert.alert_id}</div>
                                        <div className="text-[10px] text-slate-500 font-mono uppercase">
                                            ACC: <span className="text-slate-400">{alert.account_id}</span>
                                        </div>
                                    </div>

                                    <div className="text-[9px] text-slate-600 font-mono">
                                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Triggered Rules Preview */}
                                {alert.triggered_rules && alert.triggered_rules.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                                        {alert.triggered_rules.slice(0, 2).map((rule, idx) => (
                                            <span
                                                key={idx}
                                                className="px-1.5 py-0.5 bg-slate-800/50 text-slate-400 rounded text-[9px] border border-white/5 truncate max-w-[120px] font-mono"
                                            >
                                                {rule.rule_name}
                                            </span>
                                        ))}
                                        {alert.triggered_rules.length > 2 && (
                                            <span className="px-1.5 py-0.5 text-slate-500 text-[9px] font-mono">
                                                +{alert.triggered_rules.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono">
                    <div>
                        <span className="text-slate-500">Showing </span>
                        <span className="text-slate-300 font-bold">{sortedAlerts.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
                        <span className="text-slate-400 px-1">NEW: </span>
                        <span className="text-success-400 font-bold">
                            {alerts.filter(a => a.status === 'NEW').length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertQueue;
