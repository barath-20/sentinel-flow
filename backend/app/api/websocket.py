"""
WebSocket handler for real-time updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json

from app.database import get_db
from app.models import Transaction, Alert

router = APIRouter()

class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass  # Handle disconnected clients

manager = ConnectionManager()

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time transaction and alert updates
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            
            # Echo back (can be used for ping/pong)
            await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def broadcast_transaction(transaction_data: dict):
    """Broadcast new transaction to all connected clients"""
    await manager.broadcast({
        "type": "transaction",
        "data": transaction_data
    })

async def broadcast_alert(alert_data: dict):
    """Broadcast new alert to all connected clients"""
    await manager.broadcast({
        "type": "alert",
        "data": alert_data
    })
