import json
import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("Missing GROQ_API_KEY in backend/.env")

client = Groq(api_key=groq_api_key)

app = FastAPI(title="SongCheck API")

allowed_origins = [
    "http://localhost:3000",
    "https://song-check-project.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    songs: List[str]


class AnalyzeResponse(BaseModel):
    genre_dominant: str
    energy_score: int
    similar_artists: List[str]


@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "SongCheck API"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_music(payload: AnalyzeRequest):
    if not payload.songs:
        raise HTTPException(status_code=400, detail="The songs list cannot be empty.")

    prompt = f"""
You are a music analysis assistant.
Analyze this playlist:
{payload.songs}

Return ONLY valid JSON with this exact shape:
{{
  "genre_dominant": "string",
  "energy_score": 0-100 integer,
  "similar_artists": ["artist1", "artist2", "artist3"]
}}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.5,
            messages=[
                {
                    "role": "system",
                    "content": "You only return strict JSON without markdown.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        raw = completion.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        return AnalyzeResponse(
            genre_dominant=parsed["genre_dominant"],
            energy_score=max(0, min(100, int(parsed["energy_score"]))),
            similar_artists=list(parsed["similar_artists"])[:3],
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
