from fastapi import FastAPI, HTTPException
import httpx
import os

app = FastAPI(title="Münchner Kindl AI Service")

OLLAMA_URL = os.getenv("OLLAMA_API_URL", "http://ollama:11434/api")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

@app.post("/analyze/barrel-history")
async def analyze_history(history_text: str):
    prompt = f"Analysiere die folgende Fasshistorie und fasse Auffälligkeiten zusammen:\n\n{history_text}"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OLLAMA_URL}/generate",
            json={
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "stream": False
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="AI Service unavailable")
        
        return response.json()

@app.get("/health")
def health():
    return {"status": "ok"}
