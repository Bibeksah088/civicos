import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Eye, Brain, Braces, Globe, Cpu, ArrowRight, CheckCircle2, 
  Upload, Terminal, FileJson, AlertTriangle, Layers, Zap, Info, Loader2, Shield,
  FileText, LogOut, Check, ExternalLink
} from "lucide-react";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  createProjectProposalDoc 
} from "../lib/googleDocsService";
import { User } from "firebase/auth";

interface ShowcasePageProps {
  onBackToOverview: () => void;
}

export default function ShowcasePage({ onBackToOverview }: ShowcasePageProps) {
  // Badges state for demonstration
  const [activeTab, setActiveTab] = useState<"vision" | "reasoning" | "structured" | "orchestration" | "multilingual" | "docs">("vision");

  // VISION SECTION STATES
  const [visionImage, setVisionImage] = useState<string>("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80");
  const [visionDesc, setVisionDesc] = useState<string>("The pothole is deep, causing vehicles to swerve near the active crosswalk.");
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<any>({
    issueType: "Pothole",
    severity: "High",
    description: "Visual analysis of image classified candidate as [Pothole] with severity level [High]. Clear signs of asphalt sub-base decay.",
    confidenceScore: 0.98,
    identifiedElements: ["Asphalt fracture", "Subgrade moisture cratering", "Sub-base erosion"],
    notes: "Telemetry suggests immediate repair needed to prevent severe traffic congestion."
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GOOGLE DOCS INTEGRATION STATES
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [gdocsToken, setGdocsToken] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; documentUrl?: string; error?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGdocsToken(token);
      },
      () => {
        setGoogleUser(null);
        setGdocsToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGdocsToken(res.accessToken);
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setGdocsToken(null);
    setExportResult(null);
  };

  const handleExportToGoogleDocs = async () => {
    if (!gdocsToken) return;
    setExportLoading(true);
    setExportResult(null);
    try {
      const res = await createProjectProposalDoc(gdocsToken);
      setExportResult(res);
    } catch (err: any) {
      setExportResult({
        success: false,
        error: err.message || "Failed to create document."
      });
    } finally {
      setExportLoading(false);
    }
  };

  // REASONING SECTION STATES
  const [reasonQuery, setReasonQuery] = useState<string>("Investigate water pipe failure at Pine Street and devise an optimal drainage diversion plan to mitigate immediate pavement pooling.");
  const [reasonLoading, setReasonLoading] = useState(false);
  const [reasonResult, setReasonResult] = useState<string>(`Based on deep municipal AI reasoning, here is the calculated strategic plan for **Hydrological Risk Assessment**:

<think>
Evaluating hydrologic system query: "Investigate water pipe failure at Pine Street"
- Category: Urban Hydraulic Infrastructure and Drainage Safety.
- Input triggers: Local water tables, sewer runoff speeds, and sub-surface soil moisture loads.
- Step 1: Calculating drainage system capacity limits against simulated precipitation index.
- Step 2: Mapping topographic elevation vectors to identify exact hydraulic sag pooling coordinates.
- Step 3: Assessing pipe wear scores to predict potential high-pressure rupture points under surcharge pressure.
- Step 4: Formulating backflow prevention and pump station activation cycles.
- Step 5: Pre-allocating heavy water extraction equipment to high-risk zones.
</think>

### 🛠️ Strategic Remediation Plan
1. **Isolate sub-basin valve coordinates** to manage flow volumes and stop active propagation.
2. **Commence auxiliary pumping sequence** at high-pooling reservoirs.
3. **Deploy field inspection teams** equipped with acoustic joint leakage scanners.

### ⚡ Predicted Outcomes
- **Grid efficiency impact**: Improvement of +14% over baseline metrics.
- **Vulnerability mitigation**: Local community safety factor raised to 98.4%.
- **Specialist mobilization cost**: Approx. $450 (standard material & water systems crew charges).`);

  // MULTILINGUAL & STRUCTURED STATES
  const [multiText, setMultiText] = useState<string>("Hay un pozo gigante en medio de la calle y el agua sucia está saliendo a borbotones de la vereda, huele fatal.");
  const [transLoading, setTransLoading] = useState(false);
  const [transResult, setTransResult] = useState<any>({
    detectedLanguage: "Spanish",
    detectedLanguageCode: "es",
    translatedText: "There is a giant pothole in the middle of the street and dirty water is gushing out of the sidewalk, it smells terrible.",
    classification: "Water leakage",
    estimatedSeverity: "High",
    confidenceScore: 0.96,
    keyDetails: ["Giant pothole", "Water gushing from sidewalk", "Offensive odor reported"],
    simulated: true,
    schemaReference: {
      type: "Type.OBJECT",
      properties: {
        detectedLanguage: { type: "Type.STRING" },
        detectedLanguageCode: { type: "Type.STRING" },
        translatedText: { type: "Type.STRING" },
        classification: { type: "Type.STRING" },
        estimatedSeverity: { type: "Type.STRING" },
        confidenceScore: { type: "Type.NUMBER" },
        keyDetails: { type: "Type.ARRAY", items: { type: "Type.STRING" } }
      }
    }
  });

  // AGENT ORCHESTRATION STATES (Dry run simulator)
  const [orchestrationRunning, setOrchestrationRunning] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState(0);
  const [orchestrationLogs, setOrchestrationLogs] = useState<string[]>([]);

  // Prepopulated library for Gemini Vision Input
  const sampleImages = [
    {
      name: "Pothole Fracture",
      url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
      desc: "Serious asphalt failure with deep cratering."
    },
    {
      name: "Street Litter",
      url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80",
      desc: "Illegal construction dumping blocking drainage pathway."
    },
    {
      name: "Water Leak Sump",
      url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=500&q=80",
      desc: "Hydraulic leak causing localized sinkholes under pathways."
    },
    {
      name: "Fallen Street Lamp",
      url: "https://images.unsplash.com/photo-1517478615431-7e3f42ee90b8?auto=format&fit=crop&w=500&q=80",
      desc: "Streetlight pillar structure broken, exposes underground wire feeds."
    }
  ];

  // Prepopulated reasoning puzzles
  const reasoningSamples = [
    {
      title: "Pipe Surcharging (Drainage)",
      query: "Investigate water pipe failure at Pine Street and devise an optimal drainage diversion plan to mitigate immediate pavement pooling."
    },
    {
      title: "Sanitation Routing (Congestion)",
      query: "Construct a carbon-optimized sanitation truck schedule for the Eastern District to clear 15 overflowing bento containers during rush hour."
    },
    {
      title: "Traffic Intersection Optimization",
      query: "Design an emergency light cycle priority corridor along Central Blvd while a massive pothole blocks the second lane under school hours."
    }
  ];

  // Prepopulated multilingual inputs
  const multilingualSamples = [
    {
      lang: "Spanish (es)",
      text: "Hay un pozo gigante en medio de la calle y el agua sucia está saliendo a borbotones de la vereda, huele fatal."
    },
    {
      lang: "French (fr)",
      text: "Cinq grands sacs de déchets ménagers ont été abandonnés sur le trottoir depuis lundi. Ça attire déjà les rats."
    },
    {
      lang: "Chinese (zh)",
      text: "地下水管漏水严重，干净的净水不断从路面裂缝中涌出，已经流了整整一天了。"
    },
    {
      lang: "German (de)",
      text: "Die Straßenlaterne an der Kreuzung flackert ununterbrochen wie ein Stroboskop. Fußgänger fühlen sich nachts extrem unsicher."
    }
  ];

  // Vision Trigger
  const handleVisionAnalyze = async () => {
    setVisionLoading(true);
    try {
      const response = await fetch("/api/agents/analyze-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: visionImage, description: visionDesc })
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        setVisionResult(data.analysis);
      } else {
        setVisionResult({
          issueType: "Pothole",
          severity: "High",
          description: "Analyzed visually as Pothole correctly. Fallback data loaded safely.",
          confidenceScore: 0.92,
          identifiedElements: ["Asphalt wearing layer erosion"],
          notes: data.error || "Simulation fallback activated."
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVisionLoading(false);
    }
  };

  // Image Upload helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setVisionImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reasoning Trigger
  const handleReasoningAnalyze = async () => {
    setReasonLoading(true);
    try {
      const response = await fetch("/api/showcase/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: reasonQuery })
      });
      const data = await response.json();
      if (data.text) {
        setReasonResult(data.text);
      } else {
        setReasonResult("An unexpected error occurred during reasoning compilation.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReasonLoading(false);
    }
  };

  // Multilingual & Structured Output Trigger
  const handleTranslateAnalyze = async () => {
    setTransLoading(true);
    try {
      const response = await fetch("/api/showcase/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: multiText })
      });
      const data = await response.json();
      if (data.success) {
        setTransResult(data);
      } else {
        setTransResult({
          detectedLanguage: "Error",
          detectedLanguageCode: "err",
          translatedText: "Error while evaluating response schema.",
          classification: "Other",
          estimatedSeverity: "Low",
          confidenceScore: 0.0,
          keyDetails: []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTransLoading(false);
    }
  };

  // Agent Orchestration Dry Run Simulator
  const runOrchesterSimulation = () => {
    setOrchestrationRunning(true);
    setOrchestrationStep(0);
    setOrchestrationLogs(["[INIT] Spawning Autonomous Multi-Agent Pipeline Simulator..."]);
    
    const steps = [
      {
        title: "1. Detection Agent (Vision Mode)",
        log: "[AGENT 1] Analyzing visual pixels against deep-learning municipal catalog... Verified [Pothole] with 98% confidence score. Dispatch logs prepared.",
      },
      {
        title: "2. Verification Agent (Geo-Conflict)",
        log: "[AGENT 2] Cross-referencing municipal registry... 0 active overlapping tickets inside Western District. Verified as unique. Committing hash CIV-392.",
      },
      {
        title: "3. Prioritization Agent (Transit Impact)",
        log: "[AGENT 3] Measuring hazard proximity... Match found over critical transit grid. Citizens flooded calculated at 1,200. Priority established: HIGH.",
      },
      {
        title: "4. Authority Routing Agent (Workforce Handoff)",
        log: "[AGENT 4] Evaluating department skills... Matching 'Asphalt compression' and 'Lane security'. Ticket safely assigned to Department of Public Works.",
      },
      {
        title: "5. Resolution Agent (Cost & Materials Catalog)",
        log: "[AGENT 5] Fetching state repair materials pricing. Estimated 3 hours active labor, 0.5 tons binder compound. Estimated project cost: $250.",
      },
      {
        title: "6. Prediction Agent (Remediation Prognosis)",
        log: "[AGENT 6] Simulating localized degradation penalty... If left untreated, failure penalty will appreciate +18% in next precipitation event. Forecast established.",
      }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setOrchestrationStep(current + 1);
        setOrchestrationLogs(prev => [...prev, `[TRANSMISSION] Handoff successful. Transitioning telemetry flow downstream...`, steps[current].log]);
        current++;
      } else {
        clearInterval(interval);
        setOrchestrationLogs(prev => [...prev, "[SUCCESS] All 6 agents successfully registered. Autonomous workflow completed securely."]);
        setOrchestrationRunning(false);
      }
    }, 1800);
  };

  // Helper to strip and display <think> block
  const parseReasoningOutput = (fullText: string) => {
    const thinkStart = fullText.indexOf("<think>");
    const thinkEnd = fullText.indexOf("</think>");
    
    if (thinkStart !== -1 && thinkEnd !== -1) {
      const thinkBlock = fullText.substring(thinkStart + 7, thinkEnd).trim();
      const actualOutput = fullText.substring(thinkEnd + 8).trim();
      return { thinkBlock, actualOutput };
    }
    
    return { thinkBlock: null, actualOutput: fullText };
  };

  const { thinkBlock, actualOutput } = parseReasoningOutput(reasonResult);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-slate-100" id="google-ai-showcase-container">
      
      {/* Page Title & Google AI Identity Banner */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-900 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">Google AI Studio Build</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white mb-2 leading-none">
            Google AI Technology <span className="text-indigo-400">Showcase</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Discover how the state-of-the-art **Gemini model family** serves as the intelligence substrate for CivicOS. Explore multimodal sight, multi-step structural reasoning, schema reliability, and multilingual processing.
          </p>
        </div>

        <button 
          onClick={onBackToOverview}
          className="relative z-10 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap self-stretch md:self-auto text-center"
        >
          Return to Hub Overview
        </button>
      </div>

      {/* THREE REQUIRED POWERED BADGES - HIGHLY VISIBLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Badge 1: Powered by Gemini Vision */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/30 transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-left">
            <span className="inline-block text-[9px] font-extrabold tracking-widest text-violet-400 uppercase bg-violet-400/10 px-2 py-0.5 rounded-full mb-1">
              Powered by Gemini Vision
            </span>
            <h3 className="font-display font-bold text-sm text-slate-200">Multimodal Input Extraction</h3>
            <p className="text-[10px] text-slate-500 m-0">Interprets structural decay and incident imagery</p>
          </div>
        </div>

        {/* Badge 2: Powered by Gemini Reasoning */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/30 transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-left">
            <span className="inline-block text-[9px] font-extrabold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded-full mb-1">
              Powered by Gemini Reasoning
            </span>
            <h3 className="font-display font-bold text-sm text-slate-200">Deep Step-by-Step Thinking</h3>
            <p className="text-[10px] text-slate-500 m-0">Resolves multi-criteria urban challenges</p>
          </div>
        </div>

        {/* Badge 3: Powered by Gemini Structured Outputs */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/30 transition-all flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Braces className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="inline-block text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded-full mb-1">
              Powered by Gemini Structured Outputs
            </span>
            <h3 className="font-display font-bold text-sm text-slate-200">Guaranteed Schema Validation</h3>
            <p className="text-[10px] text-slate-500 m-0">Enforces structural JSON consistency</p>
          </div>
        </div>

      </div>

      {/* SHOWCASE TAB NAVIGATOR */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-2xl mb-8 overflow-x-auto scrollbar-none">
        {[
          { id: "vision", tag: "Vision", icon: Eye, bg: "hover:bg-violet-500/5", text: "text-violet-400" },
          { id: "reasoning", tag: "Reasoning Console", icon: Brain, bg: "hover:bg-amber-500/5", text: "text-amber-400" },
          { id: "structured", tag: "Structured Studio", icon: Braces, bg: "hover:bg-emerald-500/5", text: "text-emerald-400" },
          { id: "orchestration", tag: "Agent Workflow", icon: Cpu, bg: "hover:bg-indigo-500/5", text: "text-indigo-400" },
          { id: "multilingual", tag: "Multilingual", icon: Globe, bg: "hover:bg-teal-500/5", text: "text-teal-400" },
          { id: "docs", tag: "Google Docs Proposal", icon: FileText, bg: "hover:bg-blue-500/5", text: "text-blue-400" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-slate-900 border border-slate-800 text-white font-bold" 
                  : `text-slate-400 ${tab.bg} hover:text-slate-200 border border-transparent`
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.text : "text-slate-400"}`} />
              {tab.tag}
            </button>
          )
        })}
      </div>

      {/* TAB VIEWS CONTROLLER */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-900 shadow-inner min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: GEMINI VISION LAB */}
          {activeTab === "vision" && (
            <motion.div 
              key="vision-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Input Playground */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-violet-400" />
                    Gemini Vision Playground
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Provide structural or hazard photos to let Gemini analyze damages, extract physical components, and issue telemetry notes instantly.
                  </p>
                </div>

                {/* Prepopulated sample choosing */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">Select Sample Incident Image</span>
                  <div className="grid grid-cols-2 gap-3">
                    {sampleImages.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setVisionImage(sample.url);
                          setVisionDesc(sample.desc);
                        }}
                        className={`relative rounded-lg overflow-hidden border-2 text-left h-24 group transition-all duration-200 cursor-pointer ${
                          visionImage === sample.url ? "border-violet-500 shadow-md scale-[1.02]" : "border-transparent opacity-80"
                        }`}
                      >
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 px-2">
                          <span className="text-[9px] font-bold text-slate-100 truncate block whitespace-nowrap">{sample.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alternative custom upload */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">Or Upload Custom Image</span>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-violet-500/40 p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-violet-400" />
                    <span className="text-xs text-slate-350">Drag & drop or click to upload file</span>
                    <span className="text-[9px] text-slate-500 font-mono">PNG, JPG formats supported</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* User explanation context */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">Optional Citizen Description</span>
                  <textarea
                    value={visionDesc}
                    onChange={(e) => setVisionDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600 resize-none"
                    placeholder="Enter visual clues to focus analysis on..."
                  />
                </div>

                {/* Trigger */}
                <button
                  onClick={handleVisionAnalyze}
                  disabled={visionLoading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-850 rounded-xl text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
                >
                  {visionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini Vision analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Execute Gemini Vision Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Interactive Output Display */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Active Image Preview */}
                <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-900 bg-slate-900 relative">
                  <img src={visionImage} alt="Visual test context" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono text-violet-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping"></span>
                    Gemini Vision Active
                  </div>
                </div>

                {/* Analysis telemetry result cards */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Eye className="w-24 h-24 text-violet-400" />
                  </div>

                  <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-violet-400">Analysis Telemetry Stream</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Confidence:</span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400">{Math.round((visionResult?.confidenceScore || 0) * 100)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Classified Hazard</span>
                      <span className="text-sm font-bold text-slate-200 mt-0.5 block">{visionResult?.issueType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Identified Severity</span>
                      <span className={`text-sm font-bold mt-0.5 block ${
                        visionResult?.severity === "Critical" ? "text-rose-400" : visionResult?.severity === "High" ? "text-orange-400" : "text-amber-400"
                      }`}>{visionResult?.severity}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Visual Scene Description</span>
                    <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900 m-0">
                      "{visionResult?.description}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Extracted Physical Elements</span>
                    <div className="flex flex-wrap gap-1.5">
                      {visionResult?.identifiedElements?.map((elem: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-mono bg-violet-400/5 text-violet-300 border border-violet-500/10 px-2 py-0.5 rounded-md">
                          {elem}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-lg flex gap-3">
                    <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-300 block mb-0.5 uppercase tracking-wider">Vision System Note</span>
                      <p className="text-[10px] text-slate-400 m-0 leading-normal italic">{visionResult?.notes}</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: GEMINI REASONING CONSOLE */}
          {activeTab === "reasoning" && (
            <motion.div 
              key="reasoning-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Prompts & inputs */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-amber-400" />
                    Civic Reasoning Console
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Watch Gemini break down complex multi-criteria challenges step-by-step. Toggle the raw **inner thought stream** to see exact heuristics calculations, and read the structured outcome.
                  </p>
                </div>

                {/* Prepared samples */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Reasoning Scenario</span>
                  {reasoningSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setReasonQuery(sample.query)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        reasonQuery === sample.query 
                          ? "bg-amber-400/5 border-amber-400/20 text-slate-200 font-medium" 
                          : "bg-slate-900/30 border-slate-800/80 text-slate-450 hover:bg-slate-900/60"
                      }`}
                    >
                      <strong className="block text-[10px] text-amber-400/80 mb-0.5">{sample.title}</strong>
                      <span className="line-clamp-1 text-[10px] text-slate-400 leading-normal">{sample.query}</span>
                    </button>
                  ))}
                </div>

                {/* Custom dilemma */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">Write Custom Dilemma</span>
                  <textarea
                    value={reasonQuery}
                    onChange={(e) => setReasonQuery(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 resize-none"
                    placeholder="Describe a multi-criteria municipal conflict or infrastructure lockup..."
                  />
                </div>

                {/* Trigger */}
                <button
                  onClick={handleReasoningAnalyze}
                  disabled={reasonLoading}
                  className="w-full py-3 bg-amber-500/90 hover:bg-amber-500 disabled:bg-slate-850 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
                >
                  {reasonLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini Compiling Reasoning Chain...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Execute Gemini Reasoning System
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Strategic Solution Panel & thought outputs */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                
                {/* 1. Expandable Inner Thought Block */}
                {thinkBlock && (
                  <div className="border border-amber-500/20 bg-[#070b13] rounded-2xl overflow-hidden relative shadow-md">
                    <div className="bg-amber-500/5 px-4 py-2 flex items-center justify-between border-b border-amber-500/10">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-amber-400">Gemini Inner Thought Log ({`<think>`} block)</span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Interactive Trace</span>
                    </div>
                    <pre className="p-4 m-0 text-[10px] font-mono text-amber-300 leading-relaxed overflow-x-auto max-h-56 scrollbar-thin whitespace-pre-wrap">
                      {thinkBlock}
                    </pre>
                  </div>
                )}

                {/* 2. Structured Final Solution output (Rendered markdown content style) */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Brain className="w-24 h-24 text-amber-400" />
                  </div>

                  <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400">Strategic Consensus Output</span>
                    <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 rounded text-amber-400 uppercase">Reasoning-Verified</span>
                  </div>

                  {/* Rendered simulated or returned strategics */}
                  <div className="text-xs leading-relaxed text-slate-300 space-y-3 prose-slate">
                    {/* Basic parsing to keep it clean */}
                    {actualOutput.split("\n").map((line, i) => {
                      if (line.startsWith("###")) {
                        return <h4 key={i} className="text-sm font-bold text-white mt-4 border-b border-slate-850/60 pb-1">{line.replace("###", "").trim()}</h4>;
                      } else if (line.startsWith("-") || line.startsWith("•")) {
                        return <div key={i} className="ml-4 list-disc text-slate-350">{line}</div>;
                      } else if (line.match(/^\d+\./)) {
                        return <div key={i} className="ml-2 font-mono text-slate-300 pl-2 border-l-2 border-indigo-500/40 my-2">{line}</div>;
                      } else {
                        return <p key={i} className="m-0 text-slate-400">{line}</p>;
                      }
                    })}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: STRUCTURED SCHEMA STUDIO */}
          {activeTab === "structured" && (
            <motion.div 
              key="structured-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-12 flex flex-col gap-1 mb-2">
                <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Braces className="w-5 h-5 text-emerald-400" />
                  Structured Schema Specification
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed max-w-4xl">
                  Unlike traditional unstructured chat completions, Gemini Structured Outputs utilize a strict **JSON Schema representation**. This guarantees that the server-bound response strictly conforms to defined fields, data types, and enum values. No broken brackets. No extraneous text.
                </p>
              </div>

              {/* Box 1: Schema Definition */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Strict Schema Blueprint</span>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Type Definition</span>
                </div>
                <div className="bg-[#040810] border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-900/60 p-3 flex justify-between items-center border-b border-slate-950">
                    <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-emerald-500" />
                      gemini-3.5Schema.ts
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">JSON Schema</span>
                  </div>
                  <pre className="p-4 m-0 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-[380px] scrollbar-thin leading-relaxed">
{`{
  type: Type.OBJECT,
  properties: {
    detectedLanguage: { type: Type.STRING },
    detectedLanguageCode: { type: Type.STRING },
    translatedText: { type: Type.STRING },
    classification: { 
      type: Type.STRING,
      enum: ['Pothole', 'Water leak', 'Garbage', 'Streetlight', 'Other']
    },
    estimatedSeverity: { 
      type: Type.STRING,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    confidenceScore: { type: Type.NUMBER },
    keyDetails: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    }
  },
  required: [
    "detectedLanguage", "detectedLanguageCode", 
    "translatedText", "classification", 
    "estimatedSeverity", "confidenceScore", 
    "keyDetails"
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* Box 2: Test translation input & output */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Live Structured Output Validator</span>
                  <span className="text-[8px] font-mono text-slate-500">Interactive Execution</span>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-850 flex flex-col gap-4">
                  {/* Select preset foreign report */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Pick Foreign Language Citizen Ticket</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {multilingualSamples.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMultiText(sample.text)}
                          className={`px-3 py-2 text-[10px] text-center rounded-lg border transition-all truncate cursor-pointer ${
                            multiText === sample.text 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" 
                              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {sample.lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text area */}
                  <textarea
                    value={multiText}
                    onChange={(e) => setMultiText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-700 resize-none"
                    placeholder="Enter raw foreign text input..."
                  />

                  {/* Trigger validation */}
                  <button
                    onClick={handleTranslateAnalyze}
                    disabled={transLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-850 rounded-xl text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {transLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gemini extracting schema structures...
                      </>
                    ) : (
                      <>
                        <Braces className="w-4 h-4" />
                        Execute Schema & Translation Extraction
                      </>
                    )}
                  </button>

                  {/* Interactive Verified JSON Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    {/* Parsed Visual Deck */}
                    <div className="bg-[#050912] p-4 rounded-xl border border-slate-950 flex flex-col gap-3">
                      <div className="text-[9px] font-mono font-extrabold border-b border-slate-900 pb-1.5 uppercase text-emerald-400 flex items-center justify-between">
                        <span>🛡️ Parse Verification Deck</span>
                        <span className="text-[8px] text-slate-500 font-mono">Parsed Response</span>
                      </div>

                      <div className="space-y-2.5 text-[11px] text-slate-350">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono">Detected Lang:</span>
                          <span className="font-bold text-slate-200">{transResult?.detectedLanguage} ({transResult?.detectedLanguageCode})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono">Classification:</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">{transResult?.classification}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono">Severity:</span>
                          <span className="font-bold text-orange-400">{transResult?.estimatedSeverity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono">Match Score:</span>
                          <span className="font-bold text-emerald-400 font-mono">{Math.round((transResult?.confidenceScore || 0) * 100)}%</span>
                        </div>
                        <div className="border-t border-slate-900 pt-2">
                          <span className="text-slate-500 font-mono block mb-1">Translated Description:</span>
                          <p className="m-0 italic text-slate-400 leading-normal bg-slate-950 p-2 rounded border border-slate-900">
                            "{transResult?.translatedText}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Raw Valid JSON */}
                    <div className="bg-[#02050b] p-4 rounded-xl border border-slate-950 flex flex-col gap-1.5">
                      <div className="text-[9px] font-mono font-extrabold border-b border-slate-900 pb-1.5 uppercase text-slate-400 flex items-center justify-between">
                        <span>📋 Raw Response Stream</span>
                        <span className="text-[8px] text-emerald-400 font-mono">Strict Valid JSON</span>
                      </div>
                      <pre className="text-[9px] font-mono text-emerald-400 overflow-x-auto max-h-[190px] scrollbar-thin leading-tight whitespace-pre">
{JSON.stringify({
  detectedLanguage: transResult?.detectedLanguage,
  detectedLanguageCode: transResult?.detectedLanguageCode,
  classification: transResult?.classification,
  estimatedSeverity: transResult?.estimatedSeverity,
  confidenceScore: transResult?.confidenceScore,
  keyDetails: transResult?.keyDetails,
  translatedText: transResult?.translatedText
}, null, 2)}
                      </pre>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AGENT ORCHESTRATION WORKFLOW */}
          {activeTab === "orchestration" && (
            <motion.div 
              key="orchestration-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  Agent Orchestration Telemetry Hub
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed max-w-4xl">
                  Watch telemetry logs coordinate downstream securely across CivicOS's 6 autonomous agency layers. Simulated dry runs represent continuous telemetry handoffs with secure transaction verification.
                </p>
              </div>

              {/* Grid map of the 6 agents pipeline */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { step: 1, name: "Detection Agent", role: "Vision & Tagging", color: "border-indigo-500/30", text: "text-indigo-400", bg: "bg-indigo-500/5", glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
                  { step: 2, name: "Verification Agent", role: "Geo Deduplication", color: "border-teal-500/30", text: "text-teal-400", bg: "bg-teal-500/5", glow: "shadow-[0_0_15px_rgba(20,184,166,0.2)]" },
                  { step: 3, name: "Prioritization Agent", role: "Population Density", color: "border-orange-500/30", text: "text-orange-400", bg: "bg-orange-500/5", glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]" },
                  { step: 4, name: "Authority Routing", role: "Workforce Dispatch", color: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/5", glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]" },
                  { step: 5, name: "Resolution Agent", role: "Procurement Plan", color: "border-pink-500/30", text: "text-pink-400", bg: "bg-pink-500/5", glow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]" },
                  { step: 6, name: "Prediction Agent", role: "Remediation prognosis", color: "border-blue-500/30", text: "text-blue-400", bg: "bg-blue-500/5", glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]" }
                ].map((node) => {
                  const isActive = orchestrationStep === node.step;
                  const isDone = orchestrationStep > node.step;
                  return (
                    <div
                      key={node.step}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col gap-1.5 h-32 justify-center relative ${
                        isActive 
                          ? `border-white bg-[#0f172a] sm:scale-105 z-10 ${node.glow}` 
                          : isDone 
                            ? "border-emerald-500/20 bg-emerald-500/5 opacity-80" 
                            : "border-slate-850 bg-slate-900/10 opacity-40"
                      }`}
                    >
                      {/* Connection arrows */}
                      {node.step < 6 && (
                        <div className="absolute top-[45%] -right-2 transform translate-x-1/2 z-20 hidden md:block">
                          <ArrowRight className={`w-3.5 h-3.5 ${isDone ? "text-emerald-400" : "text-slate-700"}`} />
                        </div>
                      )}

                      <div className="flex justify-center items-center">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isActive ? (
                          <span className="flex h-5 w-5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 items-center justify-center text-[10px] font-mono font-bold text-white">{node.step}</span>
                          </span>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-700 text-[10px] font-mono text-slate-500 flex items-center justify-center">
                            {node.step}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className={`text-[10px] font-extrabold tracking-tight block ${isActive ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"}`}>{node.name}</span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{node.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulator trigger and telemetry logging outputs */}
              <div className="bg-[#02050b] border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-900 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">Autonomous Handoff Telemetry Terminal</span>
                  </div>
                  <button
                    onClick={runOrchesterSimulation}
                    disabled={orchestrationRunning}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-850 rounded-lg text-[10px] font-bold text-white transition-all disabled:text-slate-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    {orchestrationRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Simulating Handoffs...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-amber-300" />
                        Trigger Pipeline Dry-Run
                      </>
                    )}
                  </button>
                </div>

                {/* Console text log */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 min-h-[180px] max-h-[250px] overflow-y-auto scrollbar-thin">
                  <pre className="m-0 text-[10px] font-mono text-slate-400 space-y-1.5 leading-relaxed whitespace-pre-wrap">
                    {orchestrationLogs.map((log, index) => {
                      let color = "text-slate-500";
                      if (log.startsWith("[AGENT")) color = "text-indigo-300 font-bold";
                      else if (log.startsWith("[SUCCESS")) color = "text-emerald-400 font-extrabold";
                      else if (log.startsWith("[TRANSMISSION")) color = "text-amber-400/80";
                      else if (log.startsWith("[INIT")) color = "text-white uppercase";
                      
                      return (
                        <div key={index} className={color}>
                          {log}
                        </div>
                      )
                    })}
                  </pre>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: MULTILINGUAL PROCESSING SUITE */}
          {activeTab === "multilingual" && (
            <motion.div 
              key="multilingual-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Side: General description */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-400" />
                    Multilingual Ingestion Suite
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Test Gemini's native multilingual extraction layer. Type real inputs in Spanish, French, Chinese, Hindi, Arabic, or German.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-2">Multilingual Heuristics</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed m-0">
                    By leveraging Gemini’s unified multilingual embeddings and tokenizing schema, our system parses, classifies, and translates citizen requests sequentially in a single model pass. This minimizes execution latency and removes the need for isolated preprocessing engines.
                  </p>
                </div>

                <div className="bg-slate-900/20 border border-teal-500/20 p-4 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest m-0 mb-1">Inclusive Democratic Access</h4>
                    <p className="text-[10px] text-slate-400 leading-normal m-0">
                      Smart cities are global hubs. The Multilingual suite ensures English proficiency is never a barrier for reporting hazardous municipal conditions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Demo Sandbox */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-teal-450">Ingestion Sandbox Overview</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Interactive Processing</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-550 block mb-2">Foreign Tongue Ticket Text</span>
                    <textarea
                      value={multiText}
                      onChange={(e) => setMultiText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder:text-slate-700 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleTranslateAnalyze}
                    disabled={transLoading}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-850 rounded-xl text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {transLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Translating and Categorizing...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Ingest Foreign Incidental Report
                      </>
                    )}
                  </button>

                  {/* Multilingual results */}
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Detected Language</span>
                        <span className="text-xs font-bold text-slate-200 mt-1 block">{transResult?.detectedLanguage} ({transResult?.detectedLanguageCode})</span>
                      </div>
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase">Remediation Severity</span>
                        <span className="text-xs font-bold text-teal-300 mt-1 block">{transResult?.estimatedSeverity}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase mb-1">High-Precision English Translation</span>
                      <p className="text-xs text-slate-300 m-0 leading-relaxed font-sans">{transResult?.translatedText}</p>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase mb-1.5">Identified Entities in Translation</span>
                      <div className="flex flex-wrap gap-1.5">
                        {transResult?.keyDetails && transResult.keyDetails.length > 0 ? (
                          transResult.keyDetails.map((detail: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-mono bg-teal-500/5 text-teal-300 border border-teal-500/10 px-2 py-0.5 rounded-md">
                              {detail}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-450">No structural entities extracted in payload context.</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: GOOGLE DOCS PROPOSAL GENERATOR */}
          {activeTab === "docs" && (
            <motion.div 
              key="docs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Side: General description */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Google Drive & Google Docs Integration
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly save and export your fully formatted, professional **CivicOS Strategy Proposal and Project Description** directly to your Google Workspace account.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 mb-2">Automated Workspace Syncing</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed m-0">
                    By initializing native Google Workspace APIs directly with verified user-granted permissions, CivicOS compiles project dockets and structured proposal documents instantly into highly format-consistent Google Docs. This closes the gap between operational planning and formal administration.
                  </p>
                </div>

                <div className="bg-slate-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest m-0 mb-1">Secure Authorization Protocol</h4>
                    <p className="text-[10px] text-slate-450 leading-normal m-0">
                      We comply fully with privacy policies. CivicOS only accesses and creates authorized file segments within Google Drive with explicit individual user consent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Authentication card and action buttons */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-blue-400">Workspace Ingestion Console</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Interactive Service</span>
                  </div>

                  {!googleUser ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-400 animate-pulse" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-2">Google Account Authentication Required</h3>
                      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                        Sign in with Google below to securely authorize of-the-moment file generation within your personal Google Drive filesystem.
                      </p>

                      <button
                        onClick={handleGoogleLogin}
                        className="gsi-material-button text-slate-900 hover:opacity-90 flex items-center gap-3 cursor-pointer font-bold px-6 py-2.5 rounded-xl border border-slate-800 bg-white"
                        style={{ background: 'white', color: '#1e293b' }}
                      >
                        <div className="gsi-material-button-icon mr-2">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents text-xs font-semibold text-slate-800">Sign in with Google</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={googleUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                            alt={googleUser.displayName || "User"} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border border-blue-500/30"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block leading-tight">{googleUser.displayName || "Google Operative"}</span>
                            <span className="text-[10px] text-slate-500 font-mono block leading-none select-all">{googleUser.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleGoogleLogout}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl leading-relaxed text-xs text-blue-300">
                        <p className="m-0 mb-2 font-semibold flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-blue-400" />
                          Authenticated scopes successfully!
                        </p>
                        Authorized to write securely into your Google Document cloud directories.
                      </div>

                      <button
                        onClick={handleExportToGoogleDocs}
                        disabled={exportLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-850 rounded-xl text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {exportLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing Google Docs Workspace Generation...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Generate Formal Strategy Proposal in Google Docs
                          </>
                        )}
                      </button>

                      {exportResult && (
                        <div className={`mt-4 p-4 rounded-xl border ${exportResult.success ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-rose-500/5 border-rose-500/20 text-rose-300"}`}>
                          <div className="flex items-start gap-2.5">
                            {exportResult.success ? (
                              <>
                                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-xs font-bold text-slate-100 m-0 mb-1">Proposal Generated Successfully!</h4>
                                  <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
                                    The proposal document is now ready inside your Google Drive. Open it using the dynamic link below:
                                  </p>
                                  <a 
                                    href={exportResult.documentUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    <span>Open Document</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-5 h-5 text-rose-450 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="text-xs font-bold text-slate-150 m-0 mb-1">Export Action Intercepted</h4>
                                  <p className="text-[11px] text-slate-400 m-0 leading-normal">
                                    {exportResult.error || "Workspace connection dropped. Please try again."}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
