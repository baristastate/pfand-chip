from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import json

app = FastAPI(title="Münchner Kindl AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_API_URL", "http://ollama:11434/api")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

BOOKING_SYSTEM_PROMPT = """Du bist der freundliche Buchungsassistent der Münchner Brauerei.
Führe den Kunden auf Deutsch durch seine Buchungsanfrage für eine Führung oder Veranstaltung.
Sei kurz, herzlich und professionell. Helfe bei Fragen zu Datum, Personenanzahl, Paketen und Ablauf.
Antworte IMMER auf Deutsch. Wenn kein passendes Paket genannt wird, erkläre die verfügbaren Optionen."""


# ─── Bestehende Endpunkte ───────────────────────────────────────────

@app.post("/analyze/barrel-history")
async def analyze_history(history_text: str):
    prompt = f"Analysiere die folgende Fasshistorie und fasse Auffälligkeiten zusammen:\n\n{history_text}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OLLAMA_URL}/generate",
            json={"model": DEFAULT_MODEL, "prompt": prompt, "stream": False},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="AI Service unavailable")
        return response.json()


@app.get("/health")
def health():
    return {"status": "ok"}


# ─── Buchungs-Endpunkte ─────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class BookingChatRequest(BaseModel):
    messages: list[ChatMessage]
    packages: list[dict] | None = None


class ContractGenerateRequest(BaseModel):
    contact_name: str
    contact_email: str
    contact_phone: str | None = None
    company_name: str | None = None
    package_name: str
    event_type: str
    participant_count: int
    requested_date: str
    requested_time: str
    special_requirements: str | None = None
    total_price: float
    duration_minutes: int
    includes_catering: bool


@app.post("/booking/chat")
async def booking_chat(request: BookingChatRequest):
    """Streaming SSE Chat für den KI-Buchungsassistenten."""
    system_content = BOOKING_SYSTEM_PROMPT
    if request.packages:
        pkg_lines = []
        for p in request.packages:
            price = p.get("price_per_person") or p.get("price_flat") or 0
            unit = "€/Person" if p.get("price_per_person") else "€ pauschal"
            pkg_lines.append(f"- {p['name']}: {p.get('description', '')} ({price} {unit})")
        system_content += "\n\nVerfügbare Pakete:\n" + "\n".join(pkg_lines)

    ollama_messages = [{"role": "system", "content": system_content}]
    for msg in request.messages:
        ollama_messages.append({"role": msg.role, "content": msg.content})

    async def stream_response():
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_URL}/chat",
                    json={"model": DEFAULT_MODEL, "messages": ollama_messages, "stream": True},
                ) as response:
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield f"data: {json.dumps({'content': content})}\n\n"
                            if data.get("done"):
                                yield "data: [DONE]\n\n"
                        except json.JSONDecodeError:
                            pass
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/booking/generate-contract")
async def generate_contract(request: ContractGenerateRequest):
    """Generiert vollständigen deutschen Vertragstext via Ollama."""
    catering_text = "inklusive Brotzeit" if request.includes_catering else "ohne zusätzliche Verpflegung"
    phone_line = f"\nTelefon: {request.contact_phone}" if request.contact_phone else ""
    company_line = f"\nFirma/Organisation: {request.company_name}" if request.company_name else ""
    special_line = f"\nSonderwünsche: {request.special_requirements}" if request.special_requirements else ""

    event_type_labels = {
        "FUEHRUNG": "Brauerei-Führung",
        "PRIVATE_EVENT": "Private Veranstaltung",
        "TASTING": "Bier-Tasting",
    }
    event_label = event_type_labels.get(request.event_type, request.event_type)

    prompt = f"""Erstelle einen vollständigen, professionellen Buchungsvertrag auf Deutsch für eine Brauerei.
Verwende die folgende Struktur und fülle alle Details aus:

BUCHUNGSDETAILS:
Veranstaltungsart: {event_label}
Paket: {request.package_name}
Datum: {request.requested_date}
Uhrzeit: {request.requested_time} Uhr
Dauer: ca. {request.duration_minutes} Minuten
Personenanzahl: {request.participant_count} Personen
Leistungsumfang: {catering_text}
Gesamtpreis: {request.total_price:.2f} €

KONTAKTDATEN:
Name: {request.contact_name}
E-Mail: {request.contact_email}{phone_line}{company_line}{special_line}

Erstelle einen vollständigen Vertragstext mit folgenden Abschnitten:
§1 Vertragsparteien
§2 Buchungsgegenstand und Leistungsumfang
§3 Preis und Zahlungsbedingungen (50% Anzahlung bei Buchung, Rest 14 Tage vor Veranstaltung)
§4 Stornierungsbedingungen (bis 30 Tage vorher: kostenlos; bis 14 Tage: 50% Stornogebühr; danach: voller Betrag)
§5 Pflichten des Veranstalters
§6 Haftungsausschluss
§7 Datenschutz
§8 Schlussbestimmungen

Formuliere professionell und rechtssicher auf Deutsch."""

    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            f"{OLLAMA_URL}/generate",
            json={"model": DEFAULT_MODEL, "prompt": prompt, "stream": False},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="AI Service nicht verfügbar")

        result = response.json()
        contract_text = result.get("response", "")

        return {
            "contract_text": contract_text,
            "summary": {
                "package": request.package_name,
                "event_type": event_label,
                "date": request.requested_date,
                "time": request.requested_time,
                "participants": request.participant_count,
                "total_price": request.total_price,
                "contact_name": request.contact_name,
                "contact_email": request.contact_email,
            },
        }
