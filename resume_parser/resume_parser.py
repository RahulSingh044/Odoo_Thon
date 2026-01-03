import re
import pdfplumber
import docx
import pytesseract
from pdf2image import convert_from_path
import spacy

nlp = spacy.load("en_core_web_sm")

# -------------------------
# TEXT EXTRACTION
# -------------------------

def extract_text_pdf(path):
    text = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text.append(t)
    return "\n".join(text)


def extract_text_ocr(path):
    images = convert_from_path(path)
    return "\n".join(pytesseract.image_to_string(img) for img in images)


def extract_text_docx(path):
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def get_resume_text(path):
    if path.lower().endswith(".pdf"):
        text = extract_text_pdf(path)
        if len(text.split()) < 120:
            text = extract_text_ocr(path)
        return text
    elif path.lower().endswith(".docx"):
        return extract_text_docx(path)
    else:
        raise ValueError("Unsupported file type")

# -------------------------
# BASIC INFO
# -------------------------

def extract_email(text):
    m = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}", text)
    return m.group(0) if m else ""


def extract_phone(text):
    m = re.search(r"\+?\d[\d\s\-]{8,15}\d", text)
    return m.group(0) if m else ""


def extract_name(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    doc = nlp(lines[0])
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return lines[0]

# -------------------------
# ABOUT / SUMMARY
# -------------------------

def extract_about(text):
    pattern = r"(summary|profile|objective|about)\s*(.*?)(skills|experience|education|projects)"
    m = re.search(pattern, text, re.I | re.S)
    if m:
        return re.sub(r"\s+", " ", m.group(2)).strip()

    for line in text.split("\n"):
        if len(line.strip()) > 50:
            return line.strip()
    return ""

# -------------------------
# SKILLS
# -------------------------

def isolate_skills_section(text):
    pattern = r"skills\s*(.*?)(coding profiles|education|projects|certification)"
    m = re.search(pattern, text, re.I | re.S)
    return m.group(1) if m else text


def is_noise(s):
    s = s.lower()
    return (
        "http" in s or "www" in s or ".com" in s or
        "/" in s or "_" in s or
        s in {
            "tools", "platforms", "database", "databases",
            "basics", "profile", "profiles", "coding profiles",
            "languages"
        } or
        len(s) <= 2
    )


def extract_skills(text):
    skills_text = isolate_skills_section(text)
    skills_text = skills_text.replace("•", "\n")

    candidates = []

    # Line-based extraction
    for line in skills_text.split("\n"):
        line = line.strip()
        if ":" in line:
            line = line.split(":", 1)[1]

        for part in re.split(r",|/|&|\band\b", line):
            p = part.strip()
            if 2 <= len(p) <= 40:
                candidates.append(p)

    # NLP noun chunks (restricted)
    doc = nlp(skills_text[:1200])
    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()
        if 1 <= len(phrase.split()) <= 3:
            candidates.append(phrase)

    TECH_MAP = {
        "py": "Python",
        "js": "JavaScript",
        "cpp": "C++",
        "nodejs": "Node.js",
        "reactjs": "React",
        "ml": "Machine Learning",
        "ai": "Artificial Intelligence"
    }

    cleaned = []
    for c in candidates:
        key = c.lower().replace(".", "")
        cleaned.append(TECH_MAP.get(key, c))

    final, seen = [], set()
    for s in cleaned:
        k = s.lower()
        if k not in seen and not is_noise(s) and len(s.split()) <= 3:
            seen.add(k)
            final.append(s)

    return final

# -------------------------
# MAIN PARSER
# -------------------------

def parse_resume(path):
    raw = get_resume_text(path)
    text = re.sub(r"\s+", " ", raw)

    result = {
        "name": extract_name(raw),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "about": extract_about(text),
        "skills": extract_skills(text),
    }

    result["confidence_ok"] = (
        len(result["skills"]) >= 6
        and len(result["about"]) > 60
        and result["email"] != ""
    )

    return result
