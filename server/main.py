import os
import json
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="ScriptAI API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    subject: str
    goal: str
    platform: str
    duration: str
    style: str
    intensity: int
    emotions: list[str]
    audience_desc: str
    knowledge_level: str
    language_register: str
    audience_relation: str
    narrative_structure: str
    hook_type: str
    cta_primary: str
    cta_details: str
    keywords: list[str] = []
    to_avoid: list[str] = []
    style_reference: str = ""
    
    # New Tech Fields
    shoot_type: list[str] = []
    camera_count: str = ""
    shoot_location: str = ""
    edit_pace: str = ""
    transition_style: list[str] = []
    subtitle_style: str = ""
    audio_layers: list[str] = []
    music_management: str = ""
    screen_elements: list[str] = []
    stats_format: str = ""
    voice_type: str = ""
    acting_indications: str = ""
    pause_management: str = ""
    broll_source: str = ""
    broll_ratio: int = 30
    
    output_format: str
    mode: str = "full_script"

SYSTEM_PROMPT = """You are a senior production scriptwriter and technical director. You don't just write text; you design a complete audiovisual experience for a professional editor."""

MODE_PROMPTS = {
    "full_script": """Role: Senior Technical Scriptwriter.
Goal: Create a complete end-to-end production script with hooks, body, and CTA.
Instructions: Use technical markers ([AUDIO], [VISUAL], [SCREEN TEXT], [EDITOR NOTE]). Adapt sentence length to the chosen editing pace. All content must be in ENGLISH.""",

    "hooks_only": """Role: Viral Retention Specialist.
Goal: Generate 5 HIGH-RETENTION hooks for the given subject.
Instructions: For each hook, explain WHY it works (psychological trigger). Provide technical visual/audio instructions for the first 3 seconds of each hook. All content must be in ENGLISH.""",

    "rewriter": """Role: Script Optimizer.
Goal: Rewrite the provided text to make it more engaging, punchy, and professional.
Instructions: Maintain the original core message but improve flow, rhythm, and vocabulary. Respect the chosen technical specs. All content must be in ENGLISH.""",

    "adapter": """Role: Platform Conversion Expert.
Goal: Adapt an existing script/idea from one platform (e.g. YouTube) to another (e.g. TikTok/Shorts).
Instructions: Adjust the pace, hook strategy, and technical requirements for the new platform's constraints. All content must be in ENGLISH.""",

    "script_analysis": """Role: Script Doctor & Retention Analyst.
Goal: Analyze the provided script for weaknesses, pacing issues, and red flags that might lose viewers.
Instructions: Be brutally honest but constructive. Identify exactly where retention might drop. All content must be in ENGLISH.""",

    "shot_list": """Role: Director of Photography (DP) / Assistant Director.
Goal: Convert the script or video idea into a mandatory shooting list for the production team.
Instructions: Focus on efficiency. Group shots by type or gear needed. All content must be in ENGLISH.""",

    "reference_analyzer": """Role: Viral Reverse-Engineering Specialist.
Goal: Deconstruct the provided reference transcript to understand why it worked.
Instructions: Identify the hook DNA, the pacing shifts, and specific retention tricks used. All content must be in ENGLISH.""",

    "retention_predictor": """Role: Audience retention psychologist & Data Analyst.
Goal: Simulate how a viewer would react to the provided script and predict where they would stop watching.
Instructions: Provide a simulated retention curve and identify "leak points". All content must be in ENGLISH.""",

    "voice_clone": """Role: Master Linguistic Mimic.
Goal: Extract the exact editorial voice, vocabulary, and rhythm from the provided samples and apply it to the new topic.
Instructions: The result MUST feel like it was written by the same person who provided the samples. Maintain the same humor, sentence length, and unique quirks. All content must be in ENGLISH."""
}

TRANSITION_PROMPT = "Respond ONLY in valid JSON. No backticks. No markdown. Use professional technical terminology."

