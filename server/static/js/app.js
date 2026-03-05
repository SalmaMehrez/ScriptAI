// ScriptAI - Core Application Logic
const FORMAT_BLOCS = {
    tableau_production: 'Production Table',
    storyboard: 'Visual Storyboard',
    narratif: 'Narrative Script',
    checklist: 'Editor Checklist',
    technique_agence: 'Agency Brief',
    prompt_ia: 'AI Remix Prompt',
    critique_analyse: 'Script Analysis',
    shooting_schedule: 'Shot List',
    reference_analysis: 'Reference Analysis',
    retention_prediction: 'Retention Predictor'
};

let app = null;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScriptAI();
    app.init();
    window.app = app;
});

class ScriptAI {
    constructor() {
        this.currentStep = 0; // 0 = Dashboard
        this.totalSteps = 7;
        this.currentMode = 'full_script';

        this.tools = {
            full_script: { name: 'Full Production Script', icon: 'zap', steps: 7, desc: 'Complete end-to-end technical script.' },
            hooks_only: { name: 'Viral Hooks Only', icon: 'anchor', steps: 3, desc: 'Generate 5 high-retention hooks.' },
            rewriter: { name: 'Script Rewriter', icon: 'refresh-cw', steps: 2, desc: 'Optimize your existing text.' },
            calculator: { name: 'Duration Calc', icon: 'clock', steps: 1, desc: 'Estimate speaking time.' },
            adapter: { name: 'Platform Adapter', icon: 'refresh-ccw', steps: 2, desc: 'Convert YT to TikTok/Reels.' },
            shot_list: { name: 'Shot List Gen', icon: 'camera', steps: 2, desc: 'Full technical shooting breakdown.' },
            reference_analyzer: { name: 'Reference Analyzer', icon: 'layers', steps: 2, desc: 'Reverse-engineer viral videos.' },
            retention_predictor: { name: 'Retention Predictor', icon: 'line-chart', steps: 2, desc: 'AI-simulated retention score.' },
            voice_clone: { name: 'Voice Clone', icon: 'mic-2', steps: 2, desc: 'Mimic any editorial style.' }
        };

        this.formData = {
            subject: '',
            goal: '',
            platform: 'YouTube',
            duration: '3-5 min',
            style: 'Educational',
            intensity: 3,
            emotions: [],
            audience_desc: '',
            knowledge_level: 'Beginner',
            language_register: 'Standard',
            audience_relation: 'Expert / Mentor',
            narrative_structure: 'Problem / Solution',
            hook_type: 'Intriguing question',
            cta_primary: 'Subscription',
            cta_details: '',
            special_instructions: '',
            keywords: [],
            to_avoid: [],
            style_reference: '',

            // BLOC A - Tournage
            shoot_type: [],
            camera_count: '1 seule caméra fixe',
            shoot_location: 'Studio / fond uni',

            // BLOC B - Montage
            edit_pace: '🎯 Medium',
            transition_style: ['✂️ Hard cut only'],
            subtitle_style: 'No subtitles',

            // BLOC C - Audio
            audio_layers: ['Voice + background music'],
            music_management: 'Constant music',

            // BLOC D - Graphiques
            screen_elements: [],
            stats_format: 'Spoken only',

            // BLOC E - Narration
            voice_type: 'Face camera',
            acting_indications: 'No',
            pause_management: 'No',

            // BLOC F - B-roll
            broll_source: 'I shoot my own B-roll',
            broll_ratio: 30, // 0 to 100

            output_format: 'tableau_production'
        };

        this.isGenerating = false;
        this.result = null;

        // Step definitions
        this.stepNames = [
            "Subject & Goal",
            "Style & Tone",
            "Audience",
            "Structure",
            "Advanced Keywords",
            "Technical Specs",
            "Output Format"
        ];
    }

    init() {
        this.renderStepper();
        this.renderStep();
        this.bindGlobalEvents();
    }

    renderStepper() {
        const stepper = document.getElementById('stepper');
        const stepName = document.getElementById('step-name');
        if (!stepper) return;

        if (this.currentStep === 0) {
            stepper.classList.add('hidden');
            stepName.innerText = "ScriptAI Dashboard";
            return;
        }

        stepper.classList.remove('hidden');
        stepper.innerHTML = '';
        const currentTool = this.tools[this.currentMode] || { steps: 7 };
        const totalSteps = currentTool.steps;

        for (let i = 1; i <= totalSteps; i++) {
            const dot = document.createElement('div');
            const state = i < this.currentStep ? 'completed' : (i === this.currentStep ? 'active' : '');
            dot.className = `w-10 h-1.5 rounded-full step-indicator ${state}`;
            stepper.appendChild(dot);
        }
        document.getElementById('step-name').innerText = `Step ${this.currentStep} — ${this.stepNames[this.currentStep - 1]}`;
    }

    bindGlobalEvents() {
        document.getElementById('btn-next').addEventListener('click', () => this.nextStep());
        document.getElementById('btn-prev').addEventListener('click', () => this.prevStep());
    }

