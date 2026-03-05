import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print(f"--- Models for key {api_key[:8]}... ---")
try:
    for m in genai.list_models():
        print(f"Name: {m.name}")
        print(f"Supports: {m.supported_generation_methods}")
        print(f"Description: {m.description}")
        print("-" * 20)
except Exception as e:
    print(f"Error listing models: {e}")
