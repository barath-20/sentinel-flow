/**
 * Real-time transaction feed component
 */
import React, { useState, useEffect, useRef } from 'react';

const TransactionFeed = ({ transactions }) => {
    const feedRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (autoScroll && feedRef.current) {
            feedRef.current.scrollTop = 0; // Scroll to top for newest
        }
    }, [transactions, autoScroll]);

    const getRiskStyles = (riskScore) => {
        if (riskScore >= 80) return { border: 'border-l-danger-500', bg: 'bg-danger-900/10', glow: 'shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]', text: 'text-danger-400' };
        if (riskScore >= 60) return { border: 'border-l-warning-500', bg: 'bg-warning-900/10', glow: 'shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]', text: 'text-warning-400' };
        if (riskScore >= 40) return { border: 'border-l-primary-400', bg: 'bg-primary-900/10', glow: 'shadow-[inset_0_0_10px_rgba(96,165,250,0.1)]', text: 'text-primary-400' };
        return { border: 'border-l-success-500', bg: 'bg-slate-800/30', glow: '', text: 'text-success-400' };
    };

    const getAlertBadge = (alertLevel) => {
        const badges = {
            CRITICAL: 'bg-danger-500/20 text-danger-300 border border-danger-500/30 shadow-glow-sm',
            HIGH: 'bg-warning-500/20 text-warning-300 border border-warning-500/30',
            MEDIUM: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
            LOW: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
            NONE: 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
        };
        return badges[alertLevel] || badges.NONE;
    };

    return (
        <div className="glass-cyber rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 z-10 relative">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                        Live Feed
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">REAL-TIME MONITORING // ACTIVE</p>
                </div>

                <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 border ${autoScroll
                        ? 'bg-primary-600/20 text-primary-300 border-primary-500/30 hover:bg-primary-600/30 shadow-glow-sm'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                        }`}
                >
                    {autoScroll ? '⏸ PAUSE' : '▶ RESUME'}
                </button>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-900/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

            <div
                ref={feedRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth z-10 relative"
                style={{ maxHeight: '500px' }}
            >
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                            <span className="text-2xl opacity-50">📡</span>
                        </div>
                        <p className="font-mono text-xs tracking-widest uppercase">Waiting for data stream...</p>
                    </div>
                ) : (
                    transactions.map((txn, index) => {
                        const styles = getRiskStyles(txn.risk_score || 0);
                        return (
                            <div
                                key={txn.txn_id || index}
                                className={`group relative border-l-2 rounded-r-lg p-3 transition-all duration-300 hover:translate-x-1 ${styles.border} ${styles.bg} ${styles.glow} animate-enter hover:bg-opacity-80`}
                                style={{ animationDelay: `${index * 50}ms`, borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.03)' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono ${txn.txn_type === 'credit'
                                                ? 'bg-success-500/10 text-success-400 border border-success-500/20'
                                                : 'bg-danger-500/10 text-danger-400 border border-danger-500/20'
                                                }`}>
                                                {txn.txn_type}
                                            </span>

                                            {txn.alert_level && txn.alert_level !== 'NONE' && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getAlertBadge(txn.alert_level)}`}>
                                                    {txn.alert_level}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-white font-bold text-lg tracking-tight font-mono">
                                                ${txn.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">{txn.currency}</span>
                                        </div>

                                        <div className="text-xs text-slate-400 space-y-1 font-mono opacity-80">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                <span className="opacity-70">{txn.account_id}</span>
                                                <span className="text-slate-600">→</span>
                                                <span className="opacity-70">{txn.counterparty_id}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                {txn.country_code && (
                                                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800/50 border border-white/5">
                                                        <span>📍</span>
                                                        <span>{txn.country_code}</span>
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-slate-500">
                                                    {new Date(txn.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {txn.risk_score !== undefined && (
                                        <div className="ml-4 flex flex-col items-end justify-center h-full">
                                            <div className={`text-2xl font-bold tabular-nums tracking-tighter font-mono ${styles.text}`}>
                                                {Math.round(txn.risk_score)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <span>System: ONLINE</span>
                <span>Count: <span className="text-slate-300">{transactions.length}</span></span>
            </div>
        </div>
    );
};

export default TransactionFeed;
