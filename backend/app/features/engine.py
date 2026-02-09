"""
Feature computation engine with caching
"""
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.features.definitions import FeatureDefinitions
from app.models import FeatureCache

class FeatureEngine:
    """Main feature computation engine"""
    
    def __init__(self):
        self.feature_definitions = FeatureDefinitions()
    
    def compute_features(
        self,
        db: Session,
        transaction_data: Dict[str, Any],
        use_cache: bool = False
    ) -> Dict[str, float]:
        """
        Compute features for a transaction
        
        Args:
            db: Database session
            transaction_data: Transaction data dict
            use_cache: Whether to use cached features (for production optimization)
        
        Returns:
            Dictionary of feature names to values
        """
        
        # Compute features
        features = self.feature_definitions.compute_all_features(db, transaction_data)
        
        # Optional: Cache features for future use
        if use_cache:
            self._cache_features(db, transaction_data["account_id"], features)
        
        return features
    
    def _cache_features(
        self,
        db: Session,
        account_id: str,
        features: Dict[str, float]
    ):
        """Cache computed features"""
        
        # Delete old cache entries
        db.query(FeatureCache).filter(
            FeatureCache.account_id == account_id
        ).delete()
        
        # Insert new cache entries
        for feature_name, feature_value in features.items():
            cache_entry = FeatureCache(
                account_id=account_id,
                feature_name=feature_name,
                feature_value=feature_value,
                computed_at=datetime.now()
            )
            db.add(cache_entry)
        
        db.commit()
    
    def get_cached_features(
        self,
        db: Session,
        account_id: str
    ) -> Dict[str, float]:
        """Retrieve cached features"""
        
        cache_entries = db.query(FeatureCache).filter(
            FeatureCache.account_id == account_id
        ).all()
        
        features = {entry.feature_name: entry.feature_value for entry in cache_entries}
        return features
    
    def get_feature_vector(
        self,
        features: Dict[str, float]
    ) -> list:
        """
        Convert feature dict to ordered vector for ML model
        
        Returns feature values in consistent order
        """
        
        # Define feature order (must match training data)
        feature_names = [
            "HourlyTxnCount", "DailyTxnCount", "WeeklyTxnCount",
            "HourlyCreditSum", "DailyCreditSum", "HourlyDebitSum", "DailyDebitSum",
            "UniqueCounterparties7d", "UniqueCounterparties30d",
            "InflowOutflowRatio", "AvgTxnAmount7d", "StdTxnAmount7d",
            "TxnAmountZScore", "TxnAmountToIncomeRatio",
            "HourOfDay", "DayOfWeek", "IsWeekend", "IsNightTime",
            "TimeSinceLastTxn", "TxnFrequencyAnomaly",
            "IsInternational", "CountryRiskScore", "UniqueCountries7d",
            "CounterpartyVelocity", "SharedCounterparties"
        ]
        
        # Create ordered vector
        vector = [features.get(name, 0) for name in feature_names]
        return vector
