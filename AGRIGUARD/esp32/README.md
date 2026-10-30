# AGRIGUARD ESP32 DevKit V1 Soil Moisture Sensor Guide

This directory contains the production-ready ESP32 Arduino firmware for integrating an analog soil moisture sensor into your existing AGRIGUARD platform.

---

## 1. Hardware Pin Connections

| Sensor Pin | ESP32 DevKit V1 Pin | Notes |
| :--- | :--- | :--- |
| **AO (Analog Output)** | **GPIO 34** | ADC1 Channel 6 (Input-only, unaffected by Wi-Fi) |
| **GND** | **GND** | Common ground |
| **VCC** | **3.3V** (or VIN / 5V) | 3.3V recommended for 3.3V ADC matching |
| **Built-in LED** | **GPIO 2** | Status indicator on DevKit V1 |

---

## 2. Sensor Calibration Walkthrough

Analog soil moisture sensors output a voltage that varies inversely with soil moisture (higher voltage/ADC in dry soil, lower in wet soil). Because manufacturing variations exist between sensor batches, calibration ensures accurate 0–100% moisture readings.

### Step 1: Dry / Air Calibration
1. Ensure the sensor probe is completely clean and dry.
2. Hold it in the air (do not touch the sensor probe with your fingers).
3. Connect ESP32 to your PC via micro-USB and open **Arduino Serial Monitor** (115200 baud).
4. Observe the `[SENSOR] Raw ADC` value.
5. In `soil_moisture_sensor.ino`, update:
   ```cpp
   int DRY_CALIBRATION_VALUE = <YOUR_AIR_ADC_READING>; // e.g. 3500
   ```

### Step 2: Wet / Water Calibration
1. Prepare a cup of water or thoroughly saturated soil.
2. Submerge the sensor probes up to the maximum line (never submerge the electronic components at the top).
3. Observe the `[SENSOR] Raw ADC` reading in the Serial Monitor.
4. In `soil_moisture_sensor.ino`, update:
   ```cpp
   int WET_CALIBRATION_VALUE = <YOUR_WATER_ADC_READING>; // e.g. 1400
   ```

### Step 3: Upload
Re-upload the sketch to the ESP32. The firmware will now automatically scale readings between 0% (DRY) and 100% (WET).

---

## 3. Network & Backend Configuration

### Step 1: Wi-Fi Credentials
In `soil_moisture_sensor.ino`, enter your 2.4 GHz Wi-Fi credentials (ESP32 does not support 5 GHz Wi-Fi):
```cpp
const char* WIFI_SSID     = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
```

### Step 2: Local Backend URL
To allow the ESP32 to talk to your computer running the AGRIGUARD FastAPI backend:
1. Open PowerShell or Command Prompt on your computer.
2. Run:
   ```powershell
   ipconfig
   ```
3. Look for **IPv4 Address** under your active Wi-Fi or Ethernet adapter (e.g., `192.168.1.105`).
4. In `soil_moisture_sensor.ino`, configure:
   ```cpp
   const char* BACKEND_URL = "http://192.168.1.105:8001/api/sensor/soil-moisture";
   ```
> [!IMPORTANT]
> Never use `http://localhost:8001` or `http://127.0.0.1:8001` in ESP32 code. In the microcontroller's context, `localhost` points to the ESP32 itself, not your PC.

### Step 3: Windows Firewall (If Local)
Ensure Windows Defender Firewall allows incoming connections on port 8001:
```powershell
New-NetFirewallRule -DisplayName "AGRIGUARD Backend Port 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
```

---

## 4. Arduino IDE Upload Instructions

1. Install [Arduino IDE](https://www.arduino.cc/en/software) (version 2.x recommended).
2. Add ESP32 Board Support:
   - Go to **File -> Preferences**.
   - In "Additional Boards Manager URLs", add:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Open **Tools -> Board -> Boards Manager**, search for `esp32` by Espressif Systems, and click **Install**.
3. Select Board & Port:
   - **Tools -> Board -> esp32 -> DOIT ESP32 DEVKIT V1** (or ESP32 Dev Module).
   - **Tools -> Port -> Select your ESP32 COM port** (e.g. COM3 / COM4).
4. Open `soil_moisture_sensor.ino`.
5. Click **Upload** (arrow icon). If the console says "Connecting.....", hold the **BOOT** button on the ESP32 board for 1-2 seconds until uploading begins.
6. Open **Tools -> Serial Monitor** and set baud rate to **115200**.

---

## 5. Verifying Ingestion & Live Webpage Display

1. Start the AGRIGUARD platform:
   Double-click `start_agriguard.bat` or run `start_agriguard.ps1` in PowerShell.
2. In your browser (`http://localhost:5173`), go to the **Home** dashboard.
3. Observe the **Live Soil Moisture** card:
   - When ESP32 is powered off or waiting for its first message: displays `WAITING FOR DATA` with clear status instructions.
   - Once ESP32 transmits: immediately shifts to `LIVE`, showing exact percentage, animated dial gauge, raw ADC, DRY/MOIST/WET classification, and root-zone agronomic advice.
   - If the ESP32 is disconnected for >90 seconds: smoothly indicates `OFFLINE` with the last recorded timestamp.
