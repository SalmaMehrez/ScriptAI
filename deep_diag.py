import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing with key prefix: {api_key[:8] if api_key else 'NONE'}")

genai.configure(api_key=api_key)

models_to_test = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-flash-latest',
    'gemini-pro'
]

results = {}

for m_name in models_to_test:
    try:
        print(f"Testing model: {m_name}")
        model = genai.GenerativeModel(m_name)
        response = model.generate_content("Say OK")
        results[m_name] = {"status": "SUCCESS", "response": response.text}
    except Exception as e:
        results[m_name] = {"status": "ERROR", "message": str(e)}

print("\n--- TEST RESULTS ---")
print(json.dumps(results, indent=2))

try:
    print("\n--- ALLOWED MODELS ---")
    for m in genai.list_models():
        print(f"{m.name} | Methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
