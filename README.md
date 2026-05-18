# CBSE Teacher Assistant — AI-Powered Teaching Platform

An AI-powered web platform that empowers CBSE school teachers with intelligent tools for lesson planning, doubt resolution, classwork/homework generation, and visual learning aids — all aligned with the official NCERT/CBSE curriculum for Classes 1–12.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [System Design](#system-design)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Running](#installation--running)
- [Environment Variables](#environment-variables)
- [How Prompt Caching Works](#how-prompt-caching-works)
- [Phase 2 Roadmap](#phase-2-roadmap)

---

## Overview

CBSE teachers spend significant time preparing lesson plans, classwork sheets, and homework assignments. This platform uses the **Anthropic Claude API** to automate and accelerate that process — generating NCERT-aligned content in seconds that would otherwise take hours.

| Dimension | Details |
|---|---|
| **AI Engine** | Claude `claude-sonnet-4-6` (Anthropic) with prompt caching |
| **Backend** | Python 3.12 · FastAPI · Uvicorn |
| **Frontend** | React 18 · Vite 5 · Tailwind CSS v4 |
| **PDF Export** | ReportLab |
| **Curriculum** | NCERT/CBSE · Classes 1–12 · All subjects |

---

## Features

### Phase 1 (Current)

| Feature | Description |
|---|---|
| **Lesson Planner** | Generates full lesson overview, learning outcomes, key definitions, formulae, and summary points aligned with NCERT. Also generates presentation slides (4–15 slides) with a built-in slide viewer. |
| **Doubt Resolver** | Resolves student doubts with step-by-step explanations and real-life examples. Supports **bilingual mode** (English + Hindi). |
| **Classwork Generator** | Creates MCQs (with 4 options and answer key), one-liner Q&A, and short-answer questions — all CBSE exam pattern aligned. |
| **Homework Generator** | Produces homework sheets at three difficulty levels (Easy / Moderate / Advanced) with short-answer and long-answer sections, marks allocation, and model answers. |
| **Mind Maps & Flash Cards** | Generates hierarchical mind maps, term-definition flash cards, and PYQ-style (Previous Year Question) board exam questions with model answers. |
| **PDF Export** | Every generated output can be downloaded as a formatted, print-ready PDF. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Teacher)                       │
│                React 18 + Vite 5 + Tailwind CSS                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│   │ Lesson   │ │  Doubt   │ │Classwork │ │ Homework │ ...       │
│   │ Planner  │ │ Resolver │ │  Gen     │ │   Gen    │           │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│        │             │            │             │                │
│        └─────────────┴────────────┴─────────────┘               │
│                          Axios (HTTP)                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │  REST API  /api/*
┌──────────────────────────────▼──────────────────────────────────┐
│                     FastAPI Backend (Python)                     │
│                                                                 │
│  ┌─────────────┐  ┌────────────┐  ┌───────────┐  ┌──────────┐  │
│  │lesson router│  │doubt router│  │classwork  │  │ export   │  │
│  │  /plan      │  │  /resolve  │  │ /generate │  │  /pdf    │  │
│  │  /slides    │  │            │  │           │  │          │  │
│  └──────┬──────┘  └─────┬──────┘  └─────┬─────┘  └────┬─────┘  │
│         │               │               │              │        │
│         └───────────────┴───────────────┘              │        │
│                          │                             │        │
│              ┌───────────▼──────────┐     ┌───────────▼──────┐  │
│              │   Claude Service     │     │   PDF Service    │  │
│              │  (claude_service.py) │     │ (pdf_service.py) │  │
│              └───────────┬──────────┘     └──────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │  HTTPS (Anthropic SDK)
┌──────────────────────────▼──────────────────────────────────────┐
│                    Anthropic Claude API                         │
│              Model: claude-sonnet-4-6                           │
│              Prompt Caching: NCERT System Prompt (ephemeral)    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Prompt Caching** — The NCERT curriculum system prompt (~200 tokens) is marked `cache_control: ephemeral` on every request. After the first call, Anthropic serves it from cache at ~10% of the normal token cost, dramatically reducing API spend on repeated generations.

2. **Structured JSON Output** — Every Claude prompt asks for strict JSON output only. FastAPI validates the response against Pydantic models before returning it to the frontend, ensuring consistent data shapes.

3. **Vite Proxy** — In development, Vite proxies all `/api/*` requests to `localhost:8000`, so no CORS configuration is needed during local development and the frontend never hardcodes the backend URL.

4. **ReportLab PDF** — PDFs are generated server-side using ReportLab with school-branded formatting (CBSE blue palette, structured sections, proper header/footer layout) and streamed directly as `application/pdf` responses.

---

## System Design

### Data Flow

```
Teacher fills form
        │
        ▼
React page collects
subject + class + chapter + topic + extra params
        │
        ▼ (Axios POST /api/<feature>/generate)
FastAPI router validates request with Pydantic
        │
        ▼
claude_service.py builds feature-specific prompt
        │
        ▼ (Anthropic SDK — claude-sonnet-4-6)
Claude generates structured JSON content
        │
        ▼
FastAPI validates JSON → Pydantic response model
        │
        ▼ (HTTP 200 JSON)
React renders output in OutputCard
        │
        ▼ (optional: POST /api/export/pdf)
pdf_service.py → ReportLab → StreamingResponse (PDF)
        │
        ▼
Browser downloads PDF file
```

### Pydantic Models

All request and response shapes are strictly typed in `backend/models/schemas.py`:

| Model | Purpose |
|---|---|
| `TopicRequest` | Base: subject, class_level, chapter, topic |
| `LessonPlanResponse` | overview, learning_outcomes, definitions, formulae, summary_points |
| `SlideResponse` | List of Slide objects (title, bullets, key_terms, example) |
| `DoubtResponse` | explanation, explanation_hindi, steps, example |
| `ClassworkResponse` | mcqs, oneliners, short_qa |
| `HomeworkResponse` | header, short_answers, long_answers |
| `MindMapResponse` | mind_map (branches), flash_cards, pyq_questions |

---

## API Reference

Base URL: `http://localhost:8000`

All endpoints accept and return `application/json` unless noted.

---

### Lesson Planning

#### `POST /api/lesson/plan`
Generate a full lesson plan aligned with NCERT.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure"
}
```

**Response**
```json
{
  "overview": "...",
  "learning_outcomes": ["...", "..."],
  "definitions": [{"term": "Force", "definition": "..."}],
  "formulae": ["Pressure = Force / Area"],
  "summary_points": ["...", "..."]
}
```

---

#### `POST /api/lesson/slides`
Generate presentation slides for classroom use.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure",
  "num_slides": 8
}
```

**Response**
```json
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Introduction to Force",
      "bullets": ["A push or pull...", "SI unit is Newton"],
      "key_terms": ["Force", "Newton"],
      "example": "Pushing a door open"
    }
  ]
}
```

---

### Doubt Resolution

#### `POST /api/doubt/resolve`
Resolve a student's doubt with a clear explanation.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure",
  "question": "Why do we fall forward when a bus suddenly stops?",
  "language": "en"
}
```

`language` accepts `"en"` (English only) or `"en+hi"` (English + Hindi).

**Response**
```json
{
  "explanation": "This happens due to Newton's First Law of Motion...",
  "explanation_hindi": null,
  "steps": ["Step 1: ...", "Step 2: ..."],
  "example": "Imagine standing in a moving bus..."
}
```

---

### Classwork Generation

#### `POST /api/classwork/generate`
Generate MCQs, one-liners, and short Q&A.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure",
  "num_mcq": 5,
  "num_oneliners": 5,
  "num_short": 3
}
```

**Response**
```json
{
  "mcqs": [
    {
      "question": "The SI unit of pressure is?",
      "options": ["A) Newton", "B) Pascal", "C) Joule", "D) Watt"],
      "answer": "B) Pascal"
    }
  ],
  "oneliners": [{"question": "...", "answer": "..."}],
  "short_qa": [{"question": "...", "answer": "..."}]
}
```

---

### Homework Generation

#### `POST /api/homework/generate`
Generate a structured homework sheet.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure",
  "difficulty": "moderate",
  "num_short": 4,
  "num_long": 2
}
```

`difficulty` accepts `"easy"`, `"moderate"`, or `"advanced"`.

**Response**
```json
{
  "header": {
    "subject": "Science",
    "class_level": "Class 8",
    "chapter": "Chapter 11",
    "topic": "Force and Pressure",
    "difficulty": "moderate",
    "total_marks": 20
  },
  "short_answers": [{"question": "...", "marks": 2, "answer": "..."}],
  "long_answers": [{"question": "...", "marks": 4, "answer": "..."}]
}
```

---

### Mind Maps & Flash Cards

#### `POST /api/mindmap/generate`
Generate a mind map, flash cards, and board-exam questions.

**Request**
```json
{
  "subject": "Science",
  "class_level": "Class 8",
  "chapter": "Chapter 11",
  "topic": "Force and Pressure"
}
```

**Response**
```json
{
  "mind_map": {
    "central_topic": "Force and Pressure",
    "branches": [
      {
        "name": "Types of Force",
        "sub_topics": ["Contact Force", "Non-contact Force", "Friction"]
      }
    ]
  },
  "flash_cards": [
    {"term": "Pressure", "definition": "Force per unit area"}
  ],
  "pyq_questions": [
    {
      "question": "Define pressure and state its SI unit.",
      "marks": 2,
      "answer": "...",
      "type": "short"
    }
  ]
}
```

---

### PDF Export

#### `POST /api/export/pdf`
Export any generated content as a downloadable PDF.

Returns `application/pdf` binary stream.

**Request**
```json
{
  "content_type": "lesson",
  "title": "Force and Pressure – Class 8 Science",
  "content": { ... }
}
```

`content_type` accepts: `"lesson"`, `"slides"`, `"classwork"`, `"homework"`, `"mindmap"`, `"flashcards"`

**`content`** should be the raw response body from the corresponding generation endpoint.

---

### Health Check

#### `GET /health`
```json
{"status": "ok"}
```

---

## Project Structure

```
cbse-teacher-assistant/
│
├── backend/                        # FastAPI Python backend
│   ├── main.py                     # App entry point, CORS, router registration
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment variable template
│   │
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   │
│   ├── routers/
│   │   ├── lesson.py               # POST /api/lesson/plan, /api/lesson/slides
│   │   ├── doubt.py                # POST /api/doubt/resolve
│   │   ├── classwork.py            # POST /api/classwork/generate
│   │   ├── homework.py             # POST /api/homework/generate
│   │   ├── mindmap.py              # POST /api/mindmap/generate
│   │   └── export.py               # POST /api/export/pdf
│   │
│   └── services/
│       ├── claude_service.py       # Anthropic API client, prompt caching, all generators
│       └── pdf_service.py          # ReportLab PDF builder (per content type)
│
├── frontend/                       # React + Vite frontend
│   ├── vite.config.js              # Vite config with Tailwind plugin + /api proxy
│   ├── package.json
│   │
│   └── src/
│       ├── App.jsx                 # React Router setup
│       ├── main.jsx                # React entry point
│       ├── index.css               # Tailwind import + global resets
│       │
│       ├── api/
│       │   └── client.js           # Axios instance + per-feature API functions
│       │
│       ├── components/
│       │   ├── Layout.jsx          # Sidebar navigation + main content wrapper
│       │   ├── TopicSelector.jsx   # Reusable Subject/Class/Chapter/Topic inputs
│       │   └── OutputCard.jsx      # Result card with Export PDF button
│       │
│       └── pages/
│           ├── LessonPlanner.jsx   # Lesson plan + slide viewer (plan/slides mode)
│           ├── DoubtResolver.jsx   # Doubt resolution + bilingual toggle
│           ├── ClassworkGen.jsx    # MCQ + one-liner + short Q&A generator
│           ├── HomeworkGen.jsx     # Difficulty-tiered homework sheet generator
│           └── MindMapGen.jsx      # Mind map + flash cards + PYQ (3-tab view)
│
├── .gitignore
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.10+ (3.12 recommended) | Backend runtime |
| Node.js | 18+ or 20+ | Frontend build |
| npm | 8+ | Package manager |
| Anthropic API Key | — | Claude AI access |

Get your API key at [console.anthropic.com](https://console.anthropic.com).

---

## Installation & Running

### 1. Clone the repository

```bash
git clone https://github.com/shyam2016/cbse-teacher-assistant.git
cd cbse-teacher-assistant
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create and activate a virtual environment (recommended)**

```bash
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

**Install dependencies**

```bash
pip install -r requirements.txt
```

**Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Start the backend server**

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

**Install dependencies**

```bash
npm install
```

**Start the development server**

```bash
npm run dev
```

The app will be available at **`http://localhost:5173`**.

> The Vite dev server automatically proxies all `/api/*` requests to `localhost:8000`, so no separate CORS or URL configuration is needed.

---

### 4. Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

The optimized static files will be in `frontend/dist/`. You can then serve them with any static file host (Nginx, Vercel, Netlify, etc.) or configure FastAPI to serve them directly.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |

All other configuration (port, CORS origins, model name) is set directly in `backend/main.py` and `backend/services/claude_service.py`.

---

## How Prompt Caching Works

Every call to Claude includes the NCERT system prompt marked with `cache_control: ephemeral`:

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    system=[
        {
            "type": "text",
            "text": SYSTEM_PROMPT,              # ~200 tokens of NCERT context
            "cache_control": {"type": "ephemeral"}   # cached for 5 minutes
        }
    ],
    messages=[{"role": "user", "content": feature_prompt}]
)
```

**What this means in practice:**

| Request | Cost |
|---|---|
| 1st request | System prompt tokens billed at **1.25×** (cache write) |
| 2nd–Nth request (within 5 min) | System prompt tokens billed at **~0.1×** (cache read) |

For a classroom session where a teacher generates 10 different outputs, this reduces the system-prompt token cost by approximately **90%** compared to sending it uncached on every request.

---

## Phase 2 Roadmap

The following features are planned for Phase 2:

| Feature | Description |
|---|---|
| **AI Evaluation Engine** | Auto-grade MCQs, fill-in-the-blanks, and True/False. NLP-based scoring for short and long answers. |
| **Step-by-Step Math Evaluation** | Check solution steps (not just final answers) for Maths and Science problems. |
| **Concept Mastery Map** | Track each student's mastery level per NCERT concept ID across all topics. |
| **Personalized Feedback** | Generate strength/weakness reports and remedial suggestions per student. |
| **Parent Summary Sheet** | Auto-generate weekly progress reports in plain language for parents. |
| **Question Bank** | Auto-generate questions from any chapter, mapped to CBSE exam formats (1/2/3/5 marks). |
| **Analytics Dashboard** | Teacher view (class performance), Student view (personal progress), Admin view (school-wide). |
| **Predictive Learning** | AI predicts student performance trends and suggests revision plans before exams. |
| **OCR Answer Sheets** | Scan handwritten answer sheets and auto-evaluate using OCR + LLM. |
| **Mobile App** | Students access feedback, revision tips, and performance reports on mobile. |

---

## License

MIT License — free to use, modify, and distribute.

---

## Acknowledgements

- [Anthropic Claude](https://www.anthropic.com) — AI engine powering all content generation
- [NCERT](https://ncert.nic.in) — Curriculum reference and alignment
- [FastAPI](https://fastapi.tiangolo.com) — High-performance Python web framework
- [React](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS](https://tailwindcss.com) — Frontend stack
- [ReportLab](https://www.reportlab.com) — PDF generation
