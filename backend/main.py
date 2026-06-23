from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KazScript API", version="1.0.0")

# CORS баптау
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kazscript.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "KazScript API жұмыс істеп тұр!", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}