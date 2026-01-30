from fastapi import FastAPI, Depends  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from openai import AzureOpenAI  # type: ignore
from pydantic import BaseModel  # type: ignore
import os
from dotenv import load_dotenv
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
load_dotenv(override=True)

clerk_config = ClerkConfig(jwks_url = os.getenv("CLERK_JWKS_URL"))
clerk_guard =  ClerkHTTPBearer(clerk_config)

endpoint = "https://genai-eus-catalyst.cognitiveservices.azure.com/"
api_key = os.getenv("AZURE_OPENAI_API_KEY")
model_name = "gpt-4.1-mini"
deployment = "gpt-4.1-mini"

subscription_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = "2025-01-01-preview"


class Visit(BaseModel):
    patient_name: str
    date_of_visit: str
    notes: str

system_prompt = """
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarize the visit for the doctor and provide an email.
Reply with exactly three sections with the headings:
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
"""

def user_prompt_for(visit: Visit) -> str:
    return f"""Create the summary, next steps and draft email for:
Patient Name: {visit.patient_name}
Date of Visit: {visit.date_of_visit}
Notes:
{visit.notes}"""

@app.post("/api")
def consultation_summary(
    visit: Visit,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
    ):
    user_id = creds.decoded["sub"]  # User ID from JWT - available for future use
    # We now know which user is making the request! 
    # You could use user_id to:
    # - Track usage per user
    # - Store generated ideas in a database
    # - Apply user-specific limits or customization

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=subscription_key,
    )

    user_prompt= user_prompt_for(visit)

    prompt = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
        ]
    stream = client.chat.completions.create(model=deployment, messages=prompt, stream=True)
    
    def event_stream():
        for chunk in stream:
            choices = getattr(chunk, "choices", []) or []
            for choice in choices:
                delta = getattr(choice, "delta", None)
                text = getattr(delta, "content", None) if delta else None
                if not text:
                    continue

                if isinstance(text, list):
                    text = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in text)

                for line in str(text).split("\n"):
                    yield f"data: {line}\n"
                yield "\n"
        yield "data: [END]\n\n"
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")