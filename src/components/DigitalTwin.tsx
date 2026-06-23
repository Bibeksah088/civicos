import React, { useState } from "react";
import { 
  Activity, 
  Map as MapIcon, 
  TrendingUp, 
  AlertTriangle, 
  Radio, 
  HardHat, 
  Droplets, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Leaf, 
  BarChart3, 
  BrainCircuit, 
  Layers, 
  Hammer, 
  CheckCircle2, 
  Users, 
  Eye, 
  EyeOff, 
  Navigation,
  Flame,
  Shield,
  Zap,
  Info
} from "lucide-react";
import { IssueReport } from "../types";

interface DigitalTwinProps {
  issues: IssueReport[];
  setCurrentPage: (page: string) => void;
}

export default function DigitalTwin({ issues, setCurrentPage }: DigitalTwinProps) {
  // Map Layer Toggles
  const [showActiveIssues, setShowActiveIssues] = useState<boolean>(true);
  const [showPredictedIssues, setShowPredictedIssues] = useState<boolean>(true);
  const [showRiskHotspots, setShowRiskHotspots] = useState<boolean>(true);
  const [showResolutionProgress, setShowResolutionProgress] = useState<boolean>(true);

  // Selected Pin Drawer State
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedPredictedId, setSelectedPredictedId] = useState<string | null>(null);

  // IoT sensor & district state
  const [selectedSensor, setSelectedSensor] = useState<string>("S-CAST-2");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string | null>(null);

  // --- 1. CORE DATA CALCULATIONS & SCOPES ---
  const totalReportsCount = issues.length;
  const activeIssuesList = issues.filter(i => i.status !== "Resolved");
  const resolvedIssuesList = issues.filter(i => i.status === "Resolved");
  
  const activeCount = activeIssuesList.length;
  const resolvedCount = resolvedIssuesList.length;

  const districtNames = ["Downtown", "Eastern District", "SOMA Grid", "Western District", "Marina Sector"];

  const getCategoryFromIssue = (issue: IssueReport) => {
    const type = (issue.agentTrace?.detection?.issueType || "").toLowerCase() || issue.title.toLowerCase() || "";
    if (type.includes("pothole") || type.includes("asphalt") || type.includes("road") || type.includes("street")) return "Pothole";
    if (type.includes("garbage") || type.includes("waste") || type.includes("trash") || type.includes("dumping") || type.includes("refuse")) return "Garbage accumulation";
    if (type.includes("water") || type.includes("leak") || type.includes("flood") || type.includes("drain") || type.includes("sewer")) return "Water leakage";
    if (type.includes("light") || type.includes("lamp") || type.includes("electrical") || type.includes("wire") || type.includes("spark") || type.includes("power")) return "Broken streetlight";
    return "Hazard";
  };

  const getDepartmentForIssue = (issue: IssueReport) => {
    if (issue.agentTrace?.routing?.department) {
      return issue.agentTrace.routing.department;
    }
    const cat = getCategoryFromIssue(issue);
    if (cat === "Water leakage") return "Department of Water & Power";
    if (cat === "Broken streetlight") return "Traffic & Safety Administration";
    if (cat === "Pothole") return "Department of Public Works";
    return "Environmental Protection Agency";
  };

  // Coordinates Mapping System
  const getDistrictCoordinates = (district: string, id: string) => {
    const idNum = parseInt(id.replace(/\D/g, "")) || 0;
    let base = { x: 50, y: 50 };
    const dNorm = (district || "").toLowerCase();
    
    if (dNorm.includes("downtown")) base = { x: 48, y: 38 };
    else if (dNorm.includes("eastern")) base = { x: 78, y: 45 };
    else if (dNorm.includes("soma")) base = { x: 70, y: 72 };
    else if (dNorm.includes("western")) base = { x: 23, y: 52 };
    else if (dNorm.includes("marina") || dNorm.includes("bay")) base = { x: 38, y: 22 };
    else if (dNorm.includes("castro")) base = { x: 74, y: 32 };

    const offsetMultiplier = 5;
    const offsetX = (((idNum * 17) % 11) - 5) * offsetMultiplier;
    const offsetY = (((idNum * 23) % 11) - 5) * offsetMultiplier;

    return {
      x: Math.max(12, Math.min(88, base.x + offsetX)),
      y: Math.max(12, Math.min(88, base.y + offsetY))
    };
  };

  const getDeptCoordinates = (deptName: string) => {
    const name = deptName.toLowerCase();
    if (name.includes("public works") || name.includes("dpw")) return { x: 25, y: 72 };
    if (name.includes("water") || name.includes("dwp")) return { x: 50, y: 22 };
    if (name.includes("traffic") || name.includes("tsa")) return { x: 82, y: 55 };
    return { x: 66, y: 82 }; // EPA
  };

  // --- REQUISITE CHOSEN METRICS & SCORE FORMULATION ---

  // A. Dynamic City Health Score
  const activePotholes = activeIssuesList.filter(i => getCategoryFromIssue(i) === "Pothole").length;
  const activeTrash = activeIssuesList.filter(i => getCategoryFromIssue(i) === "Garbage accumulation").length;
  const activeLeaks = activeIssuesList.filter(i => getCategoryFromIssue(i) === "Water leakage").length;
  const activeLights = activeIssuesList.filter(i => getCategoryFromIssue(i) === "Broken streetlight").length;

  const safetyScore = Math.max(30, Math.min(100, 98 - (activeLights * 8) - (activeLeaks * 3)));
  const sanitationScore = Math.max(35, Math.min(100, 95 - (activeTrash * 9)));
  const infrastructureScore = Math.max(40, Math.min(100, 96 - (activePotholes * 7) - (activeLeaks * 5)));
  const energyGridScore = Math.max(50, Math.min(100, 94 - (activeLights * 10)));

  const dynamicHealthScore = Math.round((safetyScore * 0.35) + (sanitationScore * 0.20) + (infrastructureScore * 0.30) + (energyGridScore * 0.15));

  // B. Department Efficiency Score
  const departmentsList = [
    { name: "Department of Public Works", icon: HardHat, short: "DPW" },
    { name: "Department of Water & Power", icon: Droplets, short: "DWP" },
    { name: "Traffic & Safety Administration", icon: Activity, short: "TSA" },
    { name: "Environmental Protection Agency", icon: Leaf, short: "EPA" }
  ];

  const deptMetrics = departmentsList.map(dept => {
    const deptIssues = issues.filter(issue => getDepartmentForIssue(issue) === dept.name);
    const total = deptIssues.length;
    const resolved = deptIssues.filter(i => i.status === "Resolved").length;
    let efficiencyRate = 100;
    if (total > 0) {
      efficiencyRate = Math.round((resolved / total) * 100);
    } else {
      efficiencyRate = 96; 
    }

    return {
      ...dept,
      total,
      resolved,
      active: total - resolved,
      efficiencyRate,
      estimatedHours: deptIssues.reduce((acc, curr) => acc + (curr.agentTrace?.resolution?.estimatedHours || 3), 0),
      estimatedCost: deptIssues.reduce((acc, curr) => acc + (curr.agentTrace?.resolution?.estimatedCost || 180), 0)
    };
  });

  const aggregateDeptEfficiencyScore = Math.round(
    deptMetrics.reduce((sum, curr) => sum + curr.efficiencyRate, 0) / deptMetrics.length
  );

  // C. Community Participation Score
  const uniqueReporters = new Set(issues.map(i => i.reporterName)).size;
  const rawParticipation = (issues.length * 6) + (uniqueReporters * 10) + (resolvedCount * 5);
  const communityParticipationScore = Math.min(100, Math.max(30, 48 + rawParticipation));

  // LIVE ISSUE DENSITY per District
  const totalActiveCount = activeCount || 1;
  const districtDensity = districtNames.map(name => {
    const activeInDistrict = activeIssuesList.filter(i => {
      const d = i.location.district;
      if (name === "Eastern District" && (d === "Eastern District" || d === "Castro Corridor")) return true;
      return d === name;
    }).length;

    const densityPercentage = Math.round((activeInDistrict / totalActiveCount) * 100);
    
    let densityLevel = "Low Density";
    let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    let barColor = "bg-emerald-500";
    if (activeInDistrict > 2) {
      densityLevel = "Critical Density";
      badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      barColor = "bg-rose-500";
    } else if (activeInDistrict === 2) {
      densityLevel = "High Density";
      badgeColor = "bg-orange-500/10 text-orange-400 border-orange-500/20";
      barColor = "bg-orange-500";
    } else if (activeInDistrict === 1) {
      densityLevel = "Moderate Density";
      badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      barColor = "bg-indigo-450";
    }

    return {
      name,
      activeIssues: activeInDistrict,
      densityPercentage,
      densityLevel,
      badgeColor,
      barColor
    };
  });

  // Predicted Future Issues & Threat Vectors
  const predictedFutureIssues = districtNames.map((name, index) => {
    const districtIssues = activeIssuesList.filter(i => i.location.district === name);
    const dActive = districtIssues.length;
    const baseCoords = getDistrictCoordinates(name, `PRED-${index}`);
    
    // Set a small offset for predictions so they don't block active pins
    const predX = baseCoords.x + 8 > 90 ? baseCoords.x - 8 : baseCoords.x + 8;
    const predY = baseCoords.y - 8 < 10 ? baseCoords.y + 8 : baseCoords.y - 8;

    let probability = 30 + dActive * 12;
    if (districtIssues.some(i => i.agentTrace?.detection?.severity === "Critical")) probability += 25;
    probability = Math.min(95, probability);

    let threatLevel = "Stable Grid";
    let badgeColor = "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10";
    let ringColor = "stroke-emerald-500";
    if (probability >= 75) {
      threatLevel = "Severe Risk Forecast";
      badgeColor = "text-rose-400 bg-rose-500/5 border border-rose-500/10";
      ringColor = "stroke-rose-500 animate-pulse";
    } else if (probability >= 50) {
      threatLevel = "Moderate Threat Projection";
      badgeColor = "text-orange-400 bg-orange-500/5 border border-orange-500/10";
      ringColor = "stroke-orange-500";
    }

    let forecastTitle = "Sub-pavement decay expansion";
    let recommendation = "Initiate preventative scanning sweeps";
    if (name === "Downtown") {
      forecastTitle = "Water main hydrostatic overload";
      recommendation = "Deploy safety conduit locks & restrict high traffic loads";
    } else if (name === "Eastern District") {
      forecastTitle = "Underground light supply board shorting";
      recommendation = "Trigger thermal conduction panel diagnostics";
    } else if (name === "SOMA Grid") {
      forecastTitle = "Leaching toxic material organic decay";
      recommendation = "Schedule automated hydro-sweeper patrols";
    } else if (name === "Western District") {
      forecastTitle = "Pothole sub-base cavitation extension";
      recommendation = "Inject aggregate composite fillers immediately";
    }

    return {
      id: `PRED-${index}`,
      district: name,
      title: forecastTitle,
      probability,
      threatLevel,
      badgeColor,
      ringColor,
      recommendation,
      x: predX,
      y: predY
    };
  });

  // Dynamic procurement materials list based on active items
  const materialDemands = [
    { name: "Warm-mix Sealant Asphalt", quantity: `${activePotholes * 3.5 + 2} Tons`, utility: "DPW Pavement Patching" },
    { name: "Tamper-Proof Steel Vault Caps", quantity: `${activeLights * 2 + 1} Units`, utility: "TSA Conduit Protection" },
    { name: "Absorbent Microfiber Mats", quantity: `${activeLeaks * 4.5 + 5} Bundles`, utility: "DWP Hydrostatic Spill" },
    { name: "Heavy-Duty Biohazard Dumpsters", quantity: `${activeTrash * 2 + 1} Vats`, utility: "EPA Environmental Cleanup" }
  ];

  // Map Dots from current issues
  const mapDots = issues.map((issue) => {
    const coords = getDistrictCoordinates(issue.location.district, issue.id);
    const resolved = issue.status === "Resolved";
    
    let stepNumber = 1;
    if (issue.status === "Verified") stepNumber = 2;
    else if (issue.status === "Prioritized") stepNumber = 3;
    else if (issue.status === "Routing") stepNumber = 4;
    else if (issue.status === "Resolving") stepNumber = 5;
    else if (issue.status === "Resolved") stepNumber = 6;

    return {
      id: issue.id,
      title: issue.title,
      type: getCategoryFromIssue(issue),
      status: issue.status,
      severity: issue.agentTrace?.detection?.severity || "Medium",
      x: coords.x,
      y: coords.y,
      stepNumber,
      resolved,
      issue
    };
  });

  const selectedDotDetail = mapDots.find(dot => dot.id === selectedPinId);
  const selectedPredictedDetail = predictedFutureIssues.find(p => p.id === selectedPredictedId);

  // IoT Sensor telemetry nodes mock
  const sensorNodes = [
    { id: "S-CAST-2", name: "Castro Subsurface Pressure Transducer", value: "98.2 kPa", status: "Critical", trend: "+12.1% anomaly" },
    { id: "S-WEST-8", name: "Oak Blvd Road Humiditor Node", value: "12% RH", status: "Normal", trend: "Stable state" },
    { id: "S-SOMA-4", name: "SOMA Gate Phase Impedance Grid", value: "410 kVA", status: "Normal", trend: "Nominal load parameters" },
    { id: "S-DOWNT-1", name: "Pine Sewer Runoff Volumetric Feeder", value: activeLeaks > 0 ? "780 L/s" : "310 L/s", status: activeLeaks > 0 ? "Warning" : "Normal", trend: "+14.5% surge warning" }
  ];

  return (
    <div className="space-y-6" id="interactive-digital-twin">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="font-display font-medium text-2xl text-slate-100 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-indigo-400 stroke-1.5" />
              Interactive Civic Digital Twin
            </h2>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Autonomous Overview Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual map overlay projecting live citizen hazard reports, predictive district hotspot modeling, agent dispatches, and material requests are synchronized.
          </p>
        </div>

        {/* Quick actions redirection */}
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentPage("report")}
            className="px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
          >
            + Report New Issue
          </button>
          <button 
            onClick={() => setCurrentPage("agentcenter")}
            className="px-3.5 py-1.5 rounded-lg font-mono text-[11px] font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            System Logs
          </button>
        </div>
      </div>

      {/* THREE REQUIRED SCORES HUD METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="twin-hud-scores-centerpiece">
        
        {/* 1. City Health Score Card */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-450 tracking-wider">City Health Score</span>
            <div className={`p-1.5 rounded-lg border bg-slate-950 ${
              dynamicHealthScore >= 85 ? "border-emerald-500/20 text-emerald-400" : "border-orange-500/20 text-orange-400"
            }`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <p className={`text-4xl font-display font-black leading-none ${
                dynamicHealthScore >= 85 ? "text-emerald-400" : "text-orange-400"
              }`}>{dynamicHealthScore}%</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">State calculated weighted index</p>
            </div>
            
            {/* Visual Mini Dial */}
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle cx="24" cy="24" r="18" fill="transparent" 
                        stroke={dynamicHealthScore >= 85 ? "#34d399" : "#fb923c"} 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - dynamicHealthScore / 100)} 
                />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-350">{dynamicHealthScore}</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-4 overflow-hidden">
            <div className={`h-full transition-all duration-500 ${
              dynamicHealthScore >= 85 ? "bg-emerald-500" : "bg-orange-500"
            }`} style={{ width: `${dynamicHealthScore}%` }}></div>
          </div>
        </div>

        {/* 2. Department Efficiency Score Card */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-450 tracking-wider">Department Efficiency Score</span>
            <div className="p-1.5 rounded-lg border border-indigo-500/10 text-indigo-400 bg-slate-950">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <p className="text-4xl font-display font-black leading-none text-indigo-400">
                {aggregateDeptEfficiencyScore}%
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Average SLA resolution rate</p>
            </div>
            
            {/* Visual Mini Dial */}
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle cx="24" cy="24" r="18" fill="transparent" 
                        stroke="#818cf8" 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - aggregateDeptEfficiencyScore / 100)} 
                />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-350">{aggregateDeptEfficiencyScore}</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-4 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${aggregateDeptEfficiencyScore}%` }}></div>
          </div>
        </div>

        {/* 3. Community Participation Score Card */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-450 tracking-wider">Community Participation Score</span>
            <div className="p-1.5 rounded-lg border border-amber-500/10 text-amber-400 bg-slate-950">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <p className="text-4xl font-display font-black leading-none text-amber-400">
                {communityParticipationScore}%
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Citizens reports & reward density</p>
            </div>
            
            {/* Visual Mini Dial */}
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                <circle cx="24" cy="24" r="18" fill="transparent" 
                        stroke="#fbbf24" 
                        strokeWidth="4" 
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - communityParticipationScore / 100)} 
                />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-350">{communityParticipationScore}</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-4 overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${communityParticipationScore}%` }}></div>
          </div>
        </div>

      </div>

      {/* MAIN DIVISION LAYOUT GRID: Left=Dynamic Overlay Map, Right=Controls, Sensors, Details */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT (8 Cols) - MAP OVERLAYS CANVASES */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 relative overflow-hidden flex-1 flex flex-col justify-between shadow-2xl min-h-[500px]">
            
            {/* Map Title Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-4 gap-3 z-10 shrink-0">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight">Interactive Projection Layer Map</span>
              </div>

              {/* LIVE ACTIVE OVERLAY LAYER SWITCHES */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowActiveIssues(!showActiveIssues)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-mono font-bold border ${
                    showActiveIssues 
                      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" 
                      : "bg-slate-950 text-slate-500 border-slate-900"
                  }`}
                  title="Toggle active reported issues"
                >
                  {showActiveIssues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Active Issues</span>
                </button>

                <button
                  onClick={() => setShowPredictedIssues(!showPredictedIssues)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-mono font-bold border ${
                    showPredictedIssues 
                      ? "bg-orange-500/10 text-orange-300 border-orange-500/20" 
                      : "bg-slate-950 text-slate-500 border-slate-900"
                  }`}
                  title="Toggle AI predicted vulnerabilities"
                >
                  {showPredictedIssues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Predictions</span>
                </button>

                <button
                  onClick={() => setShowRiskHotspots(!showRiskHotspots)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-mono font-bold border ${
                    showRiskHotspots 
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/20" 
                      : "bg-slate-950 text-slate-500 border-slate-900"
                  }`}
                  title="Toggle heat wave risk hotspots"
                >
                  {showRiskHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Hotspots</span>
                </button>

                <button
                  onClick={() => setShowResolutionProgress(!showResolutionProgress)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-mono font-bold border ${
                    showResolutionProgress 
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                      : "bg-slate-950 text-slate-500 border-slate-900"
                  }`}
                  title="Toggle dynamic repair dispatch paths connecting issue sites to agency offices"
                >
                  {showResolutionProgress ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Dispatch Paths</span>
                </button>
              </div>
            </div>

            {/* VISUAL SVG MAP FIELD CONTAINER */}
            <div className="flex-1 relative border border-slate-800/80 bg-slate-950 rounded-2xl my-4 py-8 overflow-hidden min-h-[380px] select-none">
              
              {/* Layout Map Wireframes SVG Overlays */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                {/* SVG Definitions */}
                <defs>
                  {/* Glowing and fading linear and radial gradients */}
                  <linearGradient id="grid-glow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                  </linearGradient>
                  
                  {/* Hotspots glows radial definitions */}
                  <radialGradient id="hotspot-radial-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="40%" stopColor="#fb7185" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </radialGradient>
                  
                  <radialGradient id="hotspot-moderate" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#fdba74" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </radialGradient>

                  {/* Dispatch lines linear gradients */}
                  <linearGradient id="dispatch-line-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* City landscape simulated regional grid outlines */}
                <path d="M 0,150 Q 220,100 450,220 T 900,120" stroke="#334155" strokeWidth="0.8" strokeDasharray="4,4" />
                <path d="M 120,400 Q 280,240 400,0" stroke="#334155" strokeWidth="0.8" strokeDasharray="6,4" />
                <path d="M 580,400 Q 520,200 680,0" stroke="#334155" strokeWidth="1" strokeDasharray="3,6" />
                <path d="M 0,280 L 900,320" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.15" />

                {/* Major Highways & Waterway Channels */}
                <path d="M 0,80 Q 250,50 480,180 T 900,280" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" strokeOpacity="0.6" />
                <path d="M 0,80 Q 250,50 480,180 T 900,280" stroke="#4f46e5" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.25" />

                {/* Grid Dot Overlay Pattern */}
                <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#475569" fillOpacity="0.12" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-dots)" />

                {/* 1. SECTION: REAL RISK HOTSPOTS GLOW AREA (Calculated dynamically per District active count) */}
                {showRiskHotspots && districtDensity.map((dist, dIdx) => {
                  if (dist.activeIssues === 0) return null;
                  const coords = getDistrictCoordinates(dist.name, `GRID-HOT-${dIdx}`);
                  const isCritical = dist.activeIssues > 2;
                  
                  return (
                    <g key={`hot-${dIdx}`} className="transition-all duration-300">
                      {/* Pulse ring indicator */}
                      <circle 
                        cx={`${coords.x}%`} 
                        cy={`${coords.y}%`} 
                        r={25 + dist.activeIssues * 15} 
                        fill={isCritical ? "url(#hotspot-radial-glow)" : "url(#hotspot-moderate)"} 
                      />
                      <circle 
                        cx={`${coords.x}%`} 
                        cy={`${coords.y}%`} 
                        r={50 + dist.activeIssues * 20} 
                        fill="transparent"
                        stroke={isCritical ? "#f43f5e" : "#f97316"}
                        strokeOpacity="0.08"
                        strokeWidth="1.5"
                        strokeDasharray="4,6"
                      />
                    </g>
                  );
                })}

                {/* 2. SECTION: DISPATCH PATHWAYS VECTOR LINES (Connecting Issues to assigned Municipal Departments HQ) */}
                {showResolutionProgress && mapDots.map((dot) => {
                  if (dot.resolved) return null;
                  const deptName = getDepartmentForIssue(dot.issue);
                  const deptCoords = getDeptCoordinates(deptName);
                  const isCurrentlyResolving = ["Routing", "Resolving"].includes(dot.status);

                  return (
                    <g key={`line-${dot.id}`} className="transition-all">
                      {/* Dashed background path line */}
                      <line 
                        x1={`${dot.x}%`} 
                        y1={`${dot.y}%`} 
                        x2={`${deptCoords.x}%`} 
                        y2={`${deptCoords.y}%`} 
                        stroke={isCurrentlyResolving ? "url(#dispatch-line-pulse)" : "#475569"} 
                        strokeWidth={isCurrentlyResolving ? "1.5" : "0.75"}
                        strokeDasharray={isCurrentlyResolving ? "4,4" : "5,10"}
                        strokeOpacity={isCurrentlyResolving ? "0.6" : "0.3"}
                      />

                      {/* Moving glowing particle signifying agent dispatcher work stream */}
                      {isCurrentlyResolving && (
                        <circle cx={`${dot.x}%`} cy={`${dot.y}%`} r="3.5" fill="#a5b4fc" className="shadow-lg">
                          <animateMotion 
                            path={`M 0 0 L ${(deptCoords.x - dot.x) * 6} ${(deptCoords.y - dot.y) * 4}`} 
                            dur="3s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 3. SECTION: DISTRICT DEPARTMENT HEADQUARTERS NODES (Styled terminal points pins) */}
              {departmentsList.map((dept, idx) => {
                const coords = getDeptCoordinates(dept.name);
                const DeptIcon = dept.icon;
                return (
                  <div 
                    key={`dept-pin-${idx}`}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center cursor-help">
                      <DeptIcon className="w-3.5 h-3.5" />
                    </div>
                    {/* Compact overhead node index label */}
                    <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-indigo-400 bg-slate-950/90 border border-slate-900 rounded px-1.5 py-0.5 mt-1 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                      {dept.short} HQ
                    </span>
                    
                    {/* Hover detail box */}
                    <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none bottom-8 left-1/2 -translate-x-1/2 w-48 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-[10px] z-50 text-slate-200 transition-all shadow-2xl">
                      <p className="font-bold font-mono text-indigo-400 m-0">{dept.name}</p>
                      <p className="text-slate-400 mt-1 m-0">Authorized municipal repair coordinator node.</p>
                    </div>
                  </div>
                );
              })}

              {/* 4. SECTION: CO-ORDINATED REPORTED DIGITAL DOT PINS LAYER (HTML elements placed precise absolute coordinates) */}
              {showActiveIssues && mapDots.map((dot) => {
                const isSelected = selectedPinId === dot.id;
                const dotColorClass = 
                  dot.resolved ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                  dot.severity === "Critical" ? "bg-rose-500 border-rose-450 animate-pulse" :
                  dot.severity === "High" ? "bg-orange-500 border-orange-400" : "bg-indigo-500 border-indigo-400";

                return (
                  <div
                    key={`dot-pin-${dot.id}`}
                    onClick={() => {
                      setSelectedPinId(isSelected ? null : dot.id);
                      setSelectedPredictedId(null);
                    }}
                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                      isSelected ? "scale-125 z-40 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" : "hover:scale-110"
                    }`}
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  >
                    <span className="flex h-5 w-5 relative items-center justify-center">
                      {!dot.resolved && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                          dot.severity === "Critical" ? "bg-rose-400" : dot.severity === "High" ? "bg-orange-400" : "bg-indigo-400"
                        }`}></span>
                      )}
                      
                      {/* Interactive Pin Circle */}
                      <span className={`relative inline-flex items-center justify-center rounded-full h-4 w-4 border-2 shadow-lg transition-transform ${dotColorClass}`}>
                        {dot.resolved ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[3px]" />
                        ) : (
                          <span className="text-[7.5px] font-mono leading-none text-white font-extrabold">
                            {dot.stepNumber}
                          </span>
                        )}
                      </span>
                    </span>

                    {/* Overhead indicator detailing brief info */}
                    {!isSelected && (
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/90 border border-slate-900 rounded px-1.5 py-0.5 whitespace-nowrap text-[8px] font-mono font-medium text-slate-350 shadow opacity-0 hover:opacity-100 transition-opacity">
                        {dot.id}: {dot.title.substring(0, 12)}...
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 5. SECTION: FUTURE PROJECTED WARNING PINS LAYER */}
              {showPredictedIssues && predictedFutureIssues.map((pred) => {
                const isSelected = selectedPredictedId === pred.id;
                
                return (
                  <div
                    key={`pred-pin-${pred.id}`}
                    onClick={() => {
                      setSelectedPredictedId(isSelected ? null : pred.id);
                      setSelectedPinId(null);
                    }}
                    className={`absolute z-25 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                      isSelected ? "scale-125 z-40" : "hover:scale-105"
                    }`}
                    style={{ left: `${pred.x}%`, top: `${pred.y}%` }}
                  >
                    <div className="relative h-6 w-6 flex items-center justify-center">
                      {/* Dashed forecast circle ring */}
                      <svg className="absolute w-full h-full animate-spin" style={{ animationDuration: "12s" }}>
                        <circle cx="12" cy="12" r="10" fill="transparent" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                      </svg>
                      
                      {/* Core icon */}
                      <div className="h-3 w-3 rounded-full bg-amber-500/30 border border-amber-500 flex items-center justify-center shadow-lg">
                        <span className="w-1 h-1 bg-amber-300 rounded-full animate-ping"></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Static landscape topographic district labels text */}
              <div className="absolute top-[12%] left-[16%] pointer-events-none text-[8.5px] font-mono font-black text-slate-650 tracking-widest uppercase opacity-45 select-none">
                Western Sector Ring
              </div>
              <div className="absolute top-[48%] left-[78%] pointer-events-none text-[8.5px] font-mono font-black text-slate-650 tracking-widest uppercase opacity-45 select-none">
                SOMA Industrial Grid
              </div>
              <div className="absolute top-[78%] left-[32%] pointer-events-none text-[8.5px] font-mono font-black text-slate-650 tracking-widest uppercase opacity-45 select-none">
                Castro Harbors
              </div>
              <div className="absolute top-[28%] left-[45%] pointer-events-none text-[8.5px] font-mono font-black text-slate-650 tracking-widest uppercase opacity-45 select-none">
                Central Downtown
              </div>
              <div className="absolute top-[16%] left-[70%] pointer-events-none text-[8.5px] font-mono font-black text-slate-650 tracking-widest uppercase opacity-45 select-none">
                Marina Sector Bay
              </div>

            </div>

            {/* Map Legends Block */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-3">
              <span>Projection Ratio Unit: 1:125m • Vector Matrix Active</span>
              <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold">
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span>Critical Severity</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block"></span>
                  <span>High Priority</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  <span>Standard Active</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex items-center justify-center inline-block"><CheckCircle2 className="w-2 h-2 text-white" /></span>
                  <span>Resolved</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full border border-dashed border-amber-500 flex items-center justify-center inline-block"></span>
                  <span>Predicted Hazard</span>
                </span>
              </div>
            </div>

          </div>

          {/* DYNAMIC LEDGER MATERIAL DEMANDS LEDGERS */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center space-x-2">
                <Hammer className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-200">Active Structural Material Demands Ledger</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Inventory Allocation</span>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {materialDemands.map((mat, mIdx) => (
                <div key={mIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">{mat.utility}</span>
                  <div className="mt-2.5">
                    <p className="text-xs font-bold text-slate-100 truncate">{mat.name}</p>
                    <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 inline-block mt-1">
                      {mat.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT (4 Cols) - CONTROL FEED DRAWER / SENSOR FEEDS */}
        <div className="lg:col-span-4 flex flex-col space-y-6">

          {/* DYNAMIC INTERACTIVE MAP SELECTION DETAIL PANEL */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 min-h-[220px] flex flex-col justify-between shadow-xl">
            
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                Telemetry Inspector
              </span>
              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">
                Live Data Link
              </span>
            </div>

            {/* A. If an Active Pin Dot is pressed */}
            {selectedDotDetail ? (
              <div className="py-4 space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-indigo-400">{selectedDotDetail.id}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedDotDetail.severity === "Critical" ? "bg-rose-500/10 text-rose-450 border-rose-500/20" :
                      selectedDotDetail.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      {selectedDotDetail.severity} Severity
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-100 font-display mt-2">{selectedDotDetail.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 lines-clamp-3 leading-relaxed">{selectedDotDetail.issue.description}</p>
                  
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1.5 mt-3 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">District:</span>
                      <span className="text-slate-300 font-bold">{selectedDotDetail.issue.location.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reporter:</span>
                      <span className="text-slate-300">{selectedDotDetail.issue.reporterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400 font-bold">{selectedDotDetail.status}</span>
                    </div>
                  </div>
                </div>

                {/* RESOLUTION PROGRESS CHECKLIST METER */}
                <div className="pt-3 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2">Resolution Progress steps</span>
                  
                  <div className="grid grid-cols-6 gap-0.5 text-center">
                    {[
                      { step: 1, label: "Rep", cond: selectedDotDetail.stepNumber >= 1 },
                      { step: 2, label: "Ver", cond: selectedDotDetail.stepNumber >= 2 },
                      { step: 3, label: "Pri", cond: selectedDotDetail.stepNumber >= 3 },
                      { step: 4, label: "Rte", cond: selectedDotDetail.stepNumber >= 4 },
                      { step: 5, label: "Res", cond: selectedDotDetail.stepNumber >= 5 },
                      { step: 6, label: "Ok", cond: selectedDotDetail.stepNumber >= 6 },
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className={`h-1 rounded-full ${step.cond ? "bg-emerald-500" : "bg-slate-800"}`}></div>
                        <span className={`text-[8.5px] font-mono block ${step.cond ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Detailed Suggestion Action Blueprint */}
                  {selectedDotDetail.issue.agentTrace?.resolution?.suggestedPlan && (
                    <div className="bg-slate-950/80 p-2 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 mt-3">
                      <span className="text-indigo-400 font-bold block mb-1 uppercase">Suggested Blueprint Draft</span>
                      <p className="m-0 text-slate-450 italic leading-snug">
                        {selectedDotDetail.issue.agentTrace.resolution.suggestedPlan[0]}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : selectedPredictedDetail ? (
              // B. If a Predicted Pin Dot is pressed
              <div className="py-4 space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-amber-400">AI DETECTOR RISK</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${selectedPredictedDetail.badgeColor}`}>
                      {selectedPredictedDetail.probability}% Probability
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-100 font-display mt-2">{selectedPredictedDetail.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider mt-1">{selectedPredictedDetail.threatLevel}</span>
                  
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1.5 mt-3 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Forecast Region:</span>
                      <span className="text-slate-300 font-bold">{selectedPredictedDetail.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mitigation:</span>
                      <span className="text-indigo-400 font-bold">Preventative Sweeps</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900">
                  <div className="bg-amber-500/5 p-3 border border-amber-500/10 rounded-xl text-[10px] font-mono text-slate-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-amber-400 font-bold uppercase block mb-1">Pre-emptive Sweep Directive</span>
                      <p className="m-0 leading-normal text-slate-350">{selectedPredictedDetail.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // C. Unselected state instruction
              <div className="py-8 text-center flex-1 flex flex-col items-center justify-center space-y-2">
                <Navigation className="w-7 h-7 text-slate-700 stroke-1.5" />
                <p className="text-xs text-slate-500 m-0 max-w-[200px]">
                  Click on any active pin (1-6) or predicted risk ring (dashed) on the city map to inspect real-time agent trace logs.
                </p>
              </div>
            )}
          </div>

          {/* DISTRICT ANALYSIS & PERFORMANCE CLASSIFICATIONS */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-250 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Live District Active Density
              </span>
              <span className="text-[9px] font-mono text-slate-500">5 sectors</span>
            </div>

            <div className="space-y-3">
              {districtDensity.map((dist, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{dist.name}</span>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${dist.badgeColor}`}>
                      {dist.activeIssues} items
                    </span>
                  </div>
                  
                  {/* Gauge Progress Bar representing regional load */}
                  <div className="w-full bg-slate-900 rounded-full h-1 mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${dist.barColor}`} style={{ width: `${dist.activeIssues > 0 ? dist.densityPercentage : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TELEMETRY NODES SEED LIST FEEDS */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200">IoT Grid Sensor Feeds</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Node Array</span>
            </div>

            <div className="space-y-2.5">
              {sensorNodes.map((sensor) => (
                <div 
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSensor === sensor.id 
                      ? "border-indigo-500/40 bg-indigo-500/5 shadow-md" 
                      : "border-slate-900 bg-slate-950 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-400 font-bold">{sensor.id}</span>
                    <span className={`font-black uppercase ${
                      sensor.status === "Critical" ? "text-rose-450" : sensor.status === "Warning" ? "text-orange-400" : "text-emerald-400"
                    }`}>
                      {sensor.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1">{sensor.name}</h4>
                  <div className="flex justify-between items-end text-[10px] font-mono mt-1.5 pt-1.5 border-t border-slate-900/60 text-slate-400">
                    <span className="text-slate-350">{sensor.value}</span>
                    <span className="text-[9px] text-slate-500">{sensor.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
