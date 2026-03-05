from fpdf import FPDF
import os

class ScriptAIGuide(FPDF):
    def header(self):
        # Dark header background
        self.set_fill_color(10, 10, 15)  # Dark Background #0a0a0f
        self.rect(0, 0, 210, 50, 'F')
        
        # Logo placeholder / Icon
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(255, 170, 0)  # Amber #ffaa00
        self.set_xy(10, 15)
        self.cell(0, 10, 'ScriptAI', 0, 0, 'L')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(200, 200, 200)
        self.set_xy(10, 25)
        self.cell(0, 10, 'PRODUCTION SUITE 2.0', 0, 0, 'L')
        
        self.ln(25)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'ScriptAI - Professional User Guide - Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, label):
        self.set_font('Helvetica', 'B', 18)
        self.set_fill_color(255, 170, 0)
        self.set_text_color(0, 0, 0)
        self.cell(0, 12, f"  {label}", 0, 1, 'L', True)
        self.ln(5)

    def tool_box(self, name, desc, phase):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(255, 120, 0)
        self.cell(0, 8, f"- {name} ({phase})", 0, 1, 'L')
        self.set_font('Helvetica', '', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 5, desc)
        self.ln(3)

def generate_pdf(lang='fr'):
    pdf = ScriptAIGuide()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)
    
    if lang == 'fr':
        title = "GUIDE D'UTILISATION COMPLET"
        intro_text = "ScriptAI est une suite de production assistée par IA conçue pour les créateurs de contenu, monteurs et agences. Chaque outil est spécialisé pour une étape précise du workflow vidéo."
        tools_header = "LES 10 OUTILS DE PUISSANCE"
        output_name = "Guide_Utilisateur_ScriptAI_FR.pdf"
        
        tools = [
            ("Génération Complète", "Créez un script complet de A à Z avec texte, visuels et notes de montage. Idéal pour YouTube.", "Indispensable"),
            ("Générateur de Hooks", "Optimisez les 5 premières secondes pour maximiser le taux de rétention.", "Indispensable"),
            ("Réécrivain de Passage", "Collez un texte et demandez à l'IA de l'améliorer, de le raccourcir ou de changer le ton.", "Indispensable"),
            ("Calculateur de Durée", "Estimation précise du temps de parole basé sur le débit naturel.", "Indispensable"),
            ("Adaptateur Plateforme", "Transformez une vidéo YouTube en format vertical pour TikTok/Reels instantanément.", "Indispensable"),
            ("Analyse de Script", "Détecteur de faiblesses. Identifie les passages lents et propose des corrections techniques.", "Phase 2"),
            ("Liste de Tournage (Shot List)", "Convertit votre script en une liste de plans techniques pour le tournage.", "Phase 2"),
            ("Analyseur de Référence", "Analysez une vidéo virale existante pour extraire sa structure et son ADN de hook.", "Phase 3"),
            ("Prédicteur de Rétention", "Simulation IA de la courbe de rétention pour anticiper les décrochages du public.", "Phase 3"),
            ("Clone de Voix Éditoriale", "Mimétisme de votre style d'écriture unique basé sur vos textes précédents.", "Phase 3")
        ]
        lib_title = "BIBLIOTHÈQUE & HISTORIQUE"
        lib_desc = "Tous vos scripts sont sauvegardés localement sur votre navigateur. Vous pouvez les consulter, les copier ou les exporter en PDF à tout moment depuis le Dashboard."
    else:
        title = "COMPLETE USER GUIDE"
        intro_text = "ScriptAI is an AI-powered production suite designed for content creators, editors, and agencies. Each tool is specialized for a specific step in the video workflow."
        tools_header = " THE 10 POWER TOOLS"
        output_name = "ScriptAI_User_Guide_EN.pdf"
        
        tools = [
            ("Full Script Generation", "Create a full script from A to Z with text, visuals, and editing notes. Perfect for YouTube.", "Essential"),
            ("Hook Generator", "Optimize the first 5 seconds to maximize retention rates.", "Essential"),
            ("Script Rewriter", "Paste text and ask the AI to improve, shorten, or change its tone.", "Essential"),
            ("Duration Calculator", "Precise speaking time estimation based on natural flow.", "Essential"),
            ("Platform Adapter", "Transform a YouTube video into vertical format for TikTok/Reels instantly.", "Essential"),
            ("Script Analysis", "Weakness detector. Identifies slow segments and suggests technical fixes.", "Phase 2"),
            ("Shot List Generator", "Converts your script into a technical shot list for production.", "Phase 2"),
            ("Reference Analyzer", "Analyze a viral video to extract its structure and hook DNA.", "Phase 3"),
            ("Retention Predictor", "AI simulation of the retention curve to anticipate audience drop-offs.", "Phase 3"),
            ("Editorial Voice Clone", "Mimicry of your unique writing style based on your previous samples.", "Phase 3")
        ]
        lib_title = "LIBRARY & HISTORY"
        lib_desc = "All your scripts are saved locally in your browser. You can view, copy, or export them to PDF at any time from the Dashboard."

    # Body
    pdf.chapter_title(title)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(0, 7, intro_text)
    pdf.ln(10)

    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, tools_header, 0, 1, 'L')
    pdf.ln(2)

    for name, desc, phase in tools:
        pdf.tool_box(name, desc, phase)

    pdf.ln(5)
    pdf.chapter_title(lib_title)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(0, 7, lib_desc)

    output_path = f"e:/script_creation/server/static/{output_name}"
    pdf.output(output_path)
    print(f"Guide generated: {output_path}")

if __name__ == "__main__":
    generate_pdf('fr')
    generate_pdf('en')
