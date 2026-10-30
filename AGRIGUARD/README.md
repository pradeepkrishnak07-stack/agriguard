# AGRIGUARD — AI Farmer Companion | உழவன் வழிகாட்டி

An Intelligent, Offline-First AI Farming Assistant designed for Indian smallholder farmers, with dedicated Tamil-language voice interaction, agrometeorological disease risk forewarning, and validated agronomic guidance adhering to Tamil Nadu Agricultural University (TNAU) and Indian Council of Agricultural Research (ICAR) standards.

---

## 🌾 Key Capabilities

1. **AI Crop Disease Detection**:
   - Leaf photo capture via smartphone camera or gallery upload.
   - Vegetation Index (ExG) validation to ensure a real plant leaf is present and prevent non-plant false positives.
   - Calibrated confidence scoring with structured symptom explanations, organic/biological control (Pseudomonas, Trichoderma, Neem oil), chemical IPM options, and agricultural extension officer contact advisory.
   - Calibrated uncertainty rejection: `"The image does not provide enough information for a reliable prediction. Try another clear photograph."`

2. **Weather-Based Disease Risk Forewarning**:
   - Transparent epidemiological engine predicting pathogen outbreaks (e.g., Tomato Early/Late Blight, Rice Blast, Cotton Bacterial Blight) 48–72 hours before visible symptoms develop.
   - Real weather forecast integration (temperature, relative humidity, precipitation probability, and leaf wetness duration).
   - 3-tier risk category: Low, Moderate, and High Risk.

3. **Smart Irrigation Guidance**:
   - Integrates crop evapotranspiration coefficients ($K_c$), growth stage water sensitivity, soil water-holding characteristics (Red Loam, Clay, Clay Loam, Black Soil), and rainfall forecast.
   - Automatically recommends postponing irrigation when significant rain is forecast.
   - Built-in reassessment intervals and irrigation reminder settings.

4. **Crop Nutrition & Fertilizer Guide**:
   - Stage-wise N-P-K recommendation schedules (Basal application and Top-dressing splits).
   - Organic manure (FYM, Vermicompost) and bio-fertilizer enablers (Azospirillum, Phosphobacteria).
   - Visual nutrient deficiency diagnostic helper (Nitrogen, Phosphorus, Potassium, Zinc) distinguishing between visual foliar symptoms and confirmed soil test requirements.

5. **Agriculture Q&A Assistant**:
   - Gemini-powered farming assistant with English, Tamil, and Hindi responses.
   - Web Speech API speech-to-text with microphone button.
   - Text-to-speech audio playback with stop and repeat controls.
   - General crop, soil, irrigation, fertilizer, and disease information with uncertainty and local-guidance safeguards.

6. **Offline-First Architecture**:
   - Uninterrupted access to saved farm profiles, cached weather forecasts, offline disease risk rules, crop care advisories, and scan histories.
   - Clear network status banner: Online, Offline Mode, Cached Data, and Syncing.

7. **My Farm & Plot Management**:
   - Multi-crop profile support (Tomato, Rice/Paddy, Cotton, Potato, Corn, Groundnut, Chilli).
   - Variety tracking, cultivated acreage, planting dates, soil types, and irrigation methods.

8. **Smart Alerts System**:
   - Push and in-app alerts for elevated disease outbreaks, unseasonal rainfall, and critical irrigation windows with severity tags and read/unread status.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 with Vite and TypeScript
  - Tailwind CSS for responsive mobile-first UI with agricultural color palette
  - Lucide React icons
  - Web Speech API (speech recognition and synthesis)
  - LocalStorage / IndexedDB persistence layer
- **Backend**:
  - Python 3.10+
  - FastAPI & Uvicorn
  - Pydantic v2 for request/response validation
  - Pillow & NumPy for image validation and computer vision feature extraction
  - Requests for agrometeorological API feeds
  - Persistent JSON / SQLite storage engine

---

## 📁 Project Structure