    nextStep() {
        const currentTool = this.tools[this.currentMode] || { steps: 7 };
        if (this.currentStep < currentTool.steps) {
            this.currentStep++;
            this.renderStepper();
            this.renderStep();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (this.currentStep === currentTool.steps) {
            this.generateScript();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderStepper();
            this.renderStep();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    renderStep() {
        const container = document.getElementById('wizard-container');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const footer = document.getElementById('footer-actions');

        if (this.currentStep === 0) {
            footer.classList.add('hidden');
            container.innerHTML = this.getDashboardHTML();
            lucide.createIcons();
            return;
        }

        footer.classList.remove('hidden');
        // Transition Exit
        container.classList.add('step-exit');

        setTimeout(() => {
            const currentTool = this.tools[this.currentMode] || { steps: 7 };
            btnPrev.classList.toggle('hidden', this.currentStep === 1 || this.isGenerating);
            btnNext.innerText = this.currentStep === currentTool.steps ? 'Generate Result' : 'Next Step';

            container.innerHTML = this.getStepHTML(this.currentStep);
            container.classList.remove('step-exit');
            container.classList.add('animate-fade-up');

            this.bindStepEvents();
            lucide.createIcons();

            setTimeout(() => container.classList.remove('animate-fade-up'), 500);
        }, 300);
    }

    getStepHTML(step) {
        // Universal Formatting Helper
        if (this.currentMode === 'hooks_only' && step === 3) return this.getOutputFormatStepHTML();
        if (this.currentMode === 'rewriter' && step === 2) return this.getOutputFormatStepHTML();
        if (this.currentMode === 'adapter' && step === 2) return this.getOutputFormatStepHTML();
        if (this.currentMode === 'script_analysis' && step === 2) return this.getOutputFormatStepHTML();
        if (this.currentMode === 'shot_list' && step === 2) return this.getOutputFormatStepHTML();
        if (this.currentMode === 'calculator' && step === 1) return this.getCalculatorStepHTML();

        if (this.currentMode === 'full_script') {
            return this.getFullScriptStepHTML(step);
        } else if (this.currentMode === 'hooks_only') {
            return this.getHooksStepHTML(step);
        } else if (this.currentMode === 'rewriter') {
            return this.getRewriterStepHTML(step);
        } else if (this.currentMode === 'adapter') {
            return this.getAdapterStepHTML(step);
        } else if (this.currentMode === 'script_analysis') {
            return this.getAnalysisStepHTML(step);
        } else if (this.currentMode === 'shot_list') {
            return this.getShotListStepHTML(step);
        } else if (this.currentMode === 'reference_analyzer') {
            return this.getReferenceStepHTML(step);
        } else if (this.currentMode === 'retention_predictor') {
            return this.getRetentionStepHTML(step);
        } else if (this.currentMode === 'voice_clone') {
            return this.getVoiceCloneStepHTML(step);
        }
        return `<div>Step under construction</div>`;
    }

    getVoiceCloneStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Paste writing samples (min. 3 paragraphs)</label>
                <textarea id="audience_desc" class="input-modern h-64" placeholder="Paste your previous scripts or articles here to extract your style...">${this.formData.audience_desc}</textarea>
            </div>`;
        } else if (step === 2) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">What should I write in this style?</label>
                <textarea id="subject" class="input-modern h-32" placeholder="Describe the topic for the new script...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getReferenceStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Paste the Reference Script / Transcript</label>
                <textarea id="subject" class="input-modern h-64" placeholder="Paste a transcript of a video you want to emulate...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getRetentionStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Upload your script for retention simulation</label>
                <textarea id="subject" class="input-modern h-64" placeholder="Your current full script...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getAnalysisStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Paste the script to analyze</label>
                <textarea id="subject" class="input-modern h-64" placeholder="Your current draft...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getShotListStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">What is the video structure or script?</label>
                <textarea id="subject" class="input-modern h-64" placeholder="Paste your script or describe your video scenes...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getOutputFormatStepHTML() {
        return `
            <div class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Object.entries(FORMAT_BLOCS).map(([key, value]) => `
                        <div class="card-clickable ${this.formData.output_format === key ? 'active border-amber bg-amber/5' : ''}" onclick="app.updateField('output_format', '${key}')">
                            <div class="flex items-center gap-4">
                                <i data-lucide="${this.getFormatIcon(key)}" class="text-amber"></i>
                                <div>
                                    <h3 class="font-bold">${this.getFormatLabel(key)}</h3>
                                    <p class="text-xs text-white/40">${this.getFormatDesc(key)}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getHooksStepHTML(step) {
        switch (step) {
            case 1:
                return `
                <div class="space-y-8">
                    <div>
                        <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">What is your video about?</label>
                        <textarea id="subject" class="input-modern h-32" placeholder="Describe your topic or paste your partial script...">${this.formData.subject}</textarea>
                    </div>
                </div>`;
            case 2:
                return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Target Audience</label>
                        <input type="text" id="audience_desc" class="input-modern" value="${this.formData.audience_desc}" placeholder="E.g. Tech Entrepreneurs...">
                    </div>
                     <div>
                        <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Tone & Energy</label>
                        <select id="style" class="input-modern">
                            <option value="dynamic" ${this.formData.style === 'dynamic' ? 'selected' : ''}>Dynamic & Punchy</option>
                            <option value="storyteller" ${this.formData.style === 'storyteller' ? 'selected' : ''}>Storytelling</option>
                            <option value="academic" ${this.formData.style === 'academic' ? 'selected' : ''}>Educational</option>
                        </select>
                    </div>
                </div>`;
            default: return ``;
        }
    }

    getRewriterStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Paste the text to optimize</label>
                <textarea id="subject" class="input-modern h-64" placeholder="Your raw script or notes...">${this.formData.subject}</textarea>
            </div>`;
        }
        return ``;
    }

    getAdapterStepHTML(step) {
        if (step === 1) {
            return `
            <div class="space-y-8">
                <div>
                    <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Source Platform</label>
                    <select id="platform" class="input-modern">
                        <option value="YouTube">YouTube (Long)</option>
                        <option value="LinkedIn">LinkedIn Post</option>
                        <option value="Podcast">Podcast Transcript</option>
                    </select>
                </div>
                <div>
                    <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Content Source</label>
                    <textarea id="subject" class="input-modern h-32" placeholder="Paste your source text...">${this.formData.subject}</textarea>
                </div>
            </div>`;
        }
        return ``;
    }

    getCalculatorStepHTML() {
        const wordCount = (this.formData.subject || "").split(/\s+/).length;
        const durationSec = Math.round(wordCount / (130 / 60)); // 130 WPM
        return `
            <div class="space-y-8 text-center py-10">
                <div class="inline-block p-10 rounded-full bg-amber/10 border-4 border-amber/20 mb-6">
                    <span class="text-7xl font-bold font-syne text-amber">${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}</span>
                </div>
                <h2 class="text-3xl font-bold">Estimated Duration</h2>
                <p class="text-white/40 italic">Based on a natural speaking pace of 130 words per minute.</p>
                
                <div class="max-w-md mx-auto pt-8">
                    <label class="block text-white/40 text-xs font-bold uppercase tracking-widest mb-4 text-left">Update Word Count</label>
                    <textarea id="subject" class="input-modern h-32" placeholder="Paste text here...">${this.formData.subject}</textarea>
                </div>
            </div>
        `;
    }

    getFullScriptStepHTML(step) {
        switch (step) {
            case 1: return `
                <div class="space-y-8">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold mb-2">What is your <span class="text-amber">video subject</span>?</h2>
                        <p class="text-white/50 text-lg">Describe the main idea or the title of your project.</p>
                    </div>
                    
                    <div class="relative">
                        <textarea id="subject" placeholder="Ex: How to lose 5kg in 30 days without dieting..." class="h-40 text-xl font-medium resize-none">${this.formData.subject}</textarea>
                        <button class="btn-voice absolute bottom-4 right-4" onclick="app.startVoice('subject')">
                            <i data-lucide="mic"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <h4 class="col-span-full font-bold text-white/40 uppercase tracking-widest text-xs">Goal</h4>
                        ${['Inform / Educate', 'Entertain', 'Sell / Convince', 'Inspire / Motivate', 'Tell a Story'].map(item => `
                            <div class="card-clickable ${this.formData.goal === item ? 'selected' : ''}" onclick="app.handleInput('goal', '${item}')">
                                <span class="font-bold text-lg">${item}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <h4 class="w-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Platform</h4>
                        ${['YouTube long format', 'YouTube Shorts', 'TikTok', 'Instagram Reels', 'Podcast', 'Online Course'].map(item => `
                            <div class="pill ${this.formData.platform === item ? 'selected' : ''}" onclick="app.handleInput('platform', '${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <h4 class="w-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Target Duration</h4>
                        ${['15 to 30 seconds', '1 to 3 minutes', '5 to 10 minutes', '15 to 20 minutes', 'Over 30 minutes'].map(item => `
                            <div class="pill ${this.formData.duration === item ? 'selected' : ''}" onclick="app.handleInput('duration', '${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            case 2: return `
                <div class="space-y-8">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold mb-2">Define the <span class="text-amber">style</span> and energy</h2>
                        <p class="text-white/50 text-lg">The tone will bring your content to life.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${[
                    { id: 'Educational', icon: 'graduation-cap', desc: 'Clear, structured, pedagogical', ex: 'Today you will learn...' },
                    { id: 'Humorous', icon: 'laugh', desc: 'Light, punchy, with jokes', ex: 'Let\'s be honest, nobody reads...' },
                    { id: 'Narrative', icon: 'book-open', desc: 'Storytelling, emotional, immersive', ex: 'It was 3 AM when...' },
                    { id: 'Viral', icon: 'trending-up', desc: 'Strong hook, fast pace, percussive CTA', ex: '95% of people make this mistake...' },
                    { id: 'Professional', icon: 'briefcase', desc: 'Sober, credible, expert tone', ex: 'In this analysis, we will...' },
                    { id: 'Dramatic', icon: 'film', desc: 'Tension, suspense, cinematic', ex: 'Everything seemed normal that morning...' }
                ].map(s => `
                            <div class="card-clickable flex flex-col items-start gap-4 ${this.formData.style === s.id ? 'selected' : ''}" onclick="app.handleInput('style', '${s.id}')">
                                <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-amber">
                                    <i data-lucide="${s.icon}"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-xl">${s.id}</h3>
                                    <p class="text-white/40 text-sm mb-3">${s.desc}</p>
                                    <p class="text-amber/80 text-xs italic">"${s.ex}"</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="p-8 glass bg-white/5 space-y-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-sm uppercase tracking-widest text-white/40">Style Intensity</span>
                            <span class="bg-amber text-black px-2 py-0.5 rounded text-xs font-bold">${this.formData.intensity}/5</span>
                        </div>
                        <input type="range" id="intensity" min="1" max="5" value="${this.formData.intensity}" class="w-full accent-amber" onchange="app.handleInput('intensity', this.value)">
                        <div class="flex justify-between text-[10px] text-white/20 font-bold uppercase">
                            <span>Subtle</span>
                            <span>Balanced</span>
                            <span>Maxed Out</span>
                        </div>
                    </div>
                </div>
            `;
            // Cases for other steps will be added in segments to avoid overflow
            case 3: return `
                <div class="space-y-8">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold mb-2">Who is your <span class="text-amber">audience</span>?</h2>
                        <p class="text-white/50 text-lg">The more precise the description, the more effective the script.</p>
                    </div>

                    <div class="relative">
                        <h4 class="font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Audience Description</h4>
                        <textarea id="audience_desc" placeholder="Ex: Women 30-45 years old, active moms looking for quick solutions..." class="h-32 resize-none">${this.formData.audience_desc}</textarea>
                        <button class="btn-voice absolute bottom-4 right-4" onclick="app.startVoice('audience_desc')">
                            <i data-lucide="mic"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <h4 class="col-span-full font-bold text-white/40 uppercase tracking-widest text-xs">Knowledge Level</h4>
                        ${['Beginner', 'Intermediate', 'Expert'].map(item => `
                            <div class="card-clickable text-center ${this.formData.knowledge_level === item ? 'selected' : ''}" onclick="app.handleInput('knowledge_level', '${item}')">
                                <span class="font-bold">${item}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <h4 class="w-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Language Register</h4>
                        ${['Formal', 'Conversational', 'Casual'].map(item => `
                            <div class="pill ${this.formData.language_register === item ? 'selected' : ''}" onclick="app.handleInput('language_register', '${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <h4 class="w-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Narrative Stance</h4>
                        ${['Friend who shares', 'Expert who teaches', 'Someone who lived it', 'Coach who challenges'].map(item => `
                            <div class="pill ${this.formData.audience_relation === item ? 'selected' : ''}" onclick="app.handleInput('audience_relation', '${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            case 4: return `
                <div class="space-y-8">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold mb-2">What <span class="text-amber">narrative structure</span>?</h2>
                        <p class="text-white/50 text-lg">Choose the skeleton of your story.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${[
                    'Hook + Development + CTA',
                    'Problem → Agitation → Solution (PAS)',
                    'Before → During → After',
                    'Top N Numbered Points',
                    'Free Structure (AI decides)'
                ].map(item => `
                            <div class="card-clickable ${this.formData.narrative_structure === item ? 'selected' : ''}" onclick="app.handleInput('narrative_structure', '${item}')">
                                <span class="font-bold">${item}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <h4 class="w-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Hook Type</h4>
                        ${['Provocative question', 'Shocking statistic', 'Bold statement', 'Story start', 'AI chooses'].map(item => `
                            <div class="pill ${this.formData.hook_type === item ? 'selected' : ''}" onclick="app.handleInput('hook_type', '${item}')">
                                ${item}
                            </div>
                        `).join('')}
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-bold text-white/40 uppercase tracking-widest text-xs">Call to Action (CTA)</h4>
                        <div class="flex flex-wrap gap-2">
                            ${['Subscribe', 'Buy a product', 'Visit a link', 'Comment'].map(item => `
                                <div class="pill ${this.formData.cta_primary === item ? 'selected' : ''}" onclick="app.handleInput('cta_primary', '${item}')">
                                    ${item}
                                </div>
                            `).join('')}
                        </div>
                        <input type="text" id="cta_details" placeholder="CTA details (ex: link to my course, promo code...)" value="${this.formData.cta_details}" oninput="app.formData.cta_details = this.value">
                    </div>
                </div>
            `;
            case 5: return `
                <div class="space-y-8">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold mb-2"><span class="text-amber">Advanced</span> settings</h2>
                        <p class="text-white/50 text-lg">Fine-tune the details for a perfect result.</p>
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-bold text-white/40 uppercase tracking-widest text-xs">Mandatory Keywords</h4>
                        <input type="text" id="keywords_input" placeholder="Type your keywords (use commas to separate)" value="${this.formData.keywords.join(', ')}">
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-bold text-white/40 uppercase tracking-widest text-xs">Elements to Avoid</h4>
                        <div class="flex flex-wrap gap-2">
                            ${['No humor', 'No numbers', 'No jargon', 'No English terms'].map(item => `
                                <div class="pill ${this.formData.to_avoid.includes(item) ? 'selected' : ''}" onclick="app.toggleMultiSelect('to_avoid', '${item}')">
                                    ${item}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-bold text-white/40 uppercase tracking-widest text-xs">Style Reference</h4>
                        <div class="flex flex-wrap gap-2">
                            ${['MrBeast', 'TED Talk', 'Arte', 'Gary Vee'].map(item => `
                                <div class="pill ${this.formData.style_reference === item ? 'selected' : ''}" onclick="app.handleInput('style_reference', '${item}')">
                                    ${item}
                                </div>
                            `).join('')}
                        </div>
                        <input type="text" placeholder="Or describe your own style..." value="${this.formData.style_reference}" oninput="app.formData.style_reference = this.value">
                    </div>
                </div>
            `;
            case 6:
                return `
                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header>
                            <h2 class="text-3xl font-bold font-syne mb-2">Technical Specifications</h2>
                            <p class="text-white/60">Configure your video's production DNA for your editor.</p>
                        </header>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- BLOCK A - SHOOTING -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="camera" class="w-4 h-4"></i> BLOCK A — SHOOTING
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Shoot Type</label>
                                        <div class="flex flex-wrap gap-2">
                                            ${['🎥 Face camera', '🖥️ Screen recording', '🌍 B-roll', '📱 Vertical'].map(type => `
                                                <button onclick="app.toggleMultiSelect('shoot_type', '${type}')" 
                                                        class="px-3 py-1.5 rounded-lg text-xs border transition-all ${this.formData.shoot_type.includes(type) ? 'bg-amber border-amber text-black font-bold' : 'border-white/10 hover:border-amber/50'}">
                                                    ${type}
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Camera Angles</label>
                                        <select onchange="app.handleInput('camera_count', this.value)" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-amber outline-none transition-all">
                                            ${['Single fixed camera', '2 angles', '3+ angles', 'Drone / Aerial'].map(v => `<option label="${v}" value="${v}" ${this.formData.camera_count === v ? 'selected' : ''}></option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- BLOCK B - EDITING -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="scissors" class="w-4 h-4"></i> BLOCK B — EDITING
                                </h3>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Editing Pace</label>
                                    <select onchange="app.handleInput('edit_pace', this.value)" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-amber outline-none transition-all">
                                        ${['⚡ Ultra fast', '🔥 Fast', '🎯 Medium', '🎬 Slow'].map(v => `<option label="${v}" value="${v}" ${this.formData.edit_pace === v ? 'selected' : ''}></option>`).join('')}
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium mb-2">Subtitle Style</label>
                                    <select onchange="app.handleInput('subtitle_style', this.value)" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-amber outline-none transition-all">
                                        ${['None', 'Discreet (bottom)', 'Animated (TikTok)', 'Hormozi Style', 'Karaoke'].map(v => `<option label="${v}" value="${v}" ${this.formData.subtitle_style === v ? 'selected' : ''}></option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <!-- BLOCK C - AUDIO -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="music" class="w-4 h-4"></i> BLOCK C — AUDIO
                                </h3>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Audio Layers</label>
                                    <div class="flex flex-wrap gap-2">
                                        ${['Voice only', 'Voice + Music', 'Voice + Music + SFX'].map(type => `
                                            <button onclick="app.toggleMultiSelect('audio_layers', '${type}')" 
                                                    class="px-3 py-1.5 rounded-lg text-xs border transition-all ${this.formData.audio_layers.includes(type) ? 'bg-amber border-amber text-black font-bold' : 'border-white/10 hover:border-amber/50'}">
                                                ${type}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Music</label>
                                    <select onchange="app.handleInput('music_management', this.value)" class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-amber outline-none transition-all">
                                        ${['Constant', 'Intro/Outro', 'Key moments', 'Ducking Management'].map(v => `<option label="${v}" value="${v}" ${this.formData.music_management === v ? 'selected' : ''}></option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <!-- BLOCK D - GRAPHICS -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="bar-chart-3" class="w-4 h-4"></i> BLOCK D — GRAPHICS
                                </h3>
                                <div>
                                    <label class="block text-sm font-medium mb-2">On-screen Elements</label>
                                    <div class="flex flex-wrap gap-2">
                                        ${['Titles', 'Stats', 'Callouts', 'Images', 'Background Noise'].map(type => `
                                            <button onclick="app.toggleMultiSelect('screen_elements', '${type}')" 
                                                    class="px-3 py-1.5 rounded-lg text-xs border transition-all ${this.formData.screen_elements.includes(type) ? 'bg-amber border-amber text-black font-bold' : 'border-white/10 hover:border-amber/50'}">
                                                ${type}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- BLOCK E - NARRATION -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="message-square" class="w-4 h-4"></i> BLOCK E — NARRATION
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Acting indications</label>
                                        <button onclick="app.handleInput('acting_indications', this.innerText === 'YES' ? 'No' : 'YES')" 
                                                class="w-full py-2 rounded-xl border transition-all ${this.formData.acting_indications === 'YES' ? 'bg-amber border-amber text-black font-bold' : 'border-white/10'}">
                                            ${this.formData.acting_indications}
                                        </button>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Pauses/Breathing</label>
                                        <button onclick="app.handleInput('pause_management', this.innerText === 'YES' ? 'No' : 'YES')" 
                                                class="w-full py-2 rounded-xl border transition-all ${this.formData.pause_management === 'YES' ? 'bg-amber border-amber text-black font-bold' : 'border-white/10'}">
                                            ${this.formData.pause_management}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- BLOCK F - B-ROLL -->
                            <div class="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <h3 class="text-amber font-bold flex items-center gap-2">
                                    <i data-lucide="layers" class="w-4 h-4"></i> BLOCK F — B-ROLL
                                </h3>
                                <div>
                                    <label class="block text-sm font-medium mb-1 flex justify-between">
                                        <span>Face Cam</span>
                                        <span class="text-amber">${this.formData.broll_ratio}% B-Roll</span>
                                    </label>
                                    <input type="range" min="0" max="100" value="${this.formData.broll_ratio}" 
                                           oninput="app.handleInput('broll_ratio', this.value)"
                                           class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber">
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 7:
                return `
                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header>
                            <h2 class="text-3xl font-bold font-syne mb-2">Output Format</h2>
                            <p class="text-white/60">How would you like to receive your script?</p>
                        </header>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${Object.entries(FORMAT_BLOCS).map(([key, label]) => `
                                <button onclick="app.handleInput('output_format', '${key}')"
                                    class="group p-6 rounded-2xl border-2 text-left transition-all ${this.formData.output_format === key ? 'border-amber bg-white/5' : 'border-white/5 hover:border-white/20 bg-black/40'}">
                                    <div class="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <i data-lucide="${this.getFormatIcon(key)}" class="w-6 h-6 text-amber"></i>
                                    </div>
                                    <h3 class="text-lg font-bold mb-2">${this.getFormatLabel(key)}</h3>
                                    <p class="text-xs text-white/40 leading-relaxed">${this.getFormatDesc(key)}</p>
                                    <div class="mt-4 flex items-center justify-end">
                                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${this.formData.output_format === key ? 'border-amber bg-amber' : 'border-white/20'}">
                                            ${this.formData.output_format === key ? '<i data-lucide="check" class="w-4 h-4 text-black"></i>' : ''}
                                        </div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;

            default: return `<div class="p-20 text-center"><h2 class="text-2xl opacity-20">Étape en cours de construction...</h2></div>`;
        }
    }

    bindStepEvents() {
        if (this.currentStep === 1) {
            const subject = document.getElementById('subject');
            if (subject) subject.addEventListener('input', (e) => this.formData.subject = e.target.value);
        }
        if (this.currentStep === 3) {
            const desc = document.getElementById('audience_desc');
            if (desc) desc.addEventListener('input', (e) => this.formData.audience_desc = e.target.value);
        }
        if (this.currentStep === 5) {
            const keys = document.getElementById('keywords_input');
            if (keys) keys.addEventListener('input', (e) => this.formData.keywords = e.target.value.split(',').map(s => s.trim()));
        }
    }

    handleInput(field, value) {
        this.formData[field] = value;
        this.renderStep();
    }

    toggleMultiSelect(field, value) {
        const index = this.formData[field].indexOf(value);
        if (index === -1) {
            this.formData[field].push(value);
        } else {
            this.formData[field].splice(index, 1);
        }
        this.renderStep();
    }

    getFormatIcon(key) {
        const icons = {
            tableau_production: 'layout',
            storyboard: 'image',
            narratif: 'book',
            checklist: 'check-square',
            technique_agence: 'clapperboard',
            prompt_ia: 'bot',
            critique_analyse: 'search',
            shooting_schedule: 'camera'
        };
        return icons[key] || 'file-text';
    }

    getFormatLabel(key) {
        const labels = {
            tableau_production: 'Production Table',
            storyboard: 'Visual Storyboard',
            narratif: 'Narrative Script',
            checklist: 'Editor Checklist',
            technique_agence: 'Agency Brief',
            prompt_ia: 'AI Remix Prompt',
            critique_analyse: 'Script Critique',
            shooting_schedule: 'Shot List'
        };
        return labels[key] || key;
    }

    getFormatDesc(key) {
        const descs = {
            tableau_production: 'Standard pro format with timecodes.',
            storyboard: 'Ideal for creative editing.',
            narratif: 'Fluid and continuous text.',
            checklist: 'Essential key points.',
            technique_agence: 'Ultra-detailed (shots, sounds).',
            prompt_ia: 'Assets for Midjourney/Sora.',
            critique_analyse: 'Deep heatmap of red flags.',
            shooting_schedule: 'Optimized camera schedule.'
        };
        return descs[key] || '';
    }

    updateField(field, value) {
        this.formData[field] = value;
        this.renderStep();
    }

    startVoice(fieldId) {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice recognition is not supported by your browser.");
            return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        const btn = document.querySelector('.btn-voice');
        btn.classList.add('listening');

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = text;
                this.formData[fieldId] = text;
            }
            btn.classList.remove('listening');
        };

        recognition.onerror = () => btn.classList.remove('listening');
    }

    async generateScript() {
        if (this.isGenerating) return;
        this.isGenerating = true;
        this.renderLoading();

        try {
            const payload = {
                ...this.formData,
                mode: this.currentMode
            };

            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Server Error");
            }

            this.result = await response.json();
            this.saveToLibrary();
            this.renderResult();
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
            this.isGenerating = false;
            this.renderStep();
        }
    }

    renderLoading() {
        const container = document.getElementById('wizard-container');
        const footer = document.getElementById('footer-actions');
        footer.classList.add('hidden');

        const tips = [
            "Analyzing your target audience...",
            "Crafting a hook that sticks...",
            "Structuring the narrative flow...",
            "Optimizing for English speakers...",
            "Adding professional B-roll markers...",
            "Fine-tuning the technical specs...",
            "Polishing the calls to action..."
        ];

        let currentTip = 0;
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
                <div class="relative w-24 h-24 mb-10">
                    <div class="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-t-amber rounded-full animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <i data-lucide="sparkles" class="text-amber animate-pulse"></i>
                    </div>
                </div>
                <h2 class="text-3xl font-bold font-syne mb-6">Creating your masterpiece...</h2>
                <div class="h-8 mb-4 overflow-hidden">
                    <p id="loading-tip" class="text-amber font-medium text-lg italic animate-tip">
                        ${tips[0]}
                    </p>
                </div>
                <p class="text-white/40 max-w-sm">Gemini is synthesizing your choices to write a high-impact script in ${this.getFormatLabel(this.formData.output_format)} format.</p>
            </div>
        `;
        lucide.createIcons();

        this.loadingInterval = setInterval(() => {
            currentTip = (currentTip + 1) % tips.length;
            const tipEl = document.getElementById('loading-tip');
            if (tipEl) tipEl.innerText = tips[currentTip];
        }, 3000);
    }

    renderResult() {
        const container = document.getElementById('wizard-container');
        const footer = document.getElementById('footer-actions');
        footer.classList.remove('hidden');
        if (!this.result) {
            container.innerHTML = `<div class="p-10 text-center glass border-red-500/20 text-red-400">Error: No result generated. Please try again.</div>`;
            return;
        }
        footer.classList.remove('hidden');
        footer.innerHTML = `
            <button onclick="location.reload()" class="btn-secondary">Start Over</button>
            <div class="flex gap-4">
                <button onclick="app.copyToClipboard()" class="btn-secondary flex items-center gap-2">
                    <i data-lucide="copy"></i> Copy JSON
                </button>
                <button onclick="app.exportPDF()" class="btn-primary flex items-center gap-2">
                    <i data-lucide="download"></i> Export PDF
                </button>
            </div>
        `;

        let resultHTML = `
            <div class="space-y-8 animate-fade-up">
                <div class="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 class="text-5xl font-bold mb-2">${this.result.titre_principal}</h1>
                        <div class="flex gap-4">
                            <span class="bg-amber/10 text-amber text-xs font-bold px-3 py-1 rounded-full border border-amber/20">Durée: ${this.result.duree_totale}</span>
                            <span class="bg-white/10 text-white/60 text-xs font-bold px-3 py-1 rounded-full border border-white/5">Score Qualité: ${this.result.score_qualite}/100</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <h4 class="col-span-full font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Titres Alternatifs</h4>
                    ${(this.result.titres_alternatifs || []).map(t => `<div class="p-3 glass bg-white/5 rounded-lg text-sm cursor-pointer hover:border-amber/50 border border-transparent transition-all" onclick="navigator.clipboard.writeText('${t.replace(/'/g, "\\'")}')">${t}</div>`).join('')}
                </div>
        `;

        // Format specific rendering
        if (this.result.format === 'tableau_production') {
            resultHTML += `
                <div class="glass overflow-hidden">
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th class="w-24">⏱ Temps</th>
                                <th>🎤 Texte parlé</th>
                                <th class="hidden lg:table-cell">🎥 Visuel</th>
                                <th class="hidden md:table-cell">✂️ Montage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(this.result.tableau || []).map(row => `
                                <tr>
                                    <td class="font-mono text-xs text-amber">${row.timecode_debut} - ${row.timecode_fin}</td>
                                    <td class="text-lg leading-relaxed">${row.texte_parle}</td>
                                    <td class="hidden lg:table-cell text-xs text-white/50 italic">${row.indication_visuelle}</td>
                                    <td class="hidden md:table-cell text-xs text-white/40">${row.note_montage}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (this.result.format === 'storyboard') {
            resultHTML += `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${(this.result.scenes || []).map(s => `
                        <div class="glass p-6 space-y-4 border-l-4 border-amber">
                            <div class="flex justify-between items-center">
                                <span class="bg-amber text-black px-2 py-0.5 rounded text-xs font-bold">SCÈNE ${s.numero_scene}</span>
                                <span class="text-white/40 text-xs font-mono">${s.duree_secondes}s</span>
                            </div>
                            <h3 class="font-bold text-xl">${s.titre_scene}</h3>
                            <div class="bg-black/40 p-3 rounded text-sm text-white/60 border border-white/5">
                                <p class="mb-1"><strong class="text-amber/80 text-[10px] uppercase">Visuel:</strong> ${s.composition_visuelle}</p>
                                <p><strong class="text-amber/80 text-[10px] uppercase">Caméra:</strong> ${s.mouvement_camera}</p>
                            </div>
                            <p class="text-lg italic">"${s.texte_parle}"</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (this.result.format === 'narratif') {
            resultHTML += `
                <div class="space-y-12 max-w-3xl mx-auto">
                    <div class="p-6 border-l-2 border-amber bg-amber/5 rounded-r-xl">
                        <span class="text-amber text-[10px] font-bold uppercase tracking-widest">Hook Immédiat</span>
                        <p class="text-2xl font-bold mt-2">${this.result.hook}</p>
                    </div>
                    ${(this.result.parties || []).map(p => `
                        <div class="space-y-4">
                            <h3 class="text-amber font-syne text-xl uppercase tracking-tighter">${p.titre}</h3>
                            <p class="text-xl leading-relaxed text-white/80">${p.contenu}</p>
                        </div>
                    `).join('')}
                    <div class="pt-8 border-t border-white/10">
                         <span class="text-white/40 text-[10px] font-bold uppercase tracking-widest">Call to Action</span>
                         <p class="text-xl font-bold mt-1">${this.result.cta}</p>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'checklist') {
            resultHTML += `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${(this.result.items || []).map(item => `
                            <div class="glass p-5 flex items-start gap-4 hover:border-amber/30 transition-all border border-transparent">
                                <div class="w-6 h-6 rounded border-2 border-amber/30 flex-shrink-0 mt-1"></div>
                                <div>
                                    <p class="text-xl font-medium mb-2">${item.tache}</p>
                                    <span class="text-[10px] font-bold uppercase tracking-widest ${item.importance === 'CRITICAL' ? 'text-red-500' : 'text-amber/60'}">${item.importance}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (this.result.format === 'technique_agence') {
            resultHTML += `
                <div class="space-y-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="glass p-6 border-t-2 border-amber">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-amber mb-4">Artistic Direction</h3>
                            <div class="space-y-3">
                                <p class="text-sm"><strong class="text-white/40">Visual:</strong> ${this.result.direction_artistique.visuel}</p>
                                <p class="text-sm"><strong class="text-white/40">Audio:</strong> ${this.result.direction_artistique.sonore}</p>
                                <p class="text-sm"><strong class="text-white/40">Pace:</strong> ${this.result.direction_artistique.rythme}</p>
                            </div>
                        </div>
                        <div class="glass p-6">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-amber mb-4">Campaign Strategy</h3>
                            <p class="text-sm mb-2"><strong class="text-white/40">Objective:</strong> ${this.result.objectif_campagne}</p>
                            <p class="text-sm italic text-white/60">"${this.result.angle_editorial}"</p>
                        </div>
                    </div>
                    
                    <div class="glass overflow-hidden">
                        <table class="result-table">
                            <thead>
                                <tr>
                                    <th class="w-16">ID</th>
                                    <th>Shot / Action</th>
                                    <th>Dialogue</th>
                                    <th>SFX/Audio</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(this.result.script_detaille || []).map(row => `
                                    <tr>
                                        <td class="text-[10px] font-mono text-amber">#${row.id} <br/> <span class="text-white/20">${row.duree}</span></td>
                                        <td class="text-sm font-medium">${row.description}</td>
                                        <td class="text-md italic text-white/80">"${row.dialogue}"</td>
                                        <td class="text-xs text-amber/60">${row.sfx}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'script_analysis') {
            resultHTML += `
                <div class="space-y-8 max-w-4xl mx-auto">
                    <!-- Strengths & Weaknesses -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 glass border-l-4 border-green-500 bg-green-500/5">
                            <h3 class="text-green-500 font-bold uppercase text-xs mb-4">Strengths</h3>
                            <ul class="space-y-2">
                                ${(this.result.strengths || []).map(s => `<li class="text-sm flex gap-2"><span>✅</span> ${s}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="p-6 glass border-l-4 border-red-500 bg-red-500/5">
                            <h3 class="text-red-500 font-bold uppercase text-xs mb-4">Weaknesses</h3>
                            <ul class="space-y-2">
                                ${(this.result.weaknesses || []).map(w => `<li class="text-sm flex gap-2"><span>⚠️</span> ${w}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <!-- Retention Risks Heatmap -->
                    <div class="glass overflow-hidden">
                        <div class="p-4 bg-white/5 border-b border-white/10 font-bold text-xs uppercase text-white/40">Retention Risks Heatmap</div>
                        <table class="result-table">
                            <thead>
                                <tr class="bg-white/5">
                                    <th class="w-32">Timecode</th>
                                    <th>Potential Drop Reason</th>
                                    <th>Recommended Fix</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(this.result.retention_risks || []).map(r => `
                                    <tr>
                                        <td class="font-mono text-red-400 font-bold">${r.timecode}</td>
                                        <td class="text-sm">${r.reason}</td>
                                        <td class="text-sm font-medium text-amber">${r.fix}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Improvement Plan -->
                    <div class="p-8 glass bg-amber/5 border-amber/20">
                        <h3 class="font-syne text-2xl text-amber mb-6">Actionable Improvement Plan</h3>
                        <div class="space-y-4">
                            ${(this.result.improvement_plan || []).map(p => `
                                <div class="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                    <div class="w-5 h-5 rounded-full bg-amber/20 border border-amber/40 flex-shrink-0"></div>
                                    <p class="font-medium">${p}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'shot_list') {
            resultHTML += `
                <div class="space-y-8">
                    <!-- Gear & Locations -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 glass">
                            <h3 class="text-amber font-bold uppercase text-xs mb-4">Gear & Equipment</h3>
                            <div class="flex flex-wrap gap-2">
                                ${(this.result.gear_needed || []).map(g => `<span class="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/10">${g}</span>`).join('')}
                            </div>
                        </div>
                        <div class="p-6 glass">
                            <h3 class="text-amber font-bold uppercase text-xs mb-4">Key Locations</h3>
                            <div class="flex flex-wrap gap-2">
                                ${(this.result.locations || []).map(l => `<span class="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/10">${l}</span>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Mandatory Shot List -->
                    <div class="glass overflow-hidden">
                        <table class="result-table">
                            <thead>
                                <tr>
                                    <th class="w-16">ID</th>
                                    <th>Shot Description</th>
                                    <th>Type / Gear</th>
                                    <th class="w-32">Difficulty</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(this.result.shots || []).map(s => `
                                    <tr>
                                        <td class="font-mono text-amber">#${s.id}</td>
                                        <td class="font-medium">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10">${s.priority}</span>
                                                ${s.description}
                                            </div>
                                        </td>
                                        <td class="text-xs text-white/60">
                                            <strong>${s.type}</strong><br/>
                                            ${s.equipment}
                                        </td>
                                        <td class="text-center">
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${s.difficulty === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}">${s.difficulty}</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'reference_analysis') {
            resultHTML += `
                <div class="space-y-8 max-w-4xl mx-auto">
                    <!-- Hook DNA -->
                    <div class="p-8 glass bg-amber/5 border-amber/20 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-amber/10 blur-3xl rounded-full"></div>
                        <h3 class="text-amber font-syne text-xl mb-4 uppercase tracking-widest">Viral Hook DNA</h3>
                        <p class="text-3xl font-bold tracking-tight leading-tight">${this.result.hook_dna}</p>
                    </div>

                    <!-- Structural Skeleton -->
                    <div class="glass p-6">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Structural Skeleton</h3>
                        <div class="flex h-12 w-full rounded-xl overflow-hidden border border-white/10">
                            ${(this.result.structural_skeleton || []).map((s, idx) => `
                                <div class="h-full flex items-center justify-center text-[10px] font-bold border-r border-white/10 group relative" 
                                     style="width: ${s.duration_percent}; background: rgba(255, 170, 0, ${0.1 + (idx * 0.1)})">
                                    <span class="truncate px-2">${s.part}</span>
                                    <div class="absolute bottom-full mb-2 hidden group-hover:block bg-black p-2 rounded text-xs w-48 z-50 border border-white/10">
                                        <strong>${s.part}</strong>: ${s.purpose}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Key Tricks -->
                        <div class="p-6 glass border-l-4 border-amber">
                            <h3 class="text-amber font-bold uppercase text-xs mb-4">Retention Tricks Used</h3>
                            <ul class="space-y-3">
                                ${(this.result.key_retention_tricks || []).map(t => `<li class="text-sm flex gap-2"><span>💎</span> ${t}</li>`).join('')}
                            </ul>
                        </div>
                        <!-- Replication Guide -->
                        <div class="p-6 glass border-l-4 border-white">
                            <h3 class="text-white/40 font-bold uppercase text-xs mb-4">How to Replicate</h3>
                            <ul class="space-y-3">
                                ${(this.result.replication_guide || []).map(g => `<li class="text-sm flex gap-2"><span>🚀</span> ${g}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'retention_prediction') {
            resultHTML += `
                <div class="space-y-10 max-w-4xl mx-auto">
                    <!-- Main Score -->
                    <div class="text-center py-10 glass bg-amber/5">
                        <div class="inline-block p-10 rounded-full border-4 border-amber/20 mb-6 relative">
                            <span class="text-7xl font-bold font-syne text-amber">${this.result.global_score}%</span>
                            <div class="absolute -top-4 -right-4 bg-amber text-black text-[10px] font-bold px-2 py-1 rounded">ESTIMATED</div>
                        </div>
                        <h2 class="text-2xl font-bold">Predicted Retention Score</h2>
                        <p class="text-white/40 italic">Aggregated probability of viral success based on script pacing.</p>
                    </div>

                    <!-- Drop Zones & Peaks -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-red-500/60">Drop Zones (Leaks)</h4>
                            ${(this.result.drop_zones || []).map(d => `
                                <div class="p-4 glass border-l-2 border-red-500/40 bg-red-500/5">
                                    <div class="flex justify-between mb-1">
                                        <span class="text-xs font-mono text-red-400">${d.timecode}</span>
                                        <span class="text-[8px] font-bold px-1 rounded bg-red-500/20 text-red-500">${d.danger_level}</span>
                                    </div>
                                    <p class="text-sm font-medium mb-1">${d.leak_reason}</p>
                                    <p class="text-[10px] text-amber italic">FIX: ${d.fix_instruction}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="space-y-4">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-green-500/60">Engagement Peaks</h4>
                            ${(this.result.engagement_peaks || []).map(p => `
                                <div class="p-4 glass border-l-2 border-green-500/40 bg-green-500/5">
                                    <span class="text-xs font-mono text-green-400 mb-1 block">${p.timecode}</span>
                                    <p class="text-sm font-medium">${p.reason}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Simulated Curve Visualizer -->
                    <div class="glass p-8">
                         <h4 class="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">Simulated Retention Curve</h4>
                         <div class="h-32 flex items-end gap-1">
                            ${(this.result.simulated_curve_data || []).map(val => `
                                <div class="flex-grow bg-amber/20 hover:bg-amber transition-all rounded-t-sm relative group" style="height: ${val}%">
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-[8px] font-bold px-1 rounded">
                                        ${val}%
                                    </div>
                                </div>
                            `).join('')}
                         </div>
                         <div class="flex justify-between mt-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                            <span>Start</span>
                            <span>Middle</span>
                            <span>End</span>
                         </div>
                    </div>
                </div>
            `;
        } else if (this.result.format === 'prompt_ia') {
            resultHTML += `
                <div class="space-y-8">
                    <div class="p-6 glass bg-amber/5 border-amber/20 overflow-hidden relative">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-amber/10 blur-3xl rounded-full"></div>
                        <h3 class="text-amber font-syne text-xl mb-2">Global Concept</h3>
                        <p class="text-2xl font-bold tracking-tight">${this.result.concept_global}</p>
                    </div>
                    <div class="grid grid-cols-1 gap-6">
                        ${(this.result.prompts || []).map(p => `
                            <div class="glass p-8 flex flex-col md:flex-row gap-8 group hover:border-amber/40 transition-all border border-transparent">
                                <div class="w-24 flex-shrink-0">
                                    <div class="w-12 h-12 bg-amber rounded-lg flex items-center justify-center mb-2 font-bold text-black">${p.outil[0]}</div>
                                    <span class="text-[10px] font-bold uppercase tracking-widest text-amber">${p.outil}</span>
                                </div>
                                <div class="flex-grow">
                                    <p class="text-white/40 text-xs uppercase font-bold mb-4 tracking-tighter">${p.contexte}</p>
                                    <div class="bg-black/40 p-5 rounded-xl border border-white/5 font-mono text-sm group-hover:bg-black/60 transition-colors relative">
                                        <button onclick="navigator.clipboard.writeText(\`${p.prompt_text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" class="absolute top-4 right-4 text-white/20 hover:text-amber transition-colors">
                                            <i data-lucide="copy" class="w-4 h-4"></i>
                                        </button>
                                        ${p.prompt_text}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            resultHTML += `
                <div class="glass p-8">
                    <pre class="whitespace-pre-wrap font-sans text-lg leading-relaxed text-white/80">${JSON.stringify(this.result, null, 2)}</pre>
                </div>
            `;
        }

        resultHTML += `</div>`;
        container.innerHTML = resultHTML;
        lucide.createIcons();
    }

    copyToClipboard() {
        const text = JSON.stringify(this.result, null, 2);
        navigator.clipboard.writeText(text);
        alert("Script copied to clipboard!");
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text(this.result.titre_principal, 10, 10);
        doc.setFont("helvetica", "normal");
        doc.text(`Format: ${this.result.format}`, 10, 20);

        let y = 30;
        if (this.result.tableau) {
            this.result.tableau.forEach(row => {
                const text = `${row.timecode_debut} - ${row.texte_parle}`;
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 10, y);
                y += (splitText.length * 7) + 5;
                if (y > 280) { doc.addPage(); y = 10; }
            });
        } else {
            const text = JSON.stringify(this.result, null, 2);
            doc.text(doc.splitTextToSize(text, 180), 10, y);
        }

        doc.save(`ScriptAI_${this.result.titre_principal.replace(/\s/g, '_')}.pdf`);
    }

    getDashboardHTML() {
        setTimeout(() => this.renderLibrary(), 0);
        return `
            <div class="max-w-6xl mx-auto space-y-12 animate-fade-up pt-10">
                <header class="text-center">
                    <div class="inline-block bg-amber text-black text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-[0.2em]">Alpha 2.0 - Production Suite</div>
                    <h1 class="text-6xl font-bold font-syne mb-4 tracking-tighter">Choose your <span class="text-amber">Power Tool</span></h1>
                    <p class="text-white/40 text-xl max-w-2xl mx-auto">Skip the complexity and jump straight into specialized professional workflows.</p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    <!-- PHASE 1 & 2 & 3 - ACTIVE TOOLS -->
                    ${Object.entries(this.tools).map(([id, tool]) => `
                        <div class="card-clickable group border-white/5 hover:border-amber/40 p-10 flex flex-col h-full" onclick="app.selectTool('${id}')">
                            <div class="w-16 h-16 bg-amber/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <i data-lucide="${tool.icon}" class="text-amber w-8 h-8"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-3">${tool.name}</h3>
                            <p class="text-white/40 text-sm mb-6 flex-grow">${tool.desc}</p>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-widest text-amber border border-amber/20 px-3 py-1 rounded-full bg-amber/5">
                                    ${['script_analysis', 'shot_list'].includes(id) ? 'Phase 2' : (['reference_analyzer', 'retention_predictor'].includes(id) ? 'Phase 3' : 'Indispensable')}
                                </span>
                                <i data-lucide="arrow-right" class="w-4 h-4 text-amber opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    `).join('')}

                    <!-- PHASE 3 - ACTIVE TOOLS (VOICE) -->
                    ${Object.entries(this.tools).filter(([id]) => id === 'voice_clone').map(([id, tool]) => `
                        <div class="card-clickable group border-white/5 hover:border-amber/40 p-10 flex flex-col h-full" onclick="app.selectTool('${id}')">
                            <div class="w-16 h-16 bg-amber/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <i data-lucide="${tool.icon}" class="text-amber w-8 h-8"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-3">${tool.name}</h3>
                            <p class="text-white/40 text-sm mb-6 flex-grow">${tool.desc}</p>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold uppercase tracking-widest text-amber border border-amber/20 px-3 py-1 rounded-full bg-amber/5">Phase 3</span>
                                <i data-lucide="arrow-right" class="w-4 h-4 text-amber opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- LIBRARY / HISTORY -->
                <div class="mt-20 pt-10 border-t border-white/5">
                    <div class="flex justify-between items-end mb-10">
                        <div>
                            <h2 class="text-4xl font-bold font-syne mb-2">My Library</h2>
                            <p class="text-white/40">Your history of generated scripts and insights.</p>
                        </div>
                        <button onclick="localStorage.removeItem('scriptai_library'); app.renderStep()" class="text-[10px] uppercase font-bold text-red-500/30 hover:text-red-500 transition-colors">Clear History</button>
                    </div>

                    <div id="library-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- Loaded via JS -->
                    </div>
                </div>
            </div>
        `;
    }

    selectTool(toolId) {
        this.currentMode = toolId;
        this.currentStep = 1;
        this.renderStepper();
        this.renderStep();
    }

    init() {
        lucide.createIcons();
        if (this.currentStep === 0) this.renderLibrary();
    }

    renderLibrary() {
        const container = document.getElementById('library-container');
        if (!container) return;

        const library = JSON.parse(localStorage.getItem('scriptai_library') || '[]');
        if (library.length === 0) {
            container.innerHTML = `<div class="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/20 italic">No saved scripts yet. Take your first step toward viral success!</div>`;
            return;
        }

        container.innerHTML = library.reverse().map((item, idx) => `
                <div class="glass p-6 group cursor-pointer hover:border-amber/40 transition-all" onclick="app.viewLibraryItem(${library.length - 1 - idx})">
                    <div class="flex justify-between items-start mb-4">
                        <i data-lucide="${this.tools[item.mode]?.icon || 'file-text'}" class="text-amber w-5 h-5"></i>
                        <span class="text-[8px] font-bold uppercase text-white/40 tracking-widest">${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h4 class="font-bold text-sm mb-1 truncate">${item.title}</h4>
                    <p class="text-[10px] text-white/40 uppercase font-bold">${this.tools[item.mode]?.name || 'Unknown'}</p>
                </div>
            `).join('');
        lucide.createIcons();
    }

    saveToLibrary() {
        if (!this.result) return;
        const library = JSON.parse(localStorage.getItem('scriptai_library') || '[]');
        library.push({
            date: new Date().toISOString(),
            mode: this.currentMode,
            title: this.result.titre_principal || 'Untitled Script',
            data: this.result
        });
        localStorage.setItem('scriptai_library', JSON.stringify(library));
    }

    viewLibraryItem(idx) {
        const library = JSON.parse(localStorage.getItem('scriptai_library') || '[]');
        this.result = library[idx].data;
        this.currentMode = library[idx].mode;
        this.currentStep = 'result'; // Special state for history viewing
        this.renderResult();
    }
}
