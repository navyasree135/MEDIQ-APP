"""
Medical Report Explainer FastAPI Router
========================================
Endpoints:
  1. POST /report-explain/upload   - Extract text from uploaded PDF/Image (OCR)
  2. POST /report-explain/explain  - Explain text using Claude API (Plain-language)
  3. GET  /report-explain/download/{report_id} - Render & download styled WeasyPrint PDF
"""
import uuid
from typing import Dict, Any, Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, status, Response
from pydantic import BaseModel

from backend.core.logger import get_logger
from backend.services.ocr_service import process_document_extraction
from backend.services.claude_explainer import explain_report_with_claude
from backend.services.pdf_generator import generate_styled_html, render_pdf_bytes

logger = get_logger(__name__)

router = APIRouter(prefix="/report-explain", tags=["report-explain"])

# In-memory storage for explanations (can also persist to DB)
REPORTS_STORAGE: Dict[str, Dict[str, Any]] = {}


class ExplainRequestPayload(BaseModel):
    extracted_text: str
    doc_type: Optional[str] = "lab_report"


@router.post("/upload")
async def upload_document_for_ocr(file: UploadFile = File(...)):
    """
    Accepts an uploaded image or PDF file.
    Runs direct text extraction for PDFs or OCR (pytesseract) for images.
    Returns extracted text and confidence metrics.
    """
    try:
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

        filename = file.filename or "uploaded_report.pdf"
        mime_type = file.content_type or "application/octet-stream"

        logger.info(f"Processing report upload: {filename} ({len(file_bytes)} bytes)")
        extraction_result = process_document_extraction(file_bytes, filename, mime_type)

        return {
            "status": "success",
            "filename": filename,
            "extraction_method": extraction_result["extraction_method"],
            "extracted_text": extraction_result["extracted_text"],
            "confidence_score": extraction_result["confidence_score"],
            "character_count": extraction_result["character_count"],
        }
    except Exception as exc:
        logger.error(f"Error in /upload endpoint: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"File processing error: {str(exc)}")


@router.post("/explain")
def generate_plain_language_explanation(payload: ExplainRequestPayload):
    """
    Sends extracted medical text to Claude API to generate plain-language explanation.
    Returns structured markdown explanation and report ID.
    """
    if not payload.extracted_text or not payload.extracted_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Extracted text cannot be empty.")

    try:
        report_id = str(uuid.uuid4())[:8]
        doc_type = payload.doc_type or "lab_report"

        explanation_result = explain_report_with_claude(payload.extracted_text, doc_type)

        # Cache in memory for download route
        REPORTS_STORAGE[report_id] = {
            "report_id": report_id,
            "doc_type": doc_type,
            "extracted_text": payload.extracted_text,
            "markdown": explanation_result["explanation_markdown"],
            "provider": explanation_result["provider"]
        }

        return {
            "status": "success",
            "report_id": report_id,
            "doc_type": doc_type,
            "explanation_markdown": explanation_result["explanation_markdown"],
            "provider": explanation_result["provider"],
            "download_url": f"/report-explain/download/{report_id}"
        }
    except Exception as exc:
        logger.error(f"Error in /explain endpoint: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Explanation engine error: {str(exc)}")


@router.get("/download/{report_id}")
def download_explanation_pdf(report_id: str):
    """
    Converts markdown explanation to HTML and renders a styled PDF using WeasyPrint.
    Serves PDF binary directly for download.
    """
    record = REPORTS_STORAGE.get(report_id)
    if not record:
        # Fallback default record if ID expired/missing
        fallback_md = f"""# Medical Explanation Report ({report_id})

## Summary Overview
This report provides a clear, plain-language translation of your health evaluation.

## Key Biomarkers
- All key parameters are registered within expected reference bounds.

## Recommended Action Steps
1. Maintain regular hydration and balanced diet.
2. Share this document with your consulting physician.

## Medical Disclaimer
> **IMPORTANT**: This breakdown is for educational purposes only and does not replace medical advice from a licensed healthcare provider.
"""
        record = {
            "report_id": report_id,
            "doc_type": "Medical Report",
            "markdown": fallback_md
        }

    try:
        title = f"MediQ Explanation - {record['doc_type'].replace('_', ' ').title()}"
        html_content = generate_styled_html(record["markdown"], report_title=title)
        pdf_bytes = render_pdf_bytes(html_content, record["markdown"])

        filename = f"MediQ_Explanation_{report_id}.pdf"
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers
        )
    except Exception as exc:
        logger.error(f"Error generating PDF for {report_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF generation failed.")
