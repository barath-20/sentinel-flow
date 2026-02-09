import React from 'react';

const ExplanationPanel = ({ explanation }) => {
    if (!explanation) return (
        <div className="glass-cyber rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                <span className="text-3xl opacity-50">💡</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select an Alert</h3>
            <p className="text-sm text-slate-400 max-w-xs">Analysis and feature importance will appear here when you select an alert.</p>
        </div>
    );

    // structured parser for the explanation text
    const ExplanationText = ({ text }) => {
        if (!text) return null;

        const lines = text.split('\n').filter(line => line.trim().length > 0);
        let currentSection = 'header';

        // Group lines by section for smarter rendering
        const sections = {
            header: [],
            rules: [],
            anomaly: [],
            ml: [],
            recommendation: []
        };

        lines.forEach(line => {
            if (line.includes('Rule Violations:')) currentSection = 'rules';
            else if (line.includes('Anomaly Detection:')) currentSection = 'anomaly';
            else if (line.includes('ML Model Prediction:')) currentSection = 'ml';
            else if (line.includes('Recommendation:')) currentSection = 'recommendation';
            else sections[currentSection].push(line);
        });

        return (
            <div className="space-y-6 font-mono text-xs leading-relaxed text-slate-300">
                {/* Header Section */}
                <div className="space-y-2 pb-4 border-b border-white/10">
                    {sections.header.map((line, idx) => {
                        if (line.includes('RISK ALERT')) return <h4 key={idx} className="text-lg font-bold text-white mb-2">{line}</h4>;
                        if (line.includes('Risk Score:')) {
                            const score = parseFloat(line.match(/[\d.]+/)?.[0] || 0);
                            return (
                                <div key={idx} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded border border-white/5">
                                    <span className="text-slate-400">Risk Score:</span>
                                    <span className={`text-lg font-bold ${score > 80 ? 'text-danger-400' : score > 50 ? 'text-warning-400' : 'text-success-400'}`}>
                                        {score}/100
                                    </span>
                                </div>
                            );
                        }
                        return <p key={idx} className="text-slate-400 pl-1 border-l-2 border-slate-600/50 ml-1">{line}</p>;
                    })}
                </div>

                {/* Rules Violations */}
                {sections.rules.length > 0 && (
                    <div className="space-y-3">
                        <h5 className="text-danger-400 font-bold flex items-center gap-2">
                            <span>🔴</span> Rule Violations
                        </h5>
                        <div className="space-y-2">
                            {sections.rules.map((line, idx) => (
                                <div key={idx} className="bg-danger-500/10 border border-danger-500/20 p-3 rounded-lg flex gap-3 items-start">
                                    <span className="text-danger-400 mt-0.5">⚠️</span>
                                    <span className="text-white">{line.replace('•', '').trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ML Analysis */}
                {sections.ml.length > 0 && (
                    <div className="space-y-3">
                        <h5 className="text-neon-blue font-bold flex items-center gap-2">
                            <span>🤖</span> ML Interpretation
                        </h5>
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-white/5 space-y-2">
                            {sections.ml.map((line, idx) => {
                                if (line.includes('ML Model Prediction')) return <div key={idx} className="text-neon-cyan font-bold mb-2 pb-2 border-b border-white/5">{line}</div>;
                                if (line.includes('Top contributing factors')) return <div key={idx} className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Key Drivers:</div>;

                                return (
                                    <div key={idx} className="flex items-start gap-2 pl-2 text-slate-300 py-1 hover:bg-white/5 rounded transition-colors">
                                        <span>•</span>
                                        <span>{line.replace('-', '').trim()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                {sections.recommendation.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4 rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">📋</div>
                            <h5 className="text-neon-cyan font-bold mb-2 uppercase tracking-wider text-[10px]">Action Required</h5>
                            {sections.recommendation.map((line, idx) => (
                                <p key={idx} className="text-white font-medium">{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass-cyber rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-neon-blue/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

            <div className="mb-6 z-10 relative flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-neon-cyan">🧠</span> AI Analysis
                </h3>
                <div className="text-[10px] text-slate-500 font-mono border border-white/10 px-2 py-1 rounded bg-slate-900/50">
                    EXPLAINABLE AI MODULE // ENABLED
                </div>
            </div>

            <div className="flex flex-col gap-6 flex-1 z-10 relative overflow-hidden h-full">
                {/* Narrative Summary */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-white/5 backdrop-blur-sm relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-violet to-neon-blue"></div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2 flex-shrink-0">
                        <span className="text-lg">📋</span> Analysis Summary
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <ExplanationText text={explanation} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplanationPanel;
