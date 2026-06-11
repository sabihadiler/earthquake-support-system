import pandas as pd
import joblib

MODEL_DIR = "models/earthquake_model"

model = joblib.load(f"{MODEL_DIR}/earthquake_risk_model.pkl")
le_location = joblib.load(f"{MODEL_DIR}/earthquake_location_encoder.pkl")
le_type = joblib.load(f"{MODEL_DIR}/earthquake_type_encoder.pkl")
le_target = joblib.load(f"{MODEL_DIR}/earthquake_target_encoder.pkl")
features = joblib.load(f"{MODEL_DIR}/earthquake_features.pkl")


def load_earthquake_dataset(file_path):
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    return pd.read_excel(file_path)


def prepare_earthquake_data(df):
    df = df.copy()

    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")

    num_cols = ["Longitude", "Latitude", "Depth", "Rms", "Magnitude"]

    for col in num_cols:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Location"] = df["Location"].astype(str)

    if "Type" not in df.columns:
        df["Type"] = "unknown"

    df["Type"] = df["Type"].astype(str)

    df = df.dropna(
        subset=["Date", "Longitude", "Latitude", "Depth", "Magnitude", "Location"]
    )

    df["Rms"] = df["Rms"].fillna(df["Rms"].median())

    df["year"] = df["Date"].dt.year
    df["month"] = df["Date"].dt.month
    df["day"] = df["Date"].dt.day
    df["hour"] = df["Date"].dt.hour
    df["weekday"] = df["Date"].dt.weekday

    df["location_event_count"] = df["Location"].map(
        df["Location"].value_counts()
    )

    df["location_avg_magnitude"] = df["Location"].map(
        df.groupby("Location")["Magnitude"].mean()
    )

    df["location_max_magnitude"] = df["Location"].map(
        df.groupby("Location")["Magnitude"].max()
    )

    df["location_avg_depth"] = df["Location"].map(
        df.groupby("Location")["Depth"].mean()
    )

    df["Location_enc"] = df["Location"].apply(
        lambda x: le_location.transform([x])[0]
        if x in le_location.classes_
        else -1
    )

    df["Type_enc"] = df["Type"].apply(
        lambda x: le_type.transform([x])[0]
        if x in le_type.classes_
        else -1
    )

    return df


def analyze_earthquake_dataset(file_path, selected_date=None, region=None):
    df = load_earthquake_dataset(file_path)
    df = prepare_earthquake_data(df)

    if selected_date:
        selected_date = pd.to_datetime(selected_date).date()
        df = df[df["Date"].dt.date == selected_date]

    if region:
        df = df[
            df["Location"]
            .astype(str)
            .str.contains(region, case=False, na=False)
        ]

    if df.empty:
        return {"message": "No earthquake data found."}

    X = df[features]

    predictions = model.predict(X)
    df["predicted_risk"] = le_target.inverse_transform(predictions)

    risk_score_map = {
        "low": 1,
        "medium": 2,
        "high": 3
    }

    df["risk_score"] = df["predicted_risk"].map(risk_score_map)

    location_summary = df.groupby("Location").agg(
        total_earthquakes=("Location", "count"),
        avg_magnitude=("Magnitude", "mean"),
        max_magnitude=("Magnitude", "max"),
        avg_depth=("Depth", "mean"),
        avg_risk_score=("risk_score", "mean"),
        high_count=("predicted_risk", lambda x: (x == "high").sum()),
        medium_count=("predicted_risk", lambda x: (x == "medium").sum()),
        low_count=("predicted_risk", lambda x: (x == "low").sum())
    ).reset_index()

    location_summary["final_earthquake_score"] = (
        location_summary["high_count"] * 5
        + location_summary["medium_count"] * 3
        + location_summary["avg_risk_score"] * 2
        + location_summary["max_magnitude"]
    )

    location_summary = location_summary.sort_values(
        "final_earthquake_score",
        ascending=False
    )

    top_locations = location_summary.head(10).to_dict(orient="records")

    max_magnitude = round(df["Magnitude"].max(), 2)
    avg_magnitude = round(df["Magnitude"].mean(), 2)
    avg_depth = round(df["Depth"].mean(), 2)

    high_ratio = (df["predicted_risk"] == "high").sum() / len(df)

    if max_magnitude >= 7.0 or high_ratio >= 0.35 or avg_magnitude >= 5.5:
        earthquake_risk_level = "high"
    elif max_magnitude >= 5.5 or high_ratio >= 0.15 or avg_magnitude >= 4.0:
        earthquake_risk_level = "medium"
    else:
        earthquake_risk_level = "low"

    return {
        "model_type": "Machine Learning Earthquake Risk Model",
        "total_earthquakes": len(df),
        "max_magnitude": max_magnitude,
        "average_magnitude": avg_magnitude,
        "average_depth": avg_depth,
        "high_prediction_ratio": round(high_ratio, 2),
        "earthquake_risk_level": earthquake_risk_level,
        "affected_locations": df["Location"].value_counts().head(10).index.tolist(),
        "top_risky_locations": top_locations
    }