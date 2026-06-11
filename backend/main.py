from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import shutil
import os
import zipfile

from services.tweet_service import analyze_tweet_dataset
from services.tweet_model_service import predict_tweet_with_model
from services.earthquake_service import analyze_earthquake_dataset
from services.satellite_service import analyze_satellite_folder

from services.decision_service import (
    calculate_risk_score,
    calculate_dynamic_risk_score,
    determine_priority
)

from services.report_service import (
    generate_actions,
    generate_report
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)


class EmergencyInput(BaseModel):
    region: str
    magnitude: float
    damage_ratio: float
    tweet_risk_score: float
    tweet_label: str


class TweetInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "System running"}


@app.post("/tweet-analysis")
def tweet_analysis(data: TweetInput):
    return predict_tweet_with_model(data.text)


@app.post("/tweet-model-analysis")
def tweet_model_analysis(data: TweetInput):
    return predict_tweet_with_model(data.text)


@app.post("/tweet-dataset-analysis")
def tweet_dataset_analysis(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return analyze_tweet_dataset(file_path)


@app.post("/earthquake-analysis")
def earthquake_analysis(
    file: UploadFile = File(...),
    selected_date: Optional[str] = Form(None),
    region: Optional[str] = Form(None)
):
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return analyze_earthquake_dataset(
        file_path=file_path,
        selected_date=selected_date,
        region=region
    )


@app.post("/satellite-damage-analysis")
def satellite_damage_analysis(file: UploadFile = File(...)):
    zip_path = f"uploads/{file.filename}"

    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extract_folder = "uploads/satellite_images"

    if os.path.exists(extract_folder):
        shutil.rmtree(extract_folder)

    os.makedirs(extract_folder, exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_folder)

    image_paths = []

    for root, dirs, files in os.walk(extract_folder):
        for f in files:
            if "__MACOSX" in root:
                continue
            if f.startswith("._"):
                continue
            if f == ".DS_Store":
                continue
            if f.lower().endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
                image_paths.append(os.path.join(root, f))

    if len(image_paths) == 0:
        return {
            "total_images": 0,
            "valid_images": 0,
            "skipped_images": 0,
            "damaged_count": 0,
            "undamaged_count": 0,
            "damage_ratio": 0,
            "damage_level": "low",
            "sample_predictions": [],
            "message": "No satellite images found in ZIP file."
        }

    return analyze_satellite_folder(image_paths)


@app.post("/emergency-support-report")
def emergency_support(data: EmergencyInput):
    risk_score = calculate_risk_score(
        data.magnitude,
        data.damage_ratio,
        data.tweet_risk_score
    )

    priority = determine_priority(risk_score)
    actions = generate_actions(priority)
    report = generate_report(data.region, priority, risk_score)

    return {
        "region": data.region,
        "magnitude": data.magnitude,
        "damage_ratio": data.damage_ratio,
        "tweet_risk_score": data.tweet_risk_score,
        "tweet_label": data.tweet_label,
        "risk_score": risk_score,
        "priority_level": priority,
        "recommended_actions": actions,
        "report": report
    }


@app.post("/integrated-analysis-flexible")
def integrated_analysis_flexible(
    region: str = Form(...),
    selected_date: Optional[str] = Form(None),

    earthquake_file: Optional[UploadFile] = File(None),
    satellite_file: Optional[UploadFile] = File(None),
    tweet_file: Optional[UploadFile] = File(None)
):
    earthquake_result = None
    satellite_result = None
    tweet_result = None

    magnitude = None
    damage_ratio = None
    tweet_risk_score = None

    active_source_count = 0

    if earthquake_file is not None:
        earthquake_path = f"uploads/{earthquake_file.filename}"

        with open(earthquake_path, "wb") as buffer:
            shutil.copyfileobj(earthquake_file.file, buffer)

        earthquake_result = analyze_earthquake_dataset(
            file_path=earthquake_path,
            selected_date=selected_date,
            region=region
        )

        magnitude = (
            earthquake_result.get("max_magnitude")
            or earthquake_result.get("magnitude")
            or earthquake_result.get("average_magnitude")
            or earthquake_result.get("avg_magnitude")
        )

        active_source_count += 1

    if satellite_file is not None:
        zip_path = f"uploads/{satellite_file.filename}"

        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(satellite_file.file, buffer)

        extract_folder = "uploads/integrated_satellite_images"

        if os.path.exists(extract_folder):
            shutil.rmtree(extract_folder)

        os.makedirs(extract_folder, exist_ok=True)

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_folder)

        image_paths = []

        for root, dirs, files in os.walk(extract_folder):
            for f in files:
                if "__MACOSX" in root:
                    continue
                if f.startswith("._"):
                    continue
                if f == ".DS_Store":
                    continue
                if f.lower().endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
                    image_paths.append(os.path.join(root, f))

        if len(image_paths) > 0:
            satellite_result = analyze_satellite_folder(image_paths)
            damage_ratio = satellite_result.get("damage_ratio", 0)
        else:
            satellite_result = {
                "total_images": 0,
                "valid_images": 0,
                "skipped_images": 0,
                "damaged_count": 0,
                "undamaged_count": 0,
                "damage_ratio": 0,
                "damage_level": "low",
                "sample_predictions": [],
                "message": "No satellite images found in ZIP file."
            }
            damage_ratio = 0

        active_source_count += 1

    if tweet_file is not None:
        tweet_path = f"uploads/{tweet_file.filename}"

        with open(tweet_path, "wb") as buffer:
            shutil.copyfileobj(tweet_file.file, buffer)

        tweet_result = analyze_tweet_dataset(tweet_path)

        tweet_risk_score = (
            tweet_result.get("average_tweet_risk_score")
            or tweet_result.get("tweet_risk_score")
            or tweet_result.get("risk_score")
            or tweet_result.get("average_risk_score")
            or 0
        )

        active_source_count += 1

    if active_source_count < 2:
        return {
            "error": "Integrated analysis requires at least two data sources.",
            "used_sources": {
                "earthquake_data": earthquake_result is not None,
                "satellite_data": satellite_result is not None,
                "tweet_data": tweet_result is not None
            }
        }

    risk_score = calculate_dynamic_risk_score(
        magnitude=magnitude,
        damage_ratio=damage_ratio,
        tweet_risk_score=tweet_risk_score
    )

    priority = determine_priority(risk_score)
    actions = generate_actions(priority)
    report = generate_report(region, priority, risk_score)

    return {
        "region": region,
        "used_sources": {
            "earthquake_data": earthquake_result is not None,
            "satellite_data": satellite_result is not None,
            "tweet_data": tweet_result is not None
        },
        "earthquake_result": earthquake_result,
        "satellite_result": satellite_result,
        "tweet_result": tweet_result,
        "risk_score": risk_score,
        "priority_level": priority,
        "recommended_actions": actions,
        "report": report
    }