import os
import json
import anthropic

_client = None

SYSTEM_PROMPT = """You are an expert NCERT/CBSE curriculum assistant for Indian school teachers (Classes 1–12).

Your role:
- Generate structured, classroom-ready educational content aligned with NCERT textbooks and CBSE examination patterns
- Always tailor content to the specified class level (age-appropriate language and complexity)
- Use clear, simple language that Indian school teachers and students can easily understand
- Include relevant examples from everyday Indian life where appropriate
- Follow official CBSE curriculum guidelines and NCERT chapter sequences

Output format:
- Always respond with valid JSON only — no markdown, no prose outside JSON
- All keys must be exactly as specified in the user's request
- Ensure all content is educationally accurate and pedagogically sound

Subject expertise: Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Civics, Economics), English, Hindi, and all other NCERT subjects for Classes 1–12."""


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def _call_claude(user_prompt: str) -> dict:
    """Call Claude with the cached NCERT system prompt and parse JSON response."""
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_prompt}],
    )
    raw = response.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw
        raw = raw.rsplit("```", 1)[0] if "```" in raw else raw
    return json.loads(raw)


def generate_lesson_plan(subject: str, class_level: str, chapter: str, topic: str) -> dict:
    prompt = f"""Generate a detailed lesson plan for:
Subject: {subject}
Class: {class_level}
Chapter: {chapter}
Topic: {topic}

Return JSON with exactly these keys:
{{
  "overview": "2-3 paragraph lesson overview aligned with NCERT syllabus",
  "learning_outcomes": ["outcome 1", "outcome 2", "outcome 3", "outcome 4", "outcome 5"],
  "definitions": [
    {{"term": "term name", "definition": "clear definition"}},
    ...at least 4 definitions
  ],
  "formulae": ["formula 1 with description", "formula 2", ...],
  "summary_points": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}}

For subjects without formulae (e.g., History, English), return an empty list for formulae."""
    return _call_claude(prompt)


def generate_slides(subject: str, class_level: str, chapter: str, topic: str, num_slides: int) -> dict:
    prompt = f"""Generate {num_slides} presentation slides for:
Subject: {subject}
Class: {class_level}
Chapter: {chapter}
Topic: {topic}

Return JSON with exactly this structure:
{{
  "slides": [
    {{
      "slide_number": 1,
      "title": "slide title",
      "bullets": ["bullet point 1", "bullet point 2", "bullet point 3"],
      "key_terms": ["term1", "term2"],
      "example": "a concrete example or null"
    }},
    ...{num_slides} slides total
  ]
}}

Slide 1 should be a title/introduction slide. Last slide should be a summary/recap slide. Middle slides should cover key concepts progressively."""
    return _call_claude(prompt)


def resolve_doubt(subject: str, class_level: str, topic: str, question: str, language: str) -> dict:
    bilingual = language == "en+hi"
    prompt = f"""A student in {class_level} studying {subject} (topic: {topic}) has this doubt:
"{question}"

Provide a clear, simple explanation suitable for {class_level} students.

Return JSON with exactly these keys:
{{
  "explanation": "Clear English explanation in 2-3 paragraphs",
  {"\"explanation_hindi\": \"Same explanation in simple Hindi (Devanagari script)\"," if bilingual else "\"explanation_hindi\": null,"}
  "steps": ["step 1", "step 2", "step 3"],
  "example": "A concrete, relatable example from everyday life"
}}"""
    return _call_claude(prompt)


def generate_classwork(subject: str, class_level: str, chapter: str, topic: str,
                       num_mcq: int, num_oneliners: int, num_short: int) -> dict:
    prompt = f"""Generate classwork questions for:
Subject: {subject}
Class: {class_level}
Chapter: {chapter}
Topic: {topic}

Return JSON with exactly this structure:
{{
  "mcqs": [
    {{
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "answer": "A) correct option"
    }},
    ...{num_mcq} MCQs total
  ],
  "oneliners": [
    {{"question": "question", "answer": "one-line answer"}},
    ...{num_oneliners} questions total
  ],
  "short_qa": [
    {{"question": "question", "answer": "2-3 sentence answer"}},
    ...{num_short} questions total
  ]
}}

Align all questions with CBSE examination pattern for {class_level}."""
    return _call_claude(prompt)


def generate_homework(subject: str, class_level: str, chapter: str, topic: str,
                      difficulty: str, num_short: int, num_long: int) -> dict:
    difficulty_desc = {
        "easy": "straightforward recall and understanding",
        "moderate": "application and analysis level",
        "advanced": "higher-order thinking, application to new situations",
    }[difficulty]

    prompt = f"""Generate a homework sheet for:
Subject: {subject}
Class: {class_level}
Chapter: {chapter}
Topic: {topic}
Difficulty: {difficulty} ({difficulty_desc})

Return JSON with exactly this structure:
{{
  "header": {{
    "subject": "{subject}",
    "class_level": "{class_level}",
    "chapter": "{chapter}",
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "total_marks": 20
  }},
  "short_answers": [
    {{"question": "question text", "marks": 2, "answer": "model answer"}},
    ...{num_short} questions
  ],
  "long_answers": [
    {{"question": "question text", "marks": 4, "answer": "detailed model answer"}},
    ...{num_long} questions
  ]
}}

Mark distribution: short answers = 2 marks each, long answers = 4 marks each."""
    return _call_claude(prompt)


def generate_mindmap(subject: str, class_level: str, chapter: str, topic: str) -> dict:
    prompt = f"""Generate a mind map, flash cards, and important questions for:
Subject: {subject}
Class: {class_level}
Chapter: {chapter}
Topic: {topic}

Return JSON with exactly this structure:
{{
  "mind_map": {{
    "central_topic": "{topic}",
    "branches": [
      {{
        "name": "branch name",
        "sub_topics": ["subtopic 1", "subtopic 2", "subtopic 3"]
      }},
      ...4-6 branches
    ]
  }},
  "flash_cards": [
    {{"term": "key term", "definition": "clear concise definition"}},
    ...10-12 flash cards
  ],
  "pyq_questions": [
    {{
      "question": "important exam-style question",
      "marks": 3,
      "answer": "model answer",
      "type": "short/long/mcq"
    }},
    ...8-10 questions aligned with CBSE board exam pattern
  ]
}}"""
    return _call_claude(prompt)
