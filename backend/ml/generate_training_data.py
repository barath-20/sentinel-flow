"""
Generate synthetic training data for AML model

Creates 10,000+ labeled transactions with suspicious patterns:
- Normal transactions (70%)
- Structuring patterns (10%)
- Mule account patterns (10%)
- High-risk corridor (5%)
- Unusual timing (5%)
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faker import Faker
from app.config import COUNTRY_RISK_SCORES

fake = Faker()

def generate_normal_transactions(n=7000):
    """Generate normal transaction patterns (label=0)"""
    
    data = []
    base_time = datetime.now() - timedelta(days=90)
    
    for i in range(n):
        # Normal amounts
        amount = np.random.lognormal(mean=5.5, sigma=1.0)  # Mean ~$244
        amount = min(amount, 5000)  # Cap at $5000 for normal
        
        # Normal timing
        timestamp = base_time + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(8, 20),  # Business hours
            minutes=random.randint(0, 59)
        )
        
        txn_type = random.choice(["credit", "debit"])
        country = random.choice(["US", "UK", "DE", "FR", "CA"])
        
        data.append({
            "amount": round(amount, 2),
            "timestamp": timestamp,
            "txn_type": txn_type,
            "country_code": country,
            "is_international": country != "US",
            "monthly_income": np.random.normal(5000, 2000),
            "hour_of_day": timestamp.hour,
            "day_of_week": timestamp.weekday(),
            "is_suspicious": 0
        })
    
    return data

def generate_structuring_transactions(n=1000):
    """Generate structuring patterns (label=1)"""
    
    data = []
    base_time = datetime.now() - timedelta(days=90)
    
    # Create bursts of transactions
    n_bursts = n // 4
    for i in range(n_bursts):
        burst_start = base_time + timedelta(days=random.randint(0, 90))
        
        # 4 transactions in quick succession, just below $10K
        for j in range(4):
            amount = random.uniform(8000, 9900)
            timestamp = burst_start + timedelta(minutes=j * 15)
            
            data.append({
                "amount": round(amount, 2),
                "timestamp": timestamp,
                "txn_type": "credit",  # Usually credits
                "country_code": "US",
                "is_international": False,
                "monthly_income": np.random.normal(5000, 2000),
                "hour_of_day": timestamp.hour,
                "day_of_week": timestamp.weekday(),
                "is_suspicious": 1
            })
    
    return data

def generate_mule_transactions(n=1000):
    """Generate mule account / rapid movement patterns (label=1)"""
    
    data = []
    base_time = datetime.now() - timedelta(days=90)
    
    # Create credit-debit pairs
    n_pairs = n // 2
    for i in range(n_pairs):
        credit_time = base_time + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(0, 23)
        )
        
        # Large credit
        credit_amount = random.uniform(5000, 20000)
        
        data.append({
            "amount": round(credit_amount, 2),
            "timestamp": credit_time,
            "txn_type": "credit",
            "country_code": random.choice(["US", "UK", "CN", "IN"]),
            "is_international": True,
            "monthly_income": np.random.normal(5000, 2000),
            "hour_of_day": credit_time.hour,
            "day_of_week": credit_time.weekday(),
            "is_suspicious": 1
        })
        
        # Rapid debit (80-95% of credit, within 2 hours)
        debit_time = credit_time + timedelta(minutes=random.randint(30, 120))
        debit_amount = credit_amount * random.uniform(0.8, 0.95)
        
        data.append({
            "amount": round(debit_amount, 2),
            "timestamp": debit_time,
            "txn_type": "debit",
            "country_code": random.choice(["US", "UK", "CN", "IN"]),
            "is_international": True,
            "monthly_income": np.random.normal(5000, 2000),
            "hour_of_day": debit_time.hour,
            "day_of_week": debit_time.weekday(),
            "is_suspicious": 1
        })
    
    return data

def generate_high_risk_corridor_transactions(n=500):
    """Generate high-risk corridor patterns (label=1)"""
    
    data = []
    base_time = datetime.now() - timedelta(days=90)
    high_risk_countries = ["AF", "IR", "SY", "KP", "YEM", "PAK", "NGA"]
    
    for i in range(n):
        amount = random.uniform(5000, 20000)
        timestamp = base_time + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(0, 23)
        )
        
        data.append({
            "amount": round(amount, 2),
            "timestamp": timestamp,
            "txn_type": random.choice(["credit", "debit"]),
            "country_code": random.choice(high_risk_countries),
            "is_international": True,
            "monthly_income": np.random.normal(5000, 2000),
            "hour_of_day": timestamp.hour,
            "day_of_week": timestamp.weekday(),
            "is_suspicious": 1
        })
    
    return data

def generate_unusual_timing_transactions(n=500):
    """Generate unusual timing patterns (label=1)"""
    
    data = []
    base_time = datetime.now() - timedelta(days=90)
    
    for i in range(n):
        amount = random.uniform(2000, 10000)
        
        # Night hours or weekend
        if random.random() < 0.5:
            # Night transaction
            hour = random.choice(list(range(22, 24)) + list(range(0, 6)))
        else:
            # Weekend
            hour = random.randint(0, 23)
        
        timestamp = base_time + timedelta(
            days=random.randint(0, 90),
            hours=hour
        )
        
        # Make weekends
        if random.random() < 0.5:
            timestamp = timestamp + timedelta(days=(5 - timestamp.weekday()) % 7)
        
        data.append({
            "amount": round(amount, 2),
            "timestamp": timestamp,
            "txn_type": random.choice(["credit", "debit"]),
            "country_code": random.choice(["US", "UK", "DE"]),
            "is_international": random.random() < 0.3,
            "monthly_income": np.random.normal(5000, 2000),
            "hour_of_day": timestamp.hour,
            "day_of_week": timestamp.weekday(),
            "is_suspicious": 1
        })
    
    return data

def engineer_features(df):
    """Engineer features from raw transaction data"""
    
    # Simplified feature engineering for training
    # In production, these would be computed from historical data
    
    df["HourlyTxnCount"] = np.random.poisson(2, len(df))
    df["DailyTxnCount"] = np.random.poisson(5, len(df))
    df["WeeklyTxnCount"] = np.random.poisson(20, len(df))
    
    df["HourlyCreditSum"] = np.random.lognormal(5, 2, len(df))
    df["DailyCreditSum"] = np.random.lognormal(7, 2, len(df))
    df["HourlyDebitSum"] = np.random.lognormal(5, 2, len(df))
    df["DailyDebitSum"] = np.random.lognormal(7, 2, len(df))
    
    df["UniqueCounterparties7d"] = np.random.poisson(5, len(df))
    df["UniqueCounterparties30d"] = np.random.poisson(15, len(df))
    
    df["InflowOutflowRatio"] = np.random.lognormal(0, 0.5, len(df))
    df["AvgTxnAmount7d"] = np.random.lognormal(5.5, 1, len(df))
    df["StdTxnAmount7d"] = np.random.lognormal(4, 1, len(df))
    
    # Z-score (higher for suspicious)
    df["TxnAmountZScore"] = np.where(
        df["is_suspicious"] == 1,
        np.random.normal(2.5, 1, len(df)),
        np.random.normal(0, 1, len(df))
    )
    
    df["TxnAmountToIncomeRatio"] = df["amount"] / df["monthly_income"]
    
    df["HourOfDay"] = df["hour_of_day"]
    df["DayOfWeek"] = df["day_of_week"]
    df["IsWeekend"] = (df["day_of_week"] >= 5).astype(int)
    df["IsNightTime"] = ((df["hour_of_day"] >= 22) | (df["hour_of_day"] < 6)).astype(int)
    
    df["TimeSinceLastTxn"] = np.random.exponential(60, len(df))
    
    # Frequency anomaly (higher for suspicious)
    df["TxnFrequencyAnomaly"] = np.where(
        df["is_suspicious"] == 1,
        np.random.poisson(5, len(df)),
        np.random.poisson(1, len(df))
    )
    
    df["IsInternational"] = df["is_international"].astype(int)
    df["CountryRiskScore"] = df["country_code"].map(COUNTRY_RISK_SCORES).fillna(5)
    df["UniqueCountries7d"] = np.random.poisson(2, len(df))
    
    df["CounterpartyVelocity"] = np.random.poisson(3, len(df))
    df["SharedCounterparties"] = np.random.poisson(1, len(df))
    
    return df

def main():
    """Generate complete training dataset"""
    
    print("🔄 Generating synthetic training data...")
    
    # Generate each pattern
    normal = generate_normal_transactions(7000)
    structuring = generate_structuring_transactions(1000)
    mule = generate_mule_transactions(1000)
    high_risk = generate_high_risk_corridor_transactions(500)
    unusual_timing = generate_unusual_timing_transactions(500)
    
    # Combine all data
    all_data = normal + structuring + mule + high_risk + unusual_timing
    
    # Convert to DataFrame
    df = pd.DataFrame(all_data)
    
    print(f"✅ Generated {len(df)} transactions")
    print(f"   - Suspicious: {df['is_suspicious'].sum()} ({df['is_suspicious'].mean()*100:.1f}%)")
    print(f"   - Normal: {(df['is_suspicious']==0).sum()} ({(df['is_suspicious']==0).mean()*100:.1f}%)")
    
    # Engineer features
    print("🔄 Engineering features...")
    df = engineer_features(df)
    
    # Save to CSV
    output_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    df.to_csv(output_path, index=False)
    print(f"✅ Training data saved to {output_path}")
    
    print(f"\nDataset shape: {df.shape}")
    print(f"Features: {df.shape[1]}")
    print("\nClass distribution:")
    print(df["is_suspicious"].value_counts())

if __name__ == "__main__":
    main()
