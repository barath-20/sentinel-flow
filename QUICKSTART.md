# Quick Start Guide - Real-Time AML Monitoring System

## Prerequisites Check
- [ ] Python 3.9+ installed (`python --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)

## 5-Minute Setup

### Step 1: Train the ML Model (One-time, ~2 minutes)

```bash
cd d:\LITHOS HACKATHON\aml-monitoring-system\backend

# Create and activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate training data and train model
python ml/generate_training_data.py
python ml/train_model.py
```

**Expected Output:**
```
✅ Generated 10000 transactions
✅ Model trained successfully
Accuracy: 0.95+
✅ Model saved to ml/models/aml_model.pkl
```

### Step 2: Start Backend (~30 seconds)

```bash
# From backend directory with venv activated
uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
✅ Database initialized successfully
✅ Sample accounts created
🚀 AML Monitoring System started successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start Frontend (~1 minute)

**New terminal:**
```bash
cd d:\LITHOS HACKATHON\aml-monitoring-system\frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 4: Open Dashboard

Navigate to: **http://localhost:3000**

You should see:
- ✅ "System Active" green indicator in header
- ✅ Four scenario buttons
- ✅ Empty transaction feed and alert queue

## Running a Test

### Option 1: Web UI (Recommended)

1. Click 🟡 **"Structuring Detection"** button
2. Watch transactions appear in real-time (right side)
3. See alerts generated in alert queue (right side)
4. Click any alert to view detailed explanation

### Option 2: API Test

```bash
curl -X POST http://localhost:8000/api/simulate?scenario=structuring
```

**Expected Response:**
```json
{
  "success": true,
  "scenario": "structuring",
  "transaction_count": 4,
  "message": "Simulation started for scenario 'structuring'"
}
```

Watch the dashboard for real-time updates!

## Verify Everything Works

✅ **Backend Running**: Visit http://localhost:8000 → Should see `{"message":"Real-Time AML Monitoring System",...}`  
✅ **Frontend Running**: Visit http://localhost:3000 → Should see dashboard  
✅ **WebSocket Connected**: Dashboard shows "Live" connection status  
✅ **Scenarios Work**: Click a scenario button → Transactions and alerts appear  
✅ **Alert Details**: Click an alert → See full explanation with charts

## Troubleshooting

### "Module not found" error
```bash
# Backend: Ensure venv is activated
cd backend
venv\Scripts\activate
pip install -r requirements.txt

# Frontend: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Model not found" warning
```bash
# Train the model first
cd backend
python ml/generate_training_data.py
python ml/train_model.py
```

### Frontend can't connect to backend
- Check backend is running on port 8000
- Check no CORS errors in browser console (F12)
- Verify proxy config in `frontend/vite.config.js`

### No real-time updates
- Check browser console for WebSocket errors
- Ensure backend WebSocket endpoint is accessible
- Try refreshing the page

## Directory Structure Quick Reference

```
aml-monitoring-system/
├── backend/
│   ├── venv/                    # Virtual environment (created by you)
│   ├── app/                     # Application code
│   ├── ml/                      # ML scripts
│   │   ├── models/              # Trained model (created by train_model.py)
│   │   └── training_data.csv    # Generated data
│   ├── requirements.txt
│   └── aml_database.db          # SQLite database (created automatically)
│
└── frontend/
    ├── node_modules/            # Dependencies (created by npm install)
    ├── src/                     # React source code
    └── package.json

```

## Common Commands

```bash
# Backend
cd backend
venv\Scripts\activate                    # Activate venv
uvicorn app.main:app --reload --port 8000  # Start server
python ml/train_model.py                  # Retrain model

# Frontend
cd frontend
npm run dev                               # Start dev server
npm run build                             # Build for production

# Both
# Stop servers: Ctrl+C in each terminal
```

## Demo Checklist

Before demonstrating:
- [ ] Backend running and responding
- [ ] Frontend loaded at localhost:3000
- [ ] "System Active" showing in dashboard
- [ ] Test one scenario to verify system works
- [ ] Review [DEMO_SCRIPT.md](file:///d:/LITHOS%20HACKATHON/aml-monitoring-system/DEMO_SCRIPT.md) for 90-second demo flow

## Support

- **Full Documentation**: See [README.md](file:///d:/LITHOS%20HACKATHON/aml-monitoring-system/README.md)
- **Demo Script**: See [DEMO_SCRIPT.md](file:///d:/LITHOS%20HACKATHON/aml-monitoring-system/DEMO_SCRIPT.md)
- **Walkthrough**: See [walkthrough.md](file:///C:/Users/barat/.gemini/antigravity/brain/a78490c9-8a98-4774-8bbf-d91d6ab58132/walkthrough.md)

---

🚀 **You're ready to demo the Real-Time AML Monitoring System!**
