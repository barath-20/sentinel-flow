# Real-Time AML Monitoring System

🛡️ **A fully functional, real-time Anti-Money Laundering (AML) detection system for hackathon demonstration**

## Overview

This MVP demonstrates an end-to-end AML monitoring solution that ingests transaction streams, computes real-time features, performs hybrid detection (rules + anomaly + ML), and provides comprehensive explainability through an investigator dashboard.

### Key Features

✅ **Real-Time Processing**: <2s detection latency from ingestion to alert  
✅ **Hybrid Detection Engine**:
- **Rules Engine**: 6 transparent detection rules (structuring, mule accounts, high-risk corridors, etc.)
- **Anomaly Detection**: IsolationForest + z-score analysis
- **ML Model**: XGBoost trained on synthetic data with SHAP explainability

✅ **25 Real-Time Features**: Rolling windows, behavioral patterns, temporal analysis, geographic risk  
✅ **Full Explainability**: Rule triggers + anomaly insights + ML feature contributions + natural language summaries  
✅ **Interactive Dashboard**: React frontend with live transaction feed, alert queue, and scenario simulations  
✅ **4 Demo Scenarios**: Normal, Structuring, Mule Account, High-Risk Corridor

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Port 3000)                  │
│  - Dashboard  - Transaction Feed  - Alert Queue  - Scenarios    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket + REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Feature    │  │   Detection  │  │  Scoring &   │          │
│  │   Engine     │→ │   Engines    │→ │   Alerts     │          │
│  │ (25 features)│  │ (Rules+Ano+ML)│  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  SQLite Database│
                  └─────────────────┘
```

## Technology Stack

**Backend**:
- FastAPI (async, WebSocket)
- SQLite (persistence)
- scikit-learn, XGBoost, SHAP (ML & explainability)
- pandas, numpy (feature engineering)

**Frontend**:
- React 18 + Vite
- Tailwind CSS (styling)
- Recharts (visualizations)
- WebSocket (real-time updates)

**100% Free & Open Source** - No cloud dependencies!

## Project Structure

```
aml-monitoring-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # SQLite setup
│   │   ├── models.py            # ORM models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── features/            # Feature engineering (25 features)
│   │   ├── detection/           # Rules, anomaly, ML detection
│   │   ├── explainability/      # Natural language explanations
│   │   ├── simulator/           # Transaction generator
│   │   └── api/                 # REST & WebSocket endpoints
│   ├── ml/
│   │   ├── generate_training_data.py  # Synthetic data (10K samples)
│   │   └── train_model.py             # XGBoost training
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Dashboard & Alert Details
│   │   ├── hooks/               # WebSocket hook
│   │   └── utils/               # API client
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md
├── DEMO_SCRIPT.md
└── DEMO_SCRIPT_1MIN.md   # Condensed 60-second version
```

## Setup Instructions

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **npm or yarn**

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate venv (Windows)
venv\Scripts\activate

# Activate venv (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Train ML Model

```bash
# Generate synthetic training data (10,000+ samples)
python ml/generate_training_data.py

# Train XGBoost model with SHAP explainability
python ml/train_model.py
```

**Expected Output**:
```
✅ Generated 10000 transactions
✅ Model trained successfully
Accuracy: 0.95+
ROC-AUC: 0.97+
✅ Model saved to ml/models/aml_model.pkl
```

### Step 3: Start Backend Server

```bash
# Run from backend directory
uvicorn app.main:app --reload --port 8000
```

Server will start at `http://localhost:8000`

### Step 4: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at `http://localhost:3000`

### Step 5: Open Dashboard

Navigate to `http://localhost:3000` in your browser

## Usage

### Running Demo Scenarios

1. **Open Dashboard** at `http://localhost:3000`

2. **Select a Scenario**:
   - 🟢 **Normal Activity**: Low-risk transactions
   - 🟡 **Structuring**: Multiple transactions just below $10K threshold
   - 🟠 **Mule Account**: Large credit followed by rapid debit
   - 🔴 **High-Risk Corridor**: Transactions to/from high-risk countries

3. **Observe Real-Time Detection**:
   - Transactions appear in the live feed
   - Alerts are generated and shown in the alert queue
   - Click any alert to view full explainability

