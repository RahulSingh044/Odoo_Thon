import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from werkzeug.utils import secure_filename

from resume_parser import parse_resume


UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = FastAPI(title="Resume Parser API")

def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@app.post("/parser")
async def parse_resume_api(resume: UploadFile = File(...)):
    if not allowed_file(resume.filename):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    filename = secure_filename(resume.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)

    with open(path, "wb") as f:
        f.write(await resume.read())

    try:
        result = parse_resume(path)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
