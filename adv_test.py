import os
import google.generativeai as genai
from dotenv import load_dotenv
import google.api_core.exceptions

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print(f"DEBUG: Key {api_key[:8]}...")

def test_model(name):
    try:
        print(f"Testing {name}...")
        model = genai.GenerativeModel(name)
        response = model.generate_content("Hi")
        print(f"SUCCESS: {response.text}")
        return True
    except Exception as e:
        print(f"ERROR {name}: {type(e).__name__}")
        print(f"Message: {e}")
        if hasattr(e, 'details'):
            print(f"Details: {e.details}")
        return False

models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
]

for m in models:
    if test_model(m):
        break
    print("-" * 10)