4. **Review Alert Details**:
   - Risk score breakdown (pie chart)
   - Triggered rules with severity
   - ML feature contributions (bar chart)
   - Natural language explanation

### API Endpoints

**Transactions**:
- `POST /api/transactions/ingest` - Ingest transaction
- `GET /api/transactions` - List transactions

**Alerts**:
- `GET /api/alerts` - List alerts (filterable)
- `GET /api/alerts/{alert_id}` - Get alert details
- `PATCH /api/alerts/{alert_id}` - Update alert status

**Simulation**:
- `POST /api/simulate?scenario=<name>` - Start scenario simulation

**Real-time**:
- `WS /ws/live` - WebSocket for live updates

### Testing the System

**Manual Test**:
```bash
# Test transaction ingestion
curl -X POST http://localhost:8000/api/transactions/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "txn_id": "TXN001",
    "timestamp": "2026-02-08T10:00:00",
    "account_id": "ACC12345",
    "counterparty_id": "CP1234",
    "amount": 8900,
    "currency": "USD",
    "txn_type": "credit",
    "channel": "online",
    "country_code": "US",
    "is_international": false
  }'
```

**Check Response**:
```json
{
  "success": true,
  "txn_id": "TXN001",
  "risk_score": 45.2,
  "alert_level": "MEDIUM",
  "alert_generated": true
}
```

## System Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Detection Latency | <2s | ~500ms |
| Feature Computation | <200ms | ~150ms |
| ML Inference | <50ms | ~30ms |
| WebSocket Push | <500ms | ~100ms |

## Detection Features (25 Total)

**Time-Window Features** (7):
- HourlyTxnCount, DailyTxnCount, WeeklyTxnCount
- HourlyCreditSum, DailyCreditSum, HourlyDebitSum, DailyDebitSum

**Behavioral Features** (7):
- UniqueCounterparties7d, UniqueCounterparties30d
- InflowOutflowRatio, AvgTxnAmount7d, StdTxnAmount7d
- TxnAmountZScore, TxnAmountToIncomeRatio

**Temporal Features** (6):
- HourOfDay, DayOfWeek, IsWeekend, IsNightTime
- TimeSinceLastTxn, TxnFrequencyAnomaly

**Geographic Features** (3):
- IsInternational, CountryRiskScore, UniqueCountries7d

**Network Features** (2):
- CounterpartyVelocity, SharedCounterparties

## Detection Rules

1. **Structuring**: Multiple transactions $8K-$9.9K in 24h
2. **Rapid Movement**: Debit within 2h of credit (>80%)
3. **High-Risk Corridor**: International txn to high-risk country >$5K
4. **Velocity Check**: >10 transactions per hour
5. **Round Amount**: Suspiciously round amounts ≥$5K
6. **Income Anomaly**: Transaction >50% of monthly income

## Model Training

**Dataset**:
- 10,000+ synthetic transactions
- 70% normal, 30% suspicious (4 typologies)
- Features engineered from transaction patterns

**Model**:
- XGBoost Classifier
- 200 trees, max depth 6
- Class-balanced training
- SHAP explainer for interpretability

**Performance**:
- Accuracy: ~95%
- ROC-AUC: ~0.97
- Precision: ~92%
- Recall: ~94%

## Troubleshooting

**Backend won't start**:
- Ensure Python 3.9+ is installed
- Check virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`

**ML model not found**:
- Run training scripts first:
  ```bash
  python ml/generate_training_data.py
  python ml/train_model.py
  ```

**Frontend won't connect**:
- Ensure backend is running on port 8000
- Check CORS settings in `app/main.py`
- Verify proxy settings in `vite.config.js`

**No real-time updates**:
- Check WebSocket connection in browser console
- Ensure backend WebSocket endpoint is accessible
- Try refreshing the page

## Future Enhancements

- [ ] Docker Compose deployment
- [ ] Graph-based network analysis
- [ ] Advanced time series models (LSTM)
- [ ] Integration with actual banking systems
- [ ] Multi-currency support
- [ ] Automated case management
- [ ] Regulatory reporting (SAR generation)

## License

This project is for educational and demonstration purposes only.

## Contact

For questions or support, please contact the development team.

---

🚀 **Built for MIS004 Hackathon** | **End-to-End AML Detection** | **100% Free & Local**
