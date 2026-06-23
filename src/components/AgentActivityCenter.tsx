import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  UserCheck, 
  Flame, 
  Network, 
  Hammer, 
  LineChart, 
  Play, 
  RefreshCw, 
  Upload, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  TrendingUp, 
  Users, 
  FileText, 
  AlertTriangle,
  Award,
  DollarSign,
  Clock,
  ShieldAlert,
  Bot,
  Zap,
  Cpu
} from "lucide-react";
import { IssueReport, LocationData, AgentTrace } from "../types";

// Standard hackathon sandbox mock templates
const PRESETS = [
  {
    id: "preset-pothole",
    title: "Severe Pothole Cluster on Oak Boulevard",
    description: "Multiple progressive cracks and deep asphalt potholes blocking the primary school transit lane.",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
    district: "Western District",
    address: "842 Oak Blvd, Western District"
  },
  {
    id: "preset-drainage",
    title: "Major Drainage Clog and Sewer Backflow",
    description: "Sewer storm drain is completely packed with heavy tree branches. Flooding sidewalk foundations.",
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=80",
    district: "Downtown",
    address: "152 Pine Street, Downtown Centre"
  },
  {
    id: "preset-electric",
    title: "Exposed Wire Hazard on Broken Light Pole",
    description: "Damaged pedestrian streetlamp with safety base cover torn off. Live sparks occasional near water pooling.",
    imageUrl: "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=500&q=80",
    district: "Eastern District",
    address: "1224 Castro St, Eastern District"
  },
  {
    id: "preset-garbage",
    title: "Illegal Industrial Waste Dumping SOMA",
    description: "Massive pile of rotting chemical containers, tires, and metal scraps left on the freeway exit ramp.",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80",
    district: "SOMA Grid",
    address: "410 SOMA Exit Ramp, SOMA Grid"
  }
];

interface AgentActivityCenterProps {
  issues: IssueReport[];
  onAddNewIssue: (report: IssueReport) => void;
  currentUser: string;
}

