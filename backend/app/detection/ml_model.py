"""
ML model loading and inference with SHAP explainability
"""
import os
import pickle
import numpy as np
from typing import Dict, Any, List, Tuple
from app.config import MODEL_PATH, EXPLAINER_PATH

class MLModel:
    """ML model for AML risk prediction"""
    
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_names = [
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
        self.is_loaded = False
        self.load_model()
    
    def load_model(self):
        """Load trained model and explainer"""
        try:
            if os.path.exists(MODEL_PATH):
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"✅ ML model loaded from {MODEL_PATH}")
                self.is_loaded = True
            else:
                print(f"⚠️ ML model not found at {MODEL_PATH}. Will skip ML scoring until model is trained.")
                self.is_loaded = False
            
            # Load SHAP explainer if available
            if os.path.exists(EXPLAINER_PATH):
                with open(EXPLAINER_PATH, 'rb') as f:
                    self.explainer = pickle.load(f)
                print(f"✅ SHAP explainer loaded from {EXPLAINER_PATH}")
        
        except Exception as e:
            print(f"⚠️ Error loading model: {e}")
            self.is_loaded = False
    
    def predict_risk(
        self,
        feature_vector: List[float]
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Predict risk score using ML model
        
        Args:
            feature_vector: Ordered feature vector
        
        Returns:
            (ml_score, ml_explanation)
        """
        
        if not self.is_loaded or self.model is None:
            # Return neutral score if model not loaded
            return 50.0, {"error": "Model not loaded", "top_features": []}
        
        try:
            # Predict probability
            feature_array = np.array([feature_vector])
            probability = self.model.predict_proba(feature_array)[0][1]  # Probability of class 1 (suspicious)
            ml_score = probability * 100
            
            # Get feature importances
            ml_explanation = self._explain_prediction(feature_vector, probability)
            
            return ml_score, ml_explanation
        
        except Exception as e:
            print(f"⚠️ Error in ML prediction: {e}")
            return 50.0, {"error": str(e), "top_features": []}
    
    def _explain_prediction(
        self,
        feature_vector: List[float],
        probability: float
    ) -> Dict[str, Any]:
        """
        Generate explanation for ML prediction
        
        Uses SHAP if available, otherwise falls back to feature importance
        """
        
        explanation = {
            "prediction": round(probability, 3),
            "top_features": []
        }
        
        try:
            # Try SHAP explanation
            if self.explainer is not None:
                shap_values = self.explainer.shap_values(np.array([feature_vector]))
                
                # Get SHAP values for positive class
                if isinstance(shap_values, list):
                    shap_vals = shap_values[1][0]  # For binary classification
                else:
                    shap_vals = shap_values[0]
                
                # Get top contributing features
                feature_contributions = [
                    {
                        "feature": self.feature_names[i],
                        "value": round(feature_vector[i], 2),
                        "importance": round(abs(shap_vals[i]), 3),
                        "direction": "increases" if shap_vals[i] > 0 else "decreases"
                    }
                    for i in range(len(self.feature_names))
                ]
                
                # Sort by absolute importance
                feature_contributions.sort(key=lambda x: x["importance"], reverse=True)
                explanation["top_features"] = feature_contributions[:10]
            
            # Fallback to feature importance from model
            elif hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
                
                feature_contributions = [
                    {
                        "feature": self.feature_names[i],
                        "value": round(feature_vector[i], 2),
                        "importance": round(importances[i], 3)
                    }
                    for i in range(len(self.feature_names))
                ]
                
                feature_contributions.sort(key=lambda x: x["importance"], reverse=True)
                explanation["top_features"] = feature_contributions[:10]
            
            else:
                # Fallback: simple heuristic based on feature values
                explanation["top_features"] = self._heuristic_importance(feature_vector)
        
        except Exception as e:
            print(f"⚠️ Error in explanation: {e}")
            explanation["top_features"] = self._heuristic_importance(feature_vector)
        
        return explanation
    
    def _heuristic_importance(self, feature_vector: List[float]) -> List[Dict[str, Any]]:
        """Simple heuristic for feature importance when SHAP is not available"""
        
        # Define important features based on domain knowledge
        important_indices = [0, 1, 12, 13, 19, 20, 21]  # Key features
        
        contributions = []
        for i in important_indices:
            if i < len(feature_vector):
                contributions.append({
                    "feature": self.feature_names[i],
                    "value": round(feature_vector[i], 2),
                    "importance": 0.1  # Placeholder
                })
        
        return contributions[:5]
