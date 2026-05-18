from pydantic import BaseModel, Field
from typing import Optional, Literal


class TopicRequest(BaseModel):
    subject: str = Field(..., description="e.g. Science, Mathematics, English")
    class_level: str = Field(..., description="e.g. Class 8")
    chapter: str = Field(..., description="e.g. Chapter 11")
    topic: str = Field(..., description="e.g. Force and Pressure")


class LessonPlanRequest(TopicRequest):
    pass


class SlideRequest(TopicRequest):
    num_slides: int = Field(default=8, ge=4, le=15)


class DoubtRequest(TopicRequest):
    question: str = Field(..., description="Student's doubt or question")
    language: Literal["en", "en+hi"] = Field(default="en")


class ClassworkRequest(TopicRequest):
    num_mcq: int = Field(default=5, ge=1, le=10)
    num_oneliners: int = Field(default=5, ge=1, le=10)
    num_short: int = Field(default=3, ge=1, le=8)


class HomeworkRequest(TopicRequest):
    difficulty: Literal["easy", "moderate", "advanced"] = Field(default="moderate")
    num_short: int = Field(default=4, ge=1, le=8)
    num_long: int = Field(default=2, ge=1, le=5)


class MindMapRequest(TopicRequest):
    pass


class ExportRequest(BaseModel):
    content_type: Literal["lesson", "slides", "classwork", "homework", "mindmap", "flashcards"]
    title: str
    content: dict


# Response models

class Slide(BaseModel):
    slide_number: int
    title: str
    bullets: list[str]
    key_terms: list[str]
    example: Optional[str] = None


class MCQ(BaseModel):
    question: str
    options: list[str]
    answer: str


class FlashCard(BaseModel):
    term: str
    definition: str


class LessonPlanResponse(BaseModel):
    overview: str
    learning_outcomes: list[str]
    definitions: list[dict]
    formulae: list[str]
    summary_points: list[str]


class SlideResponse(BaseModel):
    slides: list[Slide]


class DoubtResponse(BaseModel):
    explanation: str
    explanation_hindi: Optional[str] = None
    steps: list[str]
    example: str


class ClassworkResponse(BaseModel):
    mcqs: list[MCQ]
    oneliners: list[dict]
    short_qa: list[dict]


class HomeworkResponse(BaseModel):
    header: dict
    short_answers: list[dict]
    long_answers: list[dict]


class MindMapResponse(BaseModel):
    mind_map: dict
    flash_cards: list[FlashCard]
    pyq_questions: list[dict]
