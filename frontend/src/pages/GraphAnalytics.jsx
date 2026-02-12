import React, { useEffect, useState, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../utils/api';

const GraphAnalytics = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const graphRef = useRef();

    useEffect(() => {
        fetchGraphData();
    }, []);

    const fetchGraphData = async () => {
        try {
            const data = await api.getGraphData(1000);

            // Process data for the graph
            // Ensure unique nodes and valid links
            const nodesMap = new Map();
            data.nodes.forEach(node => {
                nodesMap.set(node.id, {
                    ...node,
                    neighbors: [],
                    links: []
                });
            });

            // Filter links and build neighbor map
            const validLinks = data.links.filter(link => {
                const sourceExists = nodesMap.has(link.source);
                const targetExists = nodesMap.has(link.target);

                if (sourceExists && targetExists) {
                    const sourceNode = nodesMap.get(link.source);
                    const targetNode = nodesMap.get(link.target);

                    sourceNode.neighbors.push(targetNode);
                    targetNode.neighbors.push(sourceNode);
                    sourceNode.links.push(link);
                    targetNode.links.push(link);
                    return true;
                }
                return false;
            });

            setGraphData({
                nodes: Array.from(nodesMap.values()),
                links: validLinks
            });
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch graph data:", error);
            setLoading(false);
        }
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);

        // Compute highlights
        const nodeSet = new Set();
        const linkSet = new Set();

        if (node) {
            nodeSet.add(node);
            node.neighbors.forEach(neighbor => nodeSet.add(neighbor));
            node.links.forEach(link => linkSet.add(link));
        }

        setHighlightNodes(nodeSet);
        setHighlightLinks(linkSet);

        // Focus on node
        if (node && graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(4, 1000);
        }
    };

    const handleBackgroundClick = () => {
        setSelectedNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const node = graphData.nodes.find(n => n.id.toLowerCase().includes(searchTerm.toLowerCase()));
        if (node) {
            handleNodeClick(node);
        } else {
            alert("Node not found!");
        }
    };

    // Style logic
    const NODE_R = 6;

    const paintNode = React.useCallback((node, ctx, globalScale) => {
        // Dim nodes if something is highlighted but not this node
        const isHighlighted = highlightNodes.has(node);
        const hasSelection = highlightNodes.size > 0;

        if (hasSelection && !isHighlighted) {
            ctx.globalAlpha = 0.1;
        } else {
            ctx.globalAlpha = 1;
        }

        // Custom circle draw
        const label = node.id;
        const fontSize = 12 / globalScale;

        // Outer glow for high risk
        if (node.status === 'critical' || node.status === 'high') {
            ctx.beginPath();
            ctx.fillStyle = node.status === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
            ctx.arc(node.x, node.y, NODE_R * 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.fillStyle = node.status === 'critical' ? '#ef4444' :
            node.status === 'high' ? '#f59e0b' :
                node.group === 2 ? '#a855f7' : '#3b82f6';

        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI, false);
        ctx.fill();

        // Label on hover or select
        if (isHighlighted || node === selectedNode || globalScale > 3) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x, node.y + NODE_R + 8);
        }
    }, [highlightNodes, selectedNode]);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between glass-panel p-4 rounded-xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-3xl">🕸️</span>
                        Network <span className="text-neon-cyan">Intelligence</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search Entity ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-neon-cyan focus:outline-none w-64"
                        />
                        <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-white">🔍</button>
                    </form>

                    <button
                        onClick={fetchGraphData}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                        title="Refresh Graph"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex gap-6 overflow-hidden relative">
                {/* Graph Container */}
                <div className="flex-grow bg-[#050b14] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
                        </div>
                    ) : (
                        <ForceGraph2D
                            ref={graphRef}
                            graphData={graphData}
                            nodeCanvasObject={paintNode}
                            nodeRelSize={NODE_R}

                            // Link Styles
                            linkColor={link => highlightLinks.has(link) ? '#22d3ee' : 'rgba(255,255,255,0.1)'}
                            linkWidth={link => highlightLinks.has(link) ? 2 : 1}
                            linkDirectionalParticles={link => highlightLinks.has(link) ? 4 : 1}
                            linkDirectionalParticleSpeed={0.005}
                            linkDirectionalParticleWidth={2}

                            onNodeClick={handleNodeClick}
                            onBackgroundClick={handleBackgroundClick}
                            backgroundColor="#050b14"
                            d3AlphaDecay={0.02}
                            d3VelocityDecay={0.3}
                            warmupTicks={100}
                            cooldownTicks={100}
                        />
                    )}

                    {/* Overlay Stats */}
                    <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono pointer-events-none">
                        NODES: {graphData.nodes.length} | LINKS: {graphData.links.length}
                    </div>
                </div>

                {/* Side Panel */}
                {selectedNode && (
                    <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl z-20 animate-slide-in-right">
                        <div className="p-6 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-wide">Entity Analysis</h3>
                                <p className="text-xs text-slate-400 mt-1 font-mono">{selectedNode.id}</p>
                            </div>
                            <button
                                onClick={() => { setSelectedNode(null); setHighlightNodes(new Set()); }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            {/* Key Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Risk Score</div>
                                    <div className={`text-2xl font-bold ${selectedNode.risk > 80 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                            selectedNode.risk > 50 ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                        {Math.round(selectedNode.risk)}<span className="text-sm text-slate-500 font-normal">/100</span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Volume</div>
                                    <div className="text-lg font-mono text-white">
                                        ${(selectedNode.value || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Connected Entities */}
                            <div>
                                <h4 className="text-sm font-semibold text-neon-blue mb-3 flex items-center gap-2">
                                    <span>🔗</span> Direct Connections ({selectedNode.neighbors?.length || 0})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNode.neighbors?.slice(0, 8).map(n => (
                                        <span key={n.id} onClick={() => handleNodeClick(n)} className="cursor-pointer px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-slate-300 transition-colors">
                                            {n.id.substring(0, 8)}...
                                        </span>
                                    ))}
                                    {selectedNode.neighbors?.length > 8 && (
                                        <span className="px-2 py-1 text-xs text-slate-500">+{selectedNode.neighbors.length - 8} more</span>
                                    )}
                                </div>
                            </div>

                            {/* Transaction History Table */}
                            <div>
                                <h4 className="text-sm font-semibold text-neon-cyan mb-3 flex items-center gap-2">
                                    <span>📜</span> Transaction Log
                                </h4>
                                <div className="bg-slate-950 rounded-lg border border-white/10 overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900 text-slate-400">
                                            <tr>
                                                <th className="p-2">Type</th>
                                                <th className="p-2">Amt</th>
                                                <th className="p-2">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-slate-300">
                                            {graphData.links
                                                .filter(l => l.source.id === selectedNode.id || l.target.id === selectedNode.id)
                                                .slice(0, 10)
                                                .map((link, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-2 font-mono text-neon-blue">{link.type}</td>
                                                        <td className="p-2 font-bold">${link.value.toLocaleString()}</td>
                                                        <td className="p-2 text-slate-500">
                                                            {link.time ? new Date(link.time).toLocaleTimeString() : '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                                    <span>🚩</span> Flag for Investigation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphAnalytics;
