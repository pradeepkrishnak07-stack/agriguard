import os
import sys
import json
from fastapi.testclient import TestClient

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

print("=" * 60)
print("TEST 1: Health & Root Check")
print("=" * 60)
resp = client.get("/api/health")
print("Status code:", resp.status_code)
print("Payload:", resp.json())
assert resp.status_code == 200

print("\n" + "=" * 60)
print("TEST 2: Model Artifacts Check")
print("=" * 60)
models_dir = os.path.join(backend_dir, "app", "models")
model_path = os.path.join(models_dir, "plant_disease_model.joblib")
class_map_path = os.path.join(models_dir, "class_mapping.json")
metrics_path = os.path.join(models_dir, "training_metrics.json")

print("Model exists:", os.path.exists(model_path), f"({os.path.getsize(model_path):,} bytes)")
print("Class mapping exists:", os.path.exists(class_map_path))
print("Metrics exists:", os.path.exists(metrics_path))

with open(class_map_path, "r", encoding="utf-8") as f:
    class_map = json.load(f)
print(f"Total mapped classes: {len(class_map)}")

with open(metrics_path, "r", encoding="utf-8") as f:
    metrics = json.load(f)
print(f"Champion Model: {metrics.get('champion_model')}")
print(f"Champion Accuracy: {metrics.get('champion_accuracy') * 100:.2f}%")
rf_metrics = metrics.get('models_evaluated', {}).get('Random Forest', {})
svm_metrics = metrics.get('models_evaluated', {}).get('SVM (RBF)', {})
print(f"SVM Precision: {svm_metrics.get('precision') * 100:.2f}%, Recall: {svm_metrics.get('recall') * 100:.2f}%, F1: {svm_metrics.get('f1_score') * 100:.2f}%")
print(f"RF Precision: {rf_metrics.get('precision') * 100:.2f}%, Recall: {rf_metrics.get('recall') * 100:.2f}%, F1: {rf_metrics.get('f1_score') * 100:.2f}%")

print("\n" + "=" * 60)
print("TEST 3: Real PlantVillage Image Inference via /api/disease/detect")
print("=" * 60)

dataset_base = r"C:\Users\ADMIN\.cache\kagglehub\datasets\emmarex\plantdisease\versions\1\PlantVillage"

test_cases = [
    ("Tomato Early Blight", os.path.join(dataset_base, "Tomato_Early_blight")),
    ("Potato Late Blight", os.path.join(dataset_base, "Potato___Late_blight")),
    ("Pepper Bacterial Spot", os.path.join(dataset_base, "Pepper__bell___Bacterial_spot")),
    ("Tomato Healthy", os.path.join(dataset_base, "Tomato_healthy")),
    ("Potato Healthy", os.path.join(dataset_base, "Potato___healthy")),
]

