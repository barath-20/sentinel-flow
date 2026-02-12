from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import Transaction, Account, Alert
from sqlalchemy import func

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)

@router.get("/graph")
def get_graph_data(limit: int = 200, db: Session = Depends(get_db)):
    """
    Get graph data for network visualization
    Returns nodes (accounts) and links (transactions)
    """
    # Get recent transactions
    # Using timestamp desc to get recent, but we want all related to these
    txns = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(limit).all()
    
    nodes_dict = {}
    edges_list = []
    
    for txn in txns:
        # Check source node
        if txn.account_id not in nodes_dict:
            nodes_dict[txn.account_id] = {
                "id": txn.account_id,
                "group": 1, # Default group
                "value": 0, # Total volume
                "risk": 0   # Risk score
            }
        
        # Check target node
        counterparty_id = txn.counterparty_id
        if counterparty_id not in nodes_dict:
            nodes_dict[counterparty_id] = {
                "id": counterparty_id,
                "group": 2, # Counterparty group
                "value": 0,
                "risk": 0
            }
            
        # Add edge
        edges_list.append({
            "source": txn.account_id,
            "target": counterparty_id,
            "value": txn.amount,
            "type": txn.txn_type or "transfer",
            "time": txn.timestamp.isoformat() if txn.timestamp else None
        })
        
        # Update node stats
        nodes_dict[txn.account_id]["value"] += txn.amount
        nodes_dict[counterparty_id]["value"] += txn.amount

    # Enrich nodes with alert/risk data if any
    account_ids = list(nodes_dict.keys())
    if account_ids:
        alerts = db.query(Alert).filter(Alert.account_id.in_(account_ids)).all()
        for alert in alerts:
            if alert.account_id in nodes_dict:
                # Update risk to max risk found or average
                current_risk = nodes_dict[alert.account_id]["risk"]
                if alert.risk_score > current_risk:
                    nodes_dict[alert.account_id]["risk"] = alert.risk_score
                    if alert.risk_score > 80:
                        nodes_dict[alert.account_id]["group"] = 3 # High risk group

    return {
        "nodes": list(nodes_dict.values()),
        "links": edges_list
    }
