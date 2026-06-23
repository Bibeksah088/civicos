import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create Express App
const app = express();
const PORT = 3000;

// Body parser with size limits for base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to initialize GoogleGenAI lazily (fail-safe and secure)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("MY_GEMINI_API_KEY") || key === "") {
    console.warn("⚠️ GEMINI_API_KEY is not configured or placeholder. Running in simulation fallback mode.");
    return null;
  }
  aiClient = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return aiClient;
}

// Emergency Escalation Agent: automatic critical hazard processor
function applyEmergencyEscalation(trace: any, titleStr: string, descStr: string) {
  if (!trace) return;
  const content = `${titleStr || ""} ${descStr || ""} ${trace.detection?.issueType || ""}`.toLowerCase();
  
  let triggerMatched: "Fallen electrical wires" | "Open manholes" | "Major road collapse" | "Flooding" | "Gas leaks" | null = null;
  let authority = "";

  if (content.includes("electrical wire") || content.includes("fallen wire") || content.includes("downed power") || content.includes("live wire") || content.includes("sparking wire") || content.includes("exposed wire") || content.includes("wires")) {
    triggerMatched = "Fallen electrical wires";
    authority = "SF Fire Department & PG&E Emergency Services";
  } else if (content.includes("manhole") || content.includes("missing manhole") || content.includes("open manhole") || content.includes("uncovered manhole")) {
    triggerMatched = "Open manholes";
    authority = "SF Department of Public Works Emergency Hazard Dispatch";
  } else if (content.includes("road collapse") || content.includes("sinkhole") || content.includes("collapsed street") || content.includes("collapsed road") || content.includes("major road collapse")) {
    triggerMatched = "Major road collapse";
    authority = "SF Department of Building Inspection & DPW Structural Division";
  } else if (content.includes("flood") || content.includes("gushing water") || content.includes("heavy flooding") || content.includes("water flooding")) {
    triggerMatched = "Flooding";
    authority = "SF Water Enterprise Emergency Division & SFFD Disaster Operations";
  } else if (content.includes("gas leak") || content.includes("smell of gas") || content.includes("leaking gas") || content.includes("gas smell")) {
    triggerMatched = "Gas leaks";
    authority = "SF Fire Department Hazmat Unit & PG&E Gas Control Center";
  }

  if (triggerMatched) {
    if (!trace.detection) {
      trace.detection = {
        issueType: "Public safety",
        severity: "Critical",
        confidenceScore: 0.95,
        identifiedElements: [triggerMatched, "Emergency hazard signature"],
        notes: "Automatically diagnosed as extreme critical hazard."
      };
    } else {
      trace.detection.severity = "Critical";
    }

    if (!trace.prioritization) {
      trace.prioritization = {
        civicImpactScore: 100,
        priorityCategory: "Critical",
        factors: ["Active safety incident", "Extreme structural risk", "High injury probability"],
        affectedPopulationEst: 450
      };
    } else {
      trace.prioritization.priorityCategory = "Critical";
      trace.prioritization.civicImpactScore = 100;
      if (!trace.prioritization.factors) {
        trace.prioritization.factors = [];
      }
      if (!trace.prioritization.factors.includes("Active safety incident")) {
        trace.prioritization.factors.unshift("Active safety incident");
      }
    }

    if (!trace.routing) {
      trace.routing = {
        department: authority.split(" & ")[0],
        assignedOfficer: "SFFD Emergency Chief Vance",
        dispatchPriority: "Immediate",
        contactChannel: "EMERG_DISPATCH_HOTLINE"
      };
    } else {
      trace.routing.dispatchPriority = "Immediate";
      trace.routing.department = authority.split(" & ")[0];
    }

    trace.emergencyEscalation = {
      isEscalated: true,
      triggerFound: triggerMatched,
      escalatedPriority: "Critical",
      authorityNotified: authority,
      notificationTimestamp: new Date().toISOString(),
      bannerMessage: `🔴 CRITICAL HAZARD ESCALATION: ${triggerMatched.toUpperCase()} detected! Immediate authority response dispatched.`,
      decisionNotes: `Emergency Escalation Agent evaluated report details. Visual/textual signature matches safety envelope of [${triggerMatched}]. Bypassed standard triaging queue to notify ${authority} immediately.`
    };
  } else {
    trace.emergencyEscalation = {
      isEscalated: false,
      triggerFound: null,
      escalatedPriority: "Critical",
      authorityNotified: "",
      notificationTimestamp: "",
      bannerMessage: "",
      decisionNotes: "Emergency Escalation Agent monitored other agents' detection frames. No critical hazard match triggered."
    };
  }
}

// Global In-Memory Issue Store to permit syncing across views and dashboard
// Seed with high quality initial items matching community issues
const reportsStore: any[] = [
  {
    id: "CIV-291",
    title: "Severe Pothole Cluster on Oak Boulevard",
    description: "Multiple progressive structural cracks and deep potholes blocking the main lane, forcing school buses to swerve into oncoming traffic.",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "842 Oak Blvd, Western District",
      district: "Western District"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
    status: "Resolving",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    reporterName: "Marcus Vance",
    agentTrace: {
      detection: {
        issueType: "Pothole",
        severity: "High",
        confidenceScore: 0.98,
        identifiedElements: ["Asphalt degradation", "Sub-base cratering", "Subgrade moisture accumulation"],
        notes: "Heavy progressive failure of the asphalt surfacing. The sub-base layer is fully exposed with visual signs of deep moisture pooling."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.95,
        crossReferenceNotes: "Validated metadata timestamp, geo-coordinates verified within 3 meters grid alignment, and checked against municipal duplicate records."
      },
      prioritization: {
        civicImpactScore: 84,
        priorityCategory: "High",
        factors: ["Active transit disruption", "Structural damage vector", "Vulnerable transit route"],
        affectedPopulationEst: 450
      },
      routing: {
        department: "Department of Public Works",
        assignedOfficer: "Engineer Sarah Lin (Pothole Remediation Unit)",
        dispatchPriority: "Expedited",
        contactChannel: "DPW-E-DISPATCH"
      },
      resolution: {
        suggestedPlan: [
          "Establish temporary traffic management and dynamic channelization.",
          "Execute full-depth saw joint cut surrounding the active crater cluster.",
          "Evacuate subgrade material, compact soil foundation, and seal moisture barrier.",
          "Apply hot-pour premium asphalt mix binder and compact to design elevation."
        ],
        estimatedCost: 350,
        estimatedHours: 4,
        requiredSkills: ["Asphalt compaction", "Thermoregulator safety", "Tactical joint-seal application"]
      },
      prediction: {
        regionalTrendGroup: "Frost-Heave Asphalt Risk Zone",
        riskIncreasePercent: 42,
        hotspotWarning: true,
        preventativeAction: "Implement regional subsurface drainage evaluation and comprehensive thermal-seal maintenance before the winter weather cycle."
      }
    }
  },
  {
    id: "CIV-312",
    title: "Major Drainage Clog and Sewer Backflow",
    description: "Sewer storm drain is completely packed with heavy storm garbage and branches. Runoff water has flooded the sidewalk and is spilling into garages.",
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: "152 Pine Street, Downtown Centre",
      district: "Downtown"
    },
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=80",
    status: "Prioritized",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    reporterName: "Elena Rostova",
    agentTrace: {
      detection: {
        issueType: "Drainage problems",
        severity: "Critical",
        confidenceScore: 0.96,
        identifiedElements: ["Debris blockage", "Minor sidewalk flooding", "Sewer grate obstruction"],
        notes: "Major blockage due to vegetative runoff debris. Runoff is currently causing erosion to the sidewalk foundation."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.99,
        crossReferenceNotes: "Multiple image matches and telemetry confirms real-time localized rainfall accumulation matching runoff event."
      },
      prioritization: {
        civicImpactScore: 92,
        priorityCategory: "Critical",
        factors: ["Pedestrian hazard", "Immediate property integrity damage", "Storm runoff vulnerability"],
        affectedPopulationEst: 850
      },
      routing: {
        department: "Department of Water & Power",
        assignedOfficer: "Chief Hydrologist Thomas Vance",
        dispatchPriority: "Immediate",
        contactChannel: "DWP-STORM-HOTLINE"
      },
      resolution: {
        suggestedPlan: [
          "Deploy hydraulic vac-truck to suction organic debris and heavy sediments.",
          "Clear subgrade pipe obstruction utilizing high-velocity water jetting.",
          "Evaluate structural storm grate damage and reset heavy iron mesh."
        ],
        estimatedCost: 620,
        estimatedHours: 3,
        requiredSkills: ["High-impact hydraulic ops", "Sewer hazard qualification"]
      },
      prediction: {
        regionalTrendGroup: "Low-Gradient Drainage Overlay",
        riskIncreasePercent: 78,
        hotspotWarning: true,
        preventativeAction: "Upgrade historic curb inlets to high-volume storm interception grates and initiate bimonthly structural street sweeping."
      }
    }
  },
  {
    id: "CIV-104",
    title: "Exposed Wire Hazard on Broken Light Pole",
    description: "Damaged pedestrian streetlamp with base cover missing. Sparks occasionally visible near active conduit, extremely dangerous to neighborhood children.",
    location: {
      latitude: 37.7694,
      longitude: -122.4412,
      address: "1224 Castro St, Eastern District",
      district: "Eastern District"
    },
    imageUrl: "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=500&q=80",
    status: "Resolved",
    createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    reporterName: "David Cole",
    agentTrace: {
      detection: {
        issueType: "Broken streetlight",
        severity: "Critical",
        confidenceScore: 0.99,
        identifiedElements: ["Exposed high-voltage conduit", "Missing protective panel", "Compromised structural pole base"],
        notes: "Extremely serious safety concern. The primary power conduit is exposed directly to contact and weather factors."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 1.0,
        crossReferenceNotes: "Telemetric verification against electricity network confirms active transformer fluctuation matching ground coordinates."
      },
      prioritization: {
        civicImpactScore: 98,
        priorityCategory: "Critical",
        factors: ["Immediate danger of death", "Child pedestrian corridor", "Weather deterioration vulnerability"],
        affectedPopulationEst: 300
      },
      routing: {
        department: "Traffic & Safety Administration",
        assignedOfficer: "Grid Inspector James Croft",
        dispatchPriority: "Immediate",
        contactChannel: "TSA-LIVE-POWER"
      },
      resolution: {
        suggestedPlan: [
          "Emergency dispatch to de-energize local lighting circuit node immediately.",
          "Secure site with high-visibility hazard barricades and cautionary warning signs.",
          "Disconnect compromised supply cables, strip oxidation on connectors, and re-wire base.",
          "Install ultra-tough high-impact steel lockable conduit plate to ensure toddler-safety."
        ],
        estimatedCost: 180,
        estimatedHours: 2,
        requiredSkills: ["Grid isolations", "Conduit engineering"]
      },
      prediction: {
        regionalTrendGroup: "Aging Municipal Grid Nodes",
        riskIncreasePercent: 95,
        hotspotWarning: false,
        preventativeAction: "Bulk-replace legacy plastic light pole base lids with security tamper-proof high-tensile steel locked covers across the Castro corridor."
      }
    }
  }
];

