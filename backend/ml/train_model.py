"""
Train AML detection model using XGBoost with SHAP explainability

This script:
1. Loads synthetic training data
2. Splits into train/test sets
3. Trains XGBoost classifier
4. Evaluates performance
5. Saves model and SHAP explainer
"""
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
import shap

# Feature names (must match feature engineering)
FEATURE_NAMES = [
    "HourlyTxnCount", "DailyTxnCount", "WeeklyTxnCount",
    "HourlyCreditSum", "DailyCreditSum", "HourlyDebitSum", "DailyDebitSum",
    "UniqueCounterparties7d", "UniqueCounterparties30d",
    "InflowOutflowRatio", "AvgTxnAmount7d", "StdTxnAmount7d",
    "TxnAmountZScore", "TxnAmountToIncomeRatio",
    "HourOfDay", "DayOfWeek", "IsWeekend", "IsNightTime",
    "TimeSinceLastTxn", "TxnFrequencyAnomaly",
    "IsInternational", "CountryRiskScore", "UniqueCountries7d",
    "CounterpartyVelocity", "SharedCounterparties"
]

def load_data():
    """Load training data"""
    data_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Training data not found at {data_path}. "
            "Please run generate_training_data.py first."
        )
    
    df = pd.read_csv(data_path)
    print(f"✅ Loaded {len(df)} training samples")
    
    return df

def prepare_features(df):
    """Prepare feature matrix and labels"""
    
    # Select feature columns
    X = df[FEATURE_NAMES].copy()
    y = df["is_suspicious"].values
    
    # Handle any missing values
    X = X.fillna(0)
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Label distribution:")
    print(f"  Normal (0): {(y==0).sum()}")
    print(f"  Suspicious (1): {(y==1).sum()}")
    
    return X, y

def train_model(X_train, y_train):
    """Train XGBoost model"""
    
    print("\n🔄 Training XGBoost model...")
    
    # Calculate scale_pos_weight for class imbalance
    n_normal = (y_train == 0).sum()
    n_suspicious = (y_train == 1).sum()
    scale_pos_weight = n_normal / n_suspicious
    
    # Initialize model
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    # Train
    model.fit(X_train, y_train)
    
    print(f"✅ Model trained successfully")
    
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    
    print("\n📊 Model Evaluation")
    print("=" * 50)
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print(f"ROC-AUC: {roc_auc:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal", "Suspicious"]))
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"              Predicted Normal  Predicted Suspicious")
    print(f"Actual Normal        {cm[0][0]:5d}              {cm[0][1]:5d}")
    print(f"Actual Suspicious    {cm[1][0]:5d}              {cm[1][1]:5d}")
    
    return {
        "accuracy": accuracy,
        "roc_auc": roc_auc
    }

def get_feature_importance(model, feature_names):
    """Display feature importance"""
    
    print("\n🔍 Top 10 Most Important Features:")
    print("=" * 50)
    
    importance = model.feature_importances_
    feature_importance = pd.DataFrame({
        "feature": feature_names,
        "importance": importance
    }).sort_values("importance", ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"{row['feature']:30s}: {row['importance']:.4f}")
    
    return feature_importance

def create_shap_explainer(model, X_train):
    """Create SHAP explainer for model interpretability"""
    
    print("\n🔄 Creating SHAP explainer...")
    
    try:
        # Use a sample for faster computation
        sample_size = min(100, len(X_train))
        X_sample = X_train.sample(n=sample_size, random_state=42)
        
        # Create TreeExplainer
        explainer = shap.TreeExplainer(model)
        
        print(f"✅ SHAP explainer created")
        return explainer
    
    except Exception as e:
        print(f"⚠️  Error creating SHAP explainer: {e}")
        return None

def save_artifacts(model, explainer):
    """Save trained model and explainer"""
    
    # Create models directory
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(models_dir, "aml_model.pkl")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"\n✅ Model saved to {model_path}")
    
    # Save explainer
    if explainer is not None:
        explainer_path = os.path.join(models_dir, "explainer.pkl")
        with open(explainer_path, 'wb') as f:
            pickle.dump(explainer, f)
        print(f"✅ SHAP explainer saved to {explainer_path}")

def main():
    """Main training pipeline"""
    
    print("=" * 60)
    print("AML Detection Model Training")
    print("=" * 60)
    
    # Load data
    df = load_data()
    
    # Prepare features
    X, y = prepare_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Feature importance
    feature_importance = get_feature_importance(model, FEATURE_NAMES)
    
    # Create SHAP explainer
    explainer = create_shap_explainer(model, X_train)
    
    # Save artifacts
    save_artifacts(model, explainer)
    
    print("\n" + "=" * 60)
    print("✅ Training completed successfully!")
    print("=" * 60)
    print(f"\nModel Performance Summary:")
    print(f"  Accuracy: {metrics['accuracy']:.2%}")
    print(f"  ROC-AUC: {metrics['roc_auc']:.4f}")
    print(f"\nModel is ready for use in the AML monitoring system.")

if __name__ == "__main__":
    main()
