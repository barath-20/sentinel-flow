"""
Configuration settings for the AML Monitoring System
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/aml_database.db")

# Model paths
MODEL_DIR = BASE_DIR / "ml" / "models"
MODEL_PATH = MODEL_DIR / "aml_model.pkl"
EXPLAINER_PATH = MODEL_DIR / "explainer.pkl"

# Feature computation settings
FEATURE_CACHE_TTL = 300  # 5 minutes

# Risk scoring weights
RULE_WEIGHT = 0.35
ANOMALY_WEIGHT = 0.25
ML_WEIGHT = 0.40

# Alert thresholds
ALERT_THRESHOLD_LOW = 40
ALERT_THRESHOLD_MEDIUM = 60
ALERT_THRESHOLD_HIGH = 80
ALERT_THRESHOLD_CRITICAL = 90

# Transaction simulation
DEFAULT_TXN_PER_MINUTE = 5
DEFAULT_SIMULATION_DURATION = 60  # seconds

# Country risk scores (1-10, 10 = highest risk)
COUNTRY_RISK_SCORES = {
    "US": 1, "UK": 1, "DE": 1, "FR": 1, "CA": 1,
    "CN": 4, "RU": 8, "IN": 3, "BR": 4,
    "AF": 9, "IR": 9, "SY": 10, "KP": 10,
    "NGA": 6, "PAK": 7, "YEM": 9
}

# High-value transaction threshold
HIGH_VALUE_THRESHOLD = 10000

# Reporting threshold for structuring
STRUCTURING_THRESHOLD = 10000
STRUCTURING_JUST_BELOW_MIN = 8000
STRUCTURING_JUST_BELOW_MAX = 9900

# Time windows (in seconds)
WINDOW_1_HOUR = 3600
WINDOW_24_HOURS = 86400
WINDOW_7_DAYS = 604800
WINDOW_30_DAYS = 2592000

# Night time hours (for anomaly detection)
NIGHT_START_HOUR = 22
NIGHT_END_HOUR = 6