// Community Verification Helper Calculations and Integrations
function updateCommunityVerificationMetrics(issue: any) {
  if (!issue.communityVerification) {
    issue.communityVerification = {
      verificationsCount: 0,
      rejectionsCount: 0,
      evidenceUrls: [],
      severityVotes: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      trustScore: 75,
      confidenceScore: 50
    };
  }
  const { verificationsCount, rejectionsCount, severityVotes } = issue.communityVerification;
  const totalVotes = verificationsCount + rejectionsCount;
  
  // Calculate confidence score (ratio of confirmations to total, weighted by total count)
  let confidence = 50;
  if (totalVotes > 0) {
    confidence = Math.round((verificationsCount / totalVotes) * 100);
  }
  issue.communityVerification.confidenceScore = confidence;

  // Calculate community trust score
  let trust = 75; // baseline
  if (totalVotes > 0) {
    const positiveImpact = verificationsCount * 5;
    const negativeImpact = rejectionsCount * 15;
    trust = Math.max(10, Math.min(99, 75 + positiveImpact - negativeImpact));
  }
  issue.communityVerification.trustScore = trust;

  // RE-CALCULATE PRIORITIZATION IMPACT SCORE (Use these values in Prioritization Agent calculations)
  if (issue.agentTrace && issue.agentTrace.prioritization) {
    let baseImpact = issue.agentTrace.detection?.severity === "Critical" ? 90 :
                     issue.agentTrace.detection?.severity === "High" ? 75 :
                     issue.agentTrace.detection?.severity === "Medium" ? 50 : 30;
    
    // factor in confirmations and rejections
    const confirmationWeight = verificationsCount * 3; // +3 points per confirmation
    const rejectionWeight = rejectionsCount * 10;      // -10 points per rejection
    
    // factor in severity votes
    const totalSeverityVotes = severityVotes.Low + severityVotes.Medium + severityVotes.High + severityVotes.Critical;
    let severityMod = 0;
    if (totalSeverityVotes > 0) {
      const avgSeverityVal = (severityVotes.Low * 1 + severityVotes.Medium * 2 + severityVotes.High * 3 + severityVotes.Critical * 4) / totalSeverityVotes;
      const baseSeverityVal = issue.agentTrace.detection?.severity === "Critical" ? 4 :
                              issue.agentTrace.detection?.severity === "High" ? 3 :
                              issue.agentTrace.detection?.severity === "Medium" ? 2 : 1;
      
      // Shift score by difference multiplied by weight
      severityMod = Math.round((avgSeverityVal - baseSeverityVal) * 12);
    }

    let rawScore = baseImpact + confirmationWeight - rejectionWeight + severityMod;
    let finalScore = Math.max(10, Math.min(100, rawScore));
    issue.agentTrace.prioritization.civicImpactScore = finalScore;

    // Dynamically adjust category
    if (finalScore >= 85) {
      issue.agentTrace.prioritization.priorityCategory = "Critical";
    } else if (finalScore >= 70) {
      issue.agentTrace.prioritization.priorityCategory = "High";
    } else if (finalScore >= 40) {
      issue.agentTrace.prioritization.priorityCategory = "Medium";
    } else {
      issue.agentTrace.prioritization.priorityCategory = "Low";
    }
  }
}

function ensureCommunityVerifications(reports: any[]) {
  reports.forEach((report, index) => {
    if (!report.communityVerification) {
      const confirms = report.status === "Resolved" ? 14 : report.status === "Resolving" ? 8 : (index * 3 + 2) % 6 + 2;
      const rejections = report.status === "Resolved" ? 0 : (index * 2) % 2;
      const sev = report.agentTrace?.detection?.severity || "Medium";
      const votes = {
        Low: sev === "Low" ? confirms : 0,
        Medium: sev === "Medium" ? confirms : 1,
        High: sev === "High" ? confirms : 0,
        Critical: sev === "Critical" ? confirms : 0
      };
      
      report.communityVerification = {
        verificationsCount: confirms,
        rejectionsCount: rejections,
        evidenceUrls: report.imageUrl ? [report.imageUrl] : [],
        severityVotes: votes,
        trustScore: 75,
        confidenceScore: 50
      };
      
      updateCommunityVerificationMetrics(report);
    }
  });
}

// Helper to calculate health stats
function getCityHealthStats() {
  const activeCount = reportsStore.filter(r => r.status !== "Resolved").length;
  const resolvedCount = reportsStore.filter(r => r.status === "Resolved").length;
  const total = reportsStore.length;
  
  // Calculate average response duration
  const activeRates = reportsStore.map(r => r.agentTrace?.prioritization?.civicImpactScore || 50);
  const avgImpact = activeRates.reduce((a, b) => a + b, 0) / (total || 1);
  
  // Base index out of active impact
  const healthScore = Math.max(25, Math.min(99, Math.round(95 - (activeCount * 2.5) - (avgImpact * 0.12))));
  const publicSafetyIndex = Math.max(30, Math.min(99, Math.round(98 - (reportsStore.filter(r => r.agentTrace?.detection?.severity === "Critical" && r.status !== "Resolved").length * 8))));
  
  return {
    healthScore,
    activeIssues: activeCount,
    resolvedIssues: resolvedCount,
    averageResolutionHours: 18,
    publicSafetyIndex,
    carbonImpactReductionKg: resolvedCount * 120 + 450
  };
}

// 1. GET all civic issues
app.get("/api/reports", (req, res) => {
  ensureCommunityVerifications(reportsStore);
  res.json(reportsStore);
});

// New Community Verification route (verify, reject, upload evidence, vote severity)
app.post("/api/reports/:id/verify", (req, res) => {
  const { id } = req.params;
  const { action, severityVote, evidenceUrl } = req.body;

  ensureCommunityVerifications(reportsStore); // ensure present
  const issue = reportsStore.find(r => r.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Report not found" });
  }

  if (action === "verify") {
    issue.communityVerification.verificationsCount += 1;
  } else if (action === "reject") {
    issue.communityVerification.rejectionsCount += 1;
  }

  if (evidenceUrl) {
    issue.communityVerification.evidenceUrls.push(evidenceUrl);
  }

  if (severityVote && ["Low", "Medium", "High", "Critical"].includes(severityVote)) {
    issue.communityVerification.severityVotes[severityVote] += 1;
  }

  updateCommunityVerificationMetrics(issue);
  issue.updatedAt = new Date().toISOString();

  // If status is "Reported" & has at least 2 confirmations, change status to "Verified"
  if (issue.status === "Reported" && issue.communityVerification.verificationsCount >= 2) {
    issue.status = "Verified";
  }

  res.json({ success: true, issue });
});