for name, folder in test_cases:
    if not os.path.exists(folder):
        print(f"Folder not found: {folder}")
        continue
    img_files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not img_files:
        print(f"No images in {folder}")
        continue
    img_path = os.path.join(folder, img_files[0])
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    res = client.post(
        "/api/disease/detect",
        files={"file": (img_files[0], img_bytes, "image/jpeg")}
    )
    print(f"\n[Case: {name}]")
    print(f"  HTTP Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    crop_name = data.get("crop_name_en")
    condition = data.get("condition_title_en")
    pathogen = data.get("pathogen")
    conf = data.get("confidence_score")
    is_healthy = data.get("is_healthy")
    model_ver = data.get("model_version")

    print(f"  Predicted Crop: {crop_name}")
    print(f"  Condition: {condition}")
    print(f"  Pathogen: {pathogen}")
    print(f"  Confidence: {conf:.2f} ({data.get('confidence_percentage')}%)")
    print(f"  Is Healthy: {is_healthy}")
    print(f"  Model Version: {model_ver}")

    # Check Treatment Information
    org = data.get("organic_treatment", {})
    chem = data.get("chemical_treatment", {})
    print(f"  Organic Solution: {org.get('name_en')}")
    print(f"  Organic Rate: {org.get('rate_per_acre')}")
    print(f"  Chemical Product: {chem.get('product_name_en')}")
    print(f"  Chemical Rate: {chem.get('approved_rate_per_acre')}")
    print(f"  Chemical Active Ingredient: {chem.get('active_ingredient')}")

    # Verify that treatment information is not placeholder
    assert org.get("name_en") is not None, "Organic solution name should not be None"
    assert chem.get("product_name_en") is not None, "Chemical product name should not be None"

print("\n" + "=" * 60)
print("TEST 4: Non-image and Unsupported Input Handling")
print("=" * 60)

# 1. File too small (< 3 KB)
res_small = client.post(
    "/api/disease/detect",
    files={"file": ("tiny.jpg", b"small bytes", "image/jpeg")}
)
print("Small file response code:", res_small.status_code)
small_data = res_small.json()
print("Small file error_code:", small_data.get("error_code"))
assert small_data.get("success") is False
assert small_data.get("error_code") == "FILE_TOO_SMALL"

# 2. Invalid non-image file (> 3 KB)
res_invalid = client.post(
    "/api/disease/detect",
    files={"file": ("corrupt.txt", b"This is a plain text file containing arbitrary notes and not an image at all. " * 100, "text/plain")}
)
print("Invalid text file response code:", res_invalid.status_code)
inv_data = res_invalid.json()
print("Invalid text file error_code:", inv_data.get("error_code"))
assert inv_data.get("success") is False
assert inv_data.get("error_code") == "INVALID_IMAGE_DATA"

# 3. Non-leaf image (> 3 KB, e.g. blue wall / sky image with 0% plant tissue)
from PIL import Image
import io
import numpy as np
# Create 400x400 non-green, non-yellow image (> 3KB)
noise_arr = np.full((400, 400, 3), [80, 80, 220], dtype=np.uint8) # sky blue
blank_img = Image.fromarray(noise_arr)
buf = io.BytesIO()
blank_img.save(buf, format="JPEG", quality=95)
blank_bytes = buf.getvalue()
print("Non-leaf test image bytes size:", len(blank_bytes))

res_nonleaf = client.post(
    "/api/disease/detect",
    files={"file": ("blue_wall.jpg", blank_bytes, "image/jpeg")}
)
print("Non-leaf image response code:", res_nonleaf.status_code)
nonleaf_data = res_nonleaf.json()
print("Non-leaf error_code:", nonleaf_data.get("error_code"))
print("Non-leaf message:", nonleaf_data.get("message"))
assert nonleaf_data.get("success") is False
assert nonleaf_data.get("error_code") == "NO_LEAF_DETECTED"

print("\n" + "=" * 60)
print("TEST 5: Verify Other AGRIGUARD Features")
print("=" * 60)

# Weather disease risk
weather_req = {
    "crop_id": "tomato",
    "latitude": 11.0168,
    "longitude": 76.9558,
    "location_name": "Coimbatore, Tamil Nadu"
}
res_weather = client.post("/api/disease/risk", json=weather_req)
print("Weather Disease Risk status:", res_weather.status_code)
if res_weather.status_code == 200:
    wdata = res_weather.json()
    print("  Risk Category:", wdata.get("risk_category"))
    print("  Assessed Diseases:", len(wdata.get("assessed_diseases", [])))
    assert len(wdata.get("assessed_diseases", [])) > 0

# Smart Irrigation
irrigation_req = {
    "crop_id": "tomato",
    "growth_stage": "flowering",
    "soil_type": "clay_loam",
    "irrigation_method": "drip"
}
res_irrig = client.post("/api/irrigation/recommend", json=irrigation_req)
print("Smart Irrigation Advice status:", res_irrig.status_code)
if res_irrig.status_code == 200:
    idata = res_irrig.json()
    print("  Irrigation Status:", idata.get("status"))
    print("  Recommended Litres/day:", idata.get("litres_per_day"))

# Fertilizer recommendation
fertilizer_req = {
    "crop_id": "tomato",
    "soil_type": "clay_loam",
    "nitrogen_ppm": 120.0,
    "phosphorus_ppm": 22.0,
    "potassium_ppm": 180.0,
    "ph": 6.5
}
res_fert = client.post("/api/fertilizer/recommend", json=fertilizer_req)
print("Fertilizer Recommendation status:", res_fert.status_code)
if res_fert.status_code == 200:
    fdata = res_fert.json()
    print("  Crop:", fdata.get("crop_name_en"))
    print("  NPK Assessment:", fdata.get("npk_assessment", {}).get("overall_status"))
    print("  Splits:", len(fdata.get("application_splits", [])))

print("\nALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
