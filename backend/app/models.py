"""
SQLAlchemy ORM models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    txn_id = Column(String, unique=True, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    account_id = Column(String, nullable=False, index=True)
    counterparty_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    txn_type = Column(String, nullable=False)  # 'credit', 'debit'
    channel = Column(String)  # 'ATM', 'online', 'branch', 'mobile'
    country_code = Column(String)
    merchant_category = Column(String)
    is_international = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, nullable=False, index=True)
    txn_id = Column(String, ForeignKey("transactions.txn_id"), nullable=False)
    account_id = Column(String, nullable=False, index=True)
    risk_score = Column(Float, nullable=False, index=True)
    alert_level = Column(String, nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    # Component scores
    rule_score = Column(Float)
    anomaly_score = Column(Float)
    ml_score = Column(Float)
    
    # Triggered rules (JSON array)
    triggered_rules = Column(Text)
    
    # Explainability (JSON)
    explanation = Column(Text)
    top_features = Column(Text)
    
    status = Column(String, default="NEW")  # 'NEW', 'REVIEWED', 'ESCALATED', 'CLEARED'
    created_at = Column(DateTime, default=func.now())

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(String, primary_key=True)
    customer_name = Column(String)
    account_type = Column(String)  # 'personal', 'business'
    monthly_income = Column(Float)
    risk_rating = Column(String)  # 'low', 'medium', 'high'
    country = Column(String)
    created_at = Column(DateTime, default=func.now())

class FeatureCache(Base):
    __tablename__ = "feature_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, nullable=False, index=True)
    feature_name = Column(String, nullable=False)
    feature_value = Column(Float)
    computed_at = Column(DateTime, default=func.now())
