import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT


BRAND_COLOR = colors.HexColor("#1B4F72")
ACCENT_COLOR = colors.HexColor("#2E86AB")
LIGHT_BG = colors.HexColor("#EBF5FB")


def _base_doc(buffer: io.BytesIO, title: str) -> SimpleDocTemplate:
    return SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=title,
    )


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=BRAND_COLOR,
        spaceAfter=6,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=BRAND_COLOR,
        spaceBefore=12,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "SubHeader",
        parent=styles["Heading3"],
        fontSize=11,
        textColor=ACCENT_COLOR,
        spaceBefore=8,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "Bullet2",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        leftIndent=15,
        spaceAfter=3,
    ))
    return styles


def generate_lesson_pdf(title: str, content: dict) -> bytes:
    buffer = io.BytesIO()
    doc = _base_doc(buffer, title)
    styles = _styles()
    story = []

    story.append(Paragraph(title, styles["CustomTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_COLOR))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Lesson Overview", styles["SectionHeader"]))
    story.append(Paragraph(content.get("overview", ""), styles["BodyText2"]))
    story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph("Learning Outcomes", styles["SectionHeader"]))
    for i, outcome in enumerate(content.get("learning_outcomes", []), 1):
        story.append(Paragraph(f"✓  {outcome}", styles["Bullet2"]))

    if content.get("definitions"):
        story.append(Paragraph("Key Definitions", styles["SectionHeader"]))
        for defn in content["definitions"]:
            story.append(Paragraph(
                f"<b>{defn.get('term', '')}:</b> {defn.get('definition', '')}",
                styles["BodyText2"]
            ))

    if content.get("formulae"):
        story.append(Paragraph("Important Formulae", styles["SectionHeader"]))
        for formula in content["formulae"]:
            story.append(Paragraph(f"▸  {formula}", styles["Bullet2"]))

    story.append(Paragraph("Summary Points", styles["SectionHeader"]))
    for point in content.get("summary_points", []):
        story.append(Paragraph(f"•  {point}", styles["Bullet2"]))

    doc.build(story)
    return buffer.getvalue()


