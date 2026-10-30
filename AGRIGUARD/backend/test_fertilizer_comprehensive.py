import requests
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8001/api"

print("=" * 70)
print("COMPREHENSIVE AGRIGUARD FERTILIZER & SYSTEM VERIFICATION")
print("=" * 70)

# TEST 1: Valid inputs for supported crops (Tomato, Rice, Cotton)
print("\n[TEST 1] Testing Valid Inputs for Supported Crops...")
crops_to_test = ["tomato", "rice", "cotton", "banana"]
for crop in crops_to_test:
    payload = {
        "crop_id": crop,
        "crop_name": crop.title(),
        "growth_stage": "Vegetative growth",
        "land_area": 1.5,
        "land_unit": "Acres",
        "soil_type": "Red soil",
        "soil_tested": True,
        "soil_ph": 6.5,
        "soil_nitrogen": "Medium",
        "already_applied": False,
        "applied_fertilizers": [],
        "irrigation_method": "Drip irrigation",
        "plant_problems": [],
        "fertilizer_preference": "Both organic and chemical fertilizers",
        "crop_age_days": 30,
        "fertilizer_budget_inr": 8000.0,
        "user_id": "test_farmer_1"
    }
    res = requests.post(f"{BASE_URL}/fertilizer/generate", json=payload)
    assert res.status_code == 200, f"Failed for crop {crop}: {res.status_code} - {res.text}"
    data = res.json()
    assert data.get("success") is True, f"Success flag not True: {data}"
    assert "crop_info" in data, "Missing crop_info in response"
    assert "active_plan_items" in data, "Missing active_plan_items in response"
    assert "cost_analysis" in data, "Missing cost_analysis in response"
    assert "spoken_text_ta" in data, "Missing spoken_text_ta in response"
    assert "spoken_text_en" in data, "Missing spoken_text_en in response"
    print(f"  ✓ {crop.title()}: Generated successfully. Est Cost: ₹{data['cost_analysis']['estimated_total_cost_inr']:,}")

# Also test /fertilizer/recommend endpoint
rec_res = requests.post(f"{BASE_URL}/fertilizer/recommend", json={"crop_id": "tomato", "growth_stage": "Flowering"})
assert rec_res.status_code == 200, f"/fertilizer/recommend failed: {rec_res.status_code}"
rec_data = rec_res.json()
assert rec_data.get("success") is True
print(f"  ✓ /fertilizer/recommend: Status 200, NPK ratio: {rec_data.get('recommended_npk_ratio')}")

# TEST 2: Invalid inputs (negative area, invalid budget)
print("\n[TEST 2] Testing Invalid Inputs Handling...")
invalid_payload = {
    "crop_id": "tomato",
    "land_area": -5.0,
    "land_unit": "Acres",
    "fertilizer_budget_inr": -100
}
res_inv = requests.post(f"{BASE_URL}/fertilizer/generate", json=invalid_payload)
print(f"  Negative values safely normalized by calculation engine: HTTP {res_inv.status_code}")
inv_data = res_inv.json()
assert inv_data.get("success") is True  # Safely handled and clamped by engine
assert inv_data["crop_info"]["land_area_hectares"] > 0

# TEST 4: Deficiency Diagnostic
print("\n[TEST 4] Testing Deficiency Diagnostic...")
deficiency_payload = {
    "crop_id": "tomato",
    "growth_stage": "Vegetative growth",
    "land_area": 1.0,
    "land_unit": "Acres",
    "soil_type": "Red soil",
    "plant_problems": ["yellow_leaves"],
    "fertilizer_preference": "Both organic and chemical fertilizers",
    "crop_age_days": 25,
    "fertilizer_budget_inr": 5000
}
res_def = requests.post(f"{BASE_URL}/fertilizer/generate", json=deficiency_payload)
assert res_def.status_code == 200
def_data = res_def.json()
assert def_data["nutrient_deficiencies_detected"]["detected"] is True
print(f"  ✓ Diagnosed: {def_data['nutrient_deficiencies_detected']['diagnoses_en'][0]}")

# TEST 5 & 6: Tamil and English TTS Audio Generation
print("\n[TEST 5 & 6] Testing Tamil and English Voice Speech Synthesis...")
spoken_ta = def_data["spoken_text_ta"]
assert spoken_ta and len(spoken_ta) > 20
res_tts_ta = requests.get(f"{BASE_URL}/speech/tts", params={"text": spoken_ta, "lang": "ta"})
assert res_tts_ta.status_code == 200, f"Tamil TTS failed: {res_tts_ta.status_code}"
assert "audio/mpeg" in res_tts_ta.headers.get("content-type", "")
assert len(res_tts_ta.content) > 10000, "Tamil TTS audio stream should be substantive MP3"
print(f"  ✓ Tamil Speech Synthesis: HTTP 200, Audio size: {len(res_tts_ta.content):,} bytes")

spoken_en = def_data["spoken_text_en"]
res_tts_en = requests.get(f"{BASE_URL}/speech/tts", params={"text": spoken_en, "lang": "en"})
assert res_tts_en.status_code == 200, f"English TTS failed: {res_tts_en.status_code}"
assert len(res_tts_en.content) > 10000, "English TTS audio stream should be substantive MP3"
print(f"  ✓ English Speech Synthesis: HTTP 200, Audio size: {len(res_tts_en.content):,} bytes")

# TEST 7: Regression across existing modules
print("\n[TEST 7] Regression Testing Across Existing Modules...")
# 7a. Health & Readiness Check
h_res = requests.get(f"{BASE_URL}/health")
assert h_res.status_code == 200
r_res = requests.get(f"{BASE_URL}/health/ready")
assert r_res.status_code == 200
print("  ✓ Health & Readiness: OK")

# 7b. Weather & Disease Risk
risk_res = requests.post(f"{BASE_URL}/disease/risk", json={"crop_id": "tomato", "location_name": "Thanjavur, Tamil Nadu"})
assert risk_res.status_code == 200
print(f"  ✓ Weather Disease Risk: OK (Risk Level: {risk_res.json().get('risk_level')})")

# 7c. Irrigation Advice
irrig_res = requests.post(f"{BASE_URL}/irrigation/recommend", json={
    "crop_id": "tomato",
    "growth_stage": "Vegetative Growth",
    "soil_type": "Red Loam",
    "irrigation_method": "Drip Irrigation"
})
assert irrig_res.status_code == 200
print("  ✓ Irrigation Recommendation: OK")

# 7d. Plant Disease Vision Detection
img_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_tomato_early_blight.jpg")
with open(img_path, "rb") as f:
    detect_res = requests.post(f"{BASE_URL}/disease/detect", files={"file": ("leaf.jpg", f, "image/jpeg")}, data={"crop_hint": "tomato"})
assert detect_res.status_code == 200
print(f"  ✓ Plant Disease Detection: OK (Detected: {detect_res.json().get('condition_title_en')}, Conf: {detect_res.json().get('confidence_score')})")

# 7e. Fertilizer History Persistence
hist_res = requests.get(f"{BASE_URL}/fertilizer/history?user_id=test_farmer_1")
assert hist_res.status_code == 200
history_records = hist_res.json()
assert len(history_records) > 0
print(f"  ✓ Fertilizer History Storage: OK ({len(history_records)} saved recommendations for test farmer)")

print("\n" + "=" * 70)
print("ALL BACKEND & ALGORITHM INTEGRATION TESTS PASSED PERFECTLY!")
print("=" * 70)
