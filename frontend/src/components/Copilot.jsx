import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';

const Copilot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: "Hello! I'm Sentinel Copilot. I can query live transactions, explain alerts, or help you investigate accounts. What can I do for you?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await response.json();

            setMessages(prev => [...prev, { role: 'system', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: "Sorry, I encountered an error connecting to the Sentinel brain." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const content = (
        <div className="font-sans antialiased text-slate-200">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-neon-violet to-neon-blue shadow-lg hover:shadow-glow-md transition-all duration-300 z-[9999] group animate-float"
                >
                    <span className="text-2xl group-hover:scale-110 block transition-transform">🤖</span>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></div>
                </button>
            )}

            {/* Chat Interface */}
            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999]">
                    <div className="w-96 max-h-[80vh] h-[500px] flex flex-col glass-cyber rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up bg-slate-900/95 backdrop-blur-xl">
                        {/* Header */}
                        <div className="bg-slate-900/90 p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-violet to-neon-blue flex items-center justify-center">
                                    <span className="text-lg">🤖</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Sentinel Copilot</h3>
                                    <p className="text-[10px] text-neon-cyan/80 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                                        ONLINE • RAG ACTIVE
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/50 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-neon-blue/20 text-white border border-neon-blue/30 rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                                            }
                                        `}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono text-neon-cyan" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 rounded-2xl rounded-bl-none p-3 border border-white/5">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/90 border-t border-white/5 flex gap-2 backdrop-blur-md">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about alerts, transactions..."
                                className="flex-grow bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="p-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue rounded-lg border border-neon-blue/30 transition-colors disabled:opacity-50"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(content, document.body);
};

export default Copilot;
