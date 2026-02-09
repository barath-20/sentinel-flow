"""
Main FastAPI application
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import asyncio
import time
from datetime import datetime

from app.database import init_db, get_db
from app.api import transactions, alerts, websocket
from app.simulator.scenarios import get_scenario
from app.simulator.generator import TransactionGenerator
from app.schemas import SimulationRequest, TransactionCreate
from app.models import Account

# Initialize FastAPI app
app = FastAPI(
    title="Real-Time AML Monitoring System",
    description="API for real-time anti-money laundering detection and monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router)
app.include_router(alerts.router)
app.include_router(websocket.router)

# Transaction generator
txn_generator = TransactionGenerator()

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("🚀 AML Monitoring System started successfully")
    
    # Create sample accounts
    create_sample_accounts()
    
    # Initialize simulation timer
    app.state.last_sim_time = 0
    
    # Start background normal traffic
    asyncio.create_task(background_normal_traffic())

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Real-Time AML Monitoring System",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/simulate")
async def simulate_scenario(
    request: SimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Start transaction simulation for a scenario
    
    Scenarios:
    - normal: Regular customer activity
    - structuring: Multiple transactions just below $10K
    - layering: Rapid movement (credit followed by debit)
    - velocity: Sudden burst of high-value transactions
    - high_risk_corridor: Transactions to/from high-risk countries
    """
    
    # Generate account if not provided
    account_id = request.account_id or txn_generator.generate_account_id()
    
    # Ensure account exists
    account = db.query(Account).filter(Account.account_id == account_id).first()
    if not account:
        # Create account
        account = Account(
            account_id=account_id,
            customer_name=f"Test Customer {account_id[-5:]}",
            account_type="personal",
            monthly_income=5000.0,
            risk_rating="low",
            country="US"
        )
        db.add(account)
        db.commit()
    
    # Generate transactions based on scenario
    transactions_data = txn_generator.generate_scenario_transactions(
        scenario_name=request.scenario,
        account_id=account_id,
        count=request.txn_per_minute * (request.duration_seconds // 60)
    )
    
    # Signal background task to pause
    app.state.last_sim_time = time.time()
    
    # Submit transactions asynchronously
    asyncio.create_task(
        simulate_transactions(transactions_data, request.duration_seconds)
    )
    
    return {
        "success": True,
        "scenario": request.scenario,
        "account_id": account_id,
        "transaction_count": len(transactions_data),
        "duration_seconds": request.duration_seconds,
        "message": f"Simulation started for scenario '{request.scenario}'"
    }

async def simulate_transactions(transactions_data: list, duration_seconds: int):
    """
    Simulate transactions over time
    
    This function runs in the background and submits transactions to the ingestion endpoint
    """
    from app.api.transactions import ingest_transaction
    from app.database import SessionLocal
    
    interval = duration_seconds / len(transactions_data)
    
    for txn_data in transactions_data:
        # Create transaction
        txn = TransactionCreate(**txn_data)
        
        # Ingest transaction
        db = SessionLocal()
        try:
            result = await ingest_transaction(txn, db)
            
            # Broadcast to WebSocket clients
            from app.api.websocket import manager
            await manager.broadcast({
                "type": "transaction",
                "data": {
                    **txn_data,
                    "risk_score": result["risk_score"],
                    "alert_level": result["alert_level"]
                }
            })
            
            if result["alert_generated"]:
                await manager.broadcast({
                    "type": "alert",
                    "data": {
                        "alert_id": result["alert_id"],
                        "txn_id": txn_data["txn_id"],
                        "risk_score": result["risk_score"],
                        "alert_level": result["alert_level"]
                    }
                })
        
        finally:
            db.close()
        
        # Wait before next transaction
        await asyncio.sleep(interval)

async def background_normal_traffic():
    """
    Continuous background task to generate 'Normal' transactions 
    to keep the dashboard live and reactive.
    """
    # Wait a bit for system to fully start
    await asyncio.sleep(5)
    
    while True:
        try:
            # Skip if a manual simulation was started recently (within 60s)
            current_time = time.time()
            if current_time - app.state.last_sim_time < 60:
                await asyncio.sleep(5)
                continue

            # Generate one normal transaction
            account_id = "ACC12345"  # Use sample account
            txn_data = txn_generator.generate_transaction(
                account_id=account_id,
                scenario_config=get_scenario("normal")
            )
            
            # Use simulate_transactions logic for a single item
            await simulate_transactions([txn_data], 1)
            
            # Wait 10 seconds for next normal transaction
            await asyncio.sleep(10)
        except Exception as e:
            print(f"⚠️ Error in background traffic: {e}")
            await asyncio.sleep(30) # Wait longer on error

def create_sample_accounts():
    """Create sample accounts for testing"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if accounts exist
        existing = db.query(Account).count()
        if existing > 0:
            return
        
        # Create sample accounts
        sample_accounts = [
            Account(
                account_id="ACC12345",
                customer_name="John Doe",
                account_type="personal",
                monthly_income=50000.0,
                risk_rating="low",
                country="US"
            ),
            Account(
                account_id="ACC67890",
                customer_name="Jane Smith",
                account_type="business",
                monthly_income=25000.0,
                risk_rating="medium",
                country="US"
            )
        ]
        
        for account in sample_accounts:
            db.add(account)
        
        db.commit()
        print("✅ Sample accounts created")
    
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
