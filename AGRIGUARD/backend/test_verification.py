import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8001/api"

print("--- [TEST A: Backend Startup & Liveness] ---")
res_health = requests.get(f"{BASE_URL}/health", timeout=5)
print(f"GET /health: {res_health.status_code}")
health_data = res_health.json()
print("Health payload:", health_data)
assert res_health.status_code == 200
assert health_data.get("status") == "healthy"
print("TEST A PASSED!\n")

print("--- [TEST B: Database Readiness Probe] ---")
res_ready = requests.get(f"{BASE_URL}/health/ready", timeout=5)
print(f"GET /health/ready: {res_ready.status_code}")
ready_data = res_ready.json()
print("Readiness payload:", json.dumps(ready_data, indent=2))
assert res_ready.status_code == 200
assert ready_data.get("status") == "ready"
assert ready_data.get("database", {}).get("status") == "healthy"
assert ready_data.get("database", {}).get("writable") == True
print(f"Users in DB: {ready_data.get('database', {}).get('users_count')}")
print("TEST B PASSED!\n")

print("--- [TEST C: Registration with Persistent Storage] ---")
import time
unique_suffix = int(time.time()) % 100000
test_mobile = f"98888{unique_suffix:05d}"
test_email = f"farmer_{unique_suffix}@agriguard.in"
test_password = "SecurePassword123"

reg_payload = {
    "full_name": f"Farmer Verification {unique_suffix}",
    "mobile": test_mobile,
    "email": test_email,
    "state": "Tamil Nadu",
    "district": "Thanjavur",
    "password": test_password,
    "confirm_password": test_password,
    "preferred_language": "ta"
}

res_reg = requests.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=5)
print(f"POST /auth/register: {res_reg.status_code}")
reg_data = res_reg.json()
print("Register response:", reg_data)
assert res_reg.status_code == 200
assert reg_data.get("success") == True
assert reg_data.get("token") is not None
registered_user = reg_data.get("user")
assert registered_user.get("mobile") == test_mobile

# Verify in persistent database file directly
import os
data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "app", "data_storage")
with open(os.path.join(data_dir, "users.json"), "r", encoding="utf-8") as f:
    saved_users = json.load(f)
user_found = any(u.get("mobile") == test_mobile for u in saved_users)
print(f"Direct persistent file check: user found in users.json = {user_found}")
assert user_found == True
print("TEST C PASSED!\n")

print("--- [TEST D: Sign-in using Newly Registered Account] ---")
login_payload = {
    "mobile": test_mobile,
    "password": test_password
}
res_login = requests.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=5)
print(f"POST /auth/login: {res_login.status_code}")
login_data = res_login.json()
print("Login response:", login_data)
assert res_login.status_code == 200
assert login_data.get("success") == True
assert login_data.get("token") is not None
print("TEST D PASSED!\n")

print("--- [TEST E: Invalid Credentials Rejection] ---")
# 1. Wrong password
bad_pwd_res = requests.post(f"{BASE_URL}/auth/login", json={"mobile": test_mobile, "password": "WrongPassword!"}, timeout=5)
print(f"POST /auth/login (bad password): {bad_pwd_res.status_code}")
bad_pwd_data = bad_pwd_res.json()
print("Bad password response:", bad_pwd_data)
assert bad_pwd_res.status_code == 401
assert bad_pwd_data.get("success") == False
assert bad_pwd_data.get("error_code") == "INVALID_PASSWORD"

# 2. Non-existent user
unknown_res = requests.post(f"{BASE_URL}/auth/login", json={"mobile": "0000000000", "password": "AnyPassword"}, timeout=5)
print(f"POST /auth/login (unknown mobile): {unknown_res.status_code}")
unknown_data = unknown_res.json()
print("Unknown user response:", unknown_data)
assert unknown_res.status_code == 401
assert unknown_data.get("success") == False
assert unknown_data.get("error_code") == "USER_NOT_FOUND"

# 3. Duplicate mobile registration rejection
dup_reg_res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload, timeout=5)
print(f"POST /auth/register (duplicate): {dup_reg_res.status_code}")
dup_data = dup_reg_res.json()
print("Duplicate response:", dup_data)
assert dup_reg_res.status_code == 400
assert dup_data.get("error_code") == "DUPLICATE_MOBILE"
print("TEST E PASSED!\n")

print("--- [TEST H: Regression on Core Agronomic Features] ---")
# 1. Irrigation recommendation
irr_res = requests.post(f"{BASE_URL}/irrigation/recommend", json={
    "crop_id": "tomato",
    "growth_stage": "Flowering & Fruit Setting",
    "soil_type": "Red Loam",
    "irrigation_method": "Drip Irrigation",
    "latitude": 10.7870,
    "longitude": 79.1378,
    "location_name": "Thanjavur, Tamil Nadu"
}, timeout=8)
print(f"Irrigation API: {irr_res.status_code}")
assert irr_res.status_code == 200
assert "advice_en" in irr_res.json() or "recommendations" in irr_res.json() or "soil_type" in irr_res.json()

# 2. Fertilizer guidance
fert_res = requests.post(f"{BASE_URL}/fertilizer/recommend", json={
    "crop_id": "tomato",
    "growth_stage": "Vegetative Growth"
}, timeout=8)
print(f"Fertilizer API: {fert_res.status_code}")
assert fert_res.status_code == 200
assert fert_res.json().get("success") == True

# 3. Weather forecast
weather_res = requests.get(f"{BASE_URL}/weather/forecast?lat=10.787&lon=79.1378", timeout=8)
print(f"Weather API: {weather_res.status_code}")
assert weather_res.status_code == 200
assert weather_res.json().get("success") == True

# 4. Tamil Voice TTS Audio Streaming
tts_res = requests.get(f"{BASE_URL}/speech/tts?text=%E0%AE%B5%E0%AE%A3%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%8D&lang=ta", timeout=10)
print(f"TTS API: {tts_res.status_code}, content-type: {tts_res.headers.get('content-type')}, bytes: {len(tts_res.content)}")
assert tts_res.status_code == 200
assert "audio/mpeg" in tts_res.headers.get("content-type", "")
assert len(tts_res.content) > 500

print("TEST H PASSED: All agricultural & AI features fully intact!\n")
print("=== ALL TEST SUITES A, B, C, D, E, H PASSED PERFECTLY! ===")
