import re
import pandas as pd

from transformers import pipeline


classifier = pipeline(
    "sentiment-analysis",
    model="savasy/bert-base-turkish-sentiment-cased",
    tokenizer="savasy/bert-base-turkish-sentiment-cased"
)


RELEVANT_KEYWORDS = [
    "deprem", "earthquake", "enkaz", "yardım",
    "acil", "göçük", "mahsur", "yaralı",
    "afad", "çadır", "ambulans", "hasar",
    "bina", "kurtarın", "imdat", "yıkıldı"
]


DIRECT_HELP_WORDS = [
    "enkaz altında",
    "enkaz altındayız",
    "enkazdayız",
    "mahsur",
    "yardım bekleniyor",
    "yardım edin",
    "acil yardım",
    "kurtarın",
    "ulaşamıyor",
    "ulaşamıyoruz",
    "ulaşılamıyor",
    "adres",
    "sokak",
    "mahalle",
    "apartman",
    "bina yardım",
    "afad gelsin",
    "su lazım",
    "çadır lazım",
    "ilaç lazım",
    "ambulans lazım",
    "konum",
    "lütfen ulaşın",
    "lütfen yardımcı olun"
]


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#", "", text)
    text = re.sub(r"[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_relevant_tweet(text):
    cleaned = clean_text(text)
    return any(keyword in cleaned for keyword in RELEVANT_KEYWORDS)


def has_direct_help_request(text):
    cleaned = clean_text(text)
    return any(word in cleaned for word in DIRECT_HELP_WORDS)


def load_dataset(file_path):
    csv_encodings = ["utf-8", "utf-8-sig", "cp1254", "latin1", "iso-8859-9"]

    if file_path.endswith(".csv"):
        for enc in csv_encodings:
            try:
                return pd.read_csv(
    file_path,
    encoding=enc,
    on_bad_lines="skip",
    low_memory=False,
    engine="python"
)
            except UnicodeDecodeError:
                continue
        raise ValueError("CSV file could not be decoded.")

    if file_path.endswith(".xlsx") or file_path.endswith(".xls"):
        try:
            return pd.read_excel(file_path)
        except Exception:
            for enc in csv_encodings:
                try:
                    return pd.read_csv(
                        file_path,
                        encoding=enc,
                        on_bad_lines="skip",
                        low_memory=False
                    )
                except UnicodeDecodeError:
                    continue
            raise ValueError("Excel file could not be loaded.")

    raise ValueError("Unsupported file format.")


def find_text_column(df):
    possible_columns = [
        "rawContent",
        "text",
        "tweet",
        "content",
        "message"
    ]

    for col in possible_columns:
        if col in df.columns:
            return col

    return df.columns[0]


def predict_tweet_risk(text):
    cleaned = clean_text(text)
    direct_help = has_direct_help_request(cleaned)

    result = classifier(str(text))[0]
    label = result["label"].lower()

    if direct_help:
        risk_level = "high"
        risk_score = 0.75
    elif "negative" in label and is_relevant_tweet(cleaned):
        risk_level = "medium"
        risk_score = 0.50
    else:
        risk_level = "low"
        risk_score = 0.25

    return {
        "tweet": str(text),
        "risk_level": risk_level,
        "tweet_label": "urgent" if risk_level == "high" else risk_level,
        "risk_score": risk_score,
        "tweet_risk_score": risk_score,
        "direct_help_request": direct_help,
        "model_type": "Turkish BERT Sentiment Model + Emergency Action Filter"
    }


def analyze_tweet_dataset(file_path):
    df = load_dataset(file_path)

    if df.empty:
        raise ValueError("Uploaded file is empty.")

    text_column = find_text_column(df)
    df[text_column] = df[text_column].astype(str)

    total_rows = len(df)

    df["clean_text"] = df[text_column].apply(clean_text)
    df["is_relevant"] = df["clean_text"].apply(is_relevant_tweet)
    df["has_direct_help"] = df["clean_text"].apply(has_direct_help_request)

    relevant_df = df[df["is_relevant"]].copy()
    total_relevant_before_limit = len(relevant_df)

    direct_help_df = df[df["has_direct_help"]].copy()

    MAX_TWEETS = 10000

    if len(direct_help_df) >= MAX_TWEETS:
        selected_df = direct_help_df.sample(n=MAX_TWEETS, random_state=42)
    else:
        remaining_count = MAX_TWEETS - len(direct_help_df)
        remaining_df = relevant_df[~relevant_df.index.isin(direct_help_df.index)]

        if len(remaining_df) > remaining_count:
            remaining_df = remaining_df.sample(n=remaining_count, random_state=42)

        selected_df = pd.concat([direct_help_df, remaining_df])

    texts = selected_df[text_column].tolist()

    results = []

    for text in texts:
        result = predict_tweet_risk(text)

        results.append({
            "original_text": result["tweet"],
            "tweet_label": result["tweet_label"],
            "tweet_risk_score": result["tweet_risk_score"],
            "risk_level": result["risk_level"],
            "direct_help_request": result["direct_help_request"]
        })

    high_count = sum(1 for r in results if r["risk_level"] == "high")
    medium_count = sum(1 for r in results if r["risk_level"] == "medium")
    low_count = sum(1 for r in results if r["risk_level"] == "low")

    urgent_results = [
        r for r in results
        if r["risk_level"] == "high"
        and r["direct_help_request"] is True
    ]

    average_score = (
        round(sum(r["tweet_risk_score"] for r in results) / len(results), 2)
        if len(results) > 0
        else 0
    )

    if average_score >= 0.7:
        dataset_distress_level = "urgent"
    elif average_score >= 0.4:
        dataset_distress_level = "medium"
    else:
        dataset_distress_level = "low"

    return {
        "used_text_column": text_column,
        "total_rows_in_file": total_rows,
        "total_relevant_before_limit": total_relevant_before_limit,
        "direct_help_tweet_count": len(direct_help_df),
        "relevant_tweet_count": len(selected_df),
        "analyzed_rows": len(results),

        "limited_for_performance": True,
        "max_relevant_tweets": MAX_TWEETS,

        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "urgent_count": len(urgent_results),

        "average_tweet_risk_score": average_score,
        "dataset_distress_level": dataset_distress_level,

        "model_type": "Turkish BERT Sentiment Model + Emergency Action Filter",

        "urgent_tweets": urgent_results[:20],
        "sample_results": urgent_results[:20]
    }