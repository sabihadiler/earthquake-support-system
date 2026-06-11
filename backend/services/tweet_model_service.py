import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


MODEL_PATH = "models/tweet_model"

id2label = {
    0: "low",
    1: "medium",
    2: "high",
    3: "critical"
}

risk_score_map = {
    "low": 0.25,
    "medium": 0.50,
    "high": 0.75,
    "critical": 1.0
}


model = None
tokenizer = None


def load_tweet_model():
    global model, tokenizer

    if model is None or tokenizer is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Tweet model folder not found. Please place BERTurk model files into backend/models/tweet_model"
            )

        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        model.eval()

    return model, tokenizer


def predict_tweet_with_model(text: str):
    model, tokenizer = load_tweet_model()

    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=96
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        pred_id = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_id].item()

    label = id2label[pred_id]

    return {
        "original_text": text,
        "tweet_label": label,
        "tweet_risk_score": risk_score_map[label],
        "model_confidence": round(confidence, 3),
        "model_type": "BERTurk Transformer"
    }