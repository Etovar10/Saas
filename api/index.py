from fastapi import FastAPI  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from openai import AzureOpenAI  # type: ignore
import os
from dotenv import load_dotenv

app = FastAPI()
load_dotenv(override=True)

endpoint = "https://genai-eus-catalyst.cognitiveservices.azure.com/"
api_key = os.getenv("AZURE_OPENAI_API_KEY")
model_name = "gpt-4.1-mini"
deployment = "gpt-4.1-mini"

subscription_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = "2025-01-01-preview"

@app.get("/api")
def idea():

    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=subscription_key,
    )
    prompt = [{"role": "user", "content": "Come up with a new business idea for AI Agents, formatted with headings, sub-headings and bullet points"}]
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