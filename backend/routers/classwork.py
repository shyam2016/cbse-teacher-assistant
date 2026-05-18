from fastapi import APIRouter, HTTPException
from models.schemas import ClassworkRequest, ClassworkResponse
from services import claude_service

router = APIRouter()


@router.post("/generate", response_model=ClassworkResponse)
def generate_classwork(req: ClassworkRequest):
    try:
        data = claude_service.generate_classwork(
            req.subject, req.class_level, req.chapter, req.topic,
            req.num_mcq, req.num_oneliners, req.num_short
        )
        return ClassworkResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
