# 60-Second Demo Script: Sentinel Flow

## Objective
Demonstrate the **Sentinel Flow** AML monitoring system’s real-time detection and explainable AI capabilities in exactly 60 seconds.

---

## Pre-Demo Setup
1. **Start Backend**: `uvicorn app.main:app --reload --port 8000`
2. **Start Frontend**: `npm run dev`
3. **Open Dashboard**: `http://localhost:3000` (Wait for "SYSTEM ONLINE" indicator)

---

## Demo Flow (60 Seconds)

### **[0:00 - 0:10] Introduction: The Cyber SOC (10s)**
**Say**: 
> "Welcome to Sentinel Flow, a high-performance Anti-Money Laundering (AML) platform designed for the modern SOC. We combine rule engines, anomaly detection, and explainable AI to secure global transactions."

**Show**: 
- **Dashboard Header**: Point out the "SYSTEM ONLINE" green indicator.
- **Stats Card**: Gesture to the "Detection Rate" and "Total Transactions" cards.

---

### **[0:10 - 0:25] Live Detection: The Structuring Attack (15s)**
**Say**: 
> "Let's simulate a 'Structuring' attack—where criminals break large sums into smaller pieces to evade detection thresholds."

**Action**: Click the 📉 **"Structuring Pattern"** button.
**Show**: 
- **Transaction Feed**: Point to the stream of transactions populating in real-time.
- **Alert Queue**: Watch as **CRITICAL** alerts instantly populate the right sidebar.

---

### **[0:25 - 0:50] The "Why": Deep Explainability (25s)**
**Say**: 
> "Speed is nothing without context. Let's dive into an alert. Our system doesn't just flag it; it explains *why*."

**Action**: Click the top **CRITICAL** alert in the queue.
**Show**: 
- **Risk Score Gauge**: Highlight the high risk percentage.
- **Explainability Charts**: 
    - "Here we see the breakdown: Rule violations, Anomaly scores, and ML prediction."
    - Point to **SHAP Feature Importance**: "We can see exactly which features, like transaction velocity, moved the needle."

---

### **[0:50 - 1:00] Conclusion: Mission Critical (10s)**
**Say**: 
> "In 60 seconds, we've detected a complex laundring pattern and provided a full audit trail for investigators. Sentinel Flow: Real-time, Hybrid, and fully Explainable. Thank you."

**Show**: Back to Dashboard, showing the overview of all active alerts.

---

## Technical Edge (For Q&A)
- **Latency**: < 2 seconds from transaction to alert.
- **Intelligence**: Hybrid model combining XGBoost + Rule Engine + Anomaly Detection.
- **Transparency**: Integrated SHAP values for feature-level explanation.
- **Stack**: FastAPI, React, WebSocket, Tailwind CSS.

---

🎯 **Goal**: Wow the audience with the **visual polish** and the **immediate transition** from raw data to deep AI insight.
