from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from database import get_db
from models import InspectionSession
from modules.document_generation_module import DocumentGenerationModule
router = APIRouter()

@router.get("/download/{session_id}")
async def download_report(session_id: str):
    db = get_db()
    session = await db.inspection_sessions.find_one({"session_id": session_id})

    if not session:
        return {"error": "Session not found"}

    if not session.get("document_path"):
        return {"error": "Document not ready"}

    return FileResponse(
        session.get("document_path"),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="inspection_report.docx"
    )

@router.get("/download/{session_id}/pdf")
async def download_report_pdf(session_id: str):
    db = get_db()
    session = await db.inspection_sessions.find_one({"session_id": session_id})

    if not session:
        return {"error": "Session not found"}

    docx_path = session.get("document_path")
    if not docx_path or not os.path.exists(docx_path):
        return {"error": "Document not ready"}

    pdf_path = docx_path.replace(".docx", ".pdf")
    
    if not os.path.exists(pdf_path):
        try:
            import pythoncom
            pythoncom.CoInitialize()
            try:
                from docx2pdf import convert
                convert(os.path.abspath(docx_path), os.path.abspath(pdf_path))
            finally:
                pythoncom.CoUninitialize()
        except Exception as e:
            return {"error": f"Failed to generate PDF: {e}"}

    if not os.path.exists(pdf_path):
        return {"error": "Failed to generate PDF"}

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="inspection_report.pdf"'}
    )

@router.get("/batches/{batch_id}/download/docx")
async def download_batch_report(batch_id: str):
    db = get_db()
    docs = await db.inspection_sessions.find({"batch_id": batch_id}).sort("created_at", 1).to_list(length=None)
    
    if not docs:
        analysis_docs = await db.analysis_sessions.find({"visit_id": batch_id}).to_list(length=None)
        if analysis_docs:
            session_ids = [doc.get("session_id") for doc in analysis_docs if doc.get("session_id")]
            docs = await db.inspection_sessions.find({"session_id": {"$in": session_ids}}).sort("created_at", 1).to_list(length=None)

    if not docs:
        return {"error": "Batch not found"}

    sessions = [InspectionSession(**doc) for doc in docs]
    
    output_dir = os.path.join("outputs", "batches", batch_id)
    output_docx_path = os.path.join(output_dir, "combined_vessel_inspection_report.docx")
    
    if not os.path.exists(output_docx_path):
        imo_number = sessions[0].imo_number
        if imo_number:
            all_vessel_docs = await db.inspection_sessions.find({"imo_number": imo_number}).sort("created_at", 1).to_list(length=None)
            all_sessions = [InspectionSession(**doc) for doc in all_vessel_docs]
        else:
            all_sessions = sessions

        repair_json_paths = []
        for session in all_sessions:
            if session.output_path:
                repair_json_paths.append(os.path.join(session.output_path, "module_5_repair_estimation_output", "repair_estimation_outputs.json"))
        
        vessel_name = all_sessions[0].vessel_name or "Combined Vessel Inspection"
        
        generator = DocumentGenerationModule()
        generator.create_batch_report(batch_id, repair_json_paths, vessel_name)
        
    if not os.path.exists(output_docx_path):
         return {"error": "Failed to generate report"}

    return FileResponse(
        output_docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"batch_{batch_id}_inspection_report.docx"
    )

@router.get("/batches/{batch_id}/download/pdf")
async def download_batch_report_pdf(batch_id: str):
    db = get_db()
    docs = await db.inspection_sessions.find({"batch_id": batch_id}).sort("created_at", 1).to_list(length=None)
    
    if not docs:
        analysis_docs = await db.analysis_sessions.find({"visit_id": batch_id}).to_list(length=None)
        if analysis_docs:
            session_ids = [doc.get("session_id") for doc in analysis_docs if doc.get("session_id")]
            docs = await db.inspection_sessions.find({"session_id": {"$in": session_ids}}).sort("created_at", 1).to_list(length=None)

    if not docs:
        return {"error": "Batch not found"}

    sessions = [InspectionSession(**doc) for doc in docs]
    
    output_dir = os.path.join("outputs", "batches", batch_id)
    output_docx_path = os.path.join(output_dir, "combined_vessel_inspection_report.docx")
    output_pdf_path = os.path.join(output_dir, "combined_vessel_inspection_report.pdf")
    
    if not os.path.exists(output_docx_path):
        imo_number = sessions[0].imo_number
        if imo_number:
            # Fetch ALL sessions for this vessel to include in the report
            all_vessel_docs = list(db.inspection_sessions.find({"imo_number": imo_number}).sort("created_at", 1))
            all_sessions = [InspectionSession(**doc) for doc in all_vessel_docs]
        else:
            all_sessions = sessions

        repair_json_paths = []
        for session in all_sessions:
            if session.output_path:
                repair_json_paths.append(os.path.join(session.output_path, "module_5_repair_estimation_output", "repair_estimation_outputs.json"))
        
        vessel_name = all_sessions[0].vessel_name or "Combined Vessel Inspection"
        
        from modules.document_generation_module import DocumentGenerationModule
        generator = DocumentGenerationModule()
        generator.create_batch_report(batch_id, repair_json_paths, vessel_name)
        
    if not os.path.exists(output_docx_path):
         return {"error": "Failed to generate report"}

    if not os.path.exists(output_pdf_path):
        try:
            import pythoncom
            pythoncom.CoInitialize()
            try:
                from docx2pdf import convert
                convert(os.path.abspath(output_docx_path), os.path.abspath(output_pdf_path))
            finally:
                pythoncom.CoUninitialize()
        except Exception as e:
            return {"error": f"Failed to generate PDF: {e}"}

    if not os.path.exists(output_pdf_path):
        return {"error": "Failed to generate PDF"}

    return FileResponse(
        output_pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="batch_{batch_id}_inspection_report.pdf"'}
    )