"""
Predefined transaction scenarios for demonstration
"""
from typing import Dict, Any

# Scenario configurations
SCENARIOS: Dict[str, Dict[str, Any]] = {
    "normal": {
        "name": "Normal Activity",
        "description": "Typical customer transactions with low risk",
        "pattern": "normal",
        "avg_amount_range": (50, 500),
        "txn_frequency": "normal",
        "international_rate": 0.05,
        "high_risk_country_rate": 0.0,
        "structuring_enabled": False,
        "rapid_movement_enabled": False,
        "night_txn_rate": 0.1,
    },
    
    "structuring": {
        "name": "Structuring Detection",
        "description": "Multiple transactions just below $10K threshold",
        "pattern": "structuring",
        "avg_amount_range": (8000, 9900),
        "txn_frequency": "high",  # 3-5 transactions per burst
        "international_rate": 0.0,
        "high_risk_country_rate": 0.0,
        "structuring_enabled": True,
        "rapid_movement_enabled": False,
        "night_txn_rate": 0.1,
        "burst_count": 4,  # Number of structuring transactions
        "burst_interval": 10,  # seconds between transactions
    },
    
    "mule": {
        "name": "Mule Account + Rapid Movement",
        "description": "Large credits immediately followed by debits",
        "pattern": "mule",
        "avg_amount_range": (11000, 18000),
        "txn_frequency": "paired",  # Credit-debit pairs
        "international_rate": 0.3,
        "high_risk_country_rate": 0.2,
        "structuring_enabled": False,
        "rapid_movement_enabled": True,
        "night_txn_rate": 0.3,  # Higher night activity
        "debit_delay_seconds": 30,  # Time between credit and debit
        "debit_percentage": 0.9,  # 90% of credit amount withdrawn
    },
    
    "layering": {
        "name": "Layering Sequence",
        "description": "Rapid movement across multiple accounts",
        "pattern": "mule",
        "avg_amount_range": (5000, 15000),
        "txn_frequency": "paired",
        "international_rate": 0.4,
        "high_risk_country_rate": 0.2,
        "structuring_enabled": False,
        "rapid_movement_enabled": True,
        "night_txn_rate": 0.3,
        "debit_delay_seconds": 30,  # Fast movement
        "debit_percentage": 0.95,
    },
    
    "velocity": {
        "name": "High Velocity",
        "description": "Sudden burst of high-value transactions",
        "pattern": "velocity",
        "avg_amount_range": (1000, 5000),
        "txn_frequency": "high",
        "international_rate": 0.2,
        "high_risk_country_rate": 0.1,
        "structuring_enabled": False,
        "rapid_movement_enabled": False,
        "night_txn_rate": 0.1,
        "burst_count": 15,  # Enough to trigger velocity rule (>10)
        "burst_interval": 2,  # Very frequent
    },
    
    "high_risk_corridor": {
        "name": "High-Risk Corridor",
        "description": "Transactions to/from high-risk countries",
        "pattern": "high_risk",
        "avg_amount_range": (3000, 12000),
        "txn_frequency": "normal",
        "international_rate": 0.9,
        "high_risk_country_rate": 0.8,
        "structuring_enabled": False,
        "rapid_movement_enabled": False,
        "night_txn_rate": 0.2,
        "high_risk_countries": ["AF", "IR", "SY", "KP", "YEM", "PAK"],
    }
}

def get_scenario(scenario_name: str) -> Dict[str, Any]:
    """Get scenario configuration by name"""
    return SCENARIOS.get(scenario_name, SCENARIOS["normal"])
