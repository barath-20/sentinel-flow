"""
Transaction generator for creating realistic and suspicious patterns
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from faker import Faker
from app.simulator.scenarios import get_scenario
from app.config import COUNTRY_RISK_SCORES

fake = Faker()

class TransactionGenerator:
    """Generate transactions based on scenario patterns"""
    
    def __init__(self):
        self.faker = Faker()
        self.low_risk_countries = ["US", "UK", "DE", "FR", "CA"]
        self.high_risk_countries = ["AF", "IR", "SY", "KP", "YEM", "PAK", "NGA"]
        self.channels = ["online", "ATM", "branch", "mobile"]
        self.merchant_categories = [
            "retail", "restaurant", "online_shopping", "utilities",
            "entertainment", "travel", "healthcare", "education"
        ]
        
        # Predefined suspicious entities to create connected graphs (not just star topologies)
        self.suspicious_sources = ["LayerSource_Alpha", "LayerSource_Beta", "LayerSource_Gamma", "Offshore_Holdings_Ltd"]
        self.suspicious_destinations = ["ShellCorp_X", "ShellCorp_Y", "ShellCorp_Z", "SafeHarbor_LLC"]
        self.suspicious_merchants = ["HighRisk_Jewelry", "Luxury_Cars_Ltd", "Casino_Royale", "Crypto_Exchange_Global"]
        
        # Popular merchants for normal transactions to create hubs
        self.popular_merchants = {
            "retail": ["Target_Store", "Walmart_Supercenter", "Amazon_Marketplace"],
            "restaurant": ["Starbucks_Coffee", "McDonalds_MainStr", "Chipotle_Grill"],
            "online_shopping": ["Amazon_Prime", "Ebay_Seller", "Shopify_Store"],
            "utilities": ["City_Power_Co", "Water_Dept", "Internet_Provider_X"],
            "entertainment": ["Netflix_Subscription", "Spotify_Premium", "Cinema_City"],
            "travel": ["Uber_Trip", "Delta_Airlines", "Airbnb_Booking"],
            "healthcare": ["CVS_Pharmacy", "General_Hospital", "Dental_Clinic"],
            "education": ["University_Tuition", "Udemy_Course", "Chegg_Services"]
        }
    
    def generate_account_id(self) -> str:
        """Generate a random account ID"""
        return f"ACC{random.randint(10000, 99999)}"
    
    def generate_transaction(
        self,
        account_id: str,
        scenario_config: Dict[str, Any],
        is_credit: bool = None,
        timestamp: datetime = None,
        amount: float = None,
        country: str = None
    ) -> Dict[str, Any]:
        """Generate a single transaction"""
        
        if timestamp is None:
            timestamp = datetime.now()
        
        # Determine transaction type
        if is_credit is None:
            is_credit = random.choice([True, False])
        
        txn_type = "credit" if is_credit else "debit"
        
        # Determine amount
        if amount is None:
            min_amt, max_amt = scenario_config["avg_amount_range"]
            amount = round(random.uniform(min_amt, max_amt), 2)
        
        # Determine country
        if country is None:
            is_international = random.random() < scenario_config["international_rate"]
            if is_international:
                is_high_risk = random.random() < scenario_config["high_risk_country_rate"]
                if is_high_risk and "high_risk_countries" in scenario_config:
                    country = random.choice(scenario_config["high_risk_countries"])
                else:
                    country = random.choice(self.high_risk_countries if is_high_risk else self.low_risk_countries)
            else:
                country = "US"
        else:
            is_international = country != "US"
        
        # Determine merchant category and counterparty
        merchant_category = random.choice(self.merchant_categories)
        
        if txn_type == "debit" and not is_international:
            # Use popular merchants to create hubs in the graph
             counterparty_id = random.choice(self.popular_merchants.get(merchant_category, ["Unknown_Merchant"]))
        else:
             counterparty_id = f"CP{random.randint(1000, 9999)}"

        return {
            "txn_id": f"TXN{uuid.uuid4().hex[:12].upper()}",
            "timestamp": timestamp.isoformat(),
            "account_id": account_id,
            "counterparty_id": counterparty_id,
            "amount": amount,
            "currency": "USD",
            "txn_type": txn_type,
            "channel": random.choice(self.channels),
            "country_code": country,
            "merchant_category": merchant_category,
            "is_international": is_international
        }
    
    def generate_normal_transactions(
        self,
        account_id: str,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate normal transaction pattern"""
        scenario_config = get_scenario("normal")
        transactions = []
        
        base_time = datetime.now()
        for i in range(count):
            # Spread transactions over time
            timestamp = base_time + timedelta(seconds=i * random.randint(5, 15))
            
            # Avoid night transactions mostly
            if random.random() < scenario_config["night_txn_rate"]:
                timestamp = timestamp.replace(hour=random.randint(22, 23))
            else:
                timestamp = timestamp.replace(hour=random.randint(8, 20))
            
            txn = self.generate_transaction(account_id, scenario_config, timestamp=timestamp)
            transactions.append(txn)
        
        return transactions
    
    def generate_structuring_transactions(
        self,
        account_id: str,
        count: int = 4
    ) -> List[Dict[str, Any]]:
        """Generate structuring pattern (multiple txns just below $10K)"""
        scenario_config = get_scenario("structuring")
        transactions = []
        
        base_time = datetime.now()
        burst_interval = scenario_config["burst_interval"]
        
        # Consistent source for structuring to show connection
        source_id = random.choice(self.suspicious_sources[:2]) # Use subset for structuring
        
        for i in range(count):
            timestamp = base_time + timedelta(seconds=i * burst_interval)
            
            # Amount just below threshold
            amount = round(random.uniform(8000, 9900), 2)
            
            txn = self.generate_transaction(
                account_id,
                scenario_config,
                is_credit=True,  # Usually credits for structuring
                timestamp=timestamp,
                amount=amount,
                country="US"
            )
            # Override counterparty to create connected graph
            txn["counterparty_id"] = source_id
            
            transactions.append(txn)
        
        return transactions
    
    def generate_mule_transactions(
        self,
        account_id: str,
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """Generate mule account pattern (credit followed by rapid debit)"""
        scenario_config = get_scenario("mule")
        transactions = []
        
        base_time = datetime.now()
        
        # Pick consistent entities for this mule session to show flow
        # This will create a flow: Source -> Account -> ShellCo
        source_id = random.choice(self.suspicious_sources)
        dest_id = random.choice(self.suspicious_destinations)
        
        for i in range(count):
            credit_time = base_time + timedelta(minutes=i * 5)
            
            # Large credit
            credit_amount = round(random.uniform(5000, 15000), 2)
            
            credit_txn = self.generate_transaction(
                account_id,
                scenario_config,
                is_credit=True,
                timestamp=credit_time,
                amount=credit_amount
            )
            # Override counterparty
            credit_txn["counterparty_id"] = source_id
            
            transactions.append(credit_txn)
            
            # Rapid debit (80-95% of credit)
            debit_delay = scenario_config["debit_delay_seconds"]
            debit_time = credit_time + timedelta(seconds=debit_delay)
            debit_amount = round(credit_amount * scenario_config["debit_percentage"], 2)
            
            debit_txn = self.generate_transaction(
                account_id,
                scenario_config,
                is_credit=False,
                timestamp=debit_time,
                amount=debit_amount
            )
            # Override counterparty
            debit_txn["counterparty_id"] = dest_id
            
            transactions.append(debit_txn)
        
        return transactions
    
    def generate_high_risk_corridor_transactions(
        self,
        account_id: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate high-risk corridor pattern"""
        scenario_config = get_scenario("high_risk_corridor")
        transactions = []
        
        base_time = datetime.now()
        high_risk_countries = scenario_config["high_risk_countries"]
        
        # Use a "Foreign Entity" that is consistent
        foreign_entity = f"Foreign_Entity_{random.choice(high_risk_countries)}"
        
        for i in range(count):
            timestamp = base_time + timedelta(seconds=i * random.randint(10, 30))
            
            # High-risk country
            country = random.choice(high_risk_countries)
            
            txn = self.generate_transaction(
                account_id,
                scenario_config,
                timestamp=timestamp,
                country=country
            )
            txn["counterparty_id"] = foreign_entity
            
            transactions.append(txn)
        
        return transactions
    
    def generate_velocity_transactions(
        self,
        account_id: str,
        count: int = 15
    ) -> List[Dict[str, Any]]:
        """Generate high velocity pattern (burst of txns)"""
        scenario_config = get_scenario("velocity")
        transactions = []
        
        base_time = datetime.now()
        burst_interval = scenario_config["burst_interval"]
        
        # Velocity at a specific merchant
        merchant_id = random.choice(self.suspicious_merchants)
        
        for i in range(count):
            timestamp = base_time + timedelta(seconds=i * burst_interval)
            
            txn = self.generate_transaction(
                account_id,
                scenario_config,
                timestamp=timestamp
            )
            txn["counterparty_id"] = merchant_id
            
            transactions.append(txn)
        
        return transactions

    def generate_scenario_transactions(
        self,
        scenario_name: str,
        account_id: Optional[str] = None,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate transactions for a specific scenario"""
        
        if account_id is None:
            account_id = self.generate_account_id()
        
        if scenario_name == "normal":
            return self.generate_normal_transactions(account_id, count)
        elif scenario_name == "structuring":
            return self.generate_structuring_transactions(account_id, min(count, 5))
        elif scenario_name in ["mule", "layering"]:
            return self.generate_mule_transactions(account_id, min(count // 2, 5))
        elif scenario_name == "velocity":
            return self.generate_velocity_transactions(account_id, max(count, 15))
        elif scenario_name == "high_risk_corridor":
            return self.generate_high_risk_corridor_transactions(account_id, count)
        else:
            return self.generate_normal_transactions(account_id, count)