FORMAT_BLOCS = {
    "tableau_production": """Generate the script as a structured JSON table. Each row of the table is a time block with: start_timecode, end_timecode, spoken_text, visual_indication, edit_note, played_emotion. Calculate timecodes precisely according to speech rate (130 words per minute).
    Expected JSON: { "main_title": "...", "format": "production_table", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "table": [{ "start_timecode": "...", "end_timecode": "...", "spoken_text": "...", "visual_indication": "...", "edit_note": "...", "played_emotion": "..." }], "general_edit_notes": "..." }""",
    
    "storyboard": """Generate a textual storyboard scene by scene.
    Expected JSON: { "main_title": "...", "format": "storyboard", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "scenes": [{ "scene_number": 1, "scene_title": "...", "visual_composition": "...", "color_ambience": "...", "camera_movement": "...", "spoken_text": "...", "sound_effects": "...", "duration_seconds": 0 }] }""",
    
    "narratif": """Generate a fluid, continuous script ready to be read.
    Expected JSON: { "main_title": "...", "format": "narrative", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "hook": "...", "intro": "...", "parts": [{ "title": "...", "content": "..." }], "outro": "...", "cta": "...", "directing_notes": "..." }""",
    
    "checklist": """Generate a structured checklist of key points.
    Expected JSON: { "main_title": "...", "format": "checklist", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "hook_suggestion": "...", "sections": [{ "section_title": "...", "key_points": ["..."], "shooting_advice": "..." }], "cta": "..." }""",
    
    "technique_agence": """Generate an ultra-detailed production script.
    Expected JSON: { "main_title": "...", "format": "agency_technical", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "technical_brief": { "color_palette": "...", "sound_ambience": "...", "typography_style": "...", "screen_ratio": "..." }, "sequences": [{ "number": 1, "timecode": "...", "shot_type": "...", "camera_angle": "...", "movement": "...", "lighting": "...", "spoken_text": "...", "screen_subtitle": "...", "music": "...", "sound_effects": "...", "next_transition": "...", "technical_note": "..." }] }""",
    
    "prompt_ia": """Generate a set of ready-to-use AI prompts.
    Expected JSON: { "main_title": "...", "format": "ai_prompt", "total_duration": "...", "quality_score": 0-100, "alternative_titles": ["..."], "main_visual_prompt": "...", "scene_prompts": [{ "scene": 1, "description": "...", "image_prompt": "...", "video_prompt": "...", "audio_prompt": "...", "spoken_text": "..." }], "thumbnail_prompt": "...", "music_prompt": "..." }""",

    "critique_analyse": """Generate a high-level biological critique of the script.
    Expected JSON: { "main_title": "...", "format": "script_analysis", "quality_score": 0-100, "strengths": ["..."], "weaknesses": ["..."], "retention_risks": [{ "timecode": "...", "reason": "...", "fix": "..." }], "pacing_critique": "...", "improvement_plan": ["..."] }""",

    "shooting_schedule": """Generate a professional shot list for production.
    Expected JSON: { "main_title": "...", "format": "shot_list", "gear_needed": ["..."], "locations": ["..."], "shots": [{ "id": 1, "description": "...", "type": "...", "equipment": "...", "difficulty": "Low/Med/High", "priority": "Mandatory/Optional" }] }""",

    "analyse_reference": """Analyze a reference video/script to extract its viral DNA.
    Expected JSON: { "main_title": "...", "format": "reference_analysis", "structural_skeleton": [{ "part": "...", "duration_percent": "...", "purpose": "..." }], "pacing_map": "...", "hook_dna": "...", "key_retention_tricks": ["..."], "replication_guide": ["..."] }""",

    "simulation_retention": """Predict and simulate the retention curve of the script.
    Expected JSON: { "main_title": "...", "format": "retention_prediction", "global_score": 0-100, "drop_zones": [{ "timecode": "...", "danger_level": "Low/Med/High", "leak_reason": "...", "fix_instruction": "..." }], "engagement_peaks": [{ "timecode": "...", "reason": "..." }], "simulated_curve_data": [0, 100, 80, ...] }"""
}

def clean_json_response(text):
    # Remove markdown code blocks if present
    text = re.sub(r'```json\s*|\s*```', '', text)
    # Find the first { and last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

@app.post("/generate")
@limiter.limit("10/hour")
async def generate_script(req: GenerateRequest, request: Request):
    import time
    max_retries = 2
    
    # Liste élargie des modèles par ordre de préférence (Gemma est prioritaire car Gemini est bloqué ici)
    model_candidates = [
        'gemma-3-27b-it',
        'gemma-3-12b-it',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest'
    ]

    for attempt in range(max_retries + 1):
        try:
            # Rechargement forcé de la config
            load_dotenv(override=True)
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="GEMINI_API_KEY absente du fichier .env")

            genai.configure(api_key=api_key)
            
            # Paramètres de sécurité au minimum pour éviter les faux-positifs 429
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]

            format_instructions = FORMAT_BLOCS.get(req.output_format, FORMAT_BLOCS["tableau_production"])
            mode_instruction = MODE_PROMPTS.get(req.mode, MODE_PROMPTS["full_script"])
            
            user_prompt = f"{SYSTEM_PROMPT}\n\nCORE INSTRUCTIONS:\n{mode_instruction}\n\nPARAMETERS:\n{json.dumps(req.model_dump(), indent=2)}\n\nINSTRUCTIONS FORMAT:\n{format_instructions}\n\n{TRANSITION_PROMPT}"

            last_error = ""
            for model_name in model_candidates:
                try:
                    print(f"DEBUG: Tentative avec {model_name} (Essai {attempt+1}/{max_retries+1})")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(
                        user_prompt,
                        safety_settings=safety_settings
                    )
                    
                    if response and response.text:
                        print(f"DEBUG: Succès avec {model_name}")
                        return json.loads(clean_json_response(response.text))
                    else:
                        print(f"DEBUG: {model_name} a renvoyé une réponse vide.")
                except Exception as model_e:
                    last_error = str(model_e)
                    print(f"DEBUG: Échec {model_name}: {last_error}")
                    continue
            
            # Si on arrive ici, tous les modèles du candidat ont échoué
            if "429" in last_error and attempt < max_retries:
                print(f"DEBUG: Quota atteint. Attente avant retry...")
                time.sleep(3)
                continue
            
            raise Exception(last_error if last_error else "Aucun modèle disponible n'a répondu.")

        except Exception as e:
            if attempt == max_retries:
                error_msg = str(e)
                if "429" in error_msg:
                    error_msg = "Quota dépassé sur Google AI Studio. Essayez d'utiliser une clé API différente ou attendez quelques minutes."
                elif "403" in error_msg:
                    error_msg = "Accès refusé. Vérifiez votre région ou vos filtres de sécurité."
                
                print(f"CRITICAL ERROR: {error_msg}")
                raise HTTPException(status_code=500, detail=error_msg)
            time.sleep(1)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