```
AGRIGUARD/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & CORS configuration
│   │   ├── core/
│   │   │   └── config.py               # Application settings & environment config
│   │   ├── data/
│   │   │   └── knowledge_base.py       # TNAU & ICAR crop disease and fertilizer repository
│   │   ├── schemas/
│   │   │   └── farm_schemas.py         # Pydantic data models & request schemas
│   │   ├── services/
│   │   │   ├── weather_service.py      # Agrometeorological service (Open-Meteo & OpenWeather)
│   │   │   ├── disease_risk_engine.py  # Epidemiological disease risk prediction engine
│   │   │   ├── disease_detector.py     # Computer vision & leaf pathology classifier
│   │   │   ├── irrigation_engine.py    # Crop stage & weather-aware watering engine
│   │   │   ├── fertilizer_engine.py    # NPK splits & nutrient deficiency analyzer
│   │   │   ├── gemini_assistant.py     # Gemini agricultural Q&A service
│   │   │   └── farm_store.py           # Persistent profile, history & alerts store
│   │   └── api/
│   │       └── endpoints.py            # REST API route handlers
│   ├── requirements.txt                # Python package dependencies
│   └── .env.example                    # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Top header with crop selector & language toggle
│   │   │   ├── BottomNav.tsx           # Mobile-friendly 8-tab navigation bar
│   │   │   ├── OfflineBanner.tsx       # Online/offline status banner
│   │   │   ├── OnboardingModal.tsx     # First-time farmer setup modal
│   │   │   ├── HomeScreen.tsx          # Home dashboard with live weather & quick actions
│   │   │   ├── DiseaseDetectionScreen.tsx # Leaf photo capture & AI diagnosis
│   │   │   ├── DiseaseRiskScreen.tsx   # Weather-based disease outbreak forecast
│   │   │   ├── IrrigationScreen.tsx    # Smart watering guidance & rain impact
│   │   │   ├── FertilizerScreen.tsx    # Crop nutrition & deficiency checker
│   │   │   ├── VoiceAssistantScreen.tsx# Tamil voice speech & text assistant
│   │   │   ├── MyFarmScreen.tsx        # Multi-crop plot management
│   │   │   ├── AlertsScreen.tsx        # Smart alerts & notification center
│   │   │   └── SettingsScreen.tsx      # Language toggle, cache stats & diagnostics
│   │   ├── services/
│   │   │   ├── api.ts                  # API client with offline fallback
│   │   │   ├── storage.ts              # Local persistence manager
│   │   │   └── speech.ts               # Web Speech API wrapper
│   │   ├── types.ts                    # TypeScript interfaces
│   │   ├── i18n.ts                     # Full English & Tamil bilingual dictionary
│   │   ├── App.tsx                     # Main application layout
│   │   └── main.tsx                    # React DOM entry point
│   ├── tailwind.config.js              # Agricultural green & earth color themes
│   ├── vite.config.ts                  # Vite build configuration
│   └── package.json                    # Node dependencies
└── README.md
```

---

## 🚀 Installation & Execution

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Gemini in backend/.env (copy .env.example and set GEMINI_API_KEY).
# Keep this key server-side; never put it in a VITE_ variable or frontend code.

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
# Or alternately: python run.py
```
*Backend API will be running at `http://localhost:8001` with Swagger docs at `http://localhost:8001/docs`.*

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend will be running at `http://localhost:5173`.*

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, model version, and supported crops |
| `GET` | `/api/weather/forecast` | Current weather and 7-day agricultural forecast |
| `POST` | `/api/disease/detect` | Multipart leaf image upload & AI disease detection |
| `POST` | `/api/disease/risk` | Crop disease outbreak risk evaluation based on weather |
| `GET` | `/api/disease/info` | Supported crop and pathogen reference library |
| `POST` | `/api/irrigation/recommend` | Weather and crop-stage aware watering advice |
| `POST` | `/api/fertilizer/recommend` | NPK schedule and nutrient deficiency diagnostic |
| `POST` | `/api/assistant/ask` | Gemini agricultural Q&A with bounded conversation context |
| `GET` | `/api/farm/profile` | Retrieve farmer profile and registered plots |
| `POST` | `/api/farm/profile` | Update profile information |
| `GET` | `/api/history/detections` | Retrieve saved leaf scan history |
| `DELETE` | `/api/history/detections/{id}` | Delete individual scan entry |
| `GET` | `/api/alerts` | Retrieve active smart farm notifications |
| `POST` | `/api/alerts/read/{id}` | Mark alert as read |
| `GET` | `/api/admin/metrics` | System diagnostics and logged scan metrics |