def generate_classwork_pdf(title: str, content: dict) -> bytes:
    buffer = io.BytesIO()
    doc = _base_doc(buffer, title)
    styles = _styles()
    story = []

    story.append(Paragraph(title, styles["CustomTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_COLOR))
    story.append(Spacer(1, 0.3 * cm))

    if content.get("mcqs"):
        story.append(Paragraph("Section A: Multiple Choice Questions", styles["SectionHeader"]))
        for i, mcq in enumerate(content["mcqs"], 1):
            story.append(Paragraph(f"<b>Q{i}.</b> {mcq.get('question', '')}", styles["BodyText2"]))
            for opt in mcq.get("options", []):
                story.append(Paragraph(f"    {opt}", styles["Bullet2"]))
            story.append(Spacer(1, 0.1 * cm))

    if content.get("oneliners"):
        story.append(Paragraph("Section B: One-line Answers", styles["SectionHeader"]))
        for i, q in enumerate(content["oneliners"], 1):
            story.append(Paragraph(f"<b>Q{i}.</b> {q.get('question', '')}", styles["BodyText2"]))
            story.append(Paragraph(f"<b>Ans:</b> {q.get('answer', '')}", styles["Bullet2"]))
            story.append(Spacer(1, 0.1 * cm))

    if content.get("short_qa"):
        story.append(Paragraph("Section C: Short Answer Questions", styles["SectionHeader"]))
        for i, q in enumerate(content["short_qa"], 1):
            story.append(Paragraph(f"<b>Q{i}.</b> {q.get('question', '')}", styles["BodyText2"]))
            story.append(Paragraph(f"<b>Ans:</b> {q.get('answer', '')}", styles["Bullet2"]))
            story.append(Spacer(1, 0.1 * cm))

    doc.build(story)
    return buffer.getvalue()


def generate_homework_pdf(title: str, content: dict) -> bytes:
    buffer = io.BytesIO()
    doc = _base_doc(buffer, title)
    styles = _styles()
    story = []

    header = content.get("header", {})
    story.append(Paragraph("HOMEWORK ASSIGNMENT", styles["CustomTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_COLOR))
    story.append(Spacer(1, 0.2 * cm))

    meta_data = [
        ["Subject:", header.get("subject", ""), "Class:", header.get("class_level", "")],
        ["Chapter:", header.get("chapter", ""), "Topic:", header.get("topic", "")],
        ["Difficulty:", header.get("difficulty", "").title(), "Total Marks:", str(header.get("total_marks", 20))],
    ]
    meta_table = Table(meta_data, colWidths=[3 * cm, 6 * cm, 3 * cm, 5 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.4 * cm))

    if content.get("short_answers"):
        story.append(Paragraph("Section A: Short Answer Questions (2 marks each)", styles["SectionHeader"]))
        for i, q in enumerate(content["short_answers"], 1):
            story.append(Paragraph(
                f"<b>Q{i}.</b> {q.get('question', '')} <i>[{q.get('marks', 2)} marks]</i>",
                styles["BodyText2"]
            ))
            story.append(Paragraph(f"<b>Ans:</b> {q.get('answer', '')}", styles["Bullet2"]))
            story.append(Spacer(1, 0.15 * cm))

    if content.get("long_answers"):
        story.append(Paragraph("Section B: Long Answer Questions (4 marks each)", styles["SectionHeader"]))
        for i, q in enumerate(content["long_answers"], 1):
            story.append(Paragraph(
                f"<b>Q{i}.</b> {q.get('question', '')} <i>[{q.get('marks', 4)} marks]</i>",
                styles["BodyText2"]
            ))
            story.append(Paragraph(f"<b>Ans:</b> {q.get('answer', '')}", styles["Bullet2"]))
            story.append(Spacer(1, 0.15 * cm))

    doc.build(story)
    return buffer.getvalue()


def generate_mindmap_pdf(title: str, content: dict) -> bytes:
    buffer = io.BytesIO()
    doc = _base_doc(buffer, title)
    styles = _styles()
    story = []

    story.append(Paragraph(title, styles["CustomTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_COLOR))
    story.append(Spacer(1, 0.3 * cm))

    mind_map = content.get("mind_map", {})
    story.append(Paragraph("Mind Map", styles["SectionHeader"]))
    story.append(Paragraph(
        f"<b>Central Topic:</b> {mind_map.get('central_topic', '')}",
        styles["BodyText2"]
    ))
    for branch in mind_map.get("branches", []):
        story.append(Paragraph(f"◆ <b>{branch.get('name', '')}</b>", styles["SubHeader"]))
        for sub in branch.get("sub_topics", []):
            story.append(Paragraph(f"    → {sub}", styles["Bullet2"]))

    if content.get("flash_cards"):
        story.append(Paragraph("Flash Cards", styles["SectionHeader"]))
        card_data = [["Term", "Definition"]]
        for card in content["flash_cards"]:
            card_data.append([card.get("term", ""), card.get("definition", "")])
        card_table = Table(card_data, colWidths=[6 * cm, 11 * cm])
        card_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(card_table)

    if content.get("pyq_questions"):
        story.append(Paragraph("Important Questions (Board Exam Pattern)", styles["SectionHeader"]))
        for i, q in enumerate(content["pyq_questions"], 1):
            story.append(Paragraph(
                f"<b>Q{i}.</b> {q.get('question', '')} <i>[{q.get('marks', '')} marks]</i>",
                styles["BodyText2"]
            ))
            story.append(Paragraph(f"<b>Ans:</b> {q.get('answer', '')}", styles["Bullet2"]))
            story.append(Spacer(1, 0.1 * cm))

    doc.build(story)
    return buffer.getvalue()


def generate_generic_pdf(title: str, content: dict) -> bytes:
    """Fallback for slide notes export."""
    buffer = io.BytesIO()
    doc = _base_doc(buffer, title)
    styles = _styles()
    story = []

    story.append(Paragraph(title, styles["CustomTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_COLOR))
    story.append(Spacer(1, 0.3 * cm))

    for slide in content.get("slides", []):
        story.append(Paragraph(
            f"Slide {slide.get('slide_number', '')}: {slide.get('title', '')}",
            styles["SectionHeader"]
        ))
        for bullet in slide.get("bullets", []):
            story.append(Paragraph(f"• {bullet}", styles["Bullet2"]))
        if slide.get("key_terms"):
            story.append(Paragraph(
                f"<b>Key Terms:</b> {', '.join(slide['key_terms'])}",
                styles["BodyText2"]
            ))
        if slide.get("example"):
            story.append(Paragraph(f"<i>Example: {slide['example']}</i>", styles["BodyText2"]))
        story.append(Spacer(1, 0.2 * cm))

    doc.build(story)
    return buffer.getvalue()
