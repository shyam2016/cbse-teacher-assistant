from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import lesson, classwork, homework, doubt, mindmap, export

app = FastAPI(
    title="CBSE Teacher Assistant API",
    description="AI-powered tools for CBSE/NCERT aligned teaching",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lesson.router, prefix="/api/lesson", tags=["Lesson Planning"])
app.include_router(classwork.router, prefix="/api/classwork", tags=["Classwork"])
app.include_router(homework.router, prefix="/api/homework", tags=["Homework"])
app.include_router(doubt.router, prefix="/api/doubt", tags=["Doubt Resolution"])
app.include_router(mindmap.router, prefix="/api/mindmap", tags=["Mind Maps"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])


@app.get("/")
def root():
    return {"message": "CBSE Teacher Assistant API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}
