import React, { useState, useRef } from "react";
import { 
  Camera, 
  MapPin, 
  Check, 
  ChevronRight, 
  AlertCircle,
  Brain, 
  UserCheck, 
  Flame, 
  Network, 
  Hammer, 
  LineChart, 
  Sparkles,
  ArrowRight,
  ArrowDown,
  Clock,
  Bot,
  TrendingUp
} from "lucide-react";
import { IssueReport, LocationData } from "../types";

interface ReportIssueProps {
  onIssueCreated: (newIssue: IssueReport) => void;
  currentUser: string;
}

const DISTRICTS = ["Western District", "Downtown", "Castro Corridor", "Marina Sector", "SOMA Grid"];

export default function ReportIssue({ onIssueCreated, currentUser }: ReportIssueProps) {
  // Input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("Western District");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geo-coordinates simulators
  const [useGeoSim, setUseGeoSim] = useState(true);

  // Submission pipeline tracing states
  const [isTraced, setIsTraced] = useState(false);
  const [currentTraceStep, setCurrentTraceStep] = useState<number>(-1); // -1: not submitted, 0..5: agent indexes, 6: done
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [agentResults, setAgentResults] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Convert File to Base64
  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Preset location quick filler
  const handlePresetLocation = () => {
    const addresses = [
      { addr: "512 Castro St, San Francisco, CA", dist: "Castro Corridor" },
      { addr: "290 Pine Street, SOMA Grid", dist: "SOMA Grid" },
      { addr: "804 Oak Blvd, Western District", dist: "Western District" },
      { addr: "105 Marina Blvd, Marina Sector", dist: "Marina Sector" },
      { addr: "420 Market Street, Downtown", dist: "Downtown" }
    ];
    const picked = addresses[Math.floor(Math.random() * addresses.length)];
    setAddress(picked.addr);
    setDistrict(picked.dist);
  };

  // Submit hazard and trigger multi-agent sequentially animated console
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      setSubmitError("Description is required to instruct agent processing.");
      return;
    }
    
    setSubmitError(null);
    setIsTraced(true);
    setCurrentTraceStep(0);
    setTraceLogs(["Initializing CivicOS Orchestrator kernel...", "Connecting multiplex sockets..."]);

    const latitude = 37.7749 + (Math.random() - 0.5) * 0.05;
    const longitude = -122.4194 + (Math.random() - 0.5) * 0.05;
    const finalAddress = address || "Unspecified Municipal Grid Sector";

    const reportLocation: LocationData = {
      latitude,
      longitude,
      address: finalAddress,
      district
    };

    // Helper to add logs with a delayed cadence
    const appendLog = (log: string, delayMs: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setTraceLogs(prev => [...prev, log]);
          resolve();
        }, delayMs);
      });
    };

    try {
      // Launch API POST request immediately so we have the results ready, 
      // but we will do a beautifully timed sequential animation trace!
      const responsePromise = fetch("/api/agents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          description,
          image,
          location: reportLocation,
          reporterName: currentUser
        })
      });

      // TIMED TRACE STEPS (Sequence of the 6 Agents)
      
      // Step 1: Detection Agent
      await appendLog("🤖 [Detection Agent] Active. Reading visual image parts...", 1000);
      await appendLog("🤖 [Detection Agent] Reconstructing structural bounding matrix...", 1200);
      setCurrentTraceStep(0);
      
      // Fetch result
      const res = await responsePromise;
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Civic API failure");
      }
      const trace = data.report.agentTrace;
      setAgentResults(trace);

      await appendLog(`✅ [Detection Agent] Analysis Complete: Identified [${trace.detection.issueType}] (Severity: ${trace.detection.severity}).`, 800);
      
      if (trace.emergencyEscalation?.isEscalated) {
        await appendLog(`🚨 [Emergency Escalation Agent] CRITICAL ALERT TRIGGERED: Detected life safety hazard context: "${trace.emergencyEscalation.triggerFound}"!`, 1000);
        await appendLog(`🚨 [Emergency Escalation Agent] Bypassing normal queue. Overridden priority category to Critical. Dispatching automated alert notification payload directly to: ${trace.emergencyEscalation.authorityNotified}!`, 1300);
      }

      // Step 2: Verification Agent
      setCurrentTraceStep(1);
      await appendLog("🛡️ [Verification Agent] Invoked. Scanning regional coordinates overlay...", 1000);
      await appendLog("🛡️ [Verification Agent] Auditing municipal data against overlapping logs...", 1200);
      await appendLog(`✅ [Verification Agent] Checked. Verification Status: [${trace.verification.verificationStatus}] with confidence score ${Math.round(trace.verification.confidenceScore * 100)}%.`, 800);

      // Step 3: Prioritization Agent
      setCurrentTraceStep(2);
      await appendLog("🔥 [Prioritization Agent] Analysing potential population index...", 1000);
      await appendLog("🔥 [Prioritization Agent] Compiling hazard parameters...", 1100);
      await appendLog(`✅ [Prioritization Agent] Completed. Civic Impact Score formulated to [${trace.prioritization.civicImpactScore}/100]. Priority set to: ${trace.prioritization.priorityCategory}.`, 800);

      // Step 4: Routing Agent
      setCurrentTraceStep(3);
      await appendLog("⚡ [Routing Agent] Selecting active responsible authority agencies...", 1000);
      await appendLog(`✅ [Routing Agent] Auto-assigned task to: [${trace.routing.department}] -> Designated officer: ${trace.routing.assignedOfficer}.`, 900);

      // Step 5: Resolution Agent
      setCurrentTraceStep(4);
      await appendLog("🔧 [Resolution Agent] Engineering standard structural plan checklists...", 1000);
      await appendLog(`✅ [Resolution Agent] Repair roadmap formulated. Budgeted material: $${trace.resolution.estimatedCost}, Personnel: ${trace.resolution.estimatedHours} working hours.`, 900);

      // Step 6: Prediction Agent
      setCurrentTraceStep(5);
      await appendLog("📈 [Prediction Agent] Compiling regional Twin risk-decay multipliers...", 1000);
      await appendLog(`✅ [Prediction Agent] Modeling finished. Risk increase weight assigned to: +${trace.prediction.riskIncreasePercent}% if ignored. Hotspot status active: ${trace.prediction.hotspotWarning ? "YES" : "NO"}.`, 800);

      // All resolved!
      setCurrentTraceStep(6);
      await appendLog("🎉 Multi-Agent chain complete! Committing ticket to digital ledger...", 600);

      setTimeout(() => {
        onIssueCreated(data.report);
        // Reset states
        setTitle("");
        setDescription("");
        setAddress("");
        setImage(null);
        setIsTraced(false);
        setCurrentTraceStep(-1);
        setTraceLogs([]);
        setAgentResults(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "An unexpected error disrupted the multi-agent orchestration.");
      setIsTraced(false);
      setCurrentTraceStep(-1);
    }
  };

  const getStepDetails = (stepIdx: number) => {
    const descLower = description.toLowerCase();
    
    let issueType = "Garbage accumulation";
    let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let dept = "Department of Sanitation";
    let officer = "Inspector Clara Sterling";
    let cost = 150;
    let hours = 3;
    let riskPct = 35;
    let plan = [
      "Mobilize rapid sweep crew to grid sector coordinates.",
      "Clear toxic/organic decay signatures with high pressure sanitization.",
      "Authorize containment drop and file completion certificate."
    ];

    if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("street")) {
      issueType = "Pothole";
      severity = "High";
      dept = "Department of Public Works";
      officer = "District Engineer David Lin";
      cost = 250;
      hours = 4;
      riskPct = 58;
      plan = [
        "Align temporary traffic safety cones around fracture coordinates.",
        "Pneumatically blow asphalt debris and clear stagnant water pooling.",
        "Execute hot binder mastic injection and apply vibratory steel roller compaction."
      ];
    } else if (descLower.includes("water") || descLower.includes("flood") || descLower.includes("drain") || descLower.includes("leak") || descLower.includes("pipe")) {
      issueType = "Water leakage";
      severity = "Critical";
      dept = "Department of Water & Power";
      officer = "Supervisor Roger Vance";
      cost = 450;
      hours = 6;
      riskPct = 84;
      plan = [
        "Torque isolation valve blocks to shut down regional feed pipeline.",
        "Excavate municipal subgrade layers to reveal joint fracture points.",
        "Sleeve fractured pipe housing with high-durability modern structural polymer."
      ];
    } else if (descLower.includes("streetlight") || descLower.includes("light") || descLower.includes("lamp") || descLower.includes("wire") || descLower.includes("spark")) {
      issueType = "Broken streetlight";
      severity = "Critical";
      dept = "Traffic & Safety Administration";
      officer = "Grid Inspector Jennifer Croft";
      cost = 190;
      hours = 2;
      riskPct = 64;
      plan = [
        "De-energize node feeding points via standard sub-pillar isolation switches.",
        "Strip frayed wire insulation and safely splice weather-certified connectors.",
        "Test driver amperage draws and bolt double-reinforced lock panels."
      ];
    }

    const baseTime = new Date();
    
    switch (stepIdx) {
      case 0:
        return {
          icon: <Brain className="w-4 h-4 text-emerald-400" />,
          name: "Agent 1: Detection Agent",
          desc: "Parses citizen imagery details and text syntax vectors to identify specific hazard classes.",
          confidence: agentResults?.detection?.confidenceScore ?? 0.96,
          input: `Description: "${description}"${image ? " [Multimodal Image context attached]" : ""}`,
          output: `Issue Class: [${agentResults?.detection?.issueType ?? issueType}] | Base Severity: [${agentResults?.detection?.severity ?? severity}]`,
          reasoning: agentResults?.detection?.notes ?? `Multimodal image matrix analyzed. Identifies high structural match with classic street [${issueType}] markers. Recommends prompt structural inspection dispatch.`,
          timestamp: new Date(baseTime.getTime() - 5000).toISOString(),
          handoff: `Handoff ➔ Passing classification parameters & physical markings to Verification Agent for redundancy inspections...`
        };
      case 1:
        return {
          icon: <UserCheck className="w-4 h-4 text-teal-400" />,
          name: "Agent 2: Verification Agent",
          desc: "Conducts duplicate analysis across geofenced coordinates and matching categories.",
          confidence: agentResults?.verification?.confidenceScore ?? 0.94,
          input: `Issue Class: ${agentResults?.detection?.issueType ?? issueType} | GPS Zone: [Ref: Lat 37.77, Lng -122.41]`,
          output: `Deduplication Status: [${agentResults?.verification?.verificationStatus ?? "Authentic"}] | Conflict duplicates overlap: FALSE`,
          reasoning: agentResults?.verification?.crossReferenceNotes ?? `Queried regional ledger indices inside a 15-meter buffer radius over the last 48 hours. Zero active duplicate records. Ticket verified as high integrity.`,
          timestamp: new Date(baseTime.getTime() - 4000).toISOString(),
          handoff: `Handoff ➔ Forwarding unique verified certificate envelope to Prioritization Agent for population safety assessments...`
        };
      case 2:
        return {
          icon: <Flame className="w-4 h-4 text-orange-400" />,
          name: "Agent 3: Prioritization Agent",
          desc: "Formulates social vulnerability weight scores and civic lane disruption coefficients.",
          confidence: 0.95,
          input: `Severity Level: ${agentResults?.detection?.severity ?? severity} | Sector Profile: "${district}"`,
          output: `Civic Disruption index: [${agentResults?.prioritization?.civicImpactScore ?? (severity === "Critical" ? 90 : severity === "High" ? 78 : 45)}/100] | Target priority: [${agentResults?.prioritization?.priorityCategory ?? severity}]`,
          reasoning: `Hazard markers parsed against community databases. Analyzed factors: ${agentResults?.prioritization?.factors?.join(", ") ?? "Local corridor blockage, pedestrian density weights, potential runoff damages"}. Estimated citizens affected: ${agentResults?.prioritization?.affectedPopulationEst ?? 180} index.`,
          timestamp: new Date(baseTime.getTime() - 3000).toISOString(),
          handoff: `Handoff ➔ Passing community impact profile elements to Authority Routing Agent for department matching...`
        };
      case 3:
        return {
          icon: <Network className="w-4 h-4 text-purple-400" />,
          name: "Agent 4: Authority Routing Agent",
          desc: "Resolves matching specialized authority sectors and dispatches targeted field officials.",
          confidence: 0.98,
          input: `Hazard Category: ${agentResults?.detection?.issueType ?? issueType} | Disruption Rating: ${agentResults?.detection?.severity ?? severity}`,
          output: `Routed Agency: [${agentResults?.routing?.department ?? dept}] | Allocated Field officer: [${agentResults?.routing?.assignedOfficer ?? officer}]`,
          reasoning: `Matched high matching expertise coefficients within standard jurisdiction parameters. Secure dispatch priority level adjusted: [${agentResults?.routing?.dispatchPriority ?? (severity === "Critical" ? "Immediate" : "Standard")}] via Secure-Node: ${agentResults?.routing?.contactChannel ?? "OS-MUNICIPAL-SECURE-FEED"}.`,
          timestamp: new Date(baseTime.getTime() - 2000).toISOString(),
          handoff: `Handoff ➔ Sending assigned supervisor details and priority instructions to Resolution Agent...`
        };
      case 4:
        return {
          icon: <Hammer className="w-4 h-4 text-blue-400" />,
          name: "Agent 5: Resolution Agent",
          desc: "Generates custom step-by-step work phases, cost materials budgets, and labor hours.",
          confidence: 0.92,
          input: `Dispatched Node: ${agentResults?.routing?.department ?? dept} | Identified hazard markers list: ${agentResults?.detection?.identifiedElements?.slice(0, 2).join(", ") ?? "Physical debris check"}`,
          output: `Restoration Budget: [$${agentResults?.resolution?.estimatedCost ?? cost}] | Projected working hours: [${agentResults?.resolution?.estimatedHours ?? hours} hrs]`,
          reasoning: `Calculated material costs and labor matrices. Suggested repair phases: ${(agentResults?.resolution?.suggestedPlan ?? plan).join(" ➔ ")}. Required specialist credentials: ${agentResults?.resolution?.requiredSkills?.join(", ") ?? "Safety lane deployment control, mechanical containment"}.`,
          timestamp: new Date(baseTime.getTime() - 1000).toISOString(),
          handoff: `Handoff ➔ Sending restoration blueprint documents to Prediction Agent for Digital Twin calculations...`
        };
      case 5:
        return {
          icon: <LineChart className="w-4 h-4 text-indigo-400" />,
          name: "Agent 6: Prediction Agent",
          desc: "Projects infrastructural wear trendlines over the neighborhood Digital Twin canvas.",
          confidence: 0.89,
          input: `Restoration Plan Details: Budget $${agentResults?.resolution?.estimatedCost ?? cost}, Labor Hours: ${agentResults?.resolution?.estimatedHours ?? hours}`,
          output: `Wear Group Category: [${agentResults?.prediction?.regionalTrendGroup ?? (district + " Municipal Load")}] | Delayed Neglect Wear penalty: [+${agentResults?.prediction?.riskIncreasePercent ?? riskPct}%]`,
          reasoning: `Infrastructural decay projection simulation completed. Neglecting this hazard is forecast to compound adjacent grid erosion by +${agentResults?.prediction?.riskIncreasePercent ?? riskPct}% over 60 days. Hotspot alert warning: [${(agentResults?.prediction?.hotspotWarning ?? (cost > 200)) ? "ACTIVE" : "INACTIVE"}]. Policy safeguard proposal: "${agentResults?.prediction?.preventativeAction ?? "Thermal monitor adjacent blocks bimonthly"}"`,
          timestamp: new Date().toISOString(),
          handoff: `All 6 Agents completed successfully! Securing audit token inside CivicOS Ledger registry...`
        };
      default:
        return null;
    }
  };

  const currentStepInfo = () => {
    switch (currentTraceStep) {
      case 0: return { label: "Detection Agent Parsing Image & Text", color: "text-emerald-400" };
      case 1: return { label: "Verification Agent Auditing Duplications", color: "text-teal-400" };
      case 2: return { label: "Prioritization Agent Computing Civic Disruption", color: "text-orange-400" };
      case 3: return { label: "Routing Agent Mapping Jurisdictions", color: "text-purple-400" };
      case 4: return { label: "Resolution Agent Formulating Restoration Costs", color: "text-blue-400" };
      case 5: return { label: "Prediction Agent Projecting Local Trends", color: "text-indigo-400" };
      case 6: return { label: "Database Ledger Finalizing Handshake", color: "text-slate-400" };
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in" id="report-issue-container">
      
      {/* 1. AGENT ORCHESTRATION TERMINAL SCREEN */}
      {isTraced && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 shadow-2xl transition-all duration-300" id="ai-agent-terminal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <div>
                <h3 className="font-display font-black text-lg text-slate-100 tracking-tight flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Live Agent Pipeline Tracer</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5 m-0 p-0">Autonomous agent-to-agent collaboration and handoff tracking</p>
              </div>
            </div>
            <span className="font-mono text-[9px] text-indigo-300 bg-indigo-550/15 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold animate-pulse">
              Active Sequential Chaining
            </span>
          </div>

          {/* New Live Step Handoff Progress Visualization */}
          <div className="space-y-6">
            
            {/* The 6 Agents Step-by-Step Cascader */}
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isActive = currentTraceStep === idx;
                const isCompleted = currentTraceStep > idx;
                if (!isActive && !isCompleted) return null; // Only show active or completed steps
                
                const stepDetails = getStepDetails(idx);
                if (!stepDetails) return null;

                return (
                  <div key={idx} className="space-y-3 animate-fade-in">
                    
                    {/* Agent Node Box */}
                    <div className={`border rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]" 
                        : "border-emerald-500/20 bg-emerald-950/5 opacity-90"
                    }`}>
                      
                      {/* Flex Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isActive ? "bg-indigo-500/10 text-indigo-300" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {stepDetails.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span>{stepDetails.name}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-wider ${
                                isActive ? "bg-indigo-500/20 text-indigo-400 animate-pulse" : "bg-emerald-500/20 text-emerald-400"
                              }`}>
                                {isActive ? "Processing Node..." : "Telemetry Committed"}
                              </span>
                            </h4>
                            <p className="text-[10.5px] text-slate-400 font-sans mt-0.5 leading-tight">{stepDetails.desc}</p>
                          </div>
                        </div>

                        {/* Confidence and Timestamp block */}
                        <div className="flex items-center gap-4 text-right">
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] text-slate-500 font-mono block uppercase">Confidence Index</span>
                            <span className={`text-xs font-mono font-black ${
                              isActive ? "text-indigo-400" : "text-emerald-400"
                            }`}>
                              {Math.round(stepDetails.confidence * 100)}%
                            </span>
                          </div>
                          <div className="text-left sm:text-right hidden sm:block">
                            <span className="text-[8px] text-slate-500 font-mono block uppercase">Registry Time</span>
                            <span className="text-[10px] font-mono text-slate-405">
                              {stepDetails.timestamp.substring(11, 19)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Input/Output Data Tracing Panel */}
                      <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed">
                        
                        {/* INPUT BLOCK */}
                        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-900/80">
                          <div className="flex items-center gap-1 text-[9px] text-indigo-405 font-bold uppercase tracking-wider mb-1.5">
                            <span className="text-indigo-400">📥</span>
                            <span>Agent Input payload</span>
                          </div>
                          <div className="text-slate-350 bg-slate-950/20 p-2.5 rounded border border-slate-900 text-[10px] whitespace-pre-wrap leading-relaxed truncate-2-lines">
                            {stepDetails.input}
                          </div>
                        </div>

                        {/* OUTPUT BLOCK */}
                        <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-900/80">
                          <div className="flex items-center gap-1 text-[9px] text-emerald-405 font-bold uppercase tracking-wider mb-1.5">
                            <span className="text-emerald-450">📤</span>
                            <span>Simulated Agent Outputs</span>
                          </div>
                          <div className="text-slate-350 bg-slate-950/20 p-2.5 rounded border border-slate-900 text-[10px] whitespace-pre-wrap leading-relaxed">
                            {stepDetails.output}
                          </div>
                        </div>

                      </div>

                      {/* Reasoning Summary Row */}
                      <div className="mt-3 bg-slate-950/30 p-3 rounded-xl border border-slate-900/60 font-mono text-[11.5px] leading-relaxed text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-450 text-[11px] shrink-0 font-bold">💡 REASONING SUMMARY:</span>
                        <p className="m-0 text-slate-350 italic">"{stepDetails.reasoning}"</p>
                      </div>

                    </div>

                    {/* Visually stunning data handshake connector line */}
                    {idx < 5 && currentTraceStep >= idx + 1 && (
                      <div className="flex flex-col items-center justify-center py-2 animate-fade-in relative z-20">
                        <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-500/40 to-indigo-500/80 animate-pulse"></div>
                        <div className="my-1.5 px-3 py-1 bg-indigo-950/60 border border-indigo-500/20 rounded-full font-mono text-[8.5px] font-black tracking-normal text-indigo-300 flex items-center gap-1.5 animate-pulse uppercase leading-none">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping shrink-0" />
                          <span>{stepDetails.handoff}</span>
                          <ArrowDown className="w-3 h-3 text-indigo-400 stroke-[3]" />
                        </div>
                        <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500/80 to-indigo-500/40 animate-pulse"></div>
                      </div>
                    )}

                    {/* Step 5 complete check */}
                    {idx === 5 && currentTraceStep === 6 && (
                      <div className="flex flex-col items-center justify-center py-3 animate-fade-in">
                        <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-500/40 to-emerald-500/80"></div>
                        <div className="my-1 px-4 py-2 bg-emerald-950/60 border border-emerald-500/20 rounded-full font-mono text-[9px] font-bold text-emerald-400 flex items-center gap-2 uppercase animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          <span>All 6 Node Blocks committed to Ledger blockchain successfully!</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Compact Shell Terminal Log System */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-400">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">System Microkernel Standard Output Stream</span>
                <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-bold uppercase">TRACE_FEED</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-[10.5px]">
                {traceLogs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-1">
                    <span className="text-indigo-550 shrink-0 select-none">&gt;_</span>
                    <span className="leading-relaxed whitespace-pre-wrap text-slate-350">{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. REGULAR FORM DISPLAYED IF NOT TRACING */}
      {!isTraced && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6 shadow-xl" id="hazard-report-form">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="font-display font-extrabold text-2xl text-slate-100">Disseminate Community Hazard</h2>
            <p className="text-sm text-slate-405">
              Submit description details and pictures. Our multi-agent node will scan structural markers and mobilize municipal resolution immediately.
            </p>
          </div>

          {submitError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-start space-x-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-00" />
              <div>
                <p className="font-bold m-0">Submission Interrupted</p>
                <p className="m-0 mt-1 opacity-90">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Concise Title (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Deep asphalt pothole cluster" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Factual Hazard Description *</label>
              <textarea 
                rows={4}
                required
                placeholder="Detail the issue parameters context, size, relative dangers, and when it occurred..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Location & District */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">District Selection</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Street Address Coordinate</label>
                  <button 
                    type="button"
                    onClick={handlePresetLocation}
                    className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center space-x-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>Quick Fill Preset</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 512 Castro St, San Francisco" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Drag and Drop Image uploader */}
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
                Visual Proof Upload (Supports drag-and-drop)
              </label>
              
              <div 
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-155 ${
                  isDragOver 
                    ? "border-indigo-500 bg-indigo-500/5" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/30"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="dropzone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />

                {!image ? (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                      <Camera className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-300 font-medium font-sans">
                      <span>Click to upload or drag & drop</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">JPG, PNG format (Maximum upload: 10MB)</p>
                  </div>
                ) : (
                  <div className="relative mx-auto max-w-[280px]">
                    <img 
                      src={image} 
                      alt="Local Upload Preview" 
                      className="rounded-2xl border border-slate-800 shadow max-h-48 object-cover mx-auto"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-650 rounded-full h-6 w-6 text-xs text-white hover:bg-red-500 flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Block */}
            <div className="border-t border-slate-800/85 pt-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Rewards Active: +100 Hero Pts & +5% Trust Score</span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-3 shadow-[0_0_15px_rgba(79,70,229,0.35)] cursor-pointer active:scale-95 transition-all text-xs sm:text-sm text-white"
                id="submit-ticket-btn"
              >
                <span>Initialize AI Multi-Agent Processing</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
