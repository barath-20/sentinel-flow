"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# Transaction schemas
class TransactionBase(BaseModel):
    txn_id: str
    timestamp: datetime
    account_id: str
    counterparty_id: str
    amount: float = Field(gt=0)
    currency: str = "USD"
    txn_type: str  # 'credit' or 'debit'
    channel: Optional[str] = None
    country_code: Optional[str] = None
    merchant_category: Optional[str] = None
    is_international: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    alert_id: str
    txn_id: str
    account_id: str
    risk_score: float
    alert_level: str
    rule_score: Optional[float] = None
    anomaly_score: Optional[float] = None
    ml_score: Optional[float] = None

class AlertCreate(AlertBase):
    triggered_rules: str
    explanation: str
    top_features: str

class AlertResponse(AlertBase):
    id: int
    triggered_rules: str
    explanation: str
    top_features: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: Optional[str] = None

# Account schemas
class AccountBase(BaseModel):
    account_id: str
    customer_name: str
    account_type: str
    monthly_income: float
    risk_rating: str
    country: str

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    created_at: datetime
    
    class Config:
        from_attributes = True

# Simulation request
class SimulationRequest(BaseModel):
    scenario: str  # 'normal', 'structuring', 'mule', 'high_risk_corridor'
    account_id: Optional[str] = None
    duration_seconds: int = 60
    txn_per_minute: int = 5

# Statistics response
class StatsResponse(BaseModel):
    total_transactions: int
    total_alerts: int
    alerts_by_level: Dict[str, int]
    detection_rate: float
    avg_risk_score: float
