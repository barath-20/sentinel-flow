import React, { useState } from 'react';
import { api } from '../utils/api';

const ScenarioControls = ({ onSimulationStart }) => {
    const [loading, setLoading] = useState(false);
    const [activeScenario, setActiveScenario] = useState(null);

    const runScenario = async (scenarioType) => {
        setLoading(true);
        setActiveScenario(scenarioType);
        try {
            await api.startSimulation(scenarioType);
            if (onSimulationStart) onSimulationStart();
        } catch (error) {
            console.error("Failed to start scenario:", error);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setActiveScenario(null);
            }, 2000);
        }
    };

    const scenarios = [
        {
            id: 'structuring',
            label: 'Structuring Pattern',
            icon: '📉',
            desc: 'Multiple transactions just below $10K threshold',
            color: 'from-neon-violet to-neon-blue'
        },
        {
            id: 'mule',
            label: 'Mule Account',
            icon: '🔄',
            desc: 'Large credits followed by rapid movement',
            color: 'from-neon-blue to-neon-cyan'
        },
        {
            id: 'high_risk_corridor',
            label: 'High-Risk Corridor',
            icon: '🌍',
            desc: 'Transactions to/from high-risk jurisdictions',
            color: 'from-danger-500 to-warning-500'
        },
    ];

    const handleClearData = async () => {
        if (window.confirm('⚠️ WARNING: This will permanently delete ALL transaction history and alerts. Proceed?')) {
            try {
                await api.clearRecentData();
                window.location.reload(); // Refresh to clear all states
            } catch (error) {
                console.error('Error clearing data:', error);
            }
        }
    };

    return (
        <div className="glass-cyber rounded-xl p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-neon-violet/5 to-neon-blue/5 blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-neon-cyan">🕹️</span> Simulation Controls
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">INJECT SYNTHETIC PATTERNS</p>
                </div>

                <div className="flex items-center gap-4">
                    {loading && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping"></div>
                            <span className="text-xs font-mono text-neon-cyan animate-pulse">EXECUTING SCENARIO...</span>
                        </div>
                    )}

                    <button
                        onClick={handleClearData}
                        className="px-4 py-1.5 bg-danger-500/10 hover:bg-danger-500/20 border border-danger-500/30 hover:border-danger-500/50 text-danger-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <span>🗑️</span> Reset System
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => runScenario(scenario.id)}
                        disabled={loading}
                        className={`group relative overflow-hidden rounded-xl p-[1px] transition-all duration-300 ${activeScenario === scenario.id
                            ? 'scale-[0.98] opacity-90'
                            : 'hover:scale-[1.02] hover:shadow-neon-border'
                            }`}
                    >
                        {/* Gradient Border Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${scenario.color} opacity-20 group-hover:opacity-100 transition-opacity duration-300`}></div>

                        {/* Inner Content */}
                        <div className="relative h-full bg-slate-900/90 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 transition-colors group-hover:bg-slate-900/80">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center text-lg shadow-lg group-hover:shadow-glow-md transition-shadow duration-300`}>
                                {scenario.icon}
                            </div>

                            <div className="text-left">
                                <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{scenario.label}</div>
                                <div className="text-[10px] text-slate-500 font-mono leading-tight">{scenario.desc}</div>
                            </div>

                            {/* Use glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${scenario.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ScenarioControls;
