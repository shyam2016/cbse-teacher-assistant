from fastapi import APIRouter, HTTPException
from models.schemas import MindMapRequest, MindMapResponse
from services import claude_service

router = APIRouter()


@router.post("/generate", response_model=MindMapResponse)
def generate_mindmap(req: MindMapRequest):
    try:
        data = claude_service.generate_mindmap(
            req.subject, req.class_level, req.chapter, req.topic
        )
        return MindMapResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
