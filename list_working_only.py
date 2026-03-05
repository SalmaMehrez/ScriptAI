import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Searching for functional models...")
try:
    all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    working = []
    for m_name in all_models:
        try:
            model = genai.GenerativeModel(m_name)
            response = model.generate_content("Hi", request_options={'timeout': 5})
            if response.text:
                working.append(m_name)
                print(f"WORKING: {m_name}")
        except:
            continue
    print(f"\n--- ALL WORKING MODELS ---\n{working}")
except Exception as e:
    print(f"Error: {e}")