// 2. GET general city health stats
app.get("/api/stats", (req, res) => {
  ensureCommunityVerifications(reportsStore);
  res.json(getCityHealthStats());
});

// Helper to retrieve and format image part for Gemini Vision
async function getImagePart(imageInput: string): Promise<any | null> {
  if (!imageInput) return null;
  if (imageInput.startsWith("data:image/")) {
    const commaIdx = imageInput.indexOf(",");
    if (commaIdx !== -1) {
      const mime = imageInput.substring(5, imageInput.indexOf(";"));
      const base64Data = imageInput.substring(commaIdx + 1);
      return {
        inlineData: {
          mimeType: mime,
          data: base64Data
        }
      };
    }
  } else if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    try {
      const response = await fetch(imageInput);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let mimeType = response.headers.get("content-type") || "image/jpeg";
      if (!mimeType.startsWith("image/")) {
        mimeType = "image/jpeg";
      }
      return {
        inlineData: {
          mimeType: mimeType,
          data: buffer.toString("base64")
        }
      };
    } catch (e) {
      console.error("⚠️ Failed to fetch image URL inside getImagePart helper: ", e);
    }
  }
  return null;
}

// 2.5 New endpoint: POST analyze-vision using Gemini Vision for sandbox detection
app.post("/api/agents/analyze-vision", async (req, res) => {
  const { image, description } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Missing required image content." });
  }

  const ai = getGeminiClient();

  // If Gemini is not configured, run a high-fidelity simulation
  if (!ai) {
    console.log("ℹ️ Gemini Client is not configured. Running simulation for analyze-vision endpoint.");
    const dLower = (description || "").toLowerCase();
    let issueType = "Garbage accumulation";
    let severity = "Medium";
    let confidenceScore = 0.94;
    let identifiedElements = ["Debris scatter", "Refuse containers", "Waste build-up"];
    let notes = "Static mock analysis. Please set GEMINI_API_KEY in the Secrets panel to activate actual Gemini Vision reasoning.";

    if (dLower.includes("pothole") || dLower.includes("road") || dLower.includes("street") || dLower.includes("crater")) {
      issueType = "Pothole";
      severity = dLower.includes("severe") || dLower.includes("deep") ? "High" : "Medium";
      confidenceScore = 0.98;
      identifiedElements = ["Asphalt fracture", "Subgrade moisture cratering", "Border erosion"];
    } else if (dLower.includes("water") || dLower.includes("leak") || dLower.includes("flood") || dLower.includes("pipe") || dLower.includes("drain")) {
      issueType = "Water leakage";
      severity = dLower.includes("flood") || dLower.includes("gushing") ? "Critical" : "High";
      confidenceScore = 0.96;
      identifiedElements = ["Hydrostatic pavement pooling", "Subsurface flow plume", "Conduit rupture joints"];
    } else if (dLower.includes("light") || dLower.includes("lamp") || dLower.includes("electrical") || dLower.includes("wire") || dLower.includes("spark")) {
      issueType = "Broken streetlight";
      severity = dLower.includes("wire") || dLower.includes("spark") ? "Critical" : "Medium";
      confidenceScore = 0.99;
      identifiedElements = ["Compromised connection terminals", "Exposed metallic wiring", "Atmospheric sparking spark"];
    }

    return res.json({
      success: true,
      analysis: {
        issueType,
        severity,
        description: `Visual analysis of simulated image classified candidate as [${issueType}] with severity level [${severity}]. Original citizen report description: "${description || 'No text context provided'}"`,
        confidenceScore,
        identifiedElements,
        notes
      }
    });
  }

  try {
    const imagePart = await getImagePart(image);
    if (!imagePart) {
      return res.status(400).json({ error: "Unable to process or fetch the provided image asset." });
    }

    const textPrompt = `
      You are the Detection Agent of the CivicOS multi-agent municipal pipeline.
      Analyze the provided visual image in conjunction with the citizen's optional description.
      
      Citizen Description: "${description || "No text description provided."}"

      You must classify the hazard into one of these 4 specific categories:
      1. "Pothole"
      2. "Garbage accumulation"
      3. "Water leakage"
      4. "Broken streetlight"

      Estimate the severity of the hazard: "Low", "Medium", "High", or "Critical".
      Provide a highly precise generated description of the visual scene, specifying exactly what infrastructure is damaged, the immediate risk factors, and pedestrian impact.
      Formulate a realistic confidenceScore between 0.85 and 1.00.
      List any specific identifiedElements (e.g. ['exposed terminal board', 'gushing water plume', 'subgrade asphalt hole']).
      Provide brief engineering notes.

      Conform strictly to the following JSON structure. Return only valid raw JSON. Only return JSON.
    `;

    console.log(`🚀 Requesting Gemini Vision model gemini-3.5-flash for image analysis...`);
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: textPrompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING, description: "Must be exactly one of: 'Pothole', 'Garbage accumulation', 'Water leakage', 'Broken streetlight'" },
            severity: { type: Type.STRING, description: "Must be: 'Low', 'Medium', 'High', or 'Critical'" },
            description: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            identifiedElements: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING }
          },
          required: ["issueType", "severity", "description", "confidenceScore", "identifiedElements", "notes"]
        }
      }
    });

    const parsedJson = JSON.parse(result.text.trim());
    console.log("✅ Gemini Vision successfully processed visual hazard payload:", parsedJson);
    return res.json({ success: true, analysis: parsedJson });

  } catch (err: any) {
    console.error("❌ Gemini Vision analysis endpoint failed: ", err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. POST processes a reported issue using the 6-agent Gemini pipeline
app.post("/api/agents/process", async (req, res) => {
  const { title, description, image, location, reporterName } = req.body;

  if (!description || !location) {
    return res.status(400).json({ error: "Missing required fields: description and location data." });
  }

  const reportsNum = reportsStore.length + 1;
  const generatedId = `CIV-${100 + reportsNum}`;

  // Check if Gemini Client is active
  const ai = getGeminiClient();

  // Simulated AI response generator as fallback (very realistic and tailored)
  const generateSimulatedData = () => {
    // Generate tailored details based on description keyword mapping
    const descLower = description.toLowerCase();
    let type = "Garbage accumulation";
    let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let impact = 45;
    let dept = "Department of Sanitation";
    let plan = [
      "Deploy municipal sanitation fleet.",
      "Thoroughly sweep and sanitize affected roadway and street grids.",
      "Coordinate preventative containment placement."
    ];
    let skills = ["Resource dispatch", "Waste extraction protocols"];
    let cost = 150;
    let hours = 3;

    if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("street") || descLower.includes("crack")) {
      type = "Pothole";
      severity = descLower.includes("danger") || descLower.includes("huge") || descLower.includes("severe") ? "High" : "Medium";
      impact = severity === "High" ? 78 : 55;
      dept = "Department of Public Works";
      plan = [
        "Secure lane alignment with orange perimeter cones.",
        "Clear loose material and dry moisture using high-velocity air blower.",
        "Inject binder compound followed by compaction of hot-pour asphalt matrix.",
        "Seal perimeters with thermo-sealant."
      ];
      skills = ["Asphalt compaction", "Safety lane management"];
      cost = 250;
      hours = 4;
    } else if (descLower.includes("water") || descLower.includes("flood") || descLower.includes("drain") || descLower.includes("leak") || descLower.includes("pipe")) {
      type = "Water leakage";
      severity = descLower.includes("flood") || descLower.includes("gushing") ? "Critical" : "Medium";
      impact = severity === "Critical" ? 90 : 60;
      dept = "Department of Water & Power";
      plan = [
        "Locate isolation valve block and bypass conduit loop.",
        "Perform excavation to expose fractured pipeline joints.",
        "Execute rapid sleeve replacement and reinforce structurally.",
        "Verify hydrostatic grid integrity before backfilling soil."
      ];
      skills = ["Hydro-system engineering", "Soil stabilization"];
      cost = 450;
      hours = 6;
    } else if (descLower.includes("dark") || descLower.includes("light") || descLower.includes("lamp") || descLower.includes("electrical") || descLower.includes("wire")) {
      type = "Broken streetlight";
      severity = descLower.includes("wire") || descLower.includes("spark") ? "Critical" : "Medium";
      impact = severity === "Critical" ? 92 : 40;
      dept = "Traffic & Safety Administration";
      plan = [
        "Isolate subgrade feeder pillar and safely de-energize streetlight node.",
        "Inspect luminaire driver wiring and photo-sensor control switches.",
        "Replace fractured elements with rugged high-impact high-efficiency LED casing.",
        "Exemplify grounding terminal to prevent electrical dispersion."
      ];
      skills = ["High-voltage safety", "Lighting driver calibration"];
      cost = 190;
      hours = 2;
    } else if (descLower.includes("hazard") || descLower.includes("safety") || descLower.includes("danger") || descLower.includes("accident")) {
      type = "Public safety";
      severity = "High";
      impact = 82;
      dept = "Traffic & Safety Administration";
      plan = [
        "Establish tactical site barrier limits surrounding the risk factor.",
        "Notify active field compliance agents and request priority review.",
        "Deploy appropriate support units to completely suppress or repair the hazard."
      ];
      skills = ["Hazard isolation", "Crowd safety logistics"];
      cost = 220;
      hours = 3;
    }

    return {
      title: title || `Verified ${type} on ${location.address.split(',')[0]}`,
      detection: {
        issueType: type,
        severity: severity,
        confidenceScore: 0.94,
        identifiedElements: ["Primary visual signature verified", "Surrounding erosion", "Pedestrian disruption visual feedback"],
        notes: `Simulated vision detection analyzed issue of type [${type}] with calculated [${severity}] impact. Detailed description: ${description}`
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.92,
        crossReferenceNotes: `Cross-referenced with recent logs inside district [${location.district}]. Standard geo-matching detected zero active conflict overlays.`
      },
      prioritization: {
        civicImpactScore: impact,
        priorityCategory: severity,
        factors: ["Active transit impedance", "Erosion vulnerability", "Local residential density check"],
        affectedPopulationEst: Math.round(150 + Math.random() * 200)
      },
      routing: {
        department: dept,
        assignedOfficer: `Officer Dave Vance (Special Task Group Unit ${2 + Math.floor(Math.random() * 6)})`,
        dispatchPriority: severity === "Critical" ? "Immediate" : severity === "High" ? "Expedited" : "Standard",
        contactChannel: `${dept.replace(/\s/g, "").toUpperCase()}-SECURE-DISPATCH`
      },
      resolution: {
        suggestedPlan: plan,
        estimatedCost: cost,
        estimatedHours: hours,
        requiredSkills: skills
      },
      prediction: {
        regionalTrendGroup: `${location.district} Infrastructure Load Envelope`,
        riskIncreasePercent: Math.round(15 + Math.random() * 40),
        hotspotWarning: impact > 70,
        preventativeAction: `Perform bimonthly thermal scan checks and reinforce drainage capacity to buffer this specific sector against progressive degradations.`
      }
    };
  };

  try {
    if (!ai) {
      // Return simulated trace immediately
      const sim = generateSimulatedData();
      applyEmergencyEscalation(sim, title || sim.title, description);
      const newReport = {
        id: generatedId,
        title: sim.title,
        description,
        location,
        imageUrl: image || "https://images.unsplash.com/photo-1599740831419-b5ce14cbd579?auto=format&fit=crop&w=500&q=80",
        status: "Reported",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reporterName: reporterName || "Anonymous Citizen",
        agentTrace: sim
      };
      
      reportsStore.unshift(newReport);
      return res.json({ success: true, report: newReport, isSimulated: true });
    }

    // IF GEMINI IS ENABLED, construct the multimodal image + prompt pipeline
    let modelParts: any[] = [];
    
    // Check if base64 image was uploaded
    if (image && image.startsWith("data:image")) {
      const commaIdx = image.indexOf(",");
      if (commaIdx !== -1) {
        const mime = image.substring(5, image.indexOf(";"));
        const base64Data = image.substring(commaIdx + 1);
        modelParts.push({
          inlineData: {
            mimeType: mime,
            data: base64Data
          }
        });
      }
    }

    // Add comprehensive multi-agent instructions in the text prompt part
    const instructions = `
      You are the coordinator of CivicOS Multi-Agent Municipal platform.
      Analyze the community report below and run analysis under 6 distinct simulated agent profiles:
      1. Detection Agent: Scans image + text to determine the specific class of issue: "Pothole", "Garbage accumulation", "Water leakage", "Broken streetlight", "Drainage problems", "Public safety", or "Other". Estimate severity ("Low", "Medium", "High", "Critical").
      2. Verification Agent: Checks coordinates against duplication rules. Determine whether isDuplicate (true/false) based on regional report consistency. Assign verificationStatus ("Authentic", "Unverified", "Spam").
      3. Prioritization Agent: Calculate Civic Impact Score (1 to 100). Classify priorityCategory ("Low", "Medium", "High", "Critical"). List hazard factors.
      4. Authority Routing Agent: Assign responsible municipal department ("Department of Public Works", "Department of Sanitation", "Department of Water & Power", "Traffic & Safety Administration", or similar), choose a funny/realistic Officer name, set dispatchPriority ("Standard", "Expedited", "Immediate") and assign contactChannel dispatch code.
      5. Resolution Agent: Suggest step-by-step repair phases (at least 3 steps), estimate aggregate Repair Cost (numeric in USD, eg. 250), and worker hours (numeric, e.g. 5).
      6. Prediction Agent: Assign regional microclimatic or load risk factor group. Give a Risk Increase Percent (0 to 100) if neglected, set hotspotWarning (true/false) and suggest micro-policy preventative action.

      MUNICIPAL CONTEXT:
      - Reported Location Address: ${location.address} (District: ${location.district})
      - Citizen Description: "${description}"
      - Preferred Title: "${title || "Community Issue"}"

      IMPORTANT: Your entire response must conform strictly to the configured JSON schema.
    `;

    modelParts.push({ text: instructions });

    console.log(`🚀 Contacting Gemini Model gemini-3.5-flash for report processing...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: modelParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Highly concise clean title of this issue" },
            detection: {
              type: Type.OBJECT,
              properties: {
                issueType: { type: Type.STRING, description: "Pothole, Broken streetlight, Drainage problems, Water leakage, Garbage accumulation, Public safety, or Other" },
                severity: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
                confidenceScore: { type: Type.NUMBER },
                identifiedElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                notes: { type: Type.STRING }
              },
              required: ["issueType", "severity", "confidenceScore", "identifiedElements", "notes"]
            },
            verification: {
              type: Type.OBJECT,
              properties: {
                isDuplicate: { type: Type.BOOLEAN },
                duplicateReferenceId: { type: Type.STRING, description: "Optional code like CIV-DUP-01 or null if unique" },
                verificationStatus: { type: Type.STRING, description: "Authentic, Unverified, or Spam" },
                confidenceScore: { type: Type.NUMBER },
                crossReferenceNotes: { type: Type.STRING }
              },
              required: ["isDuplicate", "verificationStatus", "confidenceScore", "crossReferenceNotes"]
            },
            prioritization: {
              type: Type.OBJECT,
              properties: {
                civicImpactScore: { type: Type.NUMBER },
                priorityCategory: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
                factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                affectedPopulationEst: { type: Type.NUMBER }
              },
              required: ["civicImpactScore", "priorityCategory", "factors", "affectedPopulationEst"]
            },
            routing: {
              type: Type.OBJECT,
              properties: {
                department: { type: Type.STRING },
                assignedOfficer: { type: Type.STRING },
                dispatchPriority: { type: Type.STRING },
                contactChannel: { type: Type.STRING }
              },
              required: ["department", "assignedOfficer", "dispatchPriority", "contactChannel"]
            },
            resolution: {
              type: Type.OBJECT,
              properties: {
                suggestedPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedCost: { type: Type.NUMBER },
                estimatedHours: { type: Type.NUMBER },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["suggestedPlan", "estimatedCost", "estimatedHours", "requiredSkills"]
            },
            prediction: {
              type: Type.OBJECT,
              properties: {
                regionalTrendGroup: { type: Type.STRING },
                riskIncreasePercent: { type: Type.NUMBER },
                hotspotWarning: { type: Type.BOOLEAN },
                preventativeAction: { type: Type.STRING }
              },
              required: ["regionalTrendGroup", "riskIncreasePercent", "hotspotWarning", "preventativeAction"]
            }
          },
          required: ["title", "detection", "verification", "prioritization", "routing", "resolution", "prediction"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    applyEmergencyEscalation(parsedData, parsedData.title || title, description);

    // Construct final report object
    const newReport = {
      id: generatedId,
      title: parsedData.title || title || "Civic Issue",
      description,
      location,
      imageUrl: image || "https://images.unsplash.com/photo-1599740831419-b5ce14cbd579?auto=format&fit=crop&w=500&q=80",
      status: "Reported",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporterName: reporterName || "Anonymous Citizen",
      agentTrace: parsedData
    };

    reportsStore.unshift(newReport);
    res.json({ success: true, report: newReport, isSimulated: false });

  } catch (error: any) {
    console.error("❌ Agent processing pipeline failed: ", error);
    // Graceful fallback on API parsing or endpoint failures
    const sim = generateSimulatedData();
    applyEmergencyEscalation(sim, title || sim.title, description);
    const fallbackReport = {
      id: generatedId,
      title: title || sim.title,
      description,
      location,
      imageUrl: image || "https://images.unsplash.com/photo-1599740831419-b5ce14cbd579?auto=format&fit=crop&w=500&q=80",
      status: "Reported",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reporterName: reporterName || "Anonymous Citizen",
      agentTrace: sim
    };
    reportsStore.unshift(fallbackReport);
    res.json({ success: true, report: fallbackReport, isSimulated: true, error: error.message });
  }
});

// 4. POST handles interactive assistant chat operations
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array payload." });
  }

  const ai = getGeminiClient();

  // Create local context
  const activeIssuesSummary = reportsStore
    .map(r => `- [${r.id}] ${r.title} in ${r.location.address} (Status: ${r.status}, Severity: ${r.agentTrace?.detection?.severity || "Medium"}, assigned to: ${r.agentTrace?.routing?.department || "Unassigned"})`)
    .slice(0, 10)
    .join("\n");

  const systemInstruction = `
    You are the CivicOS Civic AI Assistance Coordinator, designated to assist residents, community leaders, and municipal officers.
    You have deep, complete, real-time knowledge of all active issues and structural conditions in our smart city:
    
    CURRENT REPORTED INFRASTRUCTURE ISSUES:
    ${activeIssuesSummary}
    
    GENERAL INFORMATION:
    - CivicOS integrates 6 automated multi-agent components: Detection Agent, Verification Agent, Prioritization Agent, Authority Routing Agent, Resolution Agent, and Prediction Agent.
    - Citizens earn "Hero Points" (e.g. 100 points per report) and increase their "Trust Score" by writing verified reports.
    
    YOUR OBJECTIVES:
    1. Answer general civic inquiries, municipal laws, and emergency protocols.
    2. Guide citizens on how to report issues, verify reports, or optimize resolution actions.
    3. Look up exact details of existing reports listed in the context if the user asks for references matching or about them.
    4. Speak in an encouraging, highly professional, community-minded humored demeanor. Be crisp and informative.
  `;

  try {
    if (!ai) {
      // Return beautiful simulated chat responses
      const lastMessage = messages[messages.length - 1]?.text || "";
      let simResponse = "Hello! I am your CivicOS AI assistant. I can look up city health statistics, guide you on submitting reports, and explain municipal processes. Since the Gemini API Key is evaluated in simulation mode, I am happy to guide your sandbox navigation!";
      
      const query = lastMessage.toLowerCase();
      if (query.includes("status") || query.includes("reports") || query.includes("list")) {
        simResponse = `Currently, the city of CivicOS has ${reportsStore.length} active registered operations. Some key active files include:\n\n` + 
          reportsStore.map(r => `• **${r.id}**: ${r.title} (${r.status} - ${r.agentTrace?.detection?.severity} Priority)`).join("\n") +
          `\n\nIs there a specific ticket you would like scheduled or details on structural remediation?`;
      } else if (query.includes("pothole") || query.includes("road")) {
        simResponse = `Our **Detection Agent** and **Resolution Agent** are tracking pothole hazards closely! Standard remediation timeline is under 18 hours once verified. Citizens submitting a pothole get +100 Hero Points and +5% Trust Score increase!`;
      } else if (query.includes("hero") || query.includes("point") || query.includes("score")) {
        simResponse = `Hero Points are given out for positive civic contributions! By submitting real reports, veridically verifying adjacent tasks, and participating in district polls, you boost your municipal Trust Score. Top ranking citizens are listed in the Community Leaderboard!`;
      }
      
      return res.json({ text: simResponse });
    }

    // Call actual Gemini model for interactive chat
    const chatHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Insert system prompt inside contents structure as a system instruction
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory.length > 0 ? chatHistory : [{ role: "user", parts: [{ text: "Hello!" }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });

  } catch (error: any) {
    console.error("❌ Chatbot endpoint failure: ", error);
    res.json({ text: `Apologies, my civic-brain is experiencing connectivity latency: ${error.message}. Let's discuss anything about our reported issues!` });
  }
});

// Showcase API Endpoint 1: Gemini Reasoning Engine
app.post("/api/showcase/reason", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt parameter." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Return stunning high-fidelity simulation of reasoning inner thought
    const pLower = prompt.toLowerCase();
    let issueType = "General Municipal Coordination";
    let plan = [
      "Analyze structural load variables.",
      "Check buffer zone margins and pipeline stress factors.",
      "Dispatch specialized rapid repair crew."
    ];
    let thinkingPrompt = `<think>
Evaluating user query: "${prompt}"
- Core problem identified: Municipal optimization/hazard coordination challenge.
- Query categorizer: Classified under municipal infrastructure safety parameters.
- Step 1: Synthesizing real-time telemetry inputs (temperature, traffic load, precipitation indexes).
- Step 2: Formulating cost-efficient restoration strategy keeping citizen safety margins above 95%.
- Step 3: Determining optimal agent handoff sequence to prevent duplicate allocations.
- Step 4: Outlining high-level resolution milestones for Department routing.
</think>`;

    if (pLower.includes("traffic") || pLower.includes("car") || pLower.includes("road") || pLower.includes("transit")) {
      issueType = "Traffic & Safety Optimization";
      thinkingPrompt = `<think>
Evaluating traffic flow optimization query: "${prompt}"
- Category: Smart Traffic Control & Corridor Management.
- Input data stream: Intersection sensor densities, construction schedules, and alternative lane capacities.
- Step 1: Simulating congestion redirection models on adjacent grid blocks.
- Step 2: Gauging impact of school bus/priority freight paths on cross-street queues.
- Step 3: Formulating adaptive traffic light timing schedules (introducing green waves on main arterials).
- Step 4: Assessing risk coefficients for school zones and construction bottlenecks.
- Step 5: Preparing routing recommendations for secondary avenues to disperse gridlock signatures.
</think>`;
      plan = [
        "Initialize dynamic signal retiming protocol at key corridor intersections.",
        "Deploy modular digital warning signage 500 meters upstream of bottleneck zones.",
        "Authorize temporary lane-reversal policies during peak peak transit hours."
      ];
    } else if (pLower.includes("water") || pLower.includes("leak") || pLower.includes("drain") || pLower.includes("flood") || pLower.includes("sewer")) {
      issueType = "Hydrological Risk Assessment";
      thinkingPrompt = `<think>
Evaluating hydrologic system query: "${prompt}"
- Category: Urban Hydraulic Infrastructure and Drainage Safety.
- Input triggers: Local water tables, sewer runoff speeds, and sub-surface soil moisture loads.
- Step 1: Calculating drainage system capacity limits against current simulated precipitation index.
- Step 2: Mapping topographic elevation vectors to identify exact hydraulic sag pooling coordinates.
- Step 3: Assessing pipe wear scores to predict potential high-pressure rupture points under surcharge pressure.
- Step 4: Formulating backflow prevention and pump station activation cycles.
- Step 5: Pre-allocating heavy water extraction equipment to high-risk zones.
</think>`;
      plan = [
        "Isolate sub-basin valve coordinates to manage flow volumes.",
        "Commence auxiliary pumping sequence at high-pooling reservoirs.",
        "Deploy field inspection teams equipped with acoustic joint leakage scanners."
      ];
    } else if (pLower.includes("garbage") || pLower.includes("trash") || pLower.includes("waste") || pLower.includes("refuse")) {
      issueType = "Sanitation Logistics Planning";
      thinkingPrompt = `<think>
Evaluating sanitation logistics query: "${prompt}"
- Category: Municipal Solid Waste Allocation & Collection Corridor Safety.
- Step 1: Analyzing density clusters of overflowing refuse containers inside coordinates.
- Step 2: Optimizing dispatch route matrices for Sanitation fleet vehicles to minimize carbon signatures.
- Step 3: Cross-matching local waste accumulation speed with municipal seasonal factors.
- Step 4: Incorporating predictive overflow alarms to alert regional inspectors.
</think>`;
      plan = [
        "Re-optimize transit matrices for specialized solid-waste hauling vehicles.",
        "Deploy durable, solar-powered smart waste compactors with automated cell fill sensors.",
        "Establish community notification circles to limit container dumping during peak repair hours."
      ];
    }

    const outputResponse = `Based on deep municipal AI reasoning, here is the calculated strategic plan for **${issueType}**:

${thinkingPrompt}

### 🛠️ Strategic Remediation Plan
${plan.map((step, index) => `${index + 1}. **${step}**`).join("\n")}

### ⚡ Predicted Outcomes
- **Grid efficiency impact:** Improvement of +14% over baseline metrics.
- **Vulnerability mitigation:** Local community safety factor raised to 98.4%.
- **Specialist mobilization cost:** Approx. $350 (standard material & fuel charges).`;

    return res.json({ text: outputResponse, simulated: true });
  }

  try {
    const systemInstruction = `
      You are the CivicOS Reasoning Engine, powered by Gemini technology.
      The user is asking you a deep structural reasoning question about a municipal challenge, city planning, or hazardous incident remediation.
      
      You MUST formulate a highly systematic, step-by-step reasoning plan.
      You MUST provide your detailed thinking process enclosed inside a standard <think> ... </think> tag at the very beginning of your response.
      Following the </think> tag, output a structured, crisp, professional engineering resolution plan in elegant markdown format, specifying exact milestones, required safety margins, and estimated community impact scores.
      
      Be extremely thorough, authoritative, and helpful. Use professional civic planning and structural engineering terminology.
    `;

    console.log(`🚀 Requesting Gemini Reasoning for prompt from showcase page...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text, simulated: false });

  } catch (error: any) {
    console.error("❌ Showcase Reasoning endpoint failure: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Showcase API Endpoint 2: Gemini Structured Outputs & Multilingual Translation
app.post("/api/showcase/translate", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text to translate." });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // High-fidelity simulation for multilingual and structured outputs
    const textLower = text.toLowerCase();
    
    let detectedLanguage = "Spanish";
    let detectedLanguageCode = "es";
    let translatedText = "There is a very large pothole on Main Street in front of the bakery, and dirty water is leaking from a nearby pipe.";
    let classification = "Pothole";
    let estimatedSeverity = "High";
    let keyDetails = ["Large pothole", "In front of bakery", "Water leaking from pipe"];

    if (textLower.includes("poubelle") || textLower.includes("ordures") || textLower.includes("déchets") || textLower.includes("sac")) {
      detectedLanguage = "French";
      detectedLanguageCode = "fr";
      translatedText = "There are five large garbage bags left on the sidewalk at the corner. They have been there for three days and are beginning to attract stray animals.";
      classification = "Garbage accumulation";
      estimatedSeverity = "Medium";
      keyDetails = ["Sidewalk garbage bags", "Left for three days", "Attracting stray animals"];
    } else if (textLower.includes("fuite") || textLower.includes("inondation") || textLower.includes("eau") || textLower.includes("tuyau")) {
      detectedLanguage = "French";
      detectedLanguageCode = "fr";
      translatedText = "The main water line on the street has split, and water is flooded up to the sidewalk. Please send help quickly as vehicles are splashing passersby.";
      classification = "Water leakage";
      estimatedSeverity = "Critical";
      keyDetails = ["Split main water line", "Flood reaching sidewalk", "Urgent dispatch requested"];
    } else if (textLower.includes("calle") || textLower.includes("hueco") || textLower.includes("bache") || textLower.includes("pozo")) {
      detectedLanguage = "Spanish";
      detectedLanguageCode = "es";
      translatedText = "There is a massive pothole in the central avenue that is destroying tires. I have seen three vehicles hit it hard within hours. It needs to be patched.";
      classification = "Pothole";
      estimatedSeverity = "High";
      keyDetails = ["Massive central avenue pothole", "Destroying tires", "Multiple vehicles affected"];
    } else if (textLower.includes("basura") || textLower.includes("desecho") || textLower.includes("acumulacion")) {
      detectedLanguage = "Spanish";
      detectedLanguageCode = "es";
      translatedText = "People are dumping construction rubble and organic waste on this empty lot. The smell is unbearable and the block is filthy.";
      classification = "Garbage accumulation";
      estimatedSeverity = "Medium";
      keyDetails = ["Construction rubble dumping", "Organic waste", "Strong offensive odor"];
    } else if (textLower.includes("luz") || textLower.includes("farola") || textLower.includes("oscuras")) {
      detectedLanguage = "Spanish";
      detectedLanguageCode = "es";
      translatedText = "The streetlights on this corner have been out for a week. The block is completely dark and people feel very unsafe walking home.";
      classification = "Broken streetlight";
      estimatedSeverity = "High";
      keyDetails = ["Corner streetlights out", "Block completely dark", "High security vulnerability risk"];
    } else if (textLower.includes("panne") || textLower.includes("lumière") || textLower.includes("lampadaire")) {
      detectedLanguage = "French";
      detectedLanguageCode = "fr";
      translatedText = "The street light in front of my garage is flashing continuously like a strobe light, causing a severe hazard at night.";
      classification = "Broken streetlight";
      estimatedSeverity = "Medium";
      keyDetails = ["Flashing street light", "In front of garage", "Local nocturnal hazard"];
    } else if (textLower.includes("水") || textLower.includes("漏水") || textLower.includes("水管")) {
      detectedLanguage = "Chinese";
      detectedLanguageCode = "zh";
      translatedText = "The underground water pipe is leaking. Large amounts of clean water are bubbling through the pavement joints. Please repair it.";
      classification = "Water leakage";
      estimatedSeverity = "High";
      keyDetails = ["Subsurface water leakage", "Pavement bubbling", "Wasting clean water"];
    } else if (textLower.includes("垃圾") || textLower.includes("堆积")) {
      detectedLanguage = "Chinese";
      detectedLanguageCode = "zh";
      translatedText = "Huge amounts of household trash are piled up by the community park gate, blocking the entrance.";
      classification = "Garbage accumulation";
      estimatedSeverity = "Medium";
      keyDetails = ["Park entrance blocked", "Household trash pile up", "Sanitation hazard"];
    } else {
      // General translation fallback
      detectedLanguage = "Detected Foreign Language";
      detectedLanguageCode = "foreign";
      translatedText = text;
      classification = "Other";
      estimatedSeverity = "Medium";
      keyDetails = ["User generated input translation"];
    }

    return res.json({
      success: true,
      detectedLanguage,
      detectedLanguageCode,
      translatedText,
      classification,
      estimatedSeverity,
      confidenceScore: 0.95,
      keyDetails,
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
  }

  try {
    const textPrompt = `
      You are the Multilingual Translation & Structured Extraction Agent of the CivicOS platform.
      Analyze the provided citizen-submitted hazard report text. It may be written in any language.
      
      Tasks:
      1. Detect the source language name (e.g. "Spanish", "French", "Chinese", "Hindi", "Arabic", "German", "English", etc.) and two-letter code ("es", "fr", "zh", etc.).
      2. Translate the report text into clear, high-quality, professional English.
      3. Classify the hazard into exactly one of these categories: "Pothole", "Garbage accumulation", "Water leakage", "Broken streetlight", or "Other".
      4. Estimate the severity of the hazard: "Low", "Medium", "High", or "Critical".
      5. Extract a list of up to 3 key details or physical markers mentioned in the text.
      6. Formulate a realistic confidence score between 0.85 and 1.00.

      Citizen Text: "${text}"

      Conform strictly to the following JSON structure. Return only valid raw JSON. Only return JSON.
    `;

    console.log(`🚀 Requesting Gemini Structured Output for Multilingual translation...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            detectedLanguageCode: { type: Type.STRING },
            translatedText: { type: Type.STRING, description: "Translation into clear standard English." },
            classification: { type: Type.STRING, description: "Must be: 'Pothole', 'Garbage accumulation', 'Water leakage', 'Broken streetlight', or 'Other'" },
            estimatedSeverity: { type: Type.STRING, description: "Must be: 'Low', 'Medium', 'High', or 'Critical'" },
            confidenceScore: { type: Type.NUMBER },
            keyDetails: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["detectedLanguage", "detectedLanguageCode", "translatedText", "classification", "estimatedSeverity", "confidenceScore", "keyDetails"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text.trim());
    return res.json({
      success: true,
      ...parsedResult,
      simulated: false,
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

  } catch (error: any) {
    console.error("❌ Multilingual translation endpoint failure: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Update an issue status (simulating civic repair progression)
app.post("/api/reports/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const issue = reportsStore.find(r => r.id === id);
  if (issue) {
    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    return res.json({ success: true, issue });
  }
  res.status(404).json({ error: "Report not found" });
});

// Delete an issue (for maintenance sandbox testing)
app.delete("/api/reports/:id", (req, res) => {
  const { id } = req.params;
  const index = reportsStore.findIndex(r => r.id === id);
  if (index !== -1) {
    reportsStore.splice(index, 1);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Report not found" });
});

// Seed data template matching high-quality 6-agent civic traces
const DEMO_SEEDS = [
  {
    id: "CIV-291",
    title: "Severe Pothole Cluster on Oak Boulevard",
    description: "Multiple progressive structural cracks and deep potholes blocking the main lane, forcing school buses to swerve into oncoming traffic.",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "842 Oak Blvd, Western District",
      district: "Western District"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
    status: "Resolving",
    createdAt: new Date(Date.now() - 48 * 3600 * 1005).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1005).toISOString(),
    reporterName: "Marcus Vance",
    agentTrace: {
      detection: {
        issueType: "Pothole",
        severity: "High",
        confidenceScore: 0.98,
        identifiedElements: ["Asphalt degradation", "Sub-base cratering", "Subgrade moisture accumulation"],
        notes: "Heavy progressive failure of the asphalt surfacing. The sub-base layer is fully exposed with visual signs of deep moisture pooling."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.95,
        crossReferenceNotes: "Validated metadata timestamp, geo-coordinates verified within 3 meters grid alignment, and checked against municipal duplicate records."
      },
      prioritization: {
        civicImpactScore: 84,
        priorityCategory: "High",
        factors: ["Active transit disruption", "Structural damage vector", "Vulnerable transit route"],
        affectedPopulationEst: 450
      },
      routing: {
        department: "Department of Public Works",
        assignedOfficer: "Engineer Sarah Lin (Pothole Remediation Unit)",
        dispatchPriority: "Expedited",
        contactChannel: "DPW-E-DISPATCH"
      },
      resolution: {
        suggestedPlan: [
          "Establish temporary traffic management and dynamic channelization.",
          "Execute full-depth saw joint cut surrounding the active crater cluster.",
          "Evacuate subgrade material, compact soil foundation, and seal moisture barrier.",
          "Apply hot-pour premium asphalt mix binder and compact to design elevation."
        ],
        estimatedCost: 350,
        estimatedHours: 4,
        requiredSkills: ["Asphalt compaction", "Thermoregulator safety", "Tactical joint-seal application"]
      },
      prediction: {
        regionalTrendGroup: "Frost-Heave Asphalt Risk Zone",
        riskIncreasePercent: 42,
        hotspotWarning: true,
        preventativeAction: "Implement regional subsurface drainage evaluation and comprehensive thermal-seal maintenance before the winter weather cycle."
      }
    }
  },
  {
    id: "CIV-312",
    title: "Major Drainage Clog and Sewer Backflow",
    description: "Sewer storm drain is completely packed with heavy storm garbage and branches. Runoff water has flooded the sidewalk and is spilling into garages.",
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: "152 Pine Street, Downtown Centre",
      district: "Downtown"
    },
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=80",
    status: "Prioritized",
    createdAt: new Date(Date.now() - 4 * 3600 * 1005).toISOString(),
    updatedAt: new Date(Date.now() - 3.8 * 3600 * 1005).toISOString(),
    reporterName: "Elena Rostova",
    agentTrace: {
      detection: {
        issueType: "Water leakage",
        severity: "Critical",
        confidenceScore: 0.96,
        identifiedElements: ["Debris blockage", "Minor sidewalk flooding", "Sewer grate obstruction"],
        notes: "Major blockage due to vegetative runoff debris. Runoff is currently causing erosion to the sidewalk foundation."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.99,
        crossReferenceNotes: "Multiple image matches and telemetry confirms real-time localized rainfall accumulation matching runoff event."
      },
      prioritization: {
        civicImpactScore: 92,
        priorityCategory: "Critical",
        factors: ["Pedestrian hazard", "Immediate property integrity damage", "Storm runoff vulnerability"],
        affectedPopulationEst: 850
      },
      routing: {
        department: "Department of Water & Power",
        assignedOfficer: "Chief Hydrologist Thomas Vance",
        dispatchPriority: "Immediate",
        contactChannel: "DWP-STORM-HOTLINE"
      },
      resolution: {
        suggestedPlan: [
          "Deploy hydraulic vac-truck to suction organic debris and heavy sediments.",
          "Clear subgrade pipe obstruction utilizing high-velocity water jetting.",
          "Evaluate structural storm grate damage and reset heavy iron mesh."
        ],
        estimatedCost: 620,
        estimatedHours: 3,
        requiredSkills: ["High-impact hydraulic ops", "Sewer hazard qualification"]
      },
      prediction: {
        regionalTrendGroup: "Low-Gradient Drainage Overlay",
        riskIncreasePercent: 78,
        hotspotWarning: true,
        preventativeAction: "Upgrade historic curb inlets to high-volume storm interception grates and initiate bimonthly structural street sweeping."
      }
    }
  },
  {
    id: "CIV-104",
    title: "Exposed Wire Hazard on Broken Light Pole",
    description: "Damaged pedestrian streetlamp with base cover missing. Sparks occasionally visible near active conduit, extremely dangerous to neighborhood children.",
    location: {
      latitude: 37.7694,
      longitude: -122.4412,
      address: "1224 Castro St, Eastern District",
      district: "Eastern District"
    },
    imageUrl: "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=500&q=80",
    status: "Resolved",
    createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    reporterName: "David Cole",
    agentTrace: {
      detection: {
        issueType: "Broken streetlight",
        severity: "Critical",
        confidenceScore: 0.99,
        identifiedElements: ["Exposed high-voltage conduit", "Missing protective panel", "Compromised structural pole base"],
        notes: "Extremely serious safety concern. The primary power conduit is exposed directly to contact and weather factors."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 1.0,
        crossReferenceNotes: "Telemetric verification against electricity network confirms active transformer fluctuation matching ground coordinates."
      },
      prioritization: {
        civicImpactScore: 98,
        priorityCategory: "Critical",
        factors: ["Immediate danger of death", "Child pedestrian corridor", "Weather deterioration vulnerability"],
        affectedPopulationEst: 300
      },
      routing: {
        department: "Traffic & Safety Administration",
        assignedOfficer: "Grid Inspector James Croft",
        dispatchPriority: "Immediate",
        contactChannel: "TSA-LIVE-POWER"
      },
      resolution: {
        suggestedPlan: [
          "Emergency dispatch to de-energize local lighting circuit node immediately.",
          "Secure site with high-visibility hazard barricades and cautionary warning signs.",
          "Disconnect compromised supply cables, strip oxidation on connectors, and re-wire base.",
          "Install ultra-tough high-impact steel lockable conduit plate to ensure toddler-safety."
        ],
        estimatedCost: 180,
        estimatedHours: 2,
        requiredSkills: ["Grid isolations", "Conduit engineering"]
      },
      prediction: {
        regionalTrendGroup: "Aging Municipal Grid Nodes",
        riskIncreasePercent: 95,
        hotspotWarning: false,
        preventativeAction: "Bulk-replace legacy plastic light pole base lids with security tamper-proof high-tensile steel locked covers across the Castro corridor."
      }
    }
  },
  {
    id: "CIV-405",
    title: "Illegal Toxic Battery Disposal SOMA Exit",
    description: "Several dozen leaking automotive batteries dumped raw on the grassy curb. Corrosive acid is bubbling and draining toward local storm grates.",
    location: {
      latitude: 37.7785,
      longitude: -122.4111,
      address: "520 Division St, SOMA Grid",
      district: "SOMA Grid"
    },
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80",
    status: "Verified",
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.4 * 3600 * 1000).toISOString(),
    reporterName: "Samantha Croft",
    agentTrace: {
      detection: {
        issueType: "Garbage accumulation",
        severity: "High",
        confidenceScore: 0.97,
        identifiedElements: ["Lead-acid battery pile", "Corrosive liquid spill", "Eco-hazard runoff"],
        notes: "Heavy environmental contamination risk as battery acid drains directly toward drainage systems."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.96,
        crossReferenceNotes: "Verified via street camera feed 502 with timestamp and license plate detection active."
      },
      prioritization: {
        civicImpactScore: 89,
        priorityCategory: "High",
        factors: ["Toxic chemical leaching", "Storm water connection vulnerability"],
        affectedPopulationEst: 600
      },
      routing: {
        department: "Department of Sanitation",
        assignedOfficer: "Hazmat Specialist Clara Sterling",
        dispatchPriority: "Expedited",
        contactChannel: "EPA-HAZMAT-1"
      },
      resolution: {
        suggestedPlan: [
          "Deploy soda ash neutralizing spill kits immediately.",
          "Safely pack rusted battery cases into sealed biohazard containment vats.",
          "Execute post-spill wash with chemical binding agents."
        ],
        estimatedCost: 850,
        estimatedHours: 5,
        requiredSkills: ["Hazmat incident command", "Chemical spill mitigation"]
      },
      prediction: {
        regionalTrendGroup: "Industrial Grid SOMA Runoff",
        riskIncreasePercent: 88,
        hotspotWarning: true,
        preventativeAction: "Install closed-circuit deterrence cameras and establish heavy hazardous waste penalty indices."
      }
    }
  },
  {
    id: "CIV-506",
    title: "Gushing Water Main Blowout on Pine St",
    description: "Main line subgrade rupture has cracked the concrete paving, sending water gushing 4 feet into the air. Water volumes are flooding traffic lanes.",
    location: {
      latitude: 37.7885,
      longitude: -122.4095,
      address: "405 Pine Ave, Downtown Centre",
      district: "Downtown"
    },
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=500&q=80",
    status: "Reported",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    reporterName: "Jeremy Stone",
    agentTrace: {
      detection: {
        issueType: "Water leakage",
        severity: "Critical",
        confidenceScore: 0.99,
        identifiedElements: ["Pressurized gushing plume", "Structural concrete cracking", "Widespread roadway flooding"],
        notes: "Major subterranean main line failure. Sub-base material is undergoing high-velocity washout."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.98,
        crossReferenceNotes: "Seismic sensors confirm localized subgrade vibration signature matching fluid exit."
      },
      prioritization: {
        civicImpactScore: 96,
        priorityCategory: "Critical",
        factors: ["Severe hydrostatic road flooding", "Sub-base soil erosion", "Active vehicle grid disruption"],
        affectedPopulationEst: 1500
      },
      routing: {
        department: "Department of Water & Power",
        assignedOfficer: "SLA Engineer Robert O'Connor",
        dispatchPriority: "Immediate",
        contactChannel: "DWP-CRITICAL-VALVE"
      },
      resolution: {
        suggestedPlan: [
          "Engage primary system isolations at Zone 4 feeder valves.",
          "Excavate the road surface down to the 12-inch cast iron main conduit.",
          "Install custom steel split sleeves over the ruptured fracture."
        ],
        estimatedCost: 1450,
        estimatedHours: 6,
        requiredSkills: ["Rupture clamp sleeve installation", "Heavy excavation logistics"]
      },
      prediction: {
        regionalTrendGroup: "Downtown Core Hydro-Aging Zone",
        riskIncreasePercent: 91,
        hotspotWarning: true,
        preventativeAction: "Initiate smart ultrasound thickness scan checks along pre-1980 downtown water mains."
      }
    }
  },
  {
    id: "CIV-607",
    title: "Fractured Overhead Traffic Signal Hanger",
    description: "Wind damage and fatigue caused the steel support hanger to crack. The traffic signal head is hanging by its electrical cable and whipping around in high winds.",
    location: {
      latitude: 37.7612,
      longitude: -122.4255,
      address: "1800 Castro St, Eastern District",
      district: "Eastern District"
    },
    imageUrl: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=500&q=80",
    status: "Routing",
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.4 * 3600 * 1000).toISOString(),
    reporterName: "Emily Chen",
    agentTrace: {
      detection: {
        issueType: "Public safety",
        severity: "High",
        confidenceScore: 0.95,
        identifiedElements: ["Hanging signal head", "Fractured support bracket", "Live whipping cable"],
        notes: "Extremely serious roadway hazard. The 40-pound signal head is vulnerable to dropping onto crossing vehicles."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.97,
        crossReferenceNotes: "Validated via telemetry indicating active short-circuit flags in signal grid sector 12."
      },
      prioritization: {
        civicImpactScore: 88,
        priorityCategory: "High",
        factors: ["Overhead falling hazard", "Severe school crossing risk"],
        affectedPopulationEst: 950
      },
      routing: {
        department: "Traffic & Safety Administration",
        assignedOfficer: "Field Tech Alexander Ward",
        dispatchPriority: "Expedited",
        contactChannel: "TSA-SIGNALS-WIND"
      },
      resolution: {
        suggestedPlan: [
          "Deploy bucket-truck unit with safety lane closure setup.",
          "De-energize overhead signal feeds.",
          "Replace cracked structural support hanger with high-strength forged steel fasteners."
        ],
        estimatedCost: 480,
        estimatedHours: 3,
        requiredSkills: ["High-elevation bucket-ops", "Electrical signal terminal wiring"]
      },
      prediction: {
        regionalTrendGroup: "Wind Shear Structural Envelopes",
         riskIncreasePercent: 65,
        hotspotWarning: false,
        preventativeAction: "Deploy vibration-dampers to wind-susceptible overhanging street signages."
      }
    }
  },
  {
    id: "CIV-708",
    title: "Storm Debris Blockage Marina Boardwalk",
    description: "High tides and storm swell have dumped sand, thick kelp layers, and massive drifted logs blocking the primary disabled ADA walkway access.",
    location: {
      latitude: 37.8033,
      longitude: -122.4375,
      address: "100 Marina Shoreline, Marina Sector",
      district: "Marina Sector"
    },
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
    status: "Verified",
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.4 * 3600 * 1000).toISOString(),
    reporterName: "Samantha Croft",
    agentTrace: {
      detection: {
        issueType: "Garbage accumulation",
        severity: "Medium",
        confidenceScore: 0.93,
        identifiedElements: ["Log obstruction", "Thick sand sedimentation", "Debris blocks ramp"],
        notes: "Access ramp is fully impassable for wheelchairs. No direct structural damage detected on underlying timber."
      },
      verification: {
        isDuplicate: false,
        duplicateReferenceId: null,
        verificationStatus: "Authentic",
        confidenceScore: 0.94,
        crossReferenceNotes: "Correlated to tidal log peak telemetry indicating sea levels +1.8m above datum."
      },
      prioritization: {
        civicImpactScore: 65,
        priorityCategory: "Medium",
        factors: ["ADA accessibility blockage", "Heavy recreational foot traffic sector"],
        affectedPopulationEst: 400
      },
      routing: {
        department: "Department of Public Works",
        assignedOfficer: "Supervisor Maria Lopez",
        dispatchPriority: "Standard",
        contactChannel: "DPW-S-PARKS"
      },
      resolution: {
        suggestedPlan: [
          "Deploy skid-steer loader equipped with clearing buckets.",
          "Brush away seaweed and thick marine fine silt residues.",
          "Power-wash rampway surface with sanitizing agents."
        ],
        estimatedCost: 290,
        estimatedHours: 2,
        requiredSkills: ["Skid-steer loader operator", "Power equipment safety"]
      },
      prediction: {
        regionalTrendGroup: "Coastal Erosion & Overflow Swell Areas",
        riskIncreasePercent: 40,
        hotspotWarning: false,
        preventativeAction: "Raise the boardwalk access elevations and install permeable sand-break barriers."
      }
    }
  }
];

// Run initial Emergency Escalation Agent pass on startup
reportsStore.forEach(report => {
  applyEmergencyEscalation(report.agentTrace, report.title, report.description);
});
DEMO_SEEDS.forEach(report => {
  applyEmergencyEscalation(report.agentTrace, report.title, report.description);
});

// POST trigger Prepopulate Seed
app.post("/api/demo/seed", (req, res) => {
  reportsStore.length = 0; // Clear store
  // Clone seeds first to prevent mutations on references
  const clonedSeeds = JSON.parse(JSON.stringify(DEMO_SEEDS));
  clonedSeeds.forEach((report: any) => {
    applyEmergencyEscalation(report.agentTrace, report.title, report.description);
  });
  reportsStore.push(...clonedSeeds);
  res.json({ success: true, reports: reportsStore, stats: getCityHealthStats() });
});

// POST fast-forward issue statuses
app.post("/api/demo/fast-forward", (req, res) => {
  reportsStore.forEach((issue) => {
    if (issue.id === "CIV-506") {
      issue.status = "Resolving";
      issue.updatedAt = new Date().toISOString();
    } else if (issue.id === "CIV-405") {
      issue.status = "Resolving";
      issue.updatedAt = new Date().toISOString();
    } else if (issue.id === "CIV-607") {
      issue.status = "Resolved";
      issue.updatedAt = new Date().toISOString();
    } else if (issue.id === "CIV-708") {
      issue.status = "Resolved";
      issue.updatedAt = new Date().toISOString();
    }
  });
  res.json({ success: true, reports: reportsStore, stats: getCityHealthStats() });
});

// POST reset to blank state
app.post("/api/demo/reset", (req, res) => {
  reportsStore.length = 0; // Clear all
  res.json({ success: true, reports: reportsStore, stats: getCityHealthStats() });
});

// Vite Middleware for development setup or static folders for production
async function startViteServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 CivicOS Core Server running on port ${PORT}`);
  });
}

startViteServer();
