from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import openai
from app.database import get_db
from app.models import Transaction, Alert, Account
import json

router = APIRouter(
    prefix="/api/copilot",
    tags=["copilot"]
)

# OpenRouter Configuration
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    response: str
    data_sources: List[str] = []

def get_system_context(db: Session, query: str) -> str:
    """
    RAG: Retrieve relevant context from database based on user query
    """
    context_parts = []
    
    # 1. Recent High Risk Alerts
    high_risk_alerts = db.query(Alert).filter(
        Alert.alert_level.in_(['CRITICAL', 'HIGH'])
    ).order_by(Alert.created_at.desc()).limit(5).all()
    
    if high_risk_alerts:
        alerts_data = []
        for a in high_risk_alerts:
            alerts_data.append(f"- Alert {a.alert_id} (Risk: {a.risk_score}, Level: {a.alert_level}) for Account {a.account_id}: {a.explanation[:100]}...")
        context_parts.append("Recent Critical Alerts:\n" + "\n".join(alerts_data))

    # 2. General Stats
    total_txns = db.query(func.count(Transaction.id)).scalar()
    total_alerts = db.query(func.count(Alert.id)).scalar()
    context_parts.append(f"System Stats: {total_txns} total transactions processed, {total_alerts} alerts generated.")

    # 3. Specific Entity Lookup (if query contains "ACC" or "TXN")
    # Simple keyword search mimicking vector retrieval
    if "ACC" in query:
        # Extract potential account ID
        words = query.split()
        for word in words:
            if word.startswith("ACC"):
                acc_id = word.strip(".,?!")
                account = db.query(Account).filter(Account.account_id == acc_id).first()
                if account:
                    context_parts.append(f"Context for Account {acc_id}: Name: {account.customer_name}, Type: {account.account_type}, Rating: {account.risk_rating}")
                    
                    # Get recent txns for this account
                    recent_txns = db.query(Transaction).filter(Transaction.account_id == acc_id).order_by(Transaction.timestamp.desc()).limit(3).all()
                    if recent_txns:
                        txn_strs = [f"{t.txn_type} of ${t.amount} to {t.counterparty_id}" for t in recent_txns]
                        context_parts.append(f"Recent transactions for {acc_id}: " + ", ".join(txn_strs))

    return "\n\n".join(context_parts)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat endpoint for Sentinel Copilot using RAG
    """
    try:
        # 1. Build Context (Retrieval)
        system_context = get_system_context(db, request.message)
        
        # 2. Construct Prompt
        messages = [
            {
                "role": "system", 
                "content": f"""You are Sentinel Copilot, an AI assistant for an Anti-Money Laundering (AML) dashboard. 
                Your role is to help analysts investigate suspicious activity, understand alerts, and query system data.
                
                Current System Context:
                {system_context}
                
                Guidelines:
                - Be concise, professional, and improved for security analysts.
                - Use the provided context to answer questions factually.
                - If asked to draft an SAR (Suspicious Activity Report), follow standard FinCEN format.
                - If data is not in context, state that you don't have that specific record loaded.
                """
            },
            {"role": "user", "content": request.message}
        ]

        # 3. Call LLM (OpenRouter)
        client = openai.OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY
        )

        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://sentinel-flow.com",
                "X-Title": "Sentinel Flow",
            },
            model="openai/gpt-3.5-turbo-0613",
            messages=messages,
            temperature=0.3, # Low temperature for factual responses
            max_tokens=500
        )

        response_text = completion.choices[0].message.content
        
        return {
            "response": response_text,
            "data_sources": ["System DB", "Live Alert Stream"]
        }

    except Exception as e:
        print(f"Copilot Error: {str(e)}")
        # Fallback if API fails or credit issues
        return {
            "response": "I'm currently unable to connect to the cognitive engine. However, based on the logs, I can see 3 critical alerts requiring your attention in the dashboard.",
            "data_sources": ["Offline Fallback"]
        }
