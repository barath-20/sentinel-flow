import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

const Layout = ({ children }) => {
    const [systemStatus, setSystemStatus] = useState('ONLINE');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const health = await api.getHealth();
                setSystemStatus(health.status);
            } catch (error) {
                setSystemStatus('OFFLINE');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-neon-blue selection:text-white relative overflow-x-hidden">
            {/* Ambient Background Nebulas - Animated */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-50 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-violet/10 rounded-full blur-[120px] animate-breathe-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] animate-breathe-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            <header className="fixed top-0 w-full z-50 glass-cyber border-b border-white/5 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-neon-violet to-neon-blue rounded-lg shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
                            <span className="text-xl font-bold text-white">L</span>
                            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse-slow"></div>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-neon-cyan transition-colors duration-300">
                            LITHOS <span className="text-neon-cyan font-light">AI</span>
                        </h1>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-sm font-medium text-white hover:text-neon-cyan transition-colors relative group py-2">
                            Dashboard
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan scale-x-100 transition-transform origin-left"></span>
                        </a>
                        <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2 relative group">
                            Alerts
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                        <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2 relative group">
                            Investigation
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                        <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors py-2 relative group">
                            Settings
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm shadow-inner overflow-hidden relative">
                            <div className={`w-2 h-2 rounded-full z-10 ${systemStatus === 'ONLINE' ? 'bg-success-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse' : 'bg-danger-500'}`}></div>
                            <span className="text-xs font-mono font-medium tracking-wide text-slate-300 z-10 relative">
                                {systemStatus}
                            </span>
                            {systemStatus === 'ONLINE' && <div className="absolute inset-0 bg-success-500/5 animate-pulse-slow"></div>}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10 shadow-lg cursor-pointer hover:border-neon-blue transition-colors"></div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 mt-20 relative z-10 min-h-[calc(100vh-160px)]">
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
        </div>
    );
};

export default Layout;
