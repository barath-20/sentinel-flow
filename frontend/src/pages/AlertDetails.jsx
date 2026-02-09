/**
 * Alert details page with full explainability - Cyberpunk Edition
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import RiskGauge from '../components/RiskGauge';
import RiskFactorsChart from '../components/RiskFactorsChart';
import ExplanationPanel from '../components/ExplanationPanel';

const AlertDetails = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();
    const [alertData, setAlertData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlert();
        window.scrollTo(0, 0);
    }, [alertId]);

    const loadAlert = async () => {
        try {
            const data = await api.getAlert(alertId);
            setAlertData(data);
        } catch (error) {
            console.error('Error loading alert:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.updateAlert(alertId, { status: newStatus });
            setAlertData(prev => ({
                ...prev,
                alert: { ...prev.alert, status: newStatus }
            }));
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-neon-blue/30 border-t-neon-blue animate-spin shadow-glow-sm"></div>
                <div className="text-neon-cyan font-mono animate-pulse tracking-widest text-xs">ANALYZING SEQUENCE...</div>
            </div>
        );
    }

    if (!alertData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="text-6xl mb-6 opacity-20 filter blur-sm">🚫</div>
                <div className="text-white text-2xl font-bold mb-2 tracking-tight">Pattern Not Found</div>
                <p className="text-slate-400 mb-8 font-mono text-sm">The requested alert sequence could not be located in the neural net.</p>
                <Link to="/" className="px-8 py-3 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded-lg hover:bg-neon-blue/30 transition-all shadow-glow-sm font-mono text-xs uppercase tracking-wider">
                    Return to Matrix
                </Link>
            </div>
        );
    }

    const { alert, transaction } = alertData;
    const explanation = alert?.explanation;
    const features = alert?.top_features;

    const getAlertBadgeColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'bg-danger-500/20 text-danger-300 border-danger-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
            case 'HIGH': return 'bg-warning-500/20 text-warning-300 border-warning-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
            default: return 'bg-primary-500/20 text-primary-300 border-primary-500/50';
        }
    };

    // Prepare Score Breakdown Data
    const scoreBreakdown = [
        { name: 'Rules', value: alert?.rule_score || 0, color: '#ef4444', label: 'Rule Based' },      // Danger
        { name: 'Anomaly', value: alert?.anomaly_score || 0, color: '#f59e0b', label: 'Anomaly' },   // Warning
        { name: 'ML Model', value: alert?.ml_score || 0, color: '#4361ee', label: 'AI Model' }       // Primary
    ];

    return (
        <div className="space-y-8 animate-enter pb-12">
            {/* Background elements */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-neon-violet/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-breathe-slow"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs font-mono tracking-wide">
                <Link to="/" className="text-slate-500 hover:text-neon-cyan transition-colors flex items-center gap-2 group">
                    <span className="group-hover:shadow-glow-sm transition-all">TERMINAL</span>
                </Link>
                <span className="text-slate-700">/</span>
                <span className="text-neon-blue">CASE #{alert.alert_id}</span>
            </div>

            {/* Header Card */}
            <div className="glass-cyber rounded-xl p-8 border-l-4 border-l-neon-violet relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <div className="text-9xl font-mono font-bold text-white">⚠️</div>
                </div>

                <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10 w-full">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Investigation Protocol
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${getAlertBadgeColor(alert.alert_level)}`}>
                                {alert.alert_level}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${alert.status === 'NEW' ? 'bg-success-500/20 text-success-400 border-success-500/30' :
                                alert.status === 'REVIEWED' ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' :
                                    alert.status === 'ESCALATED' ? 'bg-danger-500/20 text-danger-400 border-danger-500/30' :
                                        'bg-slate-700/50 text-slate-300 border-slate-600/30'
                                }`}>
                                {alert.status}
                            </span>
                        </div>

                        {/* Top 3 Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-6 mb-6">
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-widest font-bold mb-1">Target Identity</span>
                                <span className="text-neon-cyan font-mono font-medium text-base">{alert.account_id}</span>
                            </div>
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-widest font-bold mb-1">Transaction Ref</span>
                                <span className="text-white font-mono font-medium text-base tracking-tight">{alert.txn_id}</span>
                            </div>
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                                <span className="text-slate-500 block text-[10px] uppercase tracking-widest font-bold mb-1">Timestamp</span>
                                <span className="text-white font-mono text-sm">{new Date(alert.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Score Breakdown (New Location) */}
                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                            {scoreBreakdown.map((item) => (
                                <div key={item.name} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.label}</span>
                                        <span className="text-lg font-bold font-mono" style={{ color: item.color }}>{Math.round(item.value)}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center pl-8 border-l border-white/5">
                        <RiskGauge score={alert.risk_score} size="large" />
                    </div>
                </div>

                {/* Action Toolbar */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                    <button
                        onClick={() => updateStatus('REVIEWED')}
                        disabled={alert.status === 'REVIEWED'}
                        className={`px-6 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 ${alert.status === 'REVIEWED'
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            : 'bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/50 shadow-glow-sm'
                            }`}
                    >
                        <span>ACKNOWLEDGE</span>
                    </button>
                    <button
                        onClick={() => updateStatus('ESCALATED')}
                        disabled={alert.status === 'ESCALATED'}
                        className={`px-6 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 ${alert.status === 'ESCALATED'
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            : 'bg-danger-500/20 hover:bg-danger-500/30 text-danger-400 border border-danger-500/50 shadow-glow-sm'
                            }`}
                    >
                        <span>ESCALATE THREAT</span>
                    </button>
                    <button
                        onClick={() => updateStatus('CLEARED')}
                        disabled={alert.status === 'CLEARED'}
                        className={`px-6 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 ${alert.status === 'CLEARED'
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-600'
                            }`}
                    >
                        <span>DISMISS</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction Information */}
                {transaction && (
                    <div className="glass-cyber rounded-xl p-6 relative overflow-hidden lg:col-span-1 h-[520px]">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl pointer-events-none"></div>

                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-neon-cyan rounded-full"></div>
                            Data Payload
                        </h3>

                        <div className="space-y-6">
                            {/* Main Amount */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-cyan opacity-50"></div>
                                <span className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Transfer Volume</span>
                                <div className="text-4xl font-bold text-white tracking-tight font-mono drop-shadow-lg">
                                    ${transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <span className="text-neon-blue font-bold mt-1 text-xs tracking-wider">{transaction.currency}</span>
                            </div>

                            {/* Details List */}
                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between items-center p-3 rounded bg-slate-800/20 border border-white/5">
                                    <span className="text-slate-500 uppercase">Type</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${transaction.txn_type === 'credit'
                                        ? 'text-success-400 bg-success-500/10'
                                        : 'text-danger-400 bg-danger-500/10'
                                        }`}>
                                        {transaction.txn_type}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-slate-800/20 border border-white/5">
                                    <span className="text-slate-500 uppercase">Channel</span>
                                    <span className="text-white">{transaction.channel}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-slate-800/20 border border-white/5">
                                    <span className="text-slate-500 uppercase">Beneficiary</span>
                                    <span className="text-slate-300">{transaction.counterparty_id}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-slate-800/20 border border-white/5">
                                    <span className="text-slate-500 uppercase">Geo-Tag</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{transaction.country_code || 'N/A'}</span>
                                        <span className="text-base">📍</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Analysis Panel */}
                <div className="lg:col-span-2 h-[520px]">
                    <ExplanationPanel explanation={explanation} />
                </div>
            </div>

            {/* Extended Analysis / Risk Factors (New Location) */}
            <RiskFactorsChart features={features} />

            {/* Back Button */}
            <div className="flex justify-center pt-8 border-t border-white/5 mt-12">
                <Link
                    to="/"
                    className="group px-6 py-2 rounded-lg bg-transparent text-slate-500 hover:text-white transition-all duration-300 font-mono text-xs uppercase tracking-widest flex items-center gap-3"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default AlertDetails;
