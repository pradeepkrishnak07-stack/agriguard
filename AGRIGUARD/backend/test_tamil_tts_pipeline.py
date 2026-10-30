import os
import sys
import requests

sys.stdout.reconfigure(encoding="utf-8")

print("=" * 60)
print("TEST: End-to-End Tamil Voice Output Verification")
print("=" * 60)

# 1. Disease Detection with Tamil output
print("\n[1] Testing Plant Disease Prediction with Tamil...")
image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_tomato_early_blight.jpg")
with open(image_path, "rb") as f:
    detect_res = requests.post(
        "http://127.0.0.1:8001/api/disease/detect",
        files={"file": ("leaf.jpg", f, "image/jpeg")},
        data={"crop_hint": "tomato"}
    )

assert detect_res.status_code == 200, f"Disease detect failed: {detect_res.status_code}"
detect_data = detect_res.json()
crop_ta = detect_data.get("crop_name_ta")
disease_ta = detect_data.get("condition_title_ta")
explanation_ta = detect_data.get("explanation_ta")
print(f"  Crop (Tamil): {crop_ta}")
print(f"  Disease (Tamil): {disease_ta}")
print(f"  Explanation (Tamil): {explanation_ta}")

# Test TTS audio synthesis with the Tamil disease prediction text
disease_spoken = f"{crop_ta} பயிர்க்கான இலை நோய் ஆய்வு முடிவுகள். கண்டறியப்பட்ட நோய்: {disease_ta}. {explanation_ta}"
print(f"  Synthesizing Tamil speech ({len(disease_spoken)} chars)...")
tts_disease = requests.get(
    "http://127.0.0.1:8001/api/speech/tts",
    params={"text": disease_spoken, "lang": "ta"}
)
print(f"  TTS Response Status: {tts_disease.status_code}")
print(f"  TTS Content-Type: {tts_disease.headers.get('content-type')}")
print(f"  TTS Audio Bytes: {len(tts_disease.content)} bytes")
assert tts_disease.status_code == 200
assert "audio/mpeg" in tts_disease.headers.get("content-type", "")
assert len(tts_disease.content) > 5000, "Audio output should be substantive MP3 stream"

# 2. Fertilizer Recommendation with Tamil output
print("\n[2] Testing Fertilizer Recommendation with Tamil...")
fertilizer_payload = {
    "crop_id": "tomato",
    "growth_stage": "Flowering",
    "land_area": 1.5,
    "land_unit": "Acres",
    "soil_type": "Red soil",
    "soil_tested": False,
    "already_applied_fertilizer": False,
    "applied_fertilizers": [],
    "irrigation_method": "Drip irrigation",
    "plant_problems": ["yellow_leaves"],
    "fertilizer_preference": "Both organic and chemical fertilizers",
    "crop_age_days": 35,
    "fertilizer_budget_inr": 5000
}

fert_res = requests.post(
    "http://127.0.0.1:8001/api/fertilizer/generate",
    json=fertilizer_payload
)
assert fert_res.status_code == 200, f"Fertilizer recommendation failed: {fert_res.status_code}"
fert_data = fert_res.json()
fert_spoken_ta = fert_data.get("spoken_text_ta")
print(f"  Fertilizer Spoken Text (Tamil): {fert_spoken_ta}")

# Test TTS audio synthesis with the Tamil fertilizer recommendation text
print(f"  Synthesizing Tamil speech ({len(fert_spoken_ta)} chars)...")
tts_fert = requests.get(
    "http://127.0.0.1:8001/api/speech/tts",
    params={"text": fert_spoken_ta, "lang": "ta"}
)
print(f"  TTS Response Status: {tts_fert.status_code}")
print(f"  TTS Content-Type: {tts_fert.headers.get('content-type')}")
print(f"  TTS Audio Bytes: {len(tts_fert.content)} bytes")
assert tts_fert.status_code == 200
assert "audio/mpeg" in tts_fert.headers.get("content-type", "")
assert len(tts_fert.content) > 10000, "Audio output should be substantive MP3 stream"

# 3. English Speech test to verify English is preserved
print("\n[3] Testing English Text-to-Speech...")
en_text = "Fertilizer recommendation for Tomato, land area 1.5 Acres. Estimated total cost is 35,211 Rupees."
tts_en = requests.get(
    "http://127.0.0.1:8001/api/speech/tts",
    params={"text": en_text, "lang": "en"}
)
print(f"  English TTS Status: {tts_en.status_code}, Bytes: {len(tts_en.content)}")
assert tts_en.status_code == 200

print("\n" + "=" * 60)
print("SUCCESS: ALL TAMIL VOICE OUTPUT AND AUDIO TESTS PASSED!")
print("=" * 60)
