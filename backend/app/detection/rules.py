"""
Rules-based detection engine
"""
from typing import Dict, List, Any, Tuple
from app.config import (
    STRUCTURING_JUST_BELOW_MIN, STRUCTURING_JUST_BELOW_MAX,
    STRUCTURING_THRESHOLD, HIGH_VALUE_THRESHOLD
)

class RuleEngine:
    """Detect suspicious patterns using rule-based logic"""
    
    def __init__(self):
        self.rules = [
            self.rule_structuring,
            self.rule_rapid_movement,
            self.rule_high_risk_corridor,
            self.rule_velocity_check,
            self.rule_round_amount,
            self.rule_income_anomaly,
            self.rule_high_value_limit
        ]
    
    def evaluate_all_rules(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Evaluate all rules and return score + triggered rules
        
        Returns:
            (rule_score, triggered_rules)
        """
        
        triggered_rules = []
        
        for rule_func in self.rules:
            result = rule_func(transaction_data, features)
            if result:
                triggered_rules.append(result)
        
        # Calculate rule score (0-100)
        if not triggered_rules:
            rule_score = 0
        else:
            # Weight by severity: CRITICAL=100, HIGH=80, MEDIUM=60, LOW=40 for demo visibility
            severity_weights = {"CRITICAL": 100, "HIGH": 80, "MEDIUM": 60, "LOW": 40}
            total_score = sum(severity_weights.get(r["severity"], 20) for r in triggered_rules)
            rule_score = min(total_score, 100)  # Cap at 100
        
        return rule_score, triggered_rules
    
    def rule_structuring(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 1: Structuring Detection
        Multiple transactions just below $10K threshold
        """
        
        amount = transaction_data["amount"]
        daily_txn_count = features.get("DailyTxnCount", 0)
        daily_credit_sum = features.get("DailyCreditSum", 0)
        
        # Check if amount is just below threshold
        is_just_below = STRUCTURING_JUST_BELOW_MIN <= amount <= STRUCTURING_JUST_BELOW_MAX
        
        # Check if multiple transactions today
        multiple_txns = daily_txn_count >= 3
        
        # Check if total exceeds threshold
        # For demo purposes, we trigger if total >= 1.5x threshold ($15,000)
        high_daily_total = daily_credit_sum >= STRUCTURING_THRESHOLD * 1.5
        
        if is_just_below and multiple_txns and high_daily_total:
            return {
                "rule_name": "STRUCTURING_SUSPECTED",
                "severity": "HIGH",
                "description": f"Multiple transactions (${amount:.2f}) just below $10K threshold. Daily total: ${daily_credit_sum:.2f}",
                "contribution": 30
            }
        
        return None
    
    def rule_rapid_movement(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 2: Rapid Movement (Mule Account)
        Quick in-and-out pattern
        """
        
        txn_type = transaction_data["txn_type"]
        amount = transaction_data["amount"]
        time_since_last = features.get("TimeSinceLastTxn", 999999)
        hourly_credit = features.get("HourlyCreditSum", 0)
        hourly_debit = features.get("HourlyDebitSum", 0)
        
        # Debit shortly after credit
        if txn_type == "debit" and time_since_last < 120:  # 2 hours
            if hourly_credit > 5000 and amount > hourly_credit * 0.8:
                return {
                    "rule_name": "MULE_ACCOUNT_SUSPECTED",
                    "severity": "CRITICAL",
                    "description": f"Extremely rapid funds movement: Large debit (${amount:.2f}) within 2 hours of credit. Typical of mule activity.",
                    "contribution": 40
                }
        
        return None
    
    def rule_high_risk_corridor(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 3: High-Risk Corridor
        Transactions to/from high-risk countries
        """
        
        is_international = transaction_data.get("is_international", False)
        country_risk = features.get("CountryRiskScore", 0)
        amount = transaction_data["amount"]
        
        if is_international and country_risk >= 8 and amount > 2500:
            country_code = transaction_data.get("country_code", "UNKNOWN")
            return {
                "rule_name": "HIGH_RISK_CORRIDOR",
                "severity": "HIGH",
                "description": f"Transaction to high-risk country ({country_code}, risk={country_risk}) for ${amount:.2f}",
                "contribution": 30
            }
        
        return None
    
    def rule_velocity_check(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 4: Velocity Check
        Unusual transaction frequency
        """
        
        hourly_count = features.get("HourlyTxnCount", 0)
        amount = transaction_data["amount"]
        
        # Only flag if frequency is very high or combined with moderate amounts
        if hourly_count > 100:
            return {
                "rule_name": "HIGH_VELOCITY_CRITICAL",
                "severity": "CRITICAL",
                "description": f"Extreme transaction frequency: {hourly_count} transactions in 1 hour",
                "contribution": 40
            }
        elif hourly_count > 50 and amount > 500:
            return {
                "rule_name": "HIGH_VELOCITY",
                "severity": "HIGH",
                "description": f"High frequency activity with significant amounts: {hourly_count} txns/hr",
                "contribution": 30
            }
        
        return None
    
    def rule_round_amount(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 5: Round Amount Pattern
        Suspiciously round amounts
        """
        
        amount = transaction_data["amount"]
        
        if amount >= 5000 and amount % 1000 == 0:
            return {
                "rule_name": "ROUND_AMOUNT",
                "severity": "LOW",
                "description": f"Suspiciously round amount: ${amount:.2f}",
                "contribution": 10
            }
        
        return None
    
    def rule_income_anomaly(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 6: Income Ratio Breach
        Transaction amount disproportionate to income
        """
        
        income_ratio = features.get("TxnAmountToIncomeRatio", 0)
        amount = transaction_data["amount"]
        
        if income_ratio > 0.5 and amount > 1000:
            return {
                "rule_name": "INCOME_ANOMALY",
                "severity": "MEDIUM",
                "description": f"Transaction amount (${amount:.2f}) is {income_ratio*100:.1f}% of monthly income",
                "contribution": 20
            }
        
        return None

    def rule_high_value_limit(
        self,
        transaction_data: Dict[str, Any],
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Rule 7: High Value Limit
        Any single transaction over $10,000
        """
        amount = transaction_data["amount"]
        if amount > 10000:
            return {
                "rule_name": "HIGH_VALUE_THRESHOLD_BREACH",
                "severity": "CRITICAL",
                "description": f"Transaction amount (${amount:.2f}) exceeds the standard $10,000 reporting threshold.",
                "contribution": 40
            }
        return None
