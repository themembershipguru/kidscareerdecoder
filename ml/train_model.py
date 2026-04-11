import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

feature_cols = [
    "logical_pct",
    "creative_pct",
    "verbal_pct",
    "social_pct",
    "scientific_pct",
    "practical_pct",
    "age",
]


def main():
    df = pd.read_csv("synthetic_data.csv")
    X = df[feature_cols]
    y = df["dominant_profile"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    acc = float((pred == y_test).mean())
    print("accuracy", acc)
    print(classification_report(y_test, pred))
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))
    print("feature_importances", importances)
    joblib.dump(model, "aptitude_model.pkl")


if __name__ == "__main__":
    main()
