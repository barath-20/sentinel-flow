"""
Alert-related API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.schemas import AlertResponse, AlertUpdate, StatsResponse
from app.models import Alert, Transaction

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("/", response_model=List[dict])
async def list_alerts(
    status: Optional[str] = None,
    alert_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List alerts with optional filtering"""
    
    query = db.query(Alert)
    
    if status:
        query = query.filter(Alert.status == status)
    
    if alert_level:
        query = query.filter(Alert.alert_level == alert_level)
    
    alerts = query.order_by(Alert.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Format alerts with parsed JSON
    formatted_alerts = []
    for alert in alerts:
        alert_dict = {
            "id": alert.id,
            "alert_id": alert.alert_id,
            "txn_id": alert.txn_id,
            "account_id": alert.account_id,
            "risk_score": alert.risk_score,
            "alert_level": alert.alert_level,
            "rule_score": alert.rule_score,
            "anomaly_score": alert.anomaly_score,
            "ml_score": alert.ml_score,
            "triggered_rules": json.loads(alert.triggered_rules) if alert.triggered_rules else [],
            "explanation": alert.explanation,
            "top_features": json.loads(alert.top_features) if alert.top_features else [],
            "status": alert.status,
            "created_at": alert.created_at.isoformat()
        }
        formatted_alerts.append(alert_dict)
    
    return formatted_alerts

@router.get("/{alert_id}", response_model=dict)
async def get_alert(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """Get alert details with full explanation"""
    
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Get associated transaction
    transaction = db.query(Transaction).filter(Transaction.txn_id == alert.txn_id).first()
    
    return {
        "alert": {
            "id": alert.id,
            "alert_id": alert.alert_id,
            "txn_id": alert.txn_id,
            "account_id": alert.account_id,
            "risk_score": alert.risk_score,
            "alert_level": alert.alert_level,
            "rule_score": alert.rule_score,
            "anomaly_score": alert.anomaly_score,
            "ml_score": alert.ml_score,
            "triggered_rules": json.loads(alert.triggered_rules) if alert.triggered_rules else [],
            "explanation": alert.explanation,
            "top_features": json.loads(alert.top_features) if alert.top_features else [],
            "status": alert.status,
            "created_at": alert.created_at.isoformat()
        },
        "transaction": {
            "txn_id": transaction.txn_id,
            "timestamp": transaction.timestamp.isoformat(),
            "amount": transaction.amount,
            "currency": transaction.currency,
            "txn_type": transaction.txn_type,
            "channel": transaction.channel,
            "counterparty_id": transaction.counterparty_id,
            "country_code": transaction.country_code,
            "is_international": transaction.is_international
        } if transaction else None
    }

@router.patch("/{alert_id}", response_model=dict)
async def update_alert(
    alert_id: str,
    update: AlertUpdate,
    db: Session = Depends(get_db)
):
    """Update alert status"""
    
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if update.status:
        alert.status = update.status
    
    db.commit()
    db.refresh(alert)
    
    return {
        "success": True,
        "alert_id": alert_id,
        "new_status": alert.status
    }

@router.get("/stats/summary", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get system statistics"""
    
    total_transactions = db.query(Transaction).count()
    total_alerts = db.query(Alert).count()
    
    # Alerts by level
    alerts_by_level = {}
    for level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        count = db.query(Alert).filter(Alert.alert_level == level).count()
        alerts_by_level[level] = count
    
    # Detection rate
    detection_rate = (total_alerts / max(total_transactions, 1)) * 100
    
    # Average risk score
    avg_risk = db.query(Alert).with_entities(Alert.risk_score).all()
    avg_risk_score = sum(r[0] for r in avg_risk) / len(avg_risk) if avg_risk else 0
    
    return StatsResponse(
        total_transactions=total_transactions,
        total_alerts=total_alerts,
        alerts_by_level=alerts_by_level,
        detection_rate=round(detection_rate, 2),
        avg_risk_score=round(avg_risk_score, 2)
    )

@router.delete("/clear")
async def delete_all_data(db: Session = Depends(get_db)):
    """Delete all transactions and alerts (Reset System)"""
    try:
        db.query(Alert).delete()
        db.query(Transaction).delete()
        db.commit()
        return {"success": True, "message": "All data cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
