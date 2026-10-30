"""
AGRIGUARD Soil Moisture Sensor Backend Integration Tests
Tests:
1. Initial WAITING state when no readings exist.
2. Ingestion of valid ESP32 sensor telemetry via HTTP POST.
3. Payload validation and error handling for out-of-range ADC/percentages.
4. Telemetry retrieval via GET /api/sensor/soil-moisture/latest.
5. Connectivity tracking: ONLINE vs OFFLINE states.
6. IrrigationEngine integration with live telemetry.
7. Critical deficit alert generation.
"""

import sys
import io
import time
from datetime import datetime, timedelta

# Fix Windows stdout encoding for multilingual text
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.main import app
from fastapi.testclient import TestClient
from app.services.farm_store import farm_store

client = TestClient(app)

def test_sensor_integration():
    print("========================================================")
    print(" AGRIGUARD ESP32 Soil Moisture Sensor Integration Test")
    print("========================================================")

    # 1. Reset storage to clean state
    farm_store._save_json(farm_store.soil_moisture_path, {"latest": None, "history": []})

    # Test 1: Check initial state
    res = client.get("/api/sensor/soil-moisture/latest")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["connectivity_status"] == "WAITING", f"Expected WAITING, got {data['connectivity_status']}"
    assert data["is_online"] is False
    print("✓ Test 1 Passed: Initial state correctly reports WAITING.")

    # Test 2: Ingest valid telemetry
    payload = {
        "device_id": "esp32_devkit_v1_field_01",
        "raw_adc": 2350,
        "moisture_percentage": 54.8,
        "status": "MOIST",
        "sensor_pin": "GPIO34"
    }
    post_res = client.post("/api/sensor/soil-moisture", json=payload)
    assert post_res.status_code == 201, f"Expected 201, got {post_res.status_code}"
    post_data = post_res.json()
    assert post_data["success"] is True
    assert post_data["record"]["moisture_percentage"] == 54.8
    assert post_data["record"]["status"] == "MOIST"
    print("✓ Test 2 Passed: Ingested valid ESP32 reading successfully.")

    # Test 3: Verify GET /latest returns ONLINE and updated telemetry
    latest_res = client.get("/api/sensor/soil-moisture/latest")
    assert latest_res.status_code == 200
    latest_data = latest_res.json()
    assert latest_data["connectivity_status"] == "ONLINE"
    assert latest_data["is_online"] is True
    assert latest_data["raw_adc"] == 2350
    assert latest_data["moisture_percentage"] == 54.8
    assert latest_data["status"] == "MOIST"
    print("✓ Test 3 Passed: Latest reading returns ONLINE status and correct telemetry.")

    # Test 4: Validation test with invalid ADC (> 4095)
    bad_payload = {
        "device_id": "esp32_test",
        "raw_adc": 9999, # Invalid for 12-bit ADC
        "moisture_percentage": 50.0
    }
    bad_res = client.post("/api/sensor/soil-moisture", json=bad_payload)
    assert bad_res.status_code == 422, f"Expected 422 validation error, got {bad_res.status_code}"
    print("✓ Test 4 Passed: Server rejected invalid raw_adc > 4095 with HTTP 422.")

    # Test 5: Ingest Critical Low Moisture (< 20%) & verify Alert generation
    dry_payload = {
        "device_id": "esp32_devkit_v1_field_01",
        "raw_adc": 3800,
        "moisture_percentage": 14.5,
        "status": "DRY",
        "sensor_pin": "GPIO34"
    }
    dry_res = client.post("/api/sensor/soil-moisture", json=dry_payload)
    assert dry_res.status_code == 201
    
    # Check alerts
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    has_deficit_alert = any("Critical Soil Moisture Deficit" in str(a.get("title_en")) for a in alerts)
    assert has_deficit_alert, "Expected critical deficit alert in farm alerts"
    print("✓ Test 5 Passed: Critical soil deficit generated automated agronomic alert.")

    # Test 6: Verify IrrigationEngine incorporates live sensor
    irri_res = client.post("/api/irrigation/recommend", json={
        "crop_id": "tomato",
        "growth_stage": "Flowering & Fruit Setting",
        "soil_type": "Red Loam",
        "irrigation_method": "Drip Irrigation"
    })
    assert irri_res.status_code == 200
    irri_data = irri_res.json()
    assert irri_data["status_code"] == "IRRIGATE_NOW"
    assert "soil_moisture" in irri_data
    assert irri_data["soil_moisture"]["moisture_percentage"] == 14.5
    print("✓ Test 6 Passed: IrrigationEngine dynamic override based on live sensor confirmed.")

    # Test 7: Verify History Endpoint
    hist_res = client.get("/api/sensor/soil-moisture/history?limit=10")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["success"] is True
    assert hist_data["count"] >= 2
    print("✓ Test 7 Passed: Historical readings retrieved successfully.")

    # Test 8: Verify OFFLINE status calculation when last reading is stale
    stale_time = (datetime.now() - timedelta(seconds=120)).isoformat()
    store = farm_store._read_json(farm_store.soil_moisture_path)
    store["latest"]["created_at"] = stale_time
    farm_store._save_json(farm_store.soil_moisture_path, store)

    stale_res = client.get("/api/sensor/soil-moisture/latest")
    assert stale_res.status_code == 200
    stale_data = stale_res.json()
    assert stale_data["connectivity_status"] == "OFFLINE"
    assert stale_data["is_online"] is False
    assert stale_data["seconds_since_update"] >= 120
    print("✓ Test 8 Passed: Stale sensor reading (>90s) transitions correctly to OFFLINE.")

    print("\n========================================================")
    print(" ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    print("========================================================")

if __name__ == "__main__":
    test_sensor_integration()
