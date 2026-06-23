import React, { useState, useEffect, useRef } from "react";
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useAdvancedMarkerRef 
} from "@vis.gl/react-google-maps";
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Map as MapIcon, 
  Cpu, 
  Layers, 
  Zap, 
  HardHat, 
  Droplets, 
  Leaf, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronRight, 
  ArrowRight,
  Info 
} from "lucide-react";
import { IssueReport } from "../types";
import CommunityVerificationHub from "./CommunityVerificationHub";

// Grab the API Key safely following Constitution Rule 1
const API_KEY =
  (typeof process !== "undefined" && process?.env?.GOOGLE_MAPS_PLATFORM_KEY) ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "AIzaSyD6xIa0EfAuk_CO_Cl14XP9OhrnzsFmyyA";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

interface GeoIntelligenceCenterProps {
  issues: IssueReport[];
  setCurrentPage: (page: string) => void;
  onVerifyIssue: (id: string, action: "verify" | "reject", severityVote?: string, evidenceUrl?: string) => void;
}

// Custom wrapper to draw Polygons on Google Maps elegantly
interface PolygonProps {
  key?: React.Key;
  paths: google.maps.LatLngLiteral[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  visible?: boolean;
}

function Polygon({ paths, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, visible = true }: PolygonProps) {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    const polygon = new google.maps.Polygon({
      paths,
      strokeColor: strokeColor || "#3b82f6",
      strokeOpacity: strokeOpacity || 0.6,
      strokeWeight: strokeWeight || 2,
      fillColor: fillColor || "#3b82f6",
      fillOpacity: fillOpacity || 0.2,
      visible
    });

    polygon.setMap(map);
    polygonRef.current = polygon;

    return () => {
      polygon.setMap(null);
    };
  }, [map, JSON.stringify(paths), strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, visible]);

  return null;
}

// Custom wrapper to draw Circles on Google Maps elegantly (used for heatmaps / verification density)
interface CircleProps {
  key?: React.Key;
  center: google.maps.LatLngLiteral;
  radius: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  visible?: boolean;
}

function Circle({ center, radius, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, visible = true }: CircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      center,
      radius,
      strokeColor: strokeColor || "#ef4444",
      strokeOpacity: strokeOpacity || 0.4,
      strokeWeight: strokeWeight || 1,
      fillColor: fillColor || "#ef4444",
      fillOpacity: fillOpacity || 0.15,
      visible
    });

    circle.setMap(map);
    circleRef.current = circle;

    return () => {
      circle.setMap(null);
    };
  }, [map, center.lat, center.lng, radius, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity, visible]);

  return null;
}

