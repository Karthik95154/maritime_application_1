from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InspectionSession(BaseModel):
    session_id: str
    batch_id: Optional[str] = None
    video_name: Optional[str] = None
    vessel_name: Optional[str] = None
    imo_number: Optional[str] = None
    vessel_type: Optional[str] = None
    gross_tonnage: Optional[str] = None
    inspector_name: Optional[str] = None
    location: Optional[str] = None
    inspection_date: Optional[str] = None
    comments: Optional[str] = None
    video_path: Optional[str] = None
    output_path: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = 0
    current_stage: Optional[str] = None
    document_path: Optional[str] = None
    review_checkpoint: Optional[str] = None
    review_status: Optional[str] = None
    review_notes: Optional[str] = None
    review_updated_at: Optional[datetime] = None
    review_updated_by: Optional[str] = None
    pipeline_resume_from: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class Vessel(BaseModel):
    vessel_id: str
    imo: str
    vessel_name: str
    vessel_type: Optional[str] = None
    gross_tonnage: Optional[str] = None
    owner: Optional[str] = None
    operator: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    latest_report_version: Optional[int] = 0
    health_score: Optional[int] = 100
    last_inspection_date: Optional[datetime] = None

class DryDockVisit(BaseModel):
    visit_id: str
    ship_id: str
    visit_number: int
    visit_type: str = "Dry Dock"
    dockyard: Optional[str] = None
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    status: str = "Active" # Active, Completed
    report_version: int = 0
    total_defects: int = 0
    total_cost: float = 0.0
    visit_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnalysisSession(BaseModel):
    session_id: str
    vessel_id: str
    visit_id: Optional[str] = None
    uploaded_videos: list[str] = []
    analysis_results: Optional[str] = None
    generated_cost: Optional[float] = 0.0
    generated_report: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Completed"

class DefectRegistry(BaseModel):
    defect_id: str
    vessel_id: str
    visit_id: Optional[str] = None
    component: str
    defect_type: str
    severity: str
    area: float
    location: Optional[str] = None
    status: str = "New" # New, Active, Observed, Repair Planned, Repair In Progress, Repaired, Closed
    first_detected: datetime
    last_detected: datetime
    cost_estimation: float
    session_ids: list[str] = []
    report_versions: list[int] = []
    history: list[dict] = [] # Track progression history per visit/session

class RepairRegistry(BaseModel):
    repair_id: str
    vessel_id: str
    visit_id: Optional[str] = None
    defect_id: str
    repair_method: str
    dockyard: str
    repair_cost: float
    repair_date: datetime
    notes: Optional[str] = None
    before_images: list[str] = []
    after_images: list[str] = []
    repair_status: str

class ReportVersion(BaseModel):
    report_id: str
    vessel_id: str
    visit_id: Optional[str] = None
    version: int
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    session_ids: list[str] = []
    pdf_path: str
    docx_path: str
    summary: dict = {}

class ReportDifference(BaseModel):
    diff_id: str
    from_version: int
    to_version: int
    visit_id: Optional[str] = None
    new_defects: list[str] = []
    updated_defects: list[str] = []
    resolved_defects: list[str] = []
    cost_difference: float = 0.0
    health_score_difference: int = 0
    repair_changes: list[str] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
