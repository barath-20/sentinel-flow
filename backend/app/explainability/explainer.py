"""
Generate comprehensive explanations for alerts
"""
from typing import Dict, Any, List

class Explainer:
    """Generate natural language explanations for alerts"""
    
    @staticmethod
    def generate_explanation(
        transaction_data: Dict[str, Any],
        scoring_result: Dict[str, Any],
        features: Dict[str, float]
    ) -> str:
        """
        Generate natural language explanation for an alert
        
        Returns:
            Human-readable explanation string
        """
        
        alert_level = scoring_result["alert_level"]
        risk_score = scoring_result["risk_score"]
        triggered_rules = scoring_result["triggered_rules"]
        
        # Start with alert header
        if alert_level == "CRITICAL":
            header = "🚨 CRITICAL RISK ALERT"
        elif alert_level == "HIGH":
            header = "⚠️  HIGH RISK ALERT"
        elif alert_level == "MEDIUM":
            header = "⚡ MEDIUM RISK ALERT"
        else:
            header = "ℹ️  LOW RISK ALERT"
        
        explanation_parts = [
            header,
            f"\nRisk Score: {risk_score:.1f}/100",
            f"\nTransaction: {transaction_data['txn_type'].upper()} ${transaction_data['amount']:.2f}",
            f"Account: {transaction_data['account_id']}",
            ""
        ]
        
        # Add rule violations
        if triggered_rules:
            explanation_parts.append("\n🔴 Rule Violations:")
            for rule in triggered_rules:
                explanation_parts.append(f"  • [{rule['severity']}] {rule['rule_name']}: {rule['description']}")
        
        # Add anomaly details
        anomaly_score = scoring_result.get("anomaly_score", 0)
        if anomaly_score > 30:
            explanation_parts.append("\n🔵 Anomaly Detection:")
            anomaly_exp = scoring_result.get("anomaly_explanation", {})
            
            # Z-score anomalies
            z_features = anomaly_exp.get("z_score_features", [])
            for z_feat in z_features:
                explanation_parts.append(f"  • {z_feat['interpretation']}")
            
            # Unusual patterns
            patterns = anomaly_exp.get("unusual_patterns", [])
            for pattern in patterns:
                explanation_parts.append(f"  • {pattern['pattern']}: {pattern['detail']}")
        
        # Add ML insights
        ml_score = scoring_result.get("ml_score", 0)
        if ml_score > 50:
            explanation_parts.append(f"\n🤖 ML Model Prediction: {ml_score:.1f}% suspicious")
            ml_exp = scoring_result.get("ml_explanation", {})
            top_features = ml_exp.get("top_features", [])[:3]
            
            if top_features:
                explanation_parts.append("  Top contributing factors:")
                for feat in top_features:
                    val = feat['value']
                    formatted_val = str(val)
                    
                    # Format numbers
                    if isinstance(val, (int, float)):
                        if val == 0:
                            if "Anomaly" in feat['feature'] or "Flag" in feat['feature']:
                                formatted_val = "None detected"
                            else:
                                formatted_val = "0 (Baseline)"
                        elif isinstance(val, float):
                            formatted_val = f"{val:.2f}"
                    
                    direction_icon = "🔺" if feat.get('direction') == 'increases' else "🛡️"
                    direction_text = "Risk Driver" if feat.get('direction') == 'increases' else "Safety Signal (Reduces Risk)"
                    
                    # Special handling for "0" values behaving as safety signals
                    if str(formatted_val) in ["0", "0 (Baseline)", "None detected"] and feat.get('direction') == 'decreases':
                        formatted_val = "Normal Behavior"

                    explanation_parts.append(f"    - {feat['feature']}: {formatted_val} \n      {direction_icon} {direction_text}")
        
        # Add recommendation
        explanation_parts.append("\n📋 Recommendation:")
        if alert_level in ["CRITICAL", "HIGH"]:
            explanation_parts.append("  Immediate review required. Consider filing SAR if suspicious activity confirmed.")
        elif alert_level == "MEDIUM":
            explanation_parts.append("  Review transaction and customer profile. Monitor for additional suspicious activity.")
        else:
            explanation_parts.append("  Log for reference. Standard monitoring procedures apply.")
        
        return "\n".join(explanation_parts)
    
    @staticmethod
    def format_top_features(
        ml_explanation: Dict[str, Any],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Format top features for display
        
        Returns:
            List of formatted feature contributions
        """
        
        top_features = ml_explanation.get("top_features", [])[:limit]
        
        formatted = []
        for feat in top_features:
            formatted.append({
                "feature_name": feat["feature"],
                "feature_value": feat["value"],
                "importance_score": feat.get("importance", 0),
                "direction": feat.get("direction", "neutral")
            })
        
        return formatted
