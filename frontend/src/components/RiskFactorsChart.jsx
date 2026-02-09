import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RiskFactorsChart = ({ features }) => {
    // Prepare chart data
    let chartData = [];
    if (Array.isArray(features)) {
        chartData = features.map(f => ({
            name: f.feature_name || f.feature,
            value: Math.abs(f.importance_score || f.importance || 0),
            originalValue: f.feature_value || f.value,
            direction: f.direction
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    } else if (features && typeof features === 'object') {
        chartData = Object.entries(features).map(([key, value]) => ({
            name: key.replace(/_/g, ' '),
            value: Math.abs(value),
            originalValue: value
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }

    if (chartData.length === 0) return null;

    return (
        <div className="glass-cyber rounded-xl p-6 border border-white/5 relative overflow-hidden mt-8">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                Key Contributing Factors
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={180}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    const displayVal = data.originalValue === 0 ? "0 (Normal)" : data.originalValue;

                                    return (
                                        <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-2xl">
                                            <p className="text-white font-bold mb-2 font-mono text-xs">{label}</p>
                                            <div className="space-y-1 font-mono text-[10px]">
                                                <p className="text-neon-cyan">
                                                    IMP SCORE: <span className="text-white ml-1">{data.value.toFixed(2)}</span>
                                                </p>
                                                <p className="text-slate-400">
                                                    VAL: <span className="text-white ml-1">{displayVal}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.direction === 'increases' ? '#ef4444' : '#22c55e'}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-[10px] text-slate-500 text-center font-mono">
                FACTORS CONTRIBUTING TO RISK SCORE
            </div>
        </div>
    );
};

export default RiskFactorsChart;
