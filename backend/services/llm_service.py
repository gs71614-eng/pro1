import os
import json
import re
import httpx
import asyncio

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"

PROMPT_TEMPLATE = """
You are a strict negative-review classifier. Analyze the following mobile app review.

Review: "{text}"

Your task is to identify IF the review is Negative (contains a complaint, bug, failure, issue).
If the review is Positive, Neutral, or Emoji-only without a problem, MUST OUTPUT SEVERITY: "Discard"

If Negative, assign exactly ONE of these categories:
- Critical: crashes, data loss, payment failure, app unusable, security breach
- High: major feature broken, login failure, frequent errors
- Medium: UI/UX problems, slow performance, partial feature bugs
- Low: small bugs, cosmetic issues, minor functional complaints

Output STRICTLY as valid JSON in this exact structure:
{{
  "severity": "CategoryName or Discard",
  "reason": "short explanation"
}}
"""

async def classify_text(text: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(text=text.replace('"', "'"))
    
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}" if HF_API_KEY else "",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": prompt,
        "parameters": {
             "max_new_tokens": 100,
             "temperature": 0.1,
             "return_full_text": False
        }
    }

    try:
        if not HF_API_KEY:
            return dummy_classification(text)

        async with httpx.AsyncClient() as client:
            resp = await client.post(HF_MODEL_URL, headers=headers, json=payload, timeout=30.0)
            if resp.status_code != 200:
                print(f"HF API Error: {resp.text}")
                return dummy_classification(text)

            result = resp.json()
            generated_text = result[0].get("generated_text", "")
            
            match = re.search(r'\{[\s\S]*?\}', generated_text)
            if match:
                json_str = match.group(0)
                data = json.loads(json_str)
                sev = data.get("severity", "Discard")
                if sev not in ["Critical", "High", "Medium", "Low", "Discard"]:
                    sev = "Discard"
                return {
                    "severity": sev,
                    "reason": data.get("reason", "No reason extracted")
                }
            else:
                return dummy_classification(text)
    except Exception as e:
        print(f"Classification exception: {str(e)}")
        return dummy_classification(text)

def dummy_classification(text: str) -> dict:
    t = text.lower()
    if "good" in t or "great" in t or "love" in t or "nice" in t or "wow" in t:
        return {"severity": "Discard", "reason": "Positive feedback"}
    
    if "crash" in t or "open" in t or "payment" in t:
        return {"severity": "Critical", "reason": "Mentions critical failure."}
    elif "broken" in t or "login" in t:
        return {"severity": "High", "reason": "Mentions feature or login broken."}
    elif "slow" in t or "ui" in t or "lag" in t:
        return {"severity": "Medium", "reason": "Mentions performance/UI."}
    elif "bug" in t or "issue" in t:
        return {"severity": "Low", "reason": "Minor bug."}
    else:
        return {"severity": "Discard", "reason": "No actionable problem found."}

async def batch_classify(reviews: list[dict]) -> list[dict]:
    results = []
    # Process sequentially to avoid HF rate limits
    for idx, r in enumerate(reviews):
        c = await classify_text(r["content"])
        if c.get("severity") != "Discard":
            results.append({
                "id": r.get("id", str(idx)),
                "content": r["content"],
                "date": r.get("date"),
                "source": r.get("source"),
                "classification": c
            })
    return results
