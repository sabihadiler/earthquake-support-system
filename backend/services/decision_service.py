def calculate_risk_score(magnitude, damage_ratio, tweet_risk_score):
    magnitude_score = min(float(magnitude) / 8.0, 1.0)
    damage_score = min(float(damage_ratio) / 100.0, 1.0)
    tweet_score = min(float(tweet_risk_score), 1.0)

    score = (
        0.4 * magnitude_score +
        0.3 * damage_score +
        0.3 * tweet_score
    )

    return round(score, 3)


def calculate_dynamic_risk_score(
    magnitude=None,
    damage_ratio=None,
    tweet_risk_score=None
):
    weighted_scores = []

    if magnitude is not None:
        magnitude_score = min(float(magnitude) / 8.0, 1.0)
        weighted_scores.append((magnitude_score, 0.4))

    if damage_ratio is not None:
        damage_score = min(float(damage_ratio) / 100.0, 1.0)
        weighted_scores.append((damage_score, 0.3))

    if tweet_risk_score is not None:
        tweet_score = min(float(tweet_risk_score), 1.0)
        weighted_scores.append((tweet_score, 0.3))

    if len(weighted_scores) == 0:
        return 0

    total_weight = sum(weight for score, weight in weighted_scores)

    final_score = sum(
        score * weight for score, weight in weighted_scores
    ) / total_weight

    return round(final_score, 3)


def determine_priority(score):
    score = float(score)

    if score >= 0.75:
        return "CRITICAL"

    elif score >= 0.55:
        return "HIGH"

    elif score >= 0.35:
        return "MEDIUM"

    return "LOW"