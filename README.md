# Maritime Inspection Platform

The Maritime Inspection Platform is a full-stack application designed to manage, analyze, and review maritime vessel inspections, track defects (such as rust, corrosion, and paint peeling), and provide intelligence over fleet health.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Material-UI (MUI), Recharts
- **Backend:** Python, FastAPI, Motor (Async MongoDB Driver)
- **Database:** MongoDB
- **AI/ML:** Defect detection and temporal analysis models (YOLO, etc.) 

## Features

- **Dashboard:** High-level metrics for fleet health, inspections over time, and geographical vessel distribution.
- **Defect Intelligence Center:** Explore the global defect registry, track defect progression (e.g. rust area over time), and filter by severity and defect type.
- **Vessel Profiles:** Detailed history of drydock visits, health scores, and individual vessel data.
- **Inspection Center:** Upload inspection videos or images for AI-driven defect detection. 
- **Internal Review:** A human-in-the-loop review system to assess AI-detected defects, adjust severities, and generate final reports.

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.10+
- MongoDB (running locally on port 27017 or configured via `.env`)

### Running Locally

To start both the frontend and the backend simultaneously on a Windows machine, you can use the provided PowerShell script:

```powershell
.\start-maritimeinspect.ps1
```

Alternatively, you can run them separately:

**1. Start the Backend API (FastAPI)**
```bash
cd backend_v2
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Start the Frontend (Vite)**
```bash
npm run dev
```

### Default Admin Credentials

If you have just initialized an empty database, you can use the `create_admin.py` script in the `backend_v2` directory to create a default admin user.

- **Email:** `admin@bluewavemarine.com`
- **Password:** `admin123`

## Directory Structure

- `/src`: React frontend components, pages, and API hooks.
- `/backend_v2`: FastAPI backend, routes, database configuration, and AI models.
- `/backend_v2/outputs`: Static files, processed images, and generated reports from inspection sessions.