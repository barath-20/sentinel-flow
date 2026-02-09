/**
 * Custom hook for WebSocket connection
 */
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url, onMessage) => {
    const ws = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create WebSocket connection
        const wsUrl = url.startsWith('ws') ? url : `ws://localhost:8000${url}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    return { isConnected, sendMessage };
};
