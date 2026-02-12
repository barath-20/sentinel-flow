import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../utils/api';
import Copilot from './Copilot';

const Layout = ({ children }) => {
    const [systemStatus, setSystemStatus] = useState('ONLINE');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const health = await api.getHealth();
                setSystemStatus(health.status);
            } catch (error) {
                setSystemStatus('ONLINE');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Alerts', path: '/alerts', icon: '🔔' },
        { name: 'Network', path: '/network', icon: '🕸️' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-neon-blue selection:text-white relative overflow-x-hidden flex flex-col">
            {/* Ambient Background Nebulas - Animated */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-violet/10 rounded-full blur-[120px] animate-breathe-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] animate-breathe-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            <header className="fixed top-0 w-full z-50 glass-cyber border-b border-white/5 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <NavLink to="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-neon-violet to-neon-blue rounded-lg shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                            <span className="text-xl font-bold text-white">SF</span>
                            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse-slow"></div>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-neon-cyan transition-colors duration-300">
                            SentinelFlow <span className="text-neon-cyan font-light">AI</span>
                        </h1>
                    </NavLink>

                    <nav className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group relative overflow-hidden ${isActive
                                        ? 'text-neon-cyan bg-white/5 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`text-base transition-transform group-hover:scale-110 duration-300 ${isActive ? 'opacity-100' : 'opacity-60 grayscale group-hover:grayscale-0'}`}>{item.icon}</span>
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-6">
                        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-sm shadow-inner group">
                            <div className={`w-2 h-2 rounded-full z-10 ${systemStatus === 'ONLINE' ? 'bg-success-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse' : 'bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors uppercase">
                                {systemStatus === 'ONLINE' ? 'Secured' : 'Offline'}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
                            <div className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer relative group">
                                <span className="text-lg">🛎️</span>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-violet rounded-full border-2 border-[#0f172a] shadow-[0_0_5px_rgba(167,139,250,0.8)]"></span>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shadow-lg cursor-pointer hover:border-neon-blue transition-all duration-300 flex items-center justify-center group overflow-hidden relative">
                                <div className="absolute inset-0 bg-neon-blue/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                                <span className="text-slate-300 group-hover:text-white transition-colors z-10">👤</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 mt-20 relative z-10 flex-grow">
                {children}
            </main>

            <footer className="border-t border-white/5 mt-auto py-8 bg-black/40 backdrop-blur-md">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-mono">
                    <p>LITHOS AI MONITORING SYSTEM v2.5.0 • <span className="text-success-500">SECURE CHECKSUM PASSED</span></p>
                    <div className="flex space-x-4 mt-2 md:mt-0">
                        <a href="#" className="hover:text-neon-cyan transition-colors">PRIVACY</a>
                        <a href="#" className="hover:text-neon-cyan transition-colors">TERMS</a>
                        <a href="#" className="hover:text-neon-cyan transition-colors">SUPPORT</a>
                    </div>
                </div>
            </footer>

            <Copilot />
        </div>
    );
};

export default Layout;
