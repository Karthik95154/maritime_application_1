from fastapi import APIRouter


router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("")
async def get_dashboard():
    return {
        "metrics": [
            { "label": "Assigned Inspections", "value": "12", "delta": "+2", "trend": "up" },
            { "label": "Active Analysis Jobs", "value": "3", "delta": "+1", "trend": "up" },
            { "label": "Critical Defects Found", "value": "24", "delta": "-5", "trend": "down" },
            { "label": "Reports Generated", "value": "142", "delta": "+12", "trend": "up" },
            { "label": "Avg Fleet Health", "value": "84/100", "delta": "+1.2", "trend": "up" }
        ],
        "defectsByType": [
            { "name": "Corrosion", "value": 450 },
            { "name": "Coating Breakdown", "value": 320 },
            { "name": "Structural", "value": 150 },
            { "name": "Cracks", "value": 80 }
        ],
        "costTrend": [
            { "month": "Jan", "cost": 120000 },
            { "month": "Feb", "cost": 135000 },
            { "month": "Mar", "cost": 125000 },
            { "month": "Apr", "cost": 150000 },
            { "month": "May", "cost": 140000 },
            { "month": "Jun", "cost": 160000 }
        ],
        "healthScore": 82,
        "predictiveMaintenance": [
            { "vesselName": "Stellar Horizon", "probability": "85%", "risk": "High", "timeframe": "14 days" },
            { "vesselName": "Oceanic Voyager", "probability": "62%", "risk": "Medium", "timeframe": "30 days" }
        ]
    }
