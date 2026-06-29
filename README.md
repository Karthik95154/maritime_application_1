# Maritime Inspection Intelligence Platform 🚢

Welcome to the **Maritime Inspection Intelligence Platform**—a robust, enterprise-grade application for automating maritime vessel inspections using AI. The platform is designed to seamlessly process video feeds or images from maritime inspections, accurately detect and classify defects (such as rust, corrosion, and paint peeling), track their progression over time across a fleet, and streamline internal reviews.

---

## 🏗️ System Architecture

This application follows a modern decoupled architecture:

### 1. Frontend (React / TypeScript / Vite)
A rich, responsive Single Page Application (SPA) providing real-time data visualization, inspection management, and human-in-the-loop (HITL) review tools.
- **Frameworks & Libraries:** React 18, TypeScript, Vite, Material-UI (MUI), Recharts, React Query, Lucide-React.
- **Key Modules:** 
  - **Dashboard:** Fleet health metrics and distribution maps.
  - **Inspection Center:** Upload videos for AI processing.
  - **Defect Intelligence Center:** Filterable global defect registry with temporal progression (e.g., rust growth).
  - **Human in the Loop (HITL) / Review:** Review AI-detected defects frame-by-frame and accept or correct severities.

### 2. Backend (FastAPI / Python)
A highly concurrent and fast API that manages data flow, triggers the AI pipelines, and orchestrates database transactions.
- **Frameworks & Libraries:** Python 3.10+, FastAPI, Motor (Async PyMongo), Uvicorn, Loguru, Slowapi (Rate limiting).
- **Key Modules:**
  - **Authentication & Security:** JWT-based stateless authentication, bcrypt password hashing.
  - **RESTful API Routes:** Segregated into `auth`, `defects`, `inspections`, `vessels`, `dashboard`, `internal_review`, and `predict`.
  - **AI Pipeline Triggering:** Initiates Python-based ML processes for frame extraction, segmentation, classification, and temporal tracking.

### 3. Database (MongoDB)
A NoSQL document-based database capable of handling complex temporal tracking logs and massive vessel history schemas without strict migrations.
- **Driver:** Motor (Async MongoDB driver).
- **Core Collections:** `users`, `vessels`, `inspection_sessions`, `defect_registry`, `pipeline_events`.

---

## ⚙️ Core AI Pipeline & Workflows

When an inspection video is uploaded, the platform processes it via a multi-stage pipeline:
1. **Module 1 - Frame Extraction:** Identifies keyframes from drone/camera footage.
2. **Module 2 - CDS Output:** Runs YOLO-based object detection/segmentation to find physical defects (Rust, Paint peeling) and their severities.
3. **Module 3 - Temporal Tracking:** Tracks identical defects across multiple frames or historic reports to measure area growth and severity progression.
4. **Final Reporting:** Compiles the findings into detailed JSON metadata files stored in the `outputs/sessions/<session_id>` folder.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **Python** (v3.10 or higher)
* **MongoDB** (running locally on port 27017 or configured remotely via `.env`)

### 1. Quick Start (Windows)
We provide a convenient PowerShell script that launches both the frontend and backend simultaneously. From the root directory (`maritime_application`), run:
```powershell
.\start-maritimeinspect.ps1
```

### 2. Manual Start (Backend)
Navigate to the backend directory, install requirements, and run the FastAPI server:
```bash
cd backend_v2
pip install -r requirements.txt
# Start the Uvicorn server on port 8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Manual Start (Frontend)
From the root directory, install npm dependencies and start the Vite development server:
```bash
npm install
npm run dev
```

---

## 🗄️ Database Management & Utilities

In the `backend_v2` directory, there are several Python scripts designed for environment setup and data migrations:

* **`create_admin.py`**: Use this script on a fresh database to create your primary administrator account.
  * **Default Admin Email:** `admin@bluewavemarine.com`
  * **Default Password:** `admin123`
* **`migrate_to_mongo.py`**: Safely migrates existing `inspection_sessions` data from a legacy SQLite database into the current MongoDB instance without duplication.
* **`migrate_vessels.py` & `migrate_visits.py`**: Utility scripts for transferring core vessel data and drydock visit histories to MongoDB.

---

## 🔧 Environment Configuration

To configure the application for your specific environment, adjust the `.env` variables:

**Backend (`backend_v2/.env`):**
```ini
GEMINI_API_KEY=your_api_key_here
MONGO_URI=mongodb://localhost:27017/
# Other settings can be found in `config.py`
```

**Frontend (`.env`):**
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📁 Directory Layout

```text
maritime_application/
├── backend_v2/
│   ├── database/         # Legacy DB files
│   ├── final_models/     # Pre-trained YOLOv8 weights (.pt files)
│   ├── modules/          # Core AI pipeline processing logic
│   ├── outputs/          # Generated JSON metadata, extracted frames, & session reports
│   ├── routes/           # FastAPI router endpoints
│   ├── services/         # Security and internal logic
│   ├── main.py           # FastAPI Application Entrypoint
│   └── ...migration & util scripts
├── src/                  # React Frontend Code
│   ├── api/              # Axios/Fetch API wrappers (e.g. backendApi.ts)
│   ├── components/       # Reusable MUI UI elements
│   ├── pages/            # Application Views (Dashboard, DefectReview, etc)
│   └── theme.ts          # MUI Custom Theme Configuration
├── start-maritimeinspect.ps1 # Quickstart PowerShell script
└── ...config files (docker-compose.yml, package.json, vite.config.ts)
```

---

## 📝 License
Copyright © 2026 BlueWave Marine Services / Maritime Tech. All rights reserved.