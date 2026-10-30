/**
 * ======================================================================================
 * AGRIGUARD — ESP32 DevKit V1 Soil Moisture Sensor Telemetry Firmware
 * ======================================================================================
 * Hardware Connections:
 *   - ESP32 DevKit V1 (30-pin or 36-pin)
 *   - Analog Soil Moisture Sensor (Capacitive v1.2/v2.0 or Resistive Probe)
 *   - Sensor AO (Analog Output) -> ESP32 GPIO34 (ADC1 Channel 6, input only)
 *   - Sensor GND                -> ESP32 GND
 *   - Sensor VCC                -> ESP32 3.3V (or 5V/VIN if 5V sensor module)
 *   - Built-in LED              -> GPIO 2 (Status indicator)
 * ======================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// --------------------------------------------------------------------------------------
// 1. NETWORK & BACKEND CONFIGURATION
// --------------------------------------------------------------------------------------
// Replace with your Wi-Fi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

/**
 * Backend API Endpoint:
 * - If running AGRIGUARD locally on your computer:
 *   Replace 192.168.1.X with your computer's local LAN IP address.
 *   (Find your local IP by running 'ipconfig' in Windows PowerShell/Command Prompt)
 *   Example: "http://192.168.1.105:8001/api/sensor/soil-moisture"
 *
 * - If AGRIGUARD is deployed online (e.g. AWS, Render, Railway, VPS):
 *   Example: "https://your-agriguard-domain.com/api/sensor/soil-moisture"
 *
 * Note: Never use "localhost" or "127.0.0.1" inside ESP32 code because that points
 * to the ESP32 itself, not your computer!
 */
const char* BACKEND_URL = "http://192.168.1.100:8001/api/sensor/soil-moisture";

// Unique identifier for this sensor node
const char* DEVICE_ID   = "esp32_devkit_v1_field_01";

// --------------------------------------------------------------------------------------
// 2. HARDWARE & PIN DEFINITIONS
// --------------------------------------------------------------------------------------
const int SENSOR_PIN    = 34; // GPIO 34 (ADC1_CH6) — Input only, unaffected by Wi-Fi
const int STATUS_LED    = 2;  // Built-in blue LED on ESP32 DevKit V1

// --------------------------------------------------------------------------------------
// 3. SENSOR CALIBRATION VALUES (Configurable)
// --------------------------------------------------------------------------------------
/**
 * CALIBRATION INSTRUCTIONS:
 * 1. Air / Dry Soil Calibration:
 *    - Wipe the sensor probe completely dry and hold it in the air.
 *    - Open Arduino Serial Monitor (115200 baud).
 *    - Note the raw ADC reading (usually between 3200 and 4095 for 12-bit ADC).
 *    - Set DRY_CALIBRATION_VALUE to this measured number.
 *
 * 2. Water / Saturated Soil Calibration:
 *    - Dip the probe into a cup of water up to the max submersion line (do not submerge electronics).
 *    - Note the raw ADC reading in the Serial Monitor (typically between 1200 and 1800).
 *    - Set WET_CALIBRATION_VALUE to this measured number.
 */
int DRY_CALIBRATION_VALUE = 3500; // Raw ADC reading in dry air / completely dry soil
int WET_CALIBRATION_VALUE = 1400; // Raw ADC reading in cup of water / thoroughly saturated soil

// Transmission interval in milliseconds (default: 5 seconds for responsive live demo)
const unsigned long TRANSMIT_INTERVAL_MS = 5000;
unsigned long lastTransmitTime = 0;

// --------------------------------------------------------------------------------------
// 4. FUNCTION DECLARATIONS
// --------------------------------------------------------------------------------------
void connectWiFi();
int readSmoothedADC(int pin, int samples = 16);
float calculateMoisturePercentage(int rawAdc);
String determineSoilStatus(float percentage);
bool sendTelemetry(int rawAdc, float percentage, const String& status);

// --------------------------------------------------------------------------------------
// SETUP
// --------------------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================================");
  Serial.println("  AGRIGUARD — ESP32 Soil Moisture Sensor Telemetry Node");
  Serial.println("========================================================");

  // Configure Pins
  pinMode(STATUS_LED, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);

  // Configure ESP32 ADC (12-bit resolution: 0 - 4095, 11dB attenuation: 0 - 3.3V range)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  Serial.printf("[HARDWARE] Sensor Pin: GPIO%d (ADC1)\n", SENSOR_PIN);
  Serial.printf("[CALIBRATION] Dry Value: %d | Wet Value: %d\n", DRY_CALIBRATION_VALUE, WET_CALIBRATION_VALUE);
  Serial.printf("[ENDPOINT] Target URL: %s\n", BACKEND_URL);

  // Connect to Wi-Fi
  connectWiFi();
}

