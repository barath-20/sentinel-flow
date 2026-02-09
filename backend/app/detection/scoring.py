"""
Hybrid scoring engine combining rules, anomaly, and ML
"""
from typing import Dict, Any, List, Tuple
from app.detection.rules import RuleEngine
from app.detection.anomaly import AnomalyDetector
from app.detection.ml_model import MLModel
from app.config import RULE_WEIGHT, ANOMALY_WEIGHT, ML_WEIGHT

class ScoringEngine:
    """Hybrid scoring engine"""
    
    def __init__(self):
        self.rule_engine = RuleEngine()
        self.anomaly_detector = AnomalyDetector()
        self.ml_model = MLModel()
    
    def compute_risk_score(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float],
        feature_vector: List[float]
    ) -> Dict[str, Any]:
        """
        Compute hybrid risk score
        
        Returns:
            Complete scoring result with all components
        """
        
        # 1. Rules Engine
        rule_score, triggered_rules = self.rule_engine.evaluate_all_rules(
            transaction_data, features
        )
        
        # 2. Anomaly Detection
        anomaly_score = self.anomaly_detector.detect_anomaly(features, feature_vector)
        anomaly_explanation = self.anomaly_detector.get_anomaly_explanation(features)
        
        # 3. ML Model
        ml_score, ml_explanation = self.ml_model.predict_risk(feature_vector)
        
        # 4. Hybrid Score (weighted ensemble)
        final_score = (
            RULE_WEIGHT * rule_score +
            ANOMALY_WEIGHT * anomaly_score +
            ML_WEIGHT * ml_score
        )
        
        # 5. Determine alert level
        alert_level = self._determine_alert_level(final_score)
        
        return {
            "risk_score": round(final_score, 2),
            "alert_level": alert_level,
            "rule_score": round(rule_score, 2),
            "anomaly_score": round(anomaly_score, 2),
            "ml_score": round(ml_score, 2),
            "triggered_rules": triggered_rules,
            "anomaly_explanation": anomaly_explanation,
            "ml_explanation": ml_explanation
        }
    
    def _determine_alert_level(self, risk_score: float) -> str:
        """Determine alert level based on risk score"""
        
        if risk_score >= 90:
            return "CRITICAL"
        elif risk_score >= 80:
            return "HIGH"
        elif risk_score >= 60:
            return "MEDIUM"
        elif risk_score >= 40:
            return "LOW"
        else:
            return "NONE"
    
    def should_generate_alert(self, risk_score: float) -> bool:
        """Determine if alert should be generated"""
        # Generate alert for scores >= 40 (LOW and above)
        return risk_score >= 40
