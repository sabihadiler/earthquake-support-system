import os
import torch
import torchvision.models as models
from torchvision import transforms
from PIL import Image, UnidentifiedImageError

MODEL_PATH = "models/satellite_model/damage_model.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

model = models.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model = model.to(device)
model.eval()


def predict_damage_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)

        # Eğitim sırasına göre:
        # 0 = Damaged, 1 = Undamaged
        if predicted.item() == 0:
            return "Damaged"
        else:
            return "Undamaged"

    except (UnidentifiedImageError, OSError):
        return None


def analyze_satellite_folder(image_paths):
    damaged_count = 0
    undamaged_count = 0
    skipped_count = 0
    results = []

    for image_path in image_paths:
        prediction = predict_damage_image(image_path)

        if prediction is None:
            skipped_count += 1
            continue

        if prediction == "Damaged":
            damaged_count += 1
        else:
            undamaged_count += 1

        results.append({
            "file_name": os.path.basename(image_path),
            "prediction": prediction
        })

    valid_images = damaged_count + undamaged_count

    damage_ratio = (
        round((damaged_count / valid_images) * 100, 2)
        if valid_images > 0
        else 0
    )

    if damage_ratio >= 70:
        damage_level = "high"
    elif damage_ratio >= 40:
        damage_level = "medium"
    else:
        damage_level = "low"

    return {
        "total_images": len(image_paths),
        "valid_images": valid_images,
        "skipped_images": skipped_count,
        "damaged_count": damaged_count,
        "undamaged_count": undamaged_count,
        "damage_ratio": damage_ratio,
        "damage_level": damage_level,
        "sample_predictions": results[:20],
        "message": "Satellite images analyzed using CNN damage model."
    }