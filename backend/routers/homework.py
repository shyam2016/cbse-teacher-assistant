from fastapi import APIRouter, HTTPException
from models.schemas import HomeworkRequest, HomeworkResponse
from services import claude_service

router = APIRouter()


@router.post("/generate", response_model=HomeworkResponse)
def generate_homework(req: HomeworkRequest):
    try:
        data = claude_service.generate_homework(
            req.subject, req.class_level, req.chapter, req.topic,
            req.difficulty, req.num_short, req.num_long
        )
        return HomeworkResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
