from fastapi import APIRouter, HTTPException
from models.schemas import DoubtRequest, DoubtResponse
from services import claude_service

router = APIRouter()


@router.post("/resolve", response_model=DoubtResponse)
def resolve_doubt(req: DoubtRequest):
    try:
        data = claude_service.resolve_doubt(
            req.subject, req.class_level, req.topic,
            req.question, req.language
        )
        return DoubtResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