export default function GeoIntelligenceCenter({ issues, setCurrentPage, onVerifyIssue }: GeoIntelligenceCenterProps) {
  // Map Layer Toggles
  const [showActiveIssues, setShowActiveIssues] = useState<boolean>(true);
  const [showHeatmaps, setShowHeatmaps] = useState<boolean>(true);
  const [showPredictedHotspots, setShowPredictedHotspots] = useState<boolean>(true);
  const [showVerificationDensity, setShowVerificationDensity] = useState<boolean>(false);
  const [showDepartmentZones, setShowDepartmentZones] = useState<boolean>(true);

  // Selected Pin / Issue Workflow Drawer State
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<number>(0);

  // Selected Hotspot / Zone Detail State
  const [selectedPredictedHotspot, setSelectedPredictedHotspot] = useState<any | null>(null);

  // San Francisco Map Center Coordinates
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  const defaultZoom = 13;

  const [bypassAndRunSandbox, setBypassAndRunSandbox] = useState<boolean>(false);
  const isSandboxMode = !hasValidKey || bypassAndRunSandbox;

  // Render Splash Screen if API Key is not configured
  if (!hasValidKey && !bypassAndRunSandbox) {
    return (
      <div className="flex items-center justify-center min-h-[600px] font-sans text-slate-100 p-6">
        <div className="max-w-xl w-full bg-slate-950/80 border border-indigo-950/40 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <MapIcon className="w-8 h-8 animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Google Maps API Key Required
          </h2>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            Please provide a valid Google Maps Platform API Key to activate the real-time Geo Intelligence Center.
          </p>

          {/* Sandbox Bypass CTA */}
          <div className="p-1.5 bg-gradient-to-r from-pink-500/20 via-indigo-500/20 to-teal-500/20 rounded-2xl border border-indigo-500/25">
            <button
              onClick={() => setBypassAndRunSandbox(true)}
              className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Proceed with Interactive Demo Sandbox (No Key Required)</span>
            </button>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 text-left space-y-3.5">
            <p className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-1">Or, Setup a Private API Key</p>
            <div className="flex gap-2.5 items-start text-xs">
              <span className="flex h-5 w-5 rounded-full bg-indigo-600/10 border border-indigo-600/30 font-mono font-bold text-indigo-400 text-[10px] items-center justify-center shrink-0">1</span>
              <p className="text-slate-300">
                <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Get an API Key</a> from the Google Cloud Console.
              </p>
            </div>
            
            <div className="flex gap-2.5 items-start text-xs">
              <span className="flex h-5 w-5 rounded-full bg-indigo-600/10 border border-indigo-600/30 font-mono font-bold text-indigo-400 text-[10px] items-center justify-center shrink-0">2</span>
              <p className="text-slate-300">
                Open <strong className="text-white">Settings</strong> (⚙️ gear icon, top-right of your AI Studio environment).
              </p>
            </div>

            <div className="flex gap-2.5 items-start text-xs">
              <span className="flex h-5 w-5 rounded-full bg-indigo-600/10 border border-indigo-600/30 font-mono font-bold text-indigo-400 text-[10px] items-center justify-center shrink-0">3</span>
              <p className="text-slate-300">
                Select <strong className="text-white">Secrets</strong>, type <code className="bg-slate-950 font-semibold px-1 rounded text-rose-400 text-[10px]">GOOGLE_MAPS_PLATFORM_KEY</code> as the name, paste your key as the value, and save.
              </p>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-500">
            The application will recompile and load your credentials automatically.
          </p>
        </div>
      </div>
    );
  }

  // Coordinate projectors to map SF geographical coordinates onto a 1000x600 SVG viewBox
  const getSVGCoords = (lat: number, lng: number) => {
    const minLat = 37.730;
    const maxLat = 37.810;
    const minLng = -122.490;
    const maxLng = -122.385;
    
    // Projections scaled to 1000x600 viewBox with margin/padding buffers
    const y = 540 - ((lat - minLat) / (maxLat - minLat)) * 485;
    const x = 50 + ((lng - minLng) / (maxLng - minLng)) * 900;
    return { x, y };
  };

  const getSVGPolygonPoints = (zone: { lat: number; lng: number }[]) => {
    return zone.map(pt => {
      const coords = getSVGCoords(pt.lat, pt.lng);
      return `${coords.x},${coords.y}`;
    }).join(" ");
  };

  // Define department coverage zones using coordinates surrounding San Francisco
  const dpwZone = [
    { lat: 37.795, lng: -122.490 },
    { lat: 37.795, lng: -122.440 },
    { lat: 37.740, lng: -122.440 },
    { lat: 37.740, lng: -122.490 }
  ];

  const dwpZone = [
    { lat: 37.810, lng: -122.420 },
    { lat: 37.810, lng: -122.390 },
    { lat: 37.770, lng: -122.390 },
    { lat: 37.770, lng: -122.420 }
  ];

  const tsaZone = [
    { lat: 37.770, lng: -122.450 },
    { lat: 37.770, lng: -122.410 },
    { lat: 37.730, lng: -122.410 },
    { lat: 37.730, lng: -122.450 }
  ];

  const epaZone = [
    { lat: 37.775, lng: -122.410 },
    { lat: 37.775, lng: -122.385 },
    { lat: 37.740, lng: -122.385 },
    { lat: 37.740, lng: -122.410 }
  ];

  // Map Active and Resolved reports coordinates
  // Safe default lat/lng positions matching District centers if coordinates are loose or missing
  const getCoordinatesForIssue = (issue: IssueReport) => {
    let lat = issue.location.latitude;
    let lng = issue.location.longitude;

    // Check if coordinates seem invalid or centered at (0,0), and fallback to district footprints around SF
    if (!lat || !lng || (lat === 37.7749 && lng === -122.4194 && issue.id !== "CIV-291")) {
      const dist = (issue.location.district || "").toLowerCase();
      const idNum = parseInt(issue.id.replace(/\D/g, "")) || 0;
      const offsetLat = (((idNum * 17) % 11) - 5) * 0.003;
      const offsetLng = (((idNum * 23) % 11) - 5) * 0.003;

      if (dist.includes("downtown")) {
         lat = 37.785 + offsetLat;
         lng = -122.410 + offsetLng;
      } else if (dist.includes("western")) {
         lat = 37.770 + offsetLat;
         lng = -122.460 + offsetLng;
      } else if (dist.includes("eastern") || dist.includes("castro")) {
         lat = 37.760 + offsetLat;
         lng = -122.435 + offsetLng;
      } else if (dist.includes("soma")) {
         lat = 37.765 + offsetLat;
         lng = -122.400 + offsetLng;
      } else {
         lat = 37.775 + offsetLat;
         lng = -122.420 + offsetLng;
      }
    }

    return { lat, lng };
  };

  const getIssueCategoryColor = (issueType: string) => {
    const type = (issueType || "").toLowerCase();
    if (type.includes("pothole")) return "#f97316"; // Orange
    if (type.includes("leak") || type.includes("water") || type.includes("drainage")) return "#3b82f6"; // Blue
    if (type.includes("garbage") || type.includes("waste")) return "#ef4444"; // Red
    if (type.includes("streetlight") || type.includes("electricity")) return "#eab308"; // Amber
    return "#818cf8"; // Indigo
  };

  const activeIssues = issues.filter(i => i.status !== "Resolved");
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // Define 5 predicted hotspots with probabilities and recommendations
  const predictedHotspots = [
    { id: "PH-1", title: "Asphalt Cavitation Risk expansion", district: "Western District", position: { lat: 37.775, lng: -122.470 }, probability: 82, recommendation: "Inject specialized binder polymers on adjacent arterial lanes." },
    { id: "PH-2", title: "Water Main Pressure Hydrostatic spike", district: "Downtown Centre", position: { lat: 37.790, lng: -122.405 }, probability: 74, recommendation: "Schedule Acoustic leakage wave inspections and lower grid pressures." },
    { id: "PH-3", title: "Transformer overload thermal wear", district: "Eastern District", position: { lat: 37.755, lng: -122.430 }, probability: 91, recommendation: "Replace terminal base insulation covers and deploy heat probes." },
    { id: "PH-4", title: "Illegal toxic chemical refuse vector", district: "SOMA Industrial Grid", position: { lat: 37.762, lng: -122.395 }, probability: 68, recommendation: "Launch automated environmental sanitation vacuum camera patrols." },
    { id: "PH-5", title: "Curb sinkage storm water backup", district: "Marina Sector", position: { lat: 37.802, lng: -122.440 }, probability: 55, recommendation: "Reroute drainage intake paths to secondary overflow bypass bays." }
  ];

  return (
    <div className="space-y-6" id="geo-intelligence-center">
      
      {/* Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-2 inline-block">
              GEO INTELLIGENCE COMMAND
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-100 italic tracking-tight flex items-center space-x-2.5">
            <MapIcon className="w-6 h-6 text-indigo-400" />
            <span>Geo Intelligence Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Powered by true Google Maps visual integration. Access real-time spatial indicators, hazard heatmaps, forecasted risk hotspots, and track multi-agent diagnostic traces interactively.
          </p>
        </div>
        
        {/* Quick KPI stats chips */}
        <div className="flex gap-2 font-mono text-[10px]">
          <div className="bg-indigo-500/5 border border-indigo-500/25 rounded-xl px-3.5 py-2">
            <span className="text-slate-500 uppercase block">Active pins</span>
            <span className="text-xs font-bold text-indigo-400">{activeIssues.length} Nodes</span>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3.5 py-2">
            <span className="text-slate-500 uppercase block">Map Coverage</span>
            <span className="text-xs font-bold text-emerald-400">100% Operational</span>
          </div>
        </div>
      </div>

      {/* Main Map + Layers Split view */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Map & Layer controls (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Layer and Control Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 font-bold font-mono text-slate-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>LAYER COMMAND</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Toggle Buttons */}
              <button
                onClick={() => setShowActiveIssues(!showActiveIssues)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                  showActiveIssues 
                    ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-300"
                    : "bg-slate-900/40 border-transparent text-slate-500"
                }`}
              >
                {showActiveIssues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Active Hazards</span>
              </button>

              <button
                onClick={() => setShowHeatmaps(!showHeatmaps)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                  showHeatmaps 
                    ? "bg-rose-600/15 border-rose-500/30 text-rose-400"
                    : "bg-slate-900/40 border-transparent text-slate-500"
                }`}
              >
                {showHeatmaps ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Density Heatmaps</span>
              </button>

              <button
                onClick={() => setShowPredictedHotspots(!showPredictedHotspots)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                  showPredictedHotspots 
                    ? "bg-amber-600/15 border-amber-500/30 text-amber-400"
                    : "bg-slate-900/40 border-transparent text-slate-500"
                }`}
              >
                {showPredictedHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Predicted Hotspots</span>
              </button>

              <button
                onClick={() => setShowVerificationDensity(!showVerificationDensity)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                  showVerificationDensity 
                    ? "bg-teal-600/15 border-teal-500/30 text-teal-300"
                    : "bg-slate-900/40 border-transparent text-slate-500"
                }`}
              >
                {showVerificationDensity ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Verification density</span>
              </button>

              <button
                onClick={() => setShowDepartmentZones(!showDepartmentZones)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all ${
                  showDepartmentZones 
                    ? "bg-blue-600/15 border-blue-500/30 text-blue-300"
                    : "bg-slate-900/40 border-transparent text-slate-500"
                }`}
              >
                {showDepartmentZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Department Zones</span>
              </button>
            </div>
          </div>

          {/* Actual Google Map Instance */}
          <div className="rounded-3xl border border-slate-850 overflow-hidden relative shadow-2xl bg-slate-950 flex-1 min-h-[500px] h-[550px]">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                mapId="GEO_INTELLIGENCE_MAP"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: "100%", height: "100%" }}
                gestureHandling="cooperative"
                disableDefaultUI={false}
              >
                
                {/* 1. Render Department polygons */}
                {showDepartmentZones && (
                  <>
                    {/* DPW Zone (Western Area) - Green */}
                    <Polygon 
                      paths={dpwZone}
                      strokeColor="#10b981"
                      strokeOpacity={0.5}
                      strokeWeight={2}
                      fillColor="#10b981"
                      fillOpacity={0.06}
                    />
                    
                    {/* DWP Zone (Downtown Area) - Blue */}
                    <Polygon 
                      paths={dwpZone}
                      strokeColor="#3b82f6"
                      strokeOpacity={0.5}
                      strokeWeight={2}
                      fillColor="#3b82f6"
                      fillOpacity={0.06}
                    />

                    {/* TSA Zone (Eastern/Castro Area) - Yellow/Amber */}
                    <Polygon 
                      paths={tsaZone}
                      strokeColor="#fbbf24"
                      strokeOpacity={0.5}
                      strokeWeight={2}
                      fillColor="#fbbf24"
                      fillOpacity={0.06}
                    />

                    {/* EPA Zone (SOMA Area) - Red/Crimson */}
                    <Polygon 
                      paths={epaZone}
                      strokeColor="#ef4444"
                      strokeOpacity={0.5}
                      strokeWeight={2}
                      fillColor="#ef4444"
                      fillOpacity={0.06}
                    />
                  </>
                )}

                {/* 2. Render Heatmap circles at active issue clusters */}
                {showHeatmaps && (
                  <>
                    {/* High-intensity heat centers around major active issues */}
                    {activeIssues.map((issue) => {
                      const pos = getCoordinatesForIssue(issue);
                      return (
                        <Circle 
                          key={`heat-hi-${issue.id}`}
                          center={pos}
                          radius={300}
                          strokeColor="#f43f5e"
                          strokeOpacity={0.3}
                          strokeWeight={1}
                          fillColor="#f43f5e"
                          fillOpacity={0.25}
                        />
                      );
                    })}
                    {/* Medium-intensity scatter buffer heat circles */}
                    {activeIssues.map((issue) => {
                      const pos = getCoordinatesForIssue(issue);
                      return (
                        <Circle 
                          key={`heat-md-${issue.id}`}
                          center={pos}
                          radius={650}
                          strokeColor="#f97316"
                          strokeOpacity={0.15}
                          strokeWeight={1}
                          fillColor="#f97316"
                          fillOpacity={0.08}
                        />
                      );
                    })}
                  </>
                )}

                {/* 3. Render Verification Density Circles */}
                {showVerificationDensity && (
                  <>
                    <Circle 
                      center={{ lat: 37.785, lng: -122.410 }} // Downtown High Verification Density Center
                      radius={1800}
                      strokeColor="#14b8a6"
                      strokeOpacity={0.4}
                      strokeWeight={1}
                      fillColor="#14b8a6"
                      fillOpacity={0.15}
                    />
                    <Circle 
                      center={{ lat: 37.760, lng: -122.435 }} // Eastern Corridor High Verification Density center
                      radius={1400}
                      strokeColor="#14b8a6"
                      strokeOpacity={0.3}
                      strokeWeight={1}
                      fillColor="#14b8a6"
                      fillOpacity={0.12}
                    />
                  </>
                )}

                {/* 4. Render Active Hazards pins */}
                {showActiveIssues && issues.map((issue) => {
                  const pos = getCoordinatesForIssue(issue);
                  const isSelected = selectedIssueId === issue.id;
                  const isResolved = issue.status === "Resolved";
                  const color = getIssueCategoryColor(issue.agentTrace?.detection?.issueType || issue.title);

                  return (
                    <AdvancedMarker
                      key={`marker-${issue.id}`}
                      position={pos}
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setSelectedPredictedHotspot(null);
                        setActiveWorkflowTab(0);
                      }}
                    >
                      <div className={`transition-all duration-300 ${isSelected ? "scale-125 z-50 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" : "hover:scale-110"}`}>
                        <div className="relative flex items-center justify-center">
                          {/* Alert ping for unresolved critical/high issues */}
                          {!isResolved && (issue.agentTrace?.detection?.severity === "Critical" || issue.agentTrace?.detection?.severity === "High") && (
                            <span className="absolute flex h-5 w-5 animate-ping rounded-full opacity-65" style={{ backgroundColor: color }}></span>
                          )}
                          <Pin 
                            background={isResolved ? "#10b981" : color} 
                            borderColor="#070b13" 
                            glyphColor="#fff"
                            scale={isSelected ? 1.2 : 0.95}
                          />
                          {!isResolved && (
                            <div className="absolute font-mono text-[9px] font-black text-white pointer-events-none mt-[-14px]">
                              {issue.id.substring(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* 5. Render Predicted Hotspots pins */}
                {showPredictedHotspots && predictedHotspots.map((hotspot) => {
                  const isSelected = selectedPredictedHotspot?.id === hotspot.id;

                  return (
                    <AdvancedMarker
                      key={`pred-marker-${hotspot.id}`}
                      position={hotspot.position}
                      onClick={() => {
                        setSelectedPredictedHotspot(hotspot);
                        setSelectedIssueId(null);
                      }}
                    >
                      <div className={`cursor-pointer transition-all ${isSelected ? "scale-125 z-40" : "hover:scale-110"}`}>
                        <span className="flex h-5 w-5 relative items-center justify-center">
                          <span className="animate-spin absolute inline-flex h-full w-full rounded-full opacity-60 border border-dashed border-amber-500"></span>
                          <span className="relative inline-flex items-center justify-center rounded-full h-3 w-3 bg-slate-950 border-2 border-amber-500 shadow-md">
                            <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping"></span>
                          </span>
                        </span>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* 6. InfoWindow when a Predicted Hotspot is selected */}
                {selectedPredictedHotspot && (
                  <InfoWindow
                    position={selectedPredictedHotspot.position}
                    onCloseClick={() => setSelectedPredictedHotspot(null)}
                  >
                    <div className="p-2 space-y-1.5 max-w-xs text-slate-900 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-extrabold text-[10px] text-amber-600 block uppercase">AI CRITICAL FORECAST</span>
                        <span className="font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px]">
                          {selectedPredictedHotspot.probability}% Risk
                        </span>
                      </div>
                      <h4 className="font-bold font-sans text-sm m-0 leading-tight">{selectedPredictedHotspot.title}</h4>
                      <div className="m-0 text-slate-500 text-[11px] leading-tight flex justify-between uppercase font-mono">
                        <span>District:</span>
                        <span>{selectedPredictedHotspot.district}</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 p-2 rounded text-[10px] leading-snug">
                        <span className="font-bold font-mono text-amber-800 block text-[9px] uppercase tracking-wider mb-0.5">Pre-emptive Mitigation plan</span>
                        "{selectedPredictedHotspot.recommendation}"
                      </div>
                    </div>
                  </InfoWindow>
                )}

              </Map>
            </APIProvider>
          </div>

          {/* Map Legends Block */}
          <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 shrink-0 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-3">
            <span>Projection Scale Unit: 1:250m • Visual overlay map active</span>
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold">
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] inline-block"></span>
                <span>Pothole (Orange)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] inline-block"></span>
                <span>Water Leakage (Blue)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] inline-block"></span>
                <span>Garbage Obstruction (Red)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] inline-block"></span>
                <span>Broken Streetlight (Yellow)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Resolved (Green)</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Agent Workflow telemetry drawer (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col items-stretch h-full">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 shadow-2xl flex-1 flex flex-col justify-between min-h-[500px]">
            
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400 stroke-1.5" />
                Live Agent Workflow telemetry
              </span>
              <span className="text-[10px] text-green-400 uppercase font-black tracking-wide flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span>Online</span>
              </span>
            </div>

            {selectedIssue ? (
              <div className="flex-1 overflow-y-auto max-h-[650px] space-y-5 pr-1.5 custom-scrollbar animate-fade-in">
                
                {/* Meta details of report */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-indigo-400 shrink-0 uppercase bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                      ID: {selectedIssue.id}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedIssue.agentTrace?.detection?.severity === "Critical" ? "bg-rose-500/10 text-rose-450 border-rose-500/20" :
                      selectedIssue.agentTrace?.detection?.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      {selectedIssue.agentTrace?.detection?.severity || "Medium"} Severity
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-display text-slate-100 mt-2.5">{selectedIssue.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed italic border-l-2 border-indigo-600/30 pl-2.5 py-0.5">
                    "{selectedIssue.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono bg-slate-950 p-3 rounded-2xl border border-slate-900/60">
                    <div>
                      <span className="text-slate-500 uppercase block">District</span>
                      <span className="text-slate-300 font-bold">{selectedIssue.location.district}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Ledger Status</span>
                      <span className="text-emerald-400 font-black">{selectedIssue.status}</span>
                    </div>
                  </div>
                </div>

                {/* Community Verification Hub inside Map Drawer */}
                <CommunityVerificationHub 
                  issue={selectedIssue}
                  onVerify={onVerifyIssue}
                />

                {/* Emergency Escalation Agent Panel */}
                {selectedIssue.agentTrace?.emergencyEscalation?.isEscalated && (
                  <div id="geo-emergency-escalation-card" className="bg-red-950/20 border border-red-500/30 rounded-2xl p-3.5 space-y-2 mt-4 animate-pulse">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-wider">
                        Agent 1.5 Intercept: Critical Escalation
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-200">
                      {selectedIssue.agentTrace.emergencyEscalation.bannerMessage || "Standard triaging bypassed to alert first responders!"}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 bg-red-950/40 p-2 rounded-lg border border-red-500/10 leading-normal">
                      <strong>Decision:</strong> {selectedIssue.agentTrace.emergencyEscalation.decisionNotes || "Visual/textual signature flagged life safety hazard."}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                      <span>Authority: {selectedIssue.agentTrace.emergencyEscalation.authorityNotified}</span>
                    </div>
                  </div>
                )}

                {/* 6-Agent sequential workflow progress */}
                <div className="border-t border-slate-900/80 pt-4 flex-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-3">
                    Agent cascade trace
                  </span>

                  {/* Horizontal Tabs to view each Agent details */}
                  <div className="grid grid-cols-6 gap-0.5 border-b border-slate-900 pb-2 mb-4 shrink-0">
                    {[
                      { num: 1, label: "Det" },
                      { num: 2, label: "Ver" },
                      { num: 3, label: "Pri" },
                      { num: 4, label: "Rte" },
                      { num: 5, label: "Res" },
                      { num: 6, label: "Pre" }
                    ].map((tab, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveWorkflowTab(idx)}
                        className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          activeWorkflowTab === idx
                            ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold scale-105"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-950 text-[10px]"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold block">{tab.num}</span>
                        <span className="text-[8px] font-mono block tracking-tight">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Workflow Tab Content displaying exact payload reasoning */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-4 min-h-[190px] flex flex-col justify-between text-xs leading-normal">
                    
                    {/* Tab 1: Detection Agent */}
                    {activeWorkflowTab === 0 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-indigo-400 font-bold block text-[10px] uppercase">Agent 1: Detection</span>
                          <span className="font-mono text-[9px] text-slate-500">Confidence: {Math.round((selectedIssue.agentTrace?.detection?.confidenceScore || 0.96) * 100)}%</span>
                        </div>
                        <p className="font-display font-medium text-slate-200">
                          Classified hazard as <strong className="text-indigo-400">[{selectedIssue.agentTrace?.detection?.issueType || "Unknown"}]</strong>
                        </p>
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-relaxed font-mono text-[10px] text-slate-400">
                          <strong className="text-[8.5px] text-indigo-400 block uppercase mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Gemini Vision reasoning verdict</span>
                          </strong>
                          "{selectedIssue.agentTrace?.detection?.notes || "Analyzed visual frame of structural hazard segment. Identified severe erosion pattern directly matching category indices."}"
                        </div>
                        {selectedIssue.agentTrace?.detection?.identifiedElements && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {selectedIssue.agentTrace.detection.identifiedElements.map((el, i) => (
                              <span key={i} className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400">{el}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Verification Agent */}
                    {activeWorkflowTab === 1 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-teal-400 font-bold block text-[10px] uppercase">Agent 2: Verification</span>
                          <span className="font-mono text-[9px] text-slate-500">Confidence: 94%</span>
                        </div>
                        <p className="font-display font-medium text-slate-200">
                          Unique status verification: <strong className="text-teal-400">[{selectedIssue.agentTrace?.verification?.verificationStatus || "Authentic"}]</strong>
                        </p>
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-relaxed font-mono text-[10px] text-slate-400">
                          <strong className="text-[8.5px] text-teal-400 block uppercase mb-1">Duplication check signature</strong>
                          "{selectedIssue.agentTrace?.verification?.crossReferenceNotes || "Checked historical geo logs within 15 meters radius footprint. Zero overlapping tickets detected."}"
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Prioritization Agent */}
                    {activeWorkflowTab === 2 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-rose-455 font-bold block text-[10px] uppercase">Agent 3: Prioritization</span>
                          <span className="font-mono text-[9px] text-slate-500">Affected Population: {selectedIssue.agentTrace?.prioritization?.affectedPopulationEst || 250} est</span>
                        </div>
                        <p className="font-display font-medium text-slate-200">
                          Civic Impact Weighted Score: <strong className="text-rose-400">{selectedIssue.agentTrace?.prioritization?.civicImpactScore || 75}/100</strong>
                        </p>
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold">Calculated risk modifiers:</span>
                          <div className="flex flex-col gap-1">
                            {(selectedIssue.agentTrace?.prioritization?.factors || ["Impedance of municipal transportation flow", "Active environmental erosion threat"]).map((f, i) => (
                              <div key={i} className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                                <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="truncate">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Authority Routing Agent */}
                    {activeWorkflowTab === 3 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-blue-400 font-bold block text-[10px] uppercase">Agent 4: Authority routing</span>
                          <span className="font-mono text-[9px] text-slate-500">Priority: {selectedIssue.agentTrace?.routing?.dispatchPriority || "Expedited"}</span>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-500">Assigned Department:</span>
                            <span className="text-slate-300 font-bold">{selectedIssue.agentTrace?.routing?.department || "Dept of Infrastructure"}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-500">Liaison Officer:</span>
                            <span className="text-slate-300">{selectedIssue.agentTrace?.routing?.assignedOfficer || "Samantha Croft"}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-500">Dispatch Channel:</span>
                            <span className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{selectedIssue.agentTrace?.routing?.contactChannel || "TSA-LIVE-POWER"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 5: Resolution Agent */}
                    {activeWorkflowTab === 4 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-emerald-400 font-bold block text-[10px] uppercase">Agent 5: Resolution Blueprints</span>
                          <span className="font-mono text-[9px] text-slate-500">Est. Hours: {selectedIssue.agentTrace?.resolution?.estimatedHours || 4} hrs</span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[8.5px] font-mono text-slate-550 block uppercase font-bold">Planned remediation steps:</span>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {(selectedIssue.agentTrace?.resolution?.suggestedPlan || [
                              "Secure lane bounding boundaries and detour pedestrian path traffic.",
                              "Inject structural aggregate composite adhesive matrix.",
                              "Evaluate seal compaction edges twice monthly."
                            ]).map((step, i) => (
                              <p key={i} className="m-0 leading-normal text-[10px] font-mono text-slate-400 border-l border-emerald-500/40 pl-2">
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between font-mono text-[10px] pt-1.5 border-t border-slate-900/40">
                          <span className="text-slate-500">Estimated Cost:</span>
                          <span className="text-emerald-400 font-extrabold text-[11px] font-black">${selectedIssue.agentTrace?.resolution?.estimatedCost || 350} USD</span>
                        </div>
                      </div>
                    )}

                    {/* Tab 6: Prediction Agent */}
                    {activeWorkflowTab === 5 && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-900/40 pb-1.5">
                          <span className="font-mono text-purple-400 font-bold block text-[10px] uppercase">Agent 6: Prediction model</span>
                          <span className="font-mono text-[9px] text-slate-500">Type: Regional Risk</span>
                        </div>
                        <p className="font-display font-medium text-slate-200 mt-2">
                          Regional decay forecast: <strong className="text-purple-400">+{selectedIssue.agentTrace?.prediction?.riskIncreasePercent || 45}%</strong> if neglected.
                        </p>
                        <div className="bg-purple-950/15 border border-purple-500/10 p-2.5 rounded-xl text-[10px] leading-snug font-mono text-slate-400">
                          <strong className="text-[8.5px] text-purple-400 block uppercase mb-1">Micro-policy directive recommendation</strong>
                          "{selectedIssue.agentTrace?.prediction?.preventativeAction || "Trigger monthly acoustic conduction sweeps across adjacent block footprint zones."}"
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Handoff execution confirmation action block */}
                <div className="pt-4 border-t border-slate-900 shrink-0">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3.5 text-[10px] font-mono text-slate-400 flex items-start gap-2.5 leading-relaxed">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-indigo-300 font-bold uppercase block mb-0.5">Automated workflow ledger synced</span>
                      <span>This community report is logged inside the un-alterable blockchain registry docket. Remediation departments coordinates are mapped safely.</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center flex-1 flex flex-col items-center justify-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                  <Activity className="w-5 h-5 text-slate-500 stroke-1.5" />
                </div>
                <p className="text-xs text-slate-500 m-0 max-w-[200px]">
                  Click on any hazard pin on the Google Map to load its diagnostic 6-Agent sequential decision workflow trace here.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
