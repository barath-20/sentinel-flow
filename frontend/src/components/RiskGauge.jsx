import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

const RiskGauge = ({ score, size = 'normal' }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Cyberpunk Size mapping
    const dimensions = size === 'large' ? 'w-64 h-64' : 'w-32 h-32';
    const strokeWidth = size === 'large' ? 8 : 6;
    const textSize = size === 'large' ? 'text-6xl' : 'text-3xl';

    const getColors = (score) => {
        if (score >= 90) return {
            stroke: 'url(#gradient-danger)',
            shadow: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]',
            text: 'text-danger-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
        };
        if (score >= 70) return {
            stroke: 'url(#gradient-warning)',
            shadow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]',
            text: 'text-warning-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
        };
        if (score >= 40) return {
            stroke: 'url(#gradient-primary)',
            shadow: 'drop-shadow-[0_0_10px_rgba(67,97,238,0.6)]',
            text: 'text-primary-400 drop-shadow-[0_0_8px_rgba(67,97,238,0.8)]'
        };
        return {
            stroke: 'url(#gradient-success)',
            shadow: 'drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]',
            text: 'text-success-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'
        };
    };

    const colors = getColors(score);
    const animatedScore = useCountUp(score, 1500);

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Background Glow */}
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${score >= 80 ? 'bg-danger-500' :
                    score >= 60 ? 'bg-warning-500' :
                        score >= 40 ? 'bg-neon-blue' : 'bg-success-500'
                }`}></div>

            <div className={`${dimensions} relative z-10`}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Definitions for Gradients */}
                    <defs>
                        <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#EF4444" />
                            <stop offset="100%" stopColor="#7F1D1D" />
                        </linearGradient>
                        <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FACC15" />
                            <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4361EE" />
                            <stop offset="100%" stopColor="#7B2CBF" />
                        </linearGradient>
                        <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4ADE80" />
                            <stop offset="100%" stopColor="#22C55E" />
                        </linearGradient>
                    </defs>

                    {/* Background Circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth={strokeWidth}
                        className="opacity-50"
                        strokeLinecap="round"
                    />

                    {/* Progress Circle with Glow */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${colors.shadow}`}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`${textSize} font-bold font-mono tracking-tighter ${colors.text}`}>
                        {Math.round(animatedScore)}
                    </div>
                    {size === 'large' && (
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                            RISK LEVEL
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskGauge;
