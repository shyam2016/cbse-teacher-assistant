from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.schemas import ExportRequest
from services import pdf_service

router = APIRouter()

_GENERATORS = {
    "lesson": pdf_service.generate_lesson_pdf,
    "slides": pdf_service.generate_generic_pdf,
    "classwork": pdf_service.generate_classwork_pdf,
    "homework": pdf_service.generate_homework_pdf,
    "mindmap": pdf_service.generate_mindmap_pdf,
    "flashcards": pdf_service.generate_mindmap_pdf,
}


@router.post("/pdf")
def export_pdf(req: ExportRequest):
    generator = _GENERATORS.get(req.content_type)
    if not generator:
        raise HTTPException(status_code=400, detail=f"Unknown content type: {req.content_type}")
    try:
        pdf_bytes = generator(req.title, req.content)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{req.title}.pdf"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
