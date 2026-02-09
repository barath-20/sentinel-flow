"""
Transaction-related API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import json
import numpy as np

from app.database import get_db
from app.schemas import TransactionCreate, TransactionResponse
from app.models import Transaction, Alert, Account
from app.features.engine import FeatureEngine
from app.detection.scoring import ScoringEngine
from app.explainability.explainer import Explainer

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

# Initialize engines
feature_engine = FeatureEngine()
scoring_engine = ScoringEngine()
explainer = Explainer()

connected_clients = []  # For real-time updates

def convert_to_json_serializable(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    return obj

@router.post("/ingest", response_model=dict)
async def ingest_transaction(
    txn: TransactionCreate,
    db: Session = Depends(get_db)
):
    """
    Ingest a transaction and perform real-time AML detection
    """
    
    # 1. Store transaction
    db_transaction = Transaction(**txn.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # 2. Compute features
    transaction_data = txn.model_dump()
    features = feature_engine.compute_features(db, transaction_data)
    feature_vector = feature_engine.get_feature_vector(features)
    
    # 3. Compute risk score
    scoring_result = scoring_engine.compute_risk_score(
        transaction_data, features, feature_vector
    )
    
    # 4. Generate alert if needed
    alert_id = None
    if scoring_engine.should_generate_alert(scoring_result["risk_score"]):
        # Generate explanation
        explanation_text = explainer.generate_explanation(
            transaction_data, scoring_result, features
        )
        
        # Format top features
        top_features = explainer.format_top_features(
            scoring_result.get("ml_explanation", {})
        )
        
        # Convert numpy types to native Python types for JSON serialization
        top_features_serializable = convert_to_json_serializable(top_features)
        triggered_rules_serializable = convert_to_json_serializable(scoring_result["triggered_rules"])
        
        # Create alert
        alert_id = f"ALT{uuid.uuid4().hex[:12].upper()}"
        db_alert = Alert(
            alert_id=alert_id,
            txn_id=txn.txn_id,
            account_id=txn.account_id,
            risk_score=float(scoring_result["risk_score"]),  # Ensure native Python float
            alert_level=scoring_result["alert_level"],
            rule_score=float(scoring_result["rule_score"]),
            anomaly_score=float(scoring_result["anomaly_score"]),
            ml_score=float(scoring_result["ml_score"]),
            triggered_rules=json.dumps(triggered_rules_serializable),
            explanation=explanation_text,
            top_features=json.dumps(top_features_serializable),
            status="NEW"
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
    
    return {
        "success": True,
        "txn_id": txn.txn_id,
        "risk_score": scoring_result["risk_score"],
        "alert_level": scoring_result["alert_level"],
        "alert_id": alert_id,
        "alert_generated": alert_id is not None
    }

@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List recent transactions"""
    
    transactions = db.query(Transaction)\
        .order_by(Transaction.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return transactions

@router.get("/{txn_id}", response_model=TransactionResponse)
async def get_transaction(
    txn_id: str,
    db: Session = Depends(get_db)
):
    """Get transaction by ID"""
    
    transaction = db.query(Transaction).filter(Transaction.txn_id == txn_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction
