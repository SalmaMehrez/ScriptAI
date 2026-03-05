import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print(f"DEBUG: Key {api_key[:8]}...")

def find_and_test():
    try:
        models = genai.list_models()
        available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
        print(f"Available models for generation: {available_models}")
        
        # Try Flash models first
        flash_models = [m for m in available_models if 'flash' in m.lower()]
        others = [m for m in available_models if 'flash' not in m.lower()]
        
        for m_name in (flash_models + others):
            try:
                print(f"Testing {m_name}...")
                model = genai.GenerativeModel(m_name)
                response = model.generate_content("Say OK")
                print(f"SUCCESS with {m_name}: {response.text}")
                return m_name
            except Exception as e:
                print(f"FAILED {m_name}: {e}")
                continue
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    return None

find_and_test()
