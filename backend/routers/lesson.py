from fastapi import APIRouter, HTTPException
from models.schemas import LessonPlanRequest, SlideRequest, LessonPlanResponse, SlideResponse
from services import claude_service

router = APIRouter()


@router.post("/plan", response_model=LessonPlanResponse)
def generate_lesson_plan(req: LessonPlanRequest):
    try:
        data = claude_service.generate_lesson_plan(
            req.subject, req.class_level, req.chapter, req.topic
        )
        return LessonPlanResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/slides", response_model=SlideResponse)
def generate_slides(req: SlideRequest):
    try:
        data = claude_service.generate_slides(
            req.subject, req.class_level, req.chapter, req.topic, req.num_slides
        )
        return SlideResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
