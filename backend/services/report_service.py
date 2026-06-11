def generate_actions(priority):

    if priority == "CRITICAL":
        return [
            "Deploy search and rescue teams",
            "Increase medical support capacity",
            "Send emergency food and water",
            "Establish temporary shelter areas"
        ]

    elif priority == "HIGH":
        return [
            "Prepare emergency response teams",
            "Increase ambulance readiness",
            "Monitor structural damage"
        ]

    elif priority == "MEDIUM":
        return [
            "Continue regional monitoring",
            "Prepare local response units"
        ]

    return [
        "No immediate emergency response required"
    ]


def generate_report(region, priority, risk_score):

    return (
        f"{region} is classified as a "
        f"{priority} priority support region "
        f"with a calculated risk score of "
        f"{risk_score}."
    )