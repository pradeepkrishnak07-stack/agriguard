import os
import sys
import json
import glob
from fastapi.testclient import TestClient

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append('backend')
from app.main import app

client = TestClient(app)

print("=" * 70)
print("AGRIGUARD COMPLETE END-TO-END INTEGRATION TEST SUITE")
print("=" * 70)

# Helper function to find a real dataset image
def find_image(pattern, index=0):
    base_dir = r"dataset\PlantVillage-Dataset-master\PlantVillage-Dataset-master\raw\color"
    full_pattern = os.path.join(base_dir, pattern, "*.JPG")
    matches = glob.glob(full_pattern)
    if not matches:
        matches = glob.glob(os.path.join(base_dir, pattern, "*.jpg"))
    if matches:
        return matches[min(index, len(matches) - 1)]
    return None

test_cases = [
    {
        "category": "1. Supported Tomato Disease",
        "pattern": "Tomato___Early_blight",
        "expected_crop": "tomato",
        "expected_disease": "tomato_early_blight",
        "img_idx": 0
    },
    {
        "category": "2. Supported Corn Disease",
        "pattern": "Corn_(maize)___Common_rust_",
        "expected_crop": "corn",
        "expected_disease": "corn_common_rust",
        "img_idx": 0
    },
    {
        "category": "3. Other Supported Crop Disease (Grape)",
        "pattern": "Grape___Black_rot",
        "expected_crop": "grape",
        "expected_disease": "grape_black_rot",
        "img_idx": 0
    },
    {
        "category": "4. Other Supported Crop Disease (Peach)",
        "pattern": "Peach___Bacterial_spot",
        "expected_crop": "peach",
        "expected_disease": "peach_bacterial_spot",
        "img_idx": 1
    },
    {
        "category": "5. Supported Healthy Crop (Corn Healthy)",
        "pattern": "Corn_(maize)___healthy",
        "expected_crop": "corn",
        "expected_disease": "corn_healthy",
        "img_idx": 0
    },
    {
        "category": "6. Supported Healthy Crop (Tomato Healthy)",
        "pattern": "Tomato___healthy",
        "expected_crop": "tomato",
        "expected_disease": "tomato_healthy",
        "img_idx": 0
    }
]

print("\n--- A. REAL DATASET IMAGE DETECTION TESTS ---")
results_summary = []

for tc in test_cases:
    img_path = find_image(tc["pattern"], tc.get("img_idx", 0))
    if not img_path:
        print(f"Skipping {tc['category']}: Image pattern {tc['pattern']} not found.")
        continue
    
    with open(img_path, "rb") as f:
        img_bytes = f.read()
    
    filename = os.path.basename(img_path)
    # Test with crop hint corresponding to the selected crop
    response = client.post(
        "/api/disease/detect",
        files={"file": (filename, img_bytes, "image/jpeg")},
        data={"crop_hint": tc["expected_crop"], "save_to_history": "false"}
    )
    
    status = response.status_code
    data = response.json() if status == 200 else {}
    
    pred_crop = data.get("crop_id")
    pred_disease = data.get("disease_id")
    pred_conf = data.get("confidence_score")
    organic_name = data.get("organic_treatment", {}).get("name_en") if data.get("organic_treatment") else "N/A"
    chem_name = data.get("chemical_treatment", {}).get("product_name_en") if data.get("chemical_treatment") else "N/A"
    is_healthy = data.get("is_healthy")
    
    matches_crop = (pred_crop == tc["expected_crop"])
    matches_disease = (pred_disease == tc["expected_disease"])
    
    print(f"\n[{tc['category']}]")
    print(f"  File: {filename}")
    print(f"  Expected: Crop={tc['expected_crop']}, Disease={tc['expected_disease']}")
    print(f"  Predicted: Crop={pred_crop} ({data.get('crop_name_en')}), Disease={pred_disease} ({data.get('condition_title_en')})")
    print(f"  Confidence: {pred_conf:.2%}" if pred_conf else "  Confidence: N/A")
    print(f"  Is Healthy: {is_healthy}")
    print(f"  Organic Treatment: {organic_name}")
    print(f"  Chemical Treatment: {chem_name}")
    print(f"  Tamil Crop: {data.get('crop_name_ta')}")
    print(f"  Tamil Condition: {data.get('condition_title_ta')}")
    print(f"  Result Correct: Crop {'✓' if matches_crop else '✗'} | Disease {'✓' if matches_disease else '✗'}")
    
    results_summary.append({
        "category": tc["category"],
        "expected_crop": tc["expected_crop"],
        "pred_crop": pred_crop,
        "expected_disease": tc["expected_disease"],
        "pred_disease": pred_disease,
        "confidence": pred_conf,
        "crop_ok": matches_crop,
        "disease_ok": matches_disease
    })

# 7. Test Non-Plant / Unsupported / OOD Image
print("\n--- B. OUT-OF-DISTRIBUTION / NON-LEAF TEST ---")
# Create synthetic random noise image or blank image
import numpy as np
import cv2