// --------------------------------------------------------------------------------------
// MAIN LOOP
// --------------------------------------------------------------------------------------
void loop() {
  // Check Wi-Fi connection and reconnect if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARNING] Wi-Fi lost! Attempting to reconnect...");
    connectWiFi();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS || lastTransmitTime == 0) {
    lastTransmitTime = currentMillis;

    // 1. Read smoothed analog value
    int rawAdc = readSmoothedADC(SENSOR_PIN, 16);

    // 2. Calculate clamped soil moisture percentage (0.0 - 100.0%)
    float moisturePercent = calculateMoisturePercentage(rawAdc);

    // 3. Determine classification (DRY / MOIST / WET)
    String status = determineSoilStatus(moisturePercent);

    // Diagnostic Serial Output
    Serial.println("--------------------------------------------------------");
    Serial.printf("[SENSOR] Raw ADC: %d / 4095 | Moisture: %.1f%% | Status: %s\n",
                  rawAdc, moisturePercent, status.c_str());

    // 4. Send telemetry payload to AgriGuard backend
    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetry(rawAdc, moisturePercent, status);
    } else {
      Serial.println("[ERROR] Cannot transmit: Wi-Fi not connected.");
    }
  }

  // Small delay to allow ESP32 background tasks (Wi-Fi stack, watchdog) to run
  delay(50);
}

// --------------------------------------------------------------------------------------
// WI-FI CONNECTION HANDLER
// --------------------------------------------------------------------------------------
void connectWiFi() {
  Serial.printf("\n[WIFI] Connecting to SSID: '%s' ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    // Blink LED while connecting
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED, HIGH); // Solid ON when connected
    Serial.println("\n[WIFI] Connected successfully!");
    Serial.printf("[WIFI] ESP32 Assigned IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WIFI] Signal Strength (RSSI): %d dBm\n", WiFi.RSSI());
  } else {
    digitalWrite(STATUS_LED, LOW);
    Serial.println("\n[ERROR] Wi-Fi connection timed out. Will retry in next loop cycle.");
  }
}

// --------------------------------------------------------------------------------------
// SMOOTHED ADC READING (Oversampling to eliminate analog noise)
// --------------------------------------------------------------------------------------
int readSmoothedADC(int pin, int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10); // Settling delay between samples
  }
  return (int)(sum / samples);
}

// --------------------------------------------------------------------------------------
// CALCULATE MOISTURE PERCENTAGE (Handles normal & inverted calibration curves)
// --------------------------------------------------------------------------------------
float calculateMoisturePercentage(int rawAdc) {
  float pct = 0.0f;

  if (DRY_CALIBRATION_VALUE > WET_CALIBRATION_VALUE) {
    // Standard capacitive/resistive sensor: Higher voltage/ADC = Drier soil
    pct = ((float)(DRY_CALIBRATION_VALUE - rawAdc) / (float)(DRY_CALIBRATION_VALUE - WET_CALIBRATION_VALUE)) * 100.0f;
  } else if (WET_CALIBRATION_VALUE > DRY_CALIBRATION_VALUE) {
    // Inverted sensor: Higher voltage/ADC = Wetter soil
    pct = ((float)(rawAdc - DRY_CALIBRATION_VALUE) / (float)(WET_CALIBRATION_VALUE - DRY_CALIBRATION_VALUE)) * 100.0f;
  } else {
    // Failsafe in case dry == wet
    pct = 50.0f;
  }

  // Clamping strictly between 0.0% and 100.0%
  if (pct < 0.0f) pct = 0.0f;
  if (pct > 100.0f) pct = 100.0f;

  return pct;
}

// --------------------------------------------------------------------------------------
// DETERMINE SOIL STATUS
// --------------------------------------------------------------------------------------
String determineSoilStatus(float percentage) {
  if (percentage < 30.0f) {
    return "DRY";
  } else if (percentage > 70.0f) {
    return "WET";
  } else {
    return "MOIST";
  }
}

// --------------------------------------------------------------------------------------
// SEND TELEMETRY VIA HTTP POST
// --------------------------------------------------------------------------------------
bool sendTelemetry(int rawAdc, float percentage, const String& status) {
  HTTPClient http;

  Serial.printf("[HTTP] Connecting to endpoint: %s\n", BACKEND_URL);
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout

  // Build JSON payload
  // e.g. {"device_id":"esp32_devkit_v1_field_01","raw_adc":2340,"moisture_percentage":55.2,"status":"MOIST","sensor_pin":"GPIO34"}
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"raw_adc\":" + String(rawAdc) + ",";
  payload += "\"moisture_percentage\":" + String(percentage, 1) + ",";
  payload += "\"status\":\"" + status + "\",";
  payload += "\"sensor_pin\":\"GPIO34\"";
  payload += "}";

  // Quick double blink on transmit
  digitalWrite(STATUS_LED, LOW);
  delay(50);
  digitalWrite(STATUS_LED, HIGH);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] POST Result Code: %d\n", httpResponseCode);
    String responseString = http.getString();
    Serial.printf("[HTTP] Server Response: %s\n", responseString.c_str());

    http.end();
    return (httpResponseCode == 200 || httpResponseCode == 201);
  } else {
    Serial.printf("[ERROR] HTTP POST failed, error code: %s (code %d)\n",
                  http.errorToString(httpResponseCode).c_str(), httpResponseCode);
    http.end();
    return false;
  }
}
