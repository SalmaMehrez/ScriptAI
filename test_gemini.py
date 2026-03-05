import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print(f"Testing API Key starting with: {api_key[:8]}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

try:
    response = model.generate_content("Hello, reply with 'OK' if you see this.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
