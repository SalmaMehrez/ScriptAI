import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

print(f"DEBUG: Using key starting with {api_key[:8] if api_key else 'NONE'}")

genai.configure(api_key=api_key)

# The earlier list_models showed 'models/gemini-2.0-flash'
model_name = 'gemini-2.0-flash'

try:
    model = genai.GenerativeModel(model_name)
    print(f"Testing model: {model_name}")
    response = model.generate_content("Say 'The API is working'")
    print(f"SUCCESS! Response: {response.text}")
except Exception as e:
    print(f"FAILED with error: {type(e).__name__}: {e}")
    
    # Try with 'models/' prefix just in case
    try:
        model_full = genai.GenerativeModel('models/gemini-2.0-flash')
        print(f"Testing with full name: models/gemini-2.0-flash")
        response = model_full.generate_content("Say 'The API is working'")
        print(f"SUCCESS! Response: {response.text}")
    except Exception as e2:
        print(f"FAILED full name with error: {type(e2).__name__}: {e2}")
