"""
Feature definitions and computation logic for all 25 features
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
import numpy as np
from sqlalchemy.orm import Session
from app.models import Transaction, Account
from app.config import (
    WINDOW_1_HOUR, WINDOW_24_HOURS, WINDOW_7_DAYS, WINDOW_30_DAYS,
    NIGHT_START_HOUR, NIGHT_END_HOUR, COUNTRY_RISK_SCORES
)

class FeatureDefinitions:
    """Define and compute all AML features"""
    
    @staticmethod
    def compute_time_window_features(
        db: Session,
        account_id: str,
        current_timestamp: datetime
    ) -> Dict[str, float]:
        """Compute time-based aggregation features"""
        
        features = {}
        
        # Time windows
        one_hour_ago = current_timestamp - timedelta(seconds=WINDOW_1_HOUR)
        one_day_ago = current_timestamp - timedelta(seconds=WINDOW_24_HOURS)
        seven_days_ago = current_timestamp - timedelta(seconds=WINDOW_7_DAYS)
        
        # Fetch transactions in windows
        txns_1h = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= one_hour_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        txns_24h = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= one_day_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        txns_7d = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= seven_days_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        # 1. HourlyTxnCount
        features["HourlyTxnCount"] = len(txns_1h)
        
        # 2. DailyTxnCount
        features["DailyTxnCount"] = len(txns_24h)
        
        # 3. WeeklyTxnCount
        features["WeeklyTxnCount"] = len(txns_7d)
        
        # 4. HourlyCreditSum
        features["HourlyCreditSum"] = sum(
            t.amount for t in txns_1h if t.txn_type == "credit"
        )
        
        # 5. DailyCreditSum
        features["DailyCreditSum"] = sum(
            t.amount for t in txns_24h if t.txn_type == "credit"
        )
        
        # 6. HourlyDebitSum
        features["HourlyDebitSum"] = sum(
            t.amount for t in txns_1h if t.txn_type == "debit"
        )
        
        # 7. DailyDebitSum
        features["DailyDebitSum"] = sum(
            t.amount for t in txns_24h if t.txn_type == "debit"
        )
        
        return features
    
    @staticmethod
    def compute_behavioral_features(
        db: Session,
        account_id: str,
        current_timestamp: datetime,
        current_amount: float
    ) -> Dict[str, float]:
        """Compute behavioral pattern features"""
        
        features = {}
        
        seven_days_ago = current_timestamp - timedelta(seconds=WINDOW_7_DAYS)
        thirty_days_ago = current_timestamp - timedelta(seconds=WINDOW_30_DAYS)
        
        txns_7d = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= seven_days_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        txns_30d = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= thirty_days_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        # 8. UniqueCounterparties7d
        features["UniqueCounterparties7d"] = len(set(t.counterparty_id for t in txns_7d))
        
        # 9. UniqueCounterparties30d
        features["UniqueCounterparties30d"] = len(set(t.counterparty_id for t in txns_30d))
        
        # 10. InflowOutflowRatio
        inflow_7d = sum(t.amount for t in txns_7d if t.txn_type == "credit")
        outflow_7d = sum(t.amount for t in txns_7d if t.txn_type == "debit")
        features["InflowOutflowRatio"] = inflow_7d / max(outflow_7d, 1)
        
        # 11. AvgTxnAmount7d
        amounts_7d = [t.amount for t in txns_7d]
        features["AvgTxnAmount7d"] = np.mean(amounts_7d) if amounts_7d else 0
        
        # 12. StdTxnAmount7d
        features["StdTxnAmount7d"] = np.std(amounts_7d) if len(amounts_7d) > 1 else 0
        
        # 13. TxnAmountZScore
        avg_amount = features["AvgTxnAmount7d"]
        std_amount = features["StdTxnAmount7d"]
        if std_amount > 0:
            features["TxnAmountZScore"] = (current_amount - avg_amount) / std_amount
        else:
            features["TxnAmountZScore"] = 0
        
        # 14. TxnAmountToIncomeRatio
        account = db.query(Account).filter(Account.account_id == account_id).first()
        if account and account.monthly_income:
            features["TxnAmountToIncomeRatio"] = current_amount / account.monthly_income
        else:
            features["TxnAmountToIncomeRatio"] = 0
        
        return features
    
    @staticmethod
    def compute_temporal_features(
        current_timestamp: datetime,
        db: Session,
        account_id: str
    ) -> Dict[str, float]:
        """Compute time-based features"""
        
        features = {}
        
        # 15. HourOfDay
        features["HourOfDay"] = current_timestamp.hour
        
        # 16. DayOfWeek
        features["DayOfWeek"] = current_timestamp.weekday()
        
        # 17. IsWeekend
        features["IsWeekend"] = 1 if current_timestamp.weekday() >= 5 else 0
        
        # 18. IsNightTime
        hour = current_timestamp.hour
        features["IsNightTime"] = 1 if (hour >= NIGHT_START_HOUR or hour < NIGHT_END_HOUR) else 0
        
        # 19. TimeSinceLastTxn (minutes)
        last_txn = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp < current_timestamp
        ).order_by(Transaction.timestamp.desc()).first()
        
        if last_txn:
            time_diff = (current_timestamp - last_txn.timestamp).total_seconds() / 60
            features["TimeSinceLastTxn"] = time_diff
        else:
            features["TimeSinceLastTxn"] = 999999  # Very large number for first transaction
        
        # 20. TxnFrequencyAnomaly (simplified - based on hourly count)
        one_hour_ago = current_timestamp - timedelta(seconds=WINDOW_1_HOUR)
        recent_count = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= one_hour_ago,
            Transaction.timestamp <= current_timestamp
        ).count()
        
        # Anomaly if more than 5 transactions per hour
        features["TxnFrequencyAnomaly"] = max(0, recent_count - 5)
        
        return features
    
    @staticmethod
    def compute_geographic_features(
        country_code: str,
        is_international: bool,
        db: Session,
        account_id: str,
        current_timestamp: datetime
    ) -> Dict[str, float]:
        """Compute geography-based features"""
        
        features = {}
        
        # 21. IsInternational
        features["IsInternational"] = 1 if is_international else 0
        
        # 22. CountryRiskScore
        features["CountryRiskScore"] = COUNTRY_RISK_SCORES.get(country_code, 5)
        
        # 23. UniqueCountries7d
        seven_days_ago = current_timestamp - timedelta(seconds=WINDOW_7_DAYS)
        txns_7d = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.timestamp >= seven_days_ago,
            Transaction.timestamp <= current_timestamp
        ).all()
        
        unique_countries = set(t.country_code for t in txns_7d if t.country_code)
        features["UniqueCountries7d"] = len(unique_countries)
        
        return features
    
    @staticmethod
    def compute_network_features(
        counterparty_id: str,
        db: Session,
        account_id: str,
        current_timestamp: datetime
    ) -> Dict[str, float]:
        """Compute network-based features (simplified)"""
        
        features = {}
        
        seven_days_ago = current_timestamp - timedelta(seconds=WINDOW_7_DAYS)
        
        # 24. CounterpartyVelocity
        counterparty_txns = db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.counterparty_id == counterparty_id,
            Transaction.timestamp >= seven_days_ago,
            Transaction.timestamp <= current_timestamp
        ).count()
        
        features["CounterpartyVelocity"] = counterparty_txns
        
        # 25. SharedCounterparties (simplified - set to 0 for MVP)
        features["SharedCounterparties"] = 0
        
        return features
    
    @staticmethod
    def compute_all_features(
        db: Session,
        transaction_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """Compute all 25 features for a transaction"""
        
        account_id = transaction_data["account_id"]
        
        # Handle both datetime objects and ISO format strings
        timestamp_raw = transaction_data["timestamp"]
        if isinstance(timestamp_raw, datetime):
            timestamp = timestamp_raw
        else:
            timestamp = datetime.fromisoformat(timestamp_raw)
        
        amount = transaction_data["amount"]
        country_code = transaction_data.get("country_code", "US")
        is_international = transaction_data.get("is_international", False)
        counterparty_id = transaction_data["counterparty_id"]
        
        # Compute all feature groups
        time_features = FeatureDefinitions.compute_time_window_features(db, account_id, timestamp)
        behavioral_features = FeatureDefinitions.compute_behavioral_features(db, account_id, timestamp, amount)
        temporal_features = FeatureDefinitions.compute_temporal_features(timestamp, db, account_id)
        geo_features = FeatureDefinitions.compute_geographic_features(country_code, is_international, db, account_id, timestamp)
        network_features = FeatureDefinitions.compute_network_features(counterparty_id, db, account_id, timestamp)
        
        # Combine all features
        all_features = {
            **time_features,
            **behavioral_features,
            **temporal_features,
            **geo_features,
            **network_features
        }
        
        return all_features
