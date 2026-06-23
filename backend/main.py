from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import io
from converter import cyrillic_to_tote, tote_to_cyrillic

app = FastAPI(title="KazScript API", version="1.0.0")

# CORS баптау
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kazscript.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FREE_SIZE = 500 * 1024  # 500 KB

@app.get("/")
def root():
    return {"message": "KazScript API жұмыс істеп тұр!", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/convert/txt")
async def convert_txt(
    file: UploadFile = File(...),
    direction: str = "cyr2tote"
):
    # Файл форматын тексеру
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Тек .txt файлдары қабылданады")

    # Файл көлемін тексеру
    contents = await file.read()
    if len(contents) > MAX_FREE_SIZE:
        raise HTTPException(status_code=400, detail="Файл көлемі 500 KB-тан аспауы керек")

    # Мәтінді оқу
    try:
        text = contents.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = contents.decode('cp1251')
        except:
            raise HTTPException(status_code=400, detail="Файл форматын оқу мүмкін емес")

    # Түрлендіру (алгоритм кейін қосылады)
    if direction == "cyr2tote":
        converted = cyrillic_to_tote(text)
    else:
        converted = tote_to_cyrillic(text)

    return PlainTextResponse(content=converted, media_type="text/plain; charset=utf-8")