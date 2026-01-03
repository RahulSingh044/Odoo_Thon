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
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text.strip()


def extract_text_ocr(path):
    images = convert_from_path(path)
    text = ""
    for img in images:
        text += pytesseract.image_to_string(img) + "\n"
    return text.strip()


def extract_text_docx(path):
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def get_resume_text(path):
    if path.lower().endswith(".pdf"):
        text = extract_text_pdf(path)
        if len(text) < 500:  # OCR fallback
            text = extract_text_ocr(path)
        return text
    elif path.lower().endswith(".docx"):
        return extract_text_docx(path)
    else:
        raise ValueError("Unsupported file type")

# -------------------------
# ABOUT
# -------------------------

def extract_about(text):
    pattern = r"(about|summary|profile|objective)\s*(.*?)(education|skills|projects|experience)"
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    if match:
        return re.sub(r"\s+", " ", match.group(2).strip())

    lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 40]
    return lines[0] if lines else ""

# -------------------------
# ROBUST SKILL EXTRACTION
# -------------------------

def extract_skills(text):
    # ----------------------------------
    # 0️⃣ Isolate Skills section FIRST
    # ----------------------------------
    skills_match = re.search(
        r"Skills\s*(.*?)\s*Projects",
        text,
        re.IGNORECASE | re.DOTALL
    )

    if skills_match:
        skills_text = skills_match.group(1)
    else:
        skills_text = text  # fallback (keep robustness)

    # IMPORTANT: preserve line structure for skills
    skills_text = skills_text.replace("•", "\n")

    candidates = []

    # ----------------------------------
    # Signal A: line & bullet parsing
    # ----------------------------------
    for line in skills_text.split("\n"):
        line = line.strip()
        if 3 <= len(line) <= 150:
            if ":" in line:
                line = line.split(":", 1)[1]

            for p in re.split(r",|/|&|\band\b", line):
                p = p.strip()
                if 2 <= len(p) <= 40:
                    candidates.append(p)

    # ----------------------------------
    # Signal B: sentence parsing (LIMITED)
    # ----------------------------------
    for sent in re.split(r"\.|\;", skills_text):
        sent = sent.strip()
        if 10 <= len(sent) <= 150:
            for p in re.split(r",|/|&|\band\b", sent):
                p = p.strip()
                if 2 <= len(p) <= 40:
                    candidates.append(p)

    # ----------------------------------
    # Signal C: NLP noun chunks (SKILLS ONLY)
    # ----------------------------------
    doc = nlp(skills_text)
    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()
        if 1 <= len(phrase.split()) <= 4 and 3 <= len(phrase) <= 40:
            candidates.append(phrase)

    # ----------------------------------
    # Normalization
    # ----------------------------------
    TECH_MAP = {
        "js": "JavaScript",
        "node": "Node.js",
        "nodejs": "Node.js",
        "reactjs": "React",
        "nextjs": "Next.js",
        "cpp": "C++",
        "py": "Python",
        "ml": "Machine Learning",
        "ai": "Artificial Intelligence"
    }

    normalized = []
    for c in candidates:
        key = c.lower().replace(".", "")
        normalized.append(TECH_MAP.get(key, c))

    # ----------------------------------
    # Filter noise (unchanged)
    # ----------------------------------
    blacklist_start = (
        "developed", "implemented", "designed",
        "built", "worked", "using", "with"
    )

    filtered = []
    for s in normalized:
        if (
            not s.lower().startswith(blacklist_start)
            and not s.isdigit()
            and len(s.split()) <= 4
        ):
            filtered.append(s)

    # ----------------------------------
    # Frequency-based reliability (ADJUSTED)
    # ----------------------------------
    freq = {}
    for s in filtered:
        k = s.lower()
        freq[k] = freq.get(k, 0) + 1

    final = []
    seen = set()
    for s in filtered:
        key = s.lower()

        # 🔥 CHANGE: skills from Skills section are trusted
        if key not in seen and (
            freq[key] >= 1 or any(c.isupper() for c in s)
        ):
            seen.add(key)
            final.append(s)

    return final


# -------------------------
# MAIN PARSER
# -------------------------

def parse_resume(path):
    text = get_resume_text(path)
    text = re.sub(r"\s+", " ", text)

    result = {
        "about": extract_about(text),
        "skills": extract_skills(text)
    }

    result["confidence_ok"] = (
        len(result["skills"]) >= 6 and len(result["about"]) > 60
    )

    return result