---

## 🌱 Gemini Agriculture Assistant

The existing AGRIGUARD Ask AGRIGUARD interface uses Google's official `google-genai` SDK and the
`gemini-3.5-flash-lite` model by default. No model is trained, and the backend does not silently
switch to a different model or enable paid billing. Confirm model access and current quota in your
Google AI account before use.

For local development, copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY` there.
Optionally set `GEMINI_MODEL` if you have access to another supported model. The backend loads that
file; the frontend never receives or stores the key. Without a configured key, the assistant returns
a clear service-configuration error instead of a fabricated offline answer.

When deploying, add `GEMINI_API_KEY` and (optionally) `GEMINI_MODEL` in the backend hosting
provider's secret/environment settings. If the frontend is served from a different origin, set
`FRONTEND_ORIGINS` to its comma-separated HTTPS origin(s) in the backend environment, and set
`VITE_API_URL` to the backend API base URL (for example, `https://api.example.com/api`) when building
the frontend. CORS allows local development origins by default and does not allow arbitrary origins.

The assistant endpoint is `POST /api/assistant/ask`. It accepts a question, language (`en`, `ta`,
or `hi`), optional crop context, and up to 10 bounded prior conversation messages. It returns 503
when the key is missing/invalid, 429 for Gemini rate limiting, and clear timeout or service errors.
It provides general agricultural information, not a crop image diagnosis or a substitute for local
soil-test-based recommendations or product-label instructions.

## 🌦️ Weather Integration

AGRIGUARD comes pre-configured with the **Open-Meteo Agrometeorological API**, which delivers high-precision, keyless weather forecasts for coordinates across India and worldwide.

If you have an **OpenWeather API key**, you can optionally set it in `backend/.env`:
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```
If the key is omitted, AGRIGUARD automatically falls back to Open-Meteo, guaranteeing uninterrupted live weather without external setup hurdles.

---

## 📴 Offline-First Strategy

1. **Local Data Persistence**: Farm profile, registered crops, detection scan history, and active alerts are stored locally via `storageService` and synchronised with the backend whenever connectivity is available.
2. **Weather Caching**: Weather data stores timestamp, cache age, and an explicit `is_cached` status so farmers in rural areas can view the latest forecast even without internet.
3. **Local Fallback Engines**: When offline, the disease-risk engine, irrigation guidance, and fertilizer recommendations execute locally in the client using the exact same TNAU/ICAR rules.

---

## 🧪 Testing Instructions

1. **Onboarding**: Open `http://localhost:5173`. Select **தமிழ்** or **English**, fill in the district, select your primary crop, and proceed to the dashboard.
2. **Disease Scan**: Click **Check Crop Health** (`/detect`), capture or upload a leaf photo, and verify the AI diagnostics, symptoms, organic controls, and TNAU chemical guidelines.
3. **Disease Risk**: Navigate to **Disease Risk** (`/risk`), check the 3-tier risk gauge (Low / Moderate / High), contributing weather parameters, and preventive measures.
4. **Smart Irrigation**: Navigate to **Irrigation** (`/irrigation`), review watering recommendations based on forecast rain, and test the reminder button.
5. **Fertilizer Guide**: Navigate to **Fertilizer** (`/fertilizer`), choose a nutrient deficiency symptom (e.g. Zinc or Potassium), and view correction advice.
6. **Tamil Voice Assistant**: Navigate to **Ask AGRIGUARD** (`/assistant`), tap one of the suggested Tamil questions or tap the microphone button to test voice speech recognition and audio playback.
7. **Offline Mode**: Disconnect your internet connection or stop the backend, and observe the application continue working seamlessly using cached data and local offline fallbacks.