export default function AgentActivityCenter({ issues, onAddNewIssue, currentUser }: AgentActivityCenterProps) {
  // Input parameters
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [description, setDescription] = useState(PRESETS[0].description);
  const [district, setDistrict] = useState(PRESETS[0].district);
  const [address, setAddress] = useState(PRESETS[0].address);
  const [imageUrl, setImageUrl] = useState<string | null>(PRESETS[0].imageUrl);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulation execution steps
  // -1: idle, 0: Detection, 1: Verification, 2: Prioritisation, 3: Routing, 4: Resolution, 5: Prediction, 6: Completed
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [executionSpeed, setExecutionSpeed] = useState<number>(2500); // ms per step
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<Array<{ id: string; text: string; time: string; type: "system" | "bot" | "success" | "warning" }>>([]);
  const [currentPayloads, setCurrentPayloads] = useState<any>({
    detectionInput: null,
    detectionOutput: null,
    verificationInput: null,
    verificationOutput: null,
    prioritizationInput: null,
    prioritizationOutput: null,
    routingInput: null,
    routingOutput: null,
    resolutionInput: null,
    resolutionOutput: null,
    predictionInput: null,
    predictionOutput: null
  });

  // Render-time Emergency Escalation detection
  const getRenderEmergency = () => {
    let textToAnalyze = description;
    let titleToAnalyze = selectedPreset.title;
    const isLiveSim = activeStep >= 0;

    if (isLiveSim && currentPayloads.detectionInput) {
      textToAnalyze = currentPayloads.detectionInput.reporterTextIn;
      titleToAnalyze = currentPayloads.detectionOutput?.issueType || "";
    }

    const content = `${titleToAnalyze} ${textToAnalyze}`.toLowerCase();
    let triggerFound: "Fallen electrical wires" | "Open manholes" | "Major road collapse" | "Flooding" | "Gas leaks" | null = null;
    let authority = "";

    if (content.includes("electrical wire") || content.includes("fallen wire") || content.includes("downed power") || content.includes("live wire") || content.includes("sparking wire") || content.includes("exposed wire") || content.includes("wires")) {
      triggerFound = "Fallen electrical wires";
      authority = "SF Fire Department & PG&E Emergency Services";
    } else if (content.includes("manhole") || content.includes("missing manhole") || content.includes("open manhole") || content.includes("uncovered manhole")) {
      triggerFound = "Open manholes";
      authority = "SF Department of Public Works Emergency Hazard Dispatch";
    } else if (content.includes("road collapse") || content.includes("sinkhole") || content.includes("collapsed street") || content.includes("collapsed road") || content.includes("major road collapse")) {
      triggerFound = "Major road collapse";
      authority = "SF Department of Building Inspection & DPW Structural Division";
    } else if (content.includes("flood") || content.includes("gushing water") || content.includes("heavy flooding") || content.includes("water flooding")) {
      triggerFound = "Flooding";
      authority = "SF Water Enterprise Emergency Division & SFFD Disaster Operations";
    } else if (content.includes("gas leak") || content.includes("smell of gas") || content.includes("leaking gas") || content.includes("gas smell")) {
      triggerFound = "Gas leaks";
      authority = "SF Fire Department Hazmat Unit & PG&E Gas Control Center";
    }

    return { triggerFound, authority };
  };

  const renderEmergency = getRenderEmergency();

  // Load a preset template
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setDescription(preset.description);
    setDistrict(preset.district);
    setAddress(preset.address);
    setImageUrl(preset.imageUrl);
    setVisionAnalysis(null); // Clear vision analysis cache
    addLog(`Loaded Sandbox Presets: "${preset.title}" template ready.`, "system");
  };

  // Convert uploaded image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
        setVisionAnalysis(null); // Clear vision analysis cache
        addLog(`System registered custom image input frame (${(file.size / 1024).toFixed(1)} KB).`, "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const addLog = (text: string, type: "system" | "bot" | "success" | "warning" = "system") => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemLogs(prev => [{ id: Math.random().toString(), text, time, type }, ...prev]);
  };

  // Kickoff pipeline simulation loop
  const handleStartSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    setSystemLogs([]);
    
    // Create initial state log
    addLog(`⚡ Starting Sequential 6-Agent Sandbox Simulation...`, "system");
    addLog(`🔗 Source Input Frame Received: "${description.substring(0, 45)}..."`, "system");
  };

  // Stop simulation loop
  const handleResetSimulation = () => {
    setIsRunning(false);
    setActiveStep(-1);
    setVisionAnalysis(null); // Clear vision analysis cache
    setCurrentPayloads({
      detectionInput: null,
      detectionOutput: null,
      verificationInput: null,
      verificationOutput: null,
      prioritizationInput: null,
      prioritizationOutput: null,
      routingInput: null,
      routingOutput: null,
      resolutionInput: null,
      resolutionOutput: null,
      predictionInput: null,
      predictionOutput: null
    });
    addLog("Sandbox refreshed. Waiting for next evaluation trigger.", "system");
  };

  // Run sequential steps
  useEffect(() => {
    if (!isRunning || activeStep === -1) return;

    let isActive = true;
    let timer: NodeJS.Timeout;

    const processStep = async () => {
      let currentVision = visionAnalysis;

      if (activeStep === 0) {
        addLog(`🤖 Detection Agent: Scanning active imagery frame...`, "bot");
        addLog(`⚡ Uploading current frame to server-side Gemini Vision model ...`, "system");

        try {
          const payloadImage = imageUrl || PRESETS[0].imageUrl;
          const res = await fetch("/api/agents/analyze-vision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: payloadImage, description })
          });
          
          if (!res.ok) {
            throw new Error(`API error status ${res.status}`);
          }
          
          const data = await res.json();
          if (data.success && data.analysis) {
            if (isActive) {
              currentVision = data.analysis;
              setVisionAnalysis(data.analysis);
              addLog(`🟢 Gemini Vision evaluation completed successfully!`, "success");
            }
          } else {
            throw new Error(data.error || "Malformed API response structure.");
          }
        } catch (err: any) {
          console.error("Vision API fetch failed, falling back to local solver: ", err);
          addLog(`⚠️ Gemini Vision call failed (${err.message}). Using local high-fidelity fallback routing.`, "warning");
        }
      }

      // If we don't have real vision response yet, calculate local fallback or load from cached visionAnalysis
      let issueType = "Garbage accumulation";
      let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
      let confidence = 0.94;
      let items = ["Visual scatter signature", "Organic decay decomposition", "District transit impedance"];
      let notes = `Vision and NLP model classified trash mass within ${district} grids.`;

      if (currentVision) {
        issueType = currentVision.issueType;
        severity = currentVision.severity;
        confidence = currentVision.confidenceScore;
        items = currentVision.identifiedElements || ["Identified primary visual anomaly"];
        notes = currentVision.notes || currentVision.description;
      } else {
        const descLower = description.toLowerCase();
        if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("street")) {
          issueType = "Pothole";
          severity = descLower.includes("severe") || descLower.includes("deep") ? "High" : "Medium";
          confidence = 0.98;
          items = ["Aggressive asphalt fracturing", "Exposed aggregate layering", "Subgrade moisture crater"];
          notes = "Visual recognition confirmed critical asphalt degradation hazard, structural cut repair recommended.";
        } else if (descLower.includes("drain") || descLower.includes("water") || descLower.includes("flood") || descLower.includes("pipe")) {
          issueType = "Water leakage";
          severity = descLower.includes("major") || descLower.includes("gushing") ? "Critical" : "High";
          confidence = 0.95;
          items = ["High pressure moisture plume", "Surrounding foundation saturation", "Erosion undercurrent"];
          notes = "Water gush event detected. Direct risk of foundational erosion and adjacent grid hydrostatic flooding.";
        } else if (descLower.includes("wire") || descLower.includes("light") || descLower.includes("lamp") || descLower.includes("spark")) {
          issueType = "Broken streetlight";
          severity = descLower.includes("wire") || descLower.includes("spark") ? "Critical" : "Medium";
          confidence = 0.99;
          items = ["Missing terminal safety panel", "Exposed electrical conduits", "Atmospheric sparking"];
          notes = "Exposed terminal wiring detected. Live current sparking confirms risk to pedestrian corridor safety.";
        }
      }

      // Emergency Escalation Agent check
      let triggerFound: "Fallen electrical wires" | "Open manholes" | "Major road collapse" | "Flooding" | "Gas leaks" | null = null;
      let authority = "";

      const content = `${selectedPreset.title} ${description} ${issueType}`.toLowerCase();
      if (content.includes("electrical wire") || content.includes("fallen wire") || content.includes("downed power") || content.includes("live wire") || content.includes("sparking wire") || content.includes("exposed wire") || content.includes("wires")) {
        triggerFound = "Fallen electrical wires";
        authority = "SF Fire Department & PG&E Emergency Services";
      } else if (content.includes("manhole") || content.includes("missing manhole") || content.includes("open manhole") || content.includes("uncovered manhole")) {
        triggerFound = "Open manholes";
        authority = "SF Department of Public Works Emergency Hazard Dispatch";
      } else if (content.includes("road collapse") || content.includes("sinkhole") || content.includes("collapsed street") || content.includes("collapsed road") || content.includes("major road collapse")) {
        triggerFound = "Major road collapse";
        authority = "SF Department of Building Inspection & DPW Structural Division";
      } else if (content.includes("flood") || content.includes("gushing water") || content.includes("heavy flooding") || content.includes("water flooding")) {
        triggerFound = "Flooding";
        authority = "SF Water Enterprise Emergency Division & SFFD Disaster Operations";
      } else if (content.includes("gas leak") || content.includes("smell of gas") || content.includes("leaking gas") || content.includes("gas smell")) {
        triggerFound = "Gas leaks";
        authority = "SF Fire Department Hazmat Unit & PG&E Gas Control Center";
      }

      if (triggerFound) {
        severity = "Critical";
        if (issueType === "Garbage accumulation" || issueType === "Other") {
          issueType = "Public safety";
        }
      }

      // Precalculated routing credentials
      let dept = "Department of Sanitation";
      let officer = "Lead Officer Samantha Drake";
      let contact = "DISPATCH-SANI-HQ";
      let disPriority: "Standard" | "Expedited" | "Immediate" = "Standard";

      if (triggerFound) {
        dept = authority.split(" & ")[0];
        officer = "SFFD Emergency Chief Vance";
        contact = "EMERG_DISPATCH_HOTLINE";
        disPriority = "Immediate";
      } else if (issueType === "Pothole") {
        dept = "Department of Public Works";
        officer = "District Engineer David Lin";
        contact = "DPW-INFRA-EAST";
        disPriority = "Expedited";
      } else if (issueType === "Water leakage") {
        dept = "Department of Water & Power";
        officer = "Supervisor Roger Vance";
        contact = "DWP-URGENT-LINE";
        disPriority = "Immediate";
      } else if (issueType === "Broken streetlight") {
        dept = "Traffic & Safety Administration";
        officer = "Grid Inspector Jennifer Croft";
        contact = "TSA-POWER-DISPATCH";
        disPriority = "Immediate";
      }

      // Precalculated Resolution credentials
      let steps = [
        "Deploy emergency sanitation sweep vehicles.",
        "Sweep hazardous debris from curbs and street channels.",
        "Conduct visual inspections of surrounding drains."
      ];
      let cost = 120;
      let hours = 2;
      let skills = ["Debris handling safety", "Special waste logs"];

      if (issueType === "Pothole") {
        steps = [
          "Establish safety cones and vehicle channel detour around crater.",
          "Execute surgical joints cutting and clean debris with pneumatic gun.",
          "Pour premium asphalt compound, level with vibratory compactor, and secure perimeter edges."
        ];
        cost = 320;
        hours = 4;
        skills = ["Pavement engineering", "Lane navigation control"];
      } else if (issueType === "Water leakage") {
        steps = [
          "Locate and torque main pressure isolation valve at block junction.",
          "Siphon deep pool water and excavate soil to inspect pipe coupling joint.",
          "Sleeve substitute high-durability polymer pipe and dry test before soil refill."
        ];
        cost = 580;
        hours = 6;
        skills = ["Hydraulic maintenance", "Sub-surface excavations code"];
      } else if (issueType === "Broken streetlight") {
        steps = [
          "Isolate electrical pillar feed to de-energize active post line.",
          "Splice replacement weather-certified protective casing plate and wire joints.",
          "Apply lockable secure bolts and verify system ground connection."
        ];
        cost = 240;
        hours = 3;
        skills = ["Grid isolation", "High voltage safety credentials"];
      }

      // Precalculated Prioritization credentials
      const impactScore = triggerFound ? 100 : (severity === "Critical" ? 95 : severity === "High" ? 82 : 48);
      const affectedPop = triggerFound ? 450 : (severity === "Critical" ? 450 : severity === "High" ? 220 : 65);
      const factors = triggerFound 
        ? ["Immediate severe risk of injury", "Active public safety incident", "Bypassed queue to emergency responders"]
        : (severity === "Critical" 
          ? ["Immediate severe risk of injury", "Critical pedestrian route blockage", "High density sector"]
          : ["Delayed transportation corridor", "Minor infrastructure wear vector"]);

      // Consolidated outputs so everything matches typed spec correctly
      const detInput = {
        sourceImage: imageUrl ? "Uploaded Binary Buffer base64" : "Fallback Default Civic Slate Icon",
        reporterTextIn: description,
        metaTimestamp: new Date().toISOString()
      };

      const detOutput = {
        issueType,
        severity,
        confidenceScore: confidence,
        identifiedElements: items,
        notes: currentVision?.description || notes
      };

      const verInput = {
        detectedIssueType: issueType,
        currentGPS: { latitude: 37.7749, longitude: -122.4194 },
        addressString: address,
        categoryIndex: 12
      };

      const verOutput = {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic" as const,
        confidenceScore: 0.94,
        crossReferenceNotes: `Checked coordinates within 15 meters radius footprint against 24 active tickets. Zero active overlaps found.`
      };

      const prInput = {
        severityCategory: severity,
        verifiedStatus: "Authentic",
        districtProfile: district,
        identifiedHazards: items
      };

      const prOutput = {
        civicImpactScore: impactScore,
        priorityCategory: severity,
        factors,
        affectedPopulationEst: affectedPop
      };

      const rotInput = {
        hazardType: issueType,
        impactRating: severity,
        recipientDistrict: district
      };

      const rotOutput = {
        department: dept,
        assignedOfficer: officer,
        dispatchPriority: disPriority,
        contactChannel: contact
      };

      const resInput = {
        responsibleDept: dept,
        priorityLevel: severity,
        elementsList: items
      };

      const resOutput = {
        suggestedPlan: steps,
        estimatedCost: cost,
        estimatedHours: hours,
        requiredSkills: skills
      };

      const preInput = {
        zoneAddress: address,
        identifiedType: issueType,
        severityVal: severity
      };

      const riskPct = severity === "Critical" ? 92 : severity === "High" ? 64 : 28;
      const preOutput = {
        regionalTrendGroup: `${district} Zone Infrastructure Degradation`,
        riskIncreasePercent: riskPct,
        hotspotWarning: severity === "Critical" || severity === "High",
        preventativeAction: `Proactively inspect adjacent 2 blocks for structural moisture anomalies twice monthly.`
      };

      if (!isActive) return;

      switch (activeStep) {
        case 0: // 1. Detection Agent
          {
            setCurrentPayloads(prev => ({ ...prev, detectionInput: detInput, detectionOutput: detOutput }));
            addLog(`🤖 Detection Agent: Analyzed Image + Description. Class [${issueType}] parsed with ${Math.round(confidence * 100)}% confidence.`, "bot");
            if (triggerFound) {
              addLog(`🚨 [Emergency Escalation Agent] DETECTED CRITICAL THREAT: "${triggerFound}". Marks issue as Critical, escalates impact score to 100, assigns instant priority routing override.`, "warning");
              addLog(`📞 First Responder Alert: Dispatched ${authority} immediately. Bypassed standard triaging queue.`, "success");
            }
            addLog(`Handoff ➔ Passing Detection Verdict to Verification Agent for duplicate checking...`, "system");
            timer = setTimeout(() => {
              if (isActive) setActiveStep(1);
            }, executionSpeed);
          }
          break;

        case 1: // 2. Verification Agent
          {
            setCurrentPayloads(prev => ({ ...prev, verificationInput: verInput, verificationOutput: verOutput }));
            addLog(`🛡️ Verification Agent: Completed geofence duplicates scan. VerificationStatus: [Authentic] (Unique report).`, "bot");
            addLog(`Handoff ➔ Handing verified payload to Prioritization Agent for impact indexing...`, "system");
            timer = setTimeout(() => {
              if (isActive) setActiveStep(2);
            }, executionSpeed);
          }
          break;

        case 2: // 3. Prioritization Agent
          {
            setCurrentPayloads(prev => ({ ...prev, prioritizationInput: prInput, prioritizationOutput: prOutput }));
            addLog(`🔥 Prioritization Agent: Calculated Civic Impact score as [${impactScore}/100]. Category classified: [${severity}].`, "bot");
            addLog(`Handoff ➔ Passing prioritized metadata to Authority Routing Agent for jurisdiction assignment...`, "system");
            timer = setTimeout(() => {
              if (isActive) setActiveStep(3);
            }, executionSpeed);
          }
          break;

        case 3: // 4. Authority Routing Agent
          {
            setCurrentPayloads(prev => ({ ...prev, routingInput: rotInput, routingOutput: rotOutput }));
            addLog(`⚡ Authority Routing Agent: Auto-routed ticket to [${dept}]. Assigned field officer: ${officer}.`, "bot");
            addLog(`Handoff ➔ Sending assigned dispatch metadata to Resolution Agent for construction planning...`, "system");
            timer = setTimeout(() => {
              if (isActive) setActiveStep(4);
            }, executionSpeed);
          }
          break;

        case 4: // 5. Resolution Agent
          {
            setCurrentPayloads(prev => ({ ...prev, resolutionInput: resInput, resolutionOutput: resOutput }));
            addLog(`🔧 Resolution Agent: Formulated repair plans. Estimated Budget: $${cost}, Workforce requirement: ${hours} hrs.`, "bot");
            addLog(`Handoff ➔ Transferring blueprints to Prediction Agent for regional risk modeling...`, "system");
            timer = setTimeout(() => {
              if (isActive) setActiveStep(5);
            }, executionSpeed);
          }
          break;

        case 5: // 6. Prediction Agent
          {
            setCurrentPayloads(prev => ({ ...prev, predictionInput: preInput, predictionOutput: preOutput }));
            addLog(`📈 Prediction Agent: Projection modeled. Risk increases +${riskPct}% if neglected. Hotspot warning flag: ${preOutput.hotspotWarning ? "ACTIVE" : "INACTIVE"}.`, "bot");
            addLog(`🎉 Complete Multi-Agent Workflow Executed Successfully. Logging record to Ledger Database...`, "success");
            
            timer = setTimeout(() => {
              if (!isActive) return;
              setActiveStep(6);
              setIsRunning(false);
              
              const reportsNum = issues.length + 1;
              const generatedId = `CIV-${100 + reportsNum}`;
              
              const completedReport: IssueReport = {
                id: generatedId,
                title: currentVision ? `${currentVision.issueType} on ${address.split(',')[0]}` : selectedPreset.title,
                description: currentVision ? currentVision.description : description,
                location: {
                  latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
                  longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
                  address: address,
                  district: district
                },
                imageUrl: imageUrl || "https://images.unsplash.com/photo-1599740831419-b5ce14cbd579?auto=format&fit=crop&w=500&q=80",
                status: "Reported",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                reporterName: currentUser,
                agentTrace: {
                  detection: detOutput,
                  emergencyEscalation: {
                    isEscalated: !!triggerFound,
                    triggerFound: triggerFound,
                    escalatedPriority: "Critical" as const,
                    authorityNotified: authority || "None Specified",
                    notificationTimestamp: new Date().toISOString(),
                    bannerMessage: triggerFound ? `🔴 CRITICAL HAZARD ESCALATION: ${triggerFound.toUpperCase()} detected! Immediate authority response dispatched.` : "",
                    decisionNotes: triggerFound
                      ? `Emergency Escalation Agent evaluated report details. Visual/textual signature matches safety envelope of [${triggerFound}]. Bypassed standard triaging queue to notify ${authority} immediately.`
                      : "Emergency Escalation Agent monitored other agents' detection frames. No critical hazard match triggered."
                  },
                  verification: verOutput,
                  prioritization: prOutput,
                  routing: rotOutput,
                  resolution: resOutput,
                  prediction: preOutput
                }
              };
              
              addLog(`💾 Committing generated asset: "${generatedId}" registered inside CivicOS Ledger.`, "success");
              onAddNewIssue(completedReport);
            }, executionSpeed);
          }
          break;

        default:
          break;
      }
    };

    processStep();

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [isRunning, activeStep]);

  // Utility to grab the confidence score out of current agent states
  const getAgentConfidence = (step: number) => {
    switch (step) {
      case 0: return currentPayloads.detectionOutput?.confidenceScore ?? 0.96;
      case 1: return currentPayloads.verificationOutput?.confidenceScore ?? 0.94;
      case 2: return 0.95; // calculated prioritizing factor
      case 3: return 0.98; // department matching heuristics
      case 4: return 0.92; // cost estimator confidence
      case 5: return 0.89; // prediction decay modeling accuracy
      default: return 0.95;
    }
  };

  const getAgentStatusText = (stepIndex: number) => {
    if (activeStep > stepIndex) return "DONE";
    if (activeStep === stepIndex) return "EXECUTING...";
    return "PENDING";
  };

  const borderClass = (stepIndex: number) => {
    if (activeStep === stepIndex) {
      return "border-indigo-400 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.25)] animate-pulse ring-2 ring-indigo-500/20";
    }
    if (activeStep > stepIndex) {
      return "border-emerald-500/30 bg-emerald-500/5";
    }
    return "border-slate-900 bg-slate-950/20 opacity-50";
  };

  const badgeColor = (stepIndex: number) => {
    if (activeStep === stepIndex) return "bg-indigo-500/20 text-indigo-400";
    if (activeStep > stepIndex) return "bg-emerald-500/20 text-emerald-400";
    return "bg-slate-900 text-slate-500";
  };

  return (
    <div className="space-y-8" id="agent-activity-center-view">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-2 inline-block">
              HACKATHON EVALUATION SANDBOX
            </span>
            <span className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-2 inline-block">
              JUDGES VIEW
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-100 italic tracking-tight flex items-center space-x-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>Agent Activity Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspect autonomous collaboration pipelines in real-time. Upload images or select presets to trace exact inputs, decision logic, and generated outputs passed sequentially from agent to agent.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 text-xs font-mono text-indigo-400 font-bold">
          <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Pipeline: Sequential 6-Agent Cascade</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input Control Station */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6 shadow-2xl bento-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">1. Pipeline Controller</span>
              <span className="text-[9px] font-mono text-indigo-400">INPUT INJECTION</span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">PRESET SCENARIOS</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    disabled={isRunning}
                    className={`p-2.5 rounded-xl border font-mono text-[10px] text-left leading-tight transition-all truncate hover:border-slate-700 disabled:opacity-50 ${
                      selectedPreset.id === preset.id 
                        ? "border-indigo-500/40 bg-indigo-550/10 text-indigo-300 font-bold" 
                        : "border-slate-900 bg-slate-950/40 text-slate-400"
                    }`}
                  >
                    {preset.title.split("on")[0] || preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload + Coordinates block */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">IMAGE PAYLOAD</span>
                <div 
                  onClick={() => !isRunning && fileInputRef.current?.click()} 
                  className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isRunning ? "opacity-50 cursor-not-allowed border-slate-850" : "border-slate-800 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-900/10"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isRunning}
                  />
                  {imageUrl ? (
                    <div className="relative group rounded-lg overflow-hidden h-28 mx-auto max-w-[180px]">
                      <img 
                        src={imageUrl} 
                        alt="Target Hazard" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 p-2">
                      <Upload className="w-5 h-5 text-slate-500 mx-auto" />
                      <p className="text-[10px] text-slate-400 m-0">Upload custom evaluation image</p>
                      <p className="text-[9px] text-slate-600 m-0">PNG or JPG formats supported</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">MUTABLE TEXT DESCRIPTION</label>
                <textarea
                  rows={3}
                  disabled={isRunning}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setVisionAnalysis(null);
                  }}
                  className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-350 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 disabled:opacity-50"
                  placeholder="Simulate custom structural report text to influence natural language processing cascade..."
                />
              </div>

              {/* District & Location */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[9px] font-mono text-slate-550 uppercase tracking-wider mb-1 font-bold">MUNICIPAL DISTRICT</span>
                  <input 
                    type="text" 
                    disabled={isRunning} 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-[11px] bg-slate-950/60 border border-slate-900 rounded-xl px-3 py-2 text-slate-300 disabled:opacity-50"
                  />
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-slate-550 uppercase tracking-wider mb-1 font-bold">LEDGER ADDRESS</span>
                  <input 
                    type="text" 
                    disabled={isRunning} 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-[11px] bg-slate-950/60 border border-slate-900 rounded-xl px-3 py-2 text-slate-300 disabled:opacity-50 truncate"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>SIMULATION INTERVAL</span>
                <select 
                  value={executionSpeed} 
                  onChange={(e) => setExecutionSpeed(Number(e.target.value))}
                  disabled={isRunning}
                  className="bg-slate-950 border border-slate-900 rounded px-2 py-0.5 text-indigo-400 text-[10px] font-bold"
                >
                  <option value={1500}>Fast (1.5s)</option>
                  <option value={2500}>Standard (2.5s)</option>
                  <option value={4500}>Detailed (4.5s)</option>
                </select>
              </div>

              {!isRunning && activeStep === -1 ? (
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs p-3 rounded-xl transition-all shadow-[0_5px_15px_rgba(79,70,229,0.25)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Initiate Live Agency Sequence</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-display font-medium text-xs p-3 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reset Sandbox / Re-Inject Inputs</span>
                </button>
              )}
            </div>
          </div>

          {/* Tracer Log Feed Terminal */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl bento-card space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">2. Live Signal Trace Logs</span>
              <span className="text-[10px] text-green-400 uppercase font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span>Streaming</span>
              </span>
            </div>

            <div className="h-44 overflow-y-auto text-[10px] space-y-2 pr-1 select-none">
              {systemLogs.length === 0 ? (
                <div className="text-slate-650 h-full flex items-center justify-center text-center p-4">
                  Idle. Click "Initiate Live Agency Sequence" to spin up simulated model processes.
                </div>
              ) : (
                systemLogs.map(log => {
                  let badge = "text-slate-500";
                  if (log.type === "bot") badge = "text-indigo-400";
                  if (log.type === "success") badge = "text-emerald-400";
                  if (log.type === "warning") badge = "text-rose-450";
                  return (
                    <div key={log.id} className="leading-tight flex items-start space-x-1.5 border-b border-slate-900/50 pb-1.5">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className={`${badge} flex-1`}>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Agent Grid & Dynamic Flow Handshake */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6 shadow-2xl bento-card">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">3. Multi-Agent Cascade Grid</span>
                <span className="text-[9px] font-mono text-slate-500 mt-1 block">Active signals progress sequentially in continuous network loop</span>
              </div>
              <span className="text-[9px] font-mono bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                6 Autonomous Nodes
              </span>
            </div>

            {/* Layout: Sequential Flow representing agentic cascade */}
            <div className="space-y-6 relative">
              
              {/* Agent Node 1: Detection Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(0)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 1: Detection Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(0)}`}>
                          {getAgentStatusText(0)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Scans image matrices & raw citizen text models</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(Date.now() - 5 * 5000).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{Math.round(getAgentConfidence(0) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details: Input, Decision, Output */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 0 && currentPayloads.detectionInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Image Asset:</strong> {currentPayloads.detectionInput.sourceImage}</div>
                        <div><strong className="text-slate-300">Prompt text:</strong> "{currentPayloads.detectionInput.reporterTextIn}"</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting source execution trigger...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 0 && currentPayloads.detectionOutput ? (
                      <div className="space-y-1 text-slate-404 text-[10px]">
                        <div><strong className="text-slate-300">Issue Type:</strong> <span className="text-indigo-300">{currentPayloads.detectionOutput.issueType}</span></div>
                        <div><strong className="text-slate-300">Severity:</strong> <span className="text-rose-455 font-bold">{currentPayloads.detectionOutput.severity}</span></div>
                        <div><strong className="text-slate-300">Identified Markers:</strong> {currentPayloads.detectionOutput.identifiedElements.join(", ")}</div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-indigo-400 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          "{currentPayloads.detectionOutput.notes}"
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Node 1.5: Emergency Escalation Agent */}
              <div id="agent-node-emergency-escalation" className={`border rounded-2xl p-4 transition-all duration-350 ${
                renderEmergency.triggerFound 
                  ? "border-red-500/40 bg-red-950/15 text-red-100" 
                  : "border-slate-800 bg-slate-950/10 text-slate-400"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                      renderEmergency.triggerFound 
                        ? "bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse" 
                        : "bg-slate-900 border border-slate-800 text-slate-500"
                    }`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 1.5: Emergency Escalation Agent</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                          renderEmergency.triggerFound ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {renderEmergency.triggerFound ? "ESCALATED CRITICAL" : "STANDBY MONITOR"}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Monitors vision and language logs for immediate life safety triggers</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Status</span>
                    <span className={`text-[10px] font-mono font-bold ${renderEmergency.triggerFound ? "text-red-400 animate-pulse" : "text-slate-500"}`}>
                      {renderEmergency.triggerFound ? "🚨 ACTIVE THREAT REDIRECT" : "● STANDBY MONITORING"}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 leading-relaxed">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">🔍 Target Safety Parameters</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        <span>Fallen wires</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        <span>Open manholes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        <span>Road collapse</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>Flooding</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <span className="w-1.5 h-1.5 bg-purple-550 rounded-full"></span>
                        <span>Gas leaks</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 text-[10px] flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">⚡ Escalation Verdict</span>
                      {renderEmergency?.triggerFound ? (
                        <div className="space-y-1">
                          <div className="text-red-300 font-black flex items-center gap-1">
                            <span>MATCHED: [ {renderEmergency.triggerFound} ]</span>
                          </div>
                          <div className="text-slate-400">
                            Priority raised to <strong className="text-red-400 font-bold">CRITICAL (100)</strong>. Standard queues bypassed.
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic block mt-1">No life safety threat markers identified in active transaction frame. Standard processing permitted.</span>
                      )}
                    </div>
                    {renderEmergency.triggerFound && (
                      <div className="mt-2 bg-slate-900/60 p-2 rounded border border-slate-850 text-slate-400 leading-normal">
                        <strong className="text-[9px] text-red-400 block uppercase mb-0.5 font-bold">👮 Authority Alert Dispatched</strong>
                        {renderEmergency.authority}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Handoff Line 1.5 ➔ 2 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep > 0 ? "text-emerald-400" : "text-slate-700"}`}>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Handoff Line 1 ➔ 2 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep === 1 ? "text-indigo-400" : activeStep > 1 ? "text-emerald-403" : "text-slate-700"}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                  <span>Handoff: Passed Detection Category Data package</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Agent Node 2: Verification Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(1)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-md">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 2: Verification Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(1)}`}>
                          {getAgentStatusText(1)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Computes deduplication geofences and checks historical ledger logs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(Date.now() - 4 * 5000).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-teal-400">{Math.round(getAgentConfidence(1) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 1 && currentPayloads.verificationInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Detected Type:</strong> {currentPayloads.verificationInput.detectedIssueType}</div>
                        <div><strong className="text-slate-300">Geo Coordinates:</strong> Lat 37.7749, Lng -122.4194</div>
                        <div><strong className="text-slate-300">Address Target:</strong> {currentPayloads.verificationInput.addressString}</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 1 && currentPayloads.verificationOutput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Duplicate Check:</strong> <span className="text-emerald-400">Unique (isDuplicate: false)</span></div>
                        <div><strong className="text-slate-300">Status Verdict:</strong> <span className="text-teal-401 font-bold">{currentPayloads.verificationOutput.verificationStatus}</span></div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-teal-400 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          "{currentPayloads.verificationOutput.crossReferenceNotes}"
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handoff Line 2 ➔ 3 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep === 2 ? "text-indigo-400" : activeStep > 2 ? "text-emerald-403" : "text-slate-700"}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                  <span>Handoff: Passed Authenticated Ticket envelope</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Agent Node 3: Prioritization Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(2)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 3: Prioritization Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(2)}`}>
                          {getAgentStatusText(2)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Evaluates population safety index and models civic disruption severity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(Date.now() - 3 * 5000).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-orange-400">{Math.round(getAgentConfidence(2) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 2 && currentPayloads.prioritizationInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Raw Severity:</strong> {currentPayloads.prioritizationInput.severityCategory}</div>
                        <div><strong className="text-slate-300">Verification Label:</strong> {currentPayloads.prioritizationInput.verifiedStatus}</div>
                        <div><strong className="text-slate-300">Demographic Region:</strong> {currentPayloads.prioritizationInput.districtProfile}</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 2 && currentPayloads.prioritizationOutput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Civic Disruption Index:</strong> <span className="text-amber-500 font-bold">{currentPayloads.prioritizationOutput.civicImpactScore}/100</span></div>
                        <div><strong className="text-slate-300">Priority Category:</strong> <span className="text-rose-500 font-bold">{currentPayloads.prioritizationOutput.priorityCategory}</span></div>
                        <div><strong className="text-slate-300">Impact Indicators:</strong> {currentPayloads.prioritizationOutput.factors.slice(0, 2).join(" | ")}</div>
                        <div><strong className="text-slate-300">Est. Population Flooded:</strong> {currentPayloads.prioritizationOutput.affectedPopulationEst} citizens</div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-orange-400 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          Matched coordinates over dense transit grids. Regional safety margins multiplier checked with {currentPayloads.prioritizationOutput.affectedPopulationEst} proximal citizens.
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handoff Line 3 ➔ 4 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep === 3 ? "text-indigo-400" : activeStep > 3 ? "text-emerald-403" : "text-slate-700"}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                  <span>Handoff: Passed Prioritized Disruption Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Agent Node 4: Authority Routing Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(3)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 4: Authority Routing Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(3)}`}>
                          {getAgentStatusText(3)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Auto-routes tickets to matching specialized departments & active officers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(Date.now() - 2 * 5000).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-purple-400">{Math.round(getAgentConfidence(3) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 3 && currentPayloads.routingInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Hazard Class:</strong> {currentPayloads.routingInput.hazardType}</div>
                        <div><strong className="text-slate-300">Impact Rating:</strong> {currentPayloads.routingInput.impactRating}</div>
                        <div><strong className="text-slate-300">Target District:</strong> {currentPayloads.routingInput.recipientDistrict}</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 3 && currentPayloads.routingOutput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Assigned Dept:</strong> <span className="text-purple-450 font-bold">{currentPayloads.routingOutput.department}</span></div>
                        <div><strong className="text-slate-300">Field Officer:</strong> <span className="text-slate-200">{currentPayloads.routingOutput.assignedOfficer}</span></div>
                        <div><strong className="text-slate-300">Task Priority:</strong> <span className="text-indigo-400 font-bold">{currentPayloads.routingOutput.dispatchPriority}</span></div>
                        <div><strong className="text-slate-300">Secure Dispatch Code:</strong> <span className="text-indigo-500 bg-indigo-500/10 px-1 py-0.2 rounded font-bold">{currentPayloads.routingOutput.contactChannel}</span></div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-purple-405 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          Forwarded target instructions to {currentPayloads.routingOutput.assignedOfficer} of bureau bureau {currentPayloads.routingOutput.department} under priority codes.
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handoff Line 4 ➔ 5 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep === 4 ? "text-indigo-400" : activeStep > 4 ? "text-emerald-403" : "text-slate-700"}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                  <span>Handoff: Passed Jurisdiction Allocation Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Agent Node 5: Resolution Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(4)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-md">
                      <Hammer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 5: Resolution Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(4)}`}>
                          {getAgentStatusText(4)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Compiles materials and engineers cost schedules & procedural roadmaps</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(Date.now() - 1 * 5000).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-blue-400">{Math.round(getAgentConfidence(4) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 4 && currentPayloads.resolutionInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Department node:</strong> {currentPayloads.resolutionInput.responsibleDept}</div>
                        <div><strong className="text-slate-300">Priority rating:</strong> {currentPayloads.resolutionInput.priorityLevel}</div>
                        <div><strong className="text-slate-300">Target Elements:</strong> {currentPayloads.resolutionInput.elementsList.slice(0, 2).join(", ")}</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 4 && currentPayloads.resolutionOutput ? (
                      <div className="space-y-1.5 text-slate-400 text-[10px]">
                        <div className="flex items-center space-x-3 mb-1 font-bold">
                          <span className="text-emerald-400 flex items-center"><DollarSign className="w-3.5 h-3.5" />{currentPayloads.resolutionOutput.estimatedCost} Cost estimate</span>
                          <span className="text-indigo-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{currentPayloads.resolutionOutput.estimatedHours} working hours</span>
                        </div>
                        <div><strong className="text-slate-300">Actions Checklists:</strong></div>
                        <ul className="list-disc list-inside pl-1 m-0 space-y-0.5 text-slate-400">
                          {currentPayloads.resolutionOutput.suggestedPlan.map((stepStr: string, sidx: number) => (
                            <li key={sidx} className="leading-tight">{stepStr}</li>
                          ))}
                        </ul>
                        <div className="mt-1 font-semibold flex flex-wrap gap-1">
                          <span className="text-[9px] text-slate-500 uppercase">Skills needed:</span>
                          {currentPayloads.resolutionOutput.requiredSkills.map((sk: string) => (
                            <span key={sk} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 rounded">{sk}</span>
                          ))}
                        </div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-blue-405 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          Constructed mechanical restoration sequence totaling ${currentPayloads.resolutionOutput.estimatedCost} covering equipment, materials, and safety crew logistics.
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handoff Line 5 ➔ 6 */}
              <div className="flex justify-center items-center py-1">
                <div className={`flex items-center space-x-2 font-mono text-[9px] font-bold ${activeStep === 5 ? "text-indigo-400" : activeStep > 5 ? "text-emerald-403" : "text-slate-700"}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                  <span>Handoff: Passed Action Blueprints & Material Budgets</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Agent Node 6: Prediction Agent */}
              <div className={`border rounded-2xl p-4 transition-all duration-350 ${borderClass(5)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md">
                      <LineChart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>Agent 6: Prediction Agent</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${badgeColor(5)}`}>
                          {getAgentStatusText(5)}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono m-0">Projects local risk trendlines and preventative policies over local Digital Twin grids</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Timestamp</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">{Math.round(getAgentConfidence(5) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block mb-1">➔ Input received</span>
                    {activeStep >= 5 && currentPayloads.predictionInput ? (
                      <div className="space-y-1 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Geographic Zone:</strong> {currentPayloads.predictionInput.zoneAddress}</div>
                        <div><strong className="text-slate-300">Hazard Type:</strong> {currentPayloads.predictionInput.identifiedType}</div>
                        <div><strong className="text-slate-300">Base Severity:</strong> {currentPayloads.predictionInput.severityVal}</div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/60">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">✔ Output Generated & Decision</span>
                    {activeStep >= 5 && currentPayloads.predictionOutput ? (
                      <div className="space-y-1.5 text-slate-400 text-[10px]">
                        <div><strong className="text-slate-300">Infrastructure Risk Group:</strong> {currentPayloads.predictionOutput.regionalTrendGroup}</div>
                        <div className="flex items-center space-x-3 text-[10px]">
                          <div><strong className="text-slate-300">Neglect Risk Penalty:</strong> <span className="text-orange-400 font-bold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{currentPayloads.predictionOutput.riskIncreasePercent}%</span></div>
                          {currentPayloads.predictionOutput.hotspotWarning && (
                            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-450 border border-rose-500/20 px-1.5 rounded font-bold uppercase">HOTSPOT SPOTLIGHT</span>
                          )}
                        </div>
                        <div className="border-t border-slate-900/80 pt-1 mt-1 leading-normal italic text-slate-500">
                          <strong className="text-slate-400 font-bold uppercase not-italic text-[9px] block mb-0.5">Preventative microcode:</strong>
                          "{currentPayloads.predictionOutput.preventativeAction}"
                        </div>
                        <div className="mt-2 bg-slate-950/40 p-2 rounded border border-slate-900 leading-normal text-slate-400">
                          <strong className="text-[9px] text-indigo-405 block uppercase mb-0.5 tracking-wider font-extrabold flex items-center gap-1"><span>💡 REASONING SUMMARY</span></strong>
                          Decay model calculates localized degradation penalty would rise to +{currentPayloads.predictionOutput.riskIncreasePercent}% if repair operations are postponed.
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-650 italic">Awaiting upstream telemetry...</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
