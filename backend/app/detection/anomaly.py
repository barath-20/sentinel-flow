"""
Anomaly detection using IsolationForest and z-score methods
"""
from typing import Dict, List, Any
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """Detect anomalies using unsupervised methods"""
    
    def __init__(self):
        # Initialize IsolationForest with default parameters
        # In production, this would be trained on historical data
        self.isolation_forest = IsolationForest(
            n_estimators=100,
            contamination=0.1,  # Expect 10% anomalies
            random_state=42
        )
        self.is_fitted = False
    
    def fit_on_baseline(self, feature_vectors: List[List[float]]):
        """
        Fit the IsolationForest on baseline normal data
        
        Args:
            feature_vectors: List of feature vectors from normal transactions
        """
        if len(feature_vectors) > 10:
            self.isolation_forest.fit(feature_vectors)
            self.is_fitted = True
    
    def detect_anomaly(
        self,
        features: Dict[str, float],
        feature_vector: List[float]
    ) -> float:
        """
        Detect anomalies and return anomaly score (0-100)
        
        Combines IsolationForest score and z-score analysis
        
        Returns:
            Anomaly score (0-100, higher = more anomalous)
        """
        
        # 1. IsolationForest score (if fitted)
        if self.is_fitted:
            # Predict anomaly score (-1 to 1, negative = anomaly)
            isolation_score = self.isolation_forest.score_samples([feature_vector])[0]
            # Convert to 0-100 (lower isolation_score = higher anomaly)
            iso_anomaly_score = max(0, min(100, (1 - isolation_score) * 50))
        else:
            iso_anomaly_score = 0
        
        # 2. Z-score based anomaly detection
        zscore_anomaly_score = self._zscore_anomaly(features)
        
        # 3. Combine scores
        combined_score = (iso_anomaly_score + zscore_anomaly_score) / 2
        
        return combined_score
    
    def _zscore_anomaly(self, features: Dict[str, float]) -> float:
        """
        Calculate anomaly score based on z-scores
        
        High absolute z-scores indicate anomalies
        """
        
        # Key features to check for z-score anomalies
        z_score_features = [
            "TxnAmountZScore",
            "TxnFrequencyAnomaly",
        ]
        
        anomaly_score = 0
        
        # Check TxnAmountZScore
        txn_amount_zscore = abs(features.get("TxnAmountZScore", 0))
        if txn_amount_zscore > 3:
            anomaly_score += 40
        elif txn_amount_zscore > 2:
            anomaly_score += 25
        elif txn_amount_zscore > 1.5:
            anomaly_score += 10
        
        # Check TxnFrequencyAnomaly
        freq_anomaly = features.get("TxnFrequencyAnomaly", 0)
        if freq_anomaly > 5:
            anomaly_score += 30
        elif freq_anomaly > 3:
            anomaly_score += 15
        
        # Check unusual time patterns
        is_night = features.get("IsNightTime", 0)
        hourly_count = features.get("HourlyTxnCount", 0)
        if is_night and hourly_count > 2:
            anomaly_score += 15
        
        # Check income ratio
        income_ratio = features.get("TxnAmountToIncomeRatio", 0)
        if income_ratio > 0.7:
            anomaly_score += 20
        elif income_ratio > 0.5:
            anomaly_score += 10
        
        return min(anomaly_score, 100)
    
    def get_anomaly_explanation(
        self,
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Generate explanation for anomaly detection
        
        Returns:
            Dictionary with anomaly details
        """
        
        explanation = {
            "z_score_features": [],
            "unusual_patterns": []
        }
        
        # Z-score analysis
        txn_amount_zscore = features.get("TxnAmountZScore", 0)
        if abs(txn_amount_zscore) > 2:
            explanation["z_score_features"].append({
                "feature": "TxnAmountZScore",
                "value": round(txn_amount_zscore, 2),
                "threshold": 2.0,
                "interpretation": "Transaction amount significantly deviates from historical average"
            })
        
        # Frequency anomaly
        freq_anomaly = features.get("TxnFrequencyAnomaly", 0)
        if freq_anomaly > 3:
            explanation["unusual_patterns"].append({
                "pattern": "High transaction frequency",
                "detail": f"{features.get('HourlyTxnCount', 0)} transactions in 1 hour (normal: <5)"
            })
        
        # Night transactions
        if features.get("IsNightTime", 0) and features.get("HourlyTxnCount", 0) > 2:
            explanation["unusual_patterns"].append({
                "pattern": "Night-time activity",
                "detail": f"Multiple transactions during night hours ({features.get('HourOfDay', 0)}:00)"
            })
        
        return explanation