# Synthetic blue noise image (definitely not a leaf)
non_leaf = np.random.randint(150, 255, (224, 224, 3), dtype=np.uint8)
# Color it predominantly blue
non_leaf[:, :, 1] = 20  # Green low
non_leaf[:, :, 2] = 20  # Red low
_, encoded_non_leaf = cv2.imencode(".jpg", non_leaf)
non_leaf_bytes = encoded_non_leaf.tobytes()

resp_non_leaf = client.post(
    "/api/disease/detect",
    files={"file": ("unsupported_noise.jpg", non_leaf_bytes, "image/jpeg")},
    data={"crop_hint": "", "save_to_history": "false"}
)
data_non_leaf = resp_non_leaf.json()
print("Non-leaf / noise input:")
print(f"  Status code: {resp_non_leaf.status_code}")
print(f"  is_reliable: {data_non_leaf.get('is_reliable')}")
print(f"  is_uncertain / OOD: {data_non_leaf.get('is_uncertain') or data_non_leaf.get('is_out_of_distribution')}")
print(f"  Message (EN): {data_non_leaf.get('message')}")
print(f"  Message (TA): {data_non_leaf.get('message_ta')}")
print(f"  Was it forced to tomato? {'YES (Error!)' if data_non_leaf.get('crop_id') == 'tomato' and data_non_leaf.get('is_reliable') else 'NO (Handled correctly as non-leaf/unreliable!)'}")

# 8. Test Low Quality / Blurry Image
print("\n--- C. LOW-QUALITY / BLURRY LEAF TEST ---")
# Create extremely blurry image
blurry_img = cv2.GaussianBlur(non_leaf, (51, 51), 0)
_, encoded_blur = cv2.imencode(".jpg", blurry_img)
blur_bytes = encoded_blur.tobytes()

resp_blur = client.post(
    "/api/disease/detect",
    files={"file": ("blurry_sample.jpg", blur_bytes, "image/jpeg")},
    data={"crop_hint": "", "save_to_history": "false"}
)
data_blur = resp_blur.json()
print("Blurry image input:")
print(f"  is_reliable: {data_blur.get('is_reliable')}")
print(f"  Message: {data_blur.get('message')}")

# 9. Test Voice TTS Playback Endpoint
print("\n--- D. TAMIL & ENGLISH VOICE TTS ENDPOINT TEST ---")
sample_tamil_text = "மக்காச்சோளம் பயிரில் துரு நோய் கண்டறியப்பட்டுள்ளது. மேன்கோசெப் 400 கிராம் தெளிக்கவும்."
resp_tts_ta = client.get(
    "/api/speech/tts",
    params={"text": sample_tamil_text, "lang": "ta"}
)
print(f"Tamil TTS Request: {sample_tamil_text[:40]}...")
print(f"  Response Status: {resp_tts_ta.status_code}")
print(f"  Content-Type: {resp_tts_ta.headers.get('content-type')}")
print(f"  Audio byte length: {len(resp_tts_ta.content)} bytes")

resp_tts_en = client.get(
    "/api/speech/tts",
    params={"text": "Corn Common Rust detected. Apply Mancozeb 400 grams per acre.", "lang": "en"}
)
print(f"English TTS Status: {resp_tts_en.status_code}, Audio bytes: {len(resp_tts_en.content)}")

# 10. Verify Other Modules Integrity
print("\n--- E. PRESERVATION OF EXISTING AGRIGUARD MODULES ---")
# 1. Weather endpoint
resp_weather = client.get("/api/weather/forecast?lat=10.7870&lon=79.1378&location_name=Thanjavur")
print(f"Weather API: Status {resp_weather.status_code}, temp: {resp_weather.json().get('current', {}).get('temperature')}°C")

# 2. Disease Risk endpoint
resp_risk = client.post(
    "/api/disease/risk",
    json={"crop_id": "rice", "latitude": 10.787, "longitude": 79.138, "location_name": "Thanjavur"}
)
print(f"Disease Risk API (Rice): Status {resp_risk.status_code}, Risk: {resp_risk.json().get('risk_category')}")

# 3. Fertilizer Recommendation endpoint
resp_fert = client.post(
    "/api/fertilizer/recommend",
    json={
        "crop_id": "corn",
        "growth_stage": "Vegetative",
        "soil_type": "Red Loam",
        "land_area": 2.0,
        "land_unit": "acres",
        "budget_inr": 5000
    }
)
print(f"Fertilizer API (Corn): Status {resp_fert.status_code}, Guidance: {resp_fert.json().get('guidance', {}).get('general_advice_en', 'OK')[:40]}...")

# 4. Smart Irrigation endpoint
resp_irrig = client.post(
    "/api/irrigation/recommend",
    json={
        "crop_id": "corn",
        "growth_stage": "Vegetative",
        "soil_type": "Red Loam",
        "soil_moisture_pct": 35.0,
        "land_area": 2.0,
        "land_unit": "acres"
    }
)
print(f"Smart Irrigation API (Corn): Status {resp_irrig.status_code}, Status Title: {resp_irrig.json().get('status_title_en')}, Action: {resp_irrig.json().get('action_advice_en')[:45]}...")

print("\n" + "=" * 70)
print("ALL INTEGRATION TESTS COMPLETE")
print("=" * 70)
