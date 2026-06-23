import React, { useState, useEffect } from "react";
import { Sparkles, Zap, RotateCcw, Play } from "lucide-react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import ReportIssue from "./components/ReportIssue";
import CitizenDashboard from "./components/CitizenDashboard";
import AIAssistant from "./components/AIAssistant";
import DigitalTwin from "./components/DigitalTwin";
import Leaderboard from "./components/Leaderboard";
import AgentActivityCenter from "./components/AgentActivityCenter";
import ShowcasePage from "./components/ShowcasePage";
import GeoIntelligenceCenter from "./components/GeoIntelligenceCenter";
import { IssueReport, CityHealthStats, CitizenNotification } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("digitaltwin");
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [stats, setStats] = useState<CityHealthStats>({
    healthScore: 92,
    activeIssues: 2,
    resolvedIssues: 1,
    averageResolutionHours: 18,
    publicSafetyIndex: 90,
    carbonImpactReductionKg: 570
  });

  const [heroPoints, setHeroPoints] = useState<number>(300);
  const [trustScore, setTrustScore] = useState<number>(75);
  const [currentUser] = useState<string>("Samantha Croft");
  const [notifications, setNotifications] = useState<CitizenNotification[]>([
    {
      id: "nt-01",
      issueId: "CIV-291",
      issueTitle: "Pothole on Oak Blvd",
      message: "Remediation team dispatched. Saw join cutters scheduled on site under Officer Lin.",
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      read: false,
      type: "routing"
    },
    {
      id: "nt-02",
      issueId: "CIV-104",
      issueTitle: "Broken Light Pole Castro St",
      message: "Tamper-proof covers locked. Electrical network isolation lifted.",
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      read: true,
      type: "resolved"
    }
  ]);

  const [demoState, setDemoState] = useState<"seeded" | "advanced" | "empty" | "fetching">("fetching");

  // Load municipal data from server in parallel with intelligent auto-seeding
  const loadMunicipalData = async (autoSeed = false) => {
    try {
      const reportsRes = await fetch("/api/reports");
      const reportsData = await reportsRes.json();
      
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();

      if (autoSeed && (reportsData.length === 0 || reportsData.length <= 3)) {
        await handleTriggerDemoSeed(true);
      } else {
        setIssues(reportsData);
        setStats(statsData);
        if (reportsData.length >= 7) {
          setHeroPoints(1750);
          setTrustScore(93);
          setDemoState("seeded");
        } else if (reportsData.length === 0) {
          setDemoState("empty");
          setHeroPoints(0);
          setTrustScore(50);
        } else {
          setDemoState("seeded");
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse municipal API, loading fallback mockup state lists.");
    }
  };

  const handleTriggerDemoSeed = async (silent = false) => {
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIssues(data.reports);
        setStats(data.stats);
        setHeroPoints(1750);
        setTrustScore(93);
        setDemoState("seeded");

        if (!silent) {
          setNotifications((prev) => [
            {
              id: `seed-notif-${Date.now()}-1`,
              issueId: "CIV-405",
              issueTitle: "Illegal Toxic Battery Disposal SOMA Exit",
              message: "Verification Agent authorized report; assigned Hazmat Specialist Clara Sterling. Score: 89/100.",
              timestamp: new Date().toISOString(),
              read: false,
              type: "prioritization"
            },
            {
              id: `seed-notif-${Date.now()}-2`,
              issueId: "CIV-506",
              issueTitle: "Gushing Water Main Pine St",
              message: "Critical Rupture! Water & Power isolates Zone 4 feeder. Road closure dispatched.",
              timestamp: new Date().toISOString(),
              read: false,
              type: "routing"
            },
            ...prev
          ]);
        }
      }
    } catch (err) {
      console.error("Demo seed error:", err);
    }
  };

  const handleFastForwardDemo = async () => {
    try {
      const res = await fetch("/api/demo/fast-forward", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIssues(data.reports);
        setStats(data.stats);
        setHeroPoints(2150);
        setTrustScore(99);
        setDemoState("advanced");

        setNotifications((prev) => [
          {
            id: `forward-notif-${Date.now()}-1`,
            issueId: "CIV-607",
            issueTitle: "Fractured Overhead Traffic Signal Hanger",
            message: "Resolution Completed! Forged steel hanger re-bolted and signages re-energized successfully.",
            timestamp: new Date().toISOString(),
            read: false,
            type: "resolved"
          },
          {
            id: `forward-notif-${Date.now()}-2`,
            issueId: "CIV-708",
            issueTitle: "Storm Debris Blockage Marina",
            message: "Boardwalk access cleared. Timber logs extracted and ADA ramp power-washed verified.",
            timestamp: new Date().toISOString(),
            read: false,
            type: "resolved"
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Demo fast-forward error:", err);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIssues([]);
        setStats({
          healthScore: 99,
          activeIssues: 0,
          resolvedIssues: 0,
          averageResolutionHours: 12,
          publicSafetyIndex: 100,
          carbonImpactReductionKg: 0
        });
        setHeroPoints(0);
        setTrustScore(50);
        setDemoState("empty");
        setNotifications([]);
      }
    } catch (err) {
      console.error("Demo reset error:", err);
    }
  };

  useEffect(() => {
    loadMunicipalData(true);
  }, []);

  // Sync general score mechanics and add notifications when a report is lodged
  const handleAddNewIssue = (newReport: IssueReport) => {
    // Add inside local state reactively
    setIssues((prev) => [newReport, ...prev]);

    // Boost score metrics
    setHeroPoints((prev) => prev + 100);
    setTrustScore((prev) => Math.min(100, prev + 5));

    // Append dynamic alert notices for each phase of multi-agent success!
    const steps: Array<"verification" | "prioritization" | "routing" | "resolution"> = [
      "verification", "prioritization", "routing", "resolution"
    ];
    const delayMap = [1000, 2500, 4000, 5500];
    
    const messages = [
      "Verification Agent authenticated report veracity against duplicate indices.",
      `Prioritization Agent calculated hazard impact index weight to ${newReport.agentTrace?.prioritization?.civicImpactScore || 65}/100.`,
      `Authority Routing Agent dispatched task pipeline to ${newReport.agentTrace?.routing?.department || "Dept of Infrastructure"}.`,
      "Resolution Agent completed construction blueprint checklists. Repairs scheduled."
    ];

    messages.forEach((msg, idx) => {
      setTimeout(() => {
        const notif: CitizenNotification = {
          id: `notif-${Date.now()}-${idx}`,
          issueId: newReport.id,
          issueTitle: newReport.title,
          message: msg,
          timestamp: new Date().toISOString(),
          read: false,
          type: steps[idx]
        };
        setNotifications((prev) => [notif, ...prev]);
        // Update stats
        fetch("/api/stats")
          .then((r) => r.json())
          .then((s) => setStats(s))
          .catch(() => {});
      }, delayMap[idx]);
    });

    // Navigate back to citizen dashboard to track trace triggers
    setCurrentPage("dashboard");
  };

  // Status progression callback (updates server and updates UI state)
  const handleUpdateStatus = async (
    id: string, 
    nextStatus: "Reported" | "Verified" | "Prioritized" | "Routing" | "Resolving" | "Resolved"
  ) => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        // update client
        setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status: nextStatus, updatedAt: new Date().toISOString() } : issue)));
        
        // If resolved, add notification & boost stats
        if (nextStatus === "Resolved") {
          const resolvedIssue = issues.find(i => i.id === id);
          if (resolvedIssue) {
            const notif: CitizenNotification = {
              id: `notif-resolved-${Date.now()}`,
              issueId: id,
              issueTitle: resolvedIssue.title,
              message: "Remediation verified! Structural damage resolved and safe ledger status recorded.",
              timestamp: new Date().toISOString(),
              read: false,
              type: "resolved"
            };
            setNotifications((prev) => [notif, ...prev]);
            setHeroPoints((prev) => prev + 150); // resolving bonus points
            setTrustScore((prev) => Math.min(100, prev + 8));
          }
        }

        // Fetch refreshed stats
        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verify/Reject Community Issue callback
  const handleVerifyIssue = async (id: string, action: "verify" | "reject", severityVote?: string, evidenceUrl?: string) => {
    try {
      const res = await fetch(`/api/reports/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, severityVote, evidenceUrl })
      });
      const data = await res.json();
      if (data.success && data.issue) {
        // update client list
        setIssues((prev) => prev.map((issue) => (issue.id === id ? data.issue : issue)));
        
        // Fetch refreshed stats
        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        setStats(statsData);

        // Add verification reward points and dynamic notification
        if (action === "verify") {
          setHeroPoints((prev) => prev + 25); // verify reward
          setTrustScore((prev) => Math.min(100, prev + 1));
        } else {
          setHeroPoints((prev) => prev + 10); // contribution reward
        }
      }
    } catch (err) {
      console.error("Failed to verify issue:", err);
    }
  };

  // Delete issue callback
  const handleDeleteIssue = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setIssues((prev) => prev.filter((i) => i.id !== id));
        
        // Fetch refreshed stats
        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unresolvedEmergencies = issues.filter(
    issue => issue.status !== "Resolved" && issue.agentTrace?.emergencyEscalation?.isEscalated === true
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#070b13] text-slate-100">
      
      {/* Navigation Layout Header */}
      <Header 
        stats={stats}
        heroPoints={heroPoints}
        trustScore={trustScore}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
      />

      {/* Emergency Escalation Banner System */}
      {unresolvedEmergencies.length > 0 && (
        <div id="emergency-esc-banner" className="bg-red-950/90 backdrop-blur-md border-y border-red-500/40 text-red-200 py-3.5 px-4 relative overflow-hidden transition-all duration-500 shadow-[0_4px_25px_rgba(239,68,68,0.25),inset_0_0_20px_rgba(239,68,68,0.22)] z-45">
          <div className="absolute inset-0 bg-red-500/[0.04] animate-pulse pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-400 to-transparent animate-shimmer"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-red-500/25 text-red-400 px-2.5 py-0.5 rounded border border-red-500/40">
                  EMERGENCY AGENT ESCALATED
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {unresolvedEmergencies[0].agentTrace?.emergencyEscalation?.bannerMessage || "Severe public hazard intercepted!"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 md:mt-0">
              <span className="text-[10px] font-mono text-slate-300 bg-slate-900/80 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                📍 {unresolvedEmergencies[0].location.address}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                🚑 Dispatched: {unresolvedEmergencies[0].agentTrace?.emergencyEscalation?.authorityNotified}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* JUDGES LIVE SANDBOX CONTROLLER PANEL */}
      <div className="border-b border-indigo-500/10 bg-indigo-950/20 px-4 py-3 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.25)] relative z-40">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse text-indigo-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider font-display text-[11px]">Judges Live Sandbox Controller</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono leading-none bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-extrabold gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                  Active Sandbox Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Experience CivicOS instantly. Prepopulate the system with 7 realistic hazard reports, 6-agent decision pipelines, risk predictions, and dynamic leaderboard rankings without manual data entry.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status indicator badge */}
            <div className="px-3 py-1.5 rounded-xl border border-slate-850 bg-slate-950/60 font-mono text-[9px] text-slate-400 flex items-center gap-2">
              <span className="text-slate-500 font-medium">Registry Status:</span>
              {demoState === "seeded" && (
                <span className="text-emerald-400 font-bold uppercase tracking-wider">● 7 Active Hazard Nodes</span>
              )}
              {demoState === "advanced" && (
                <span className="text-indigo-400 font-bold uppercase tracking-wide">● Remediations Fast-Forwarded</span>
              )}
              {demoState === "empty" && (
                <span className="text-zinc-500 font-bold uppercase tracking-wide">● Clean Slate</span>
              )}
              {demoState === "fetching" && (
                <span className="text-amber-500 font-bold uppercase tracking-wide animate-pulse">● Connecting...</span>
              )}
            </div>

            <button 
              onClick={() => handleTriggerDemoSeed(false)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 border ${
                demoState === "seeded"
                  ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/40"
                  : "bg-indigo-600 border-indigo-500 hover:border-indigo-400 text-white shadow-[0_0_12px_rgba(79,70,229,0.3)] hover:bg-indigo-500"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prepopulate 7-Hazards</span>
            </button>

            <button 
              onClick={handleFastForwardDemo}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 border ${
                demoState === "advanced"
                  ? "bg-slate-950/40 border-slate-900 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-605/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300"
              }`}
              disabled={demoState === "advanced"}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fast-Forward Stages</span>
            </button>

            <button 
              onClick={handleResetDemo}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 border ${
                demoState === "empty"
                  ? "bg-slate-950/40 border-slate-900 text-slate-500 cursor-not-allowed"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
              }`}
              disabled={demoState === "empty"}
              title="Reset all reported issues to test manual workflows from scratch."
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Slate</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Page View Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        {currentPage === "landing" && (
          <LandingPage 
            stats={stats}
            onNavigateToReport={() => setCurrentPage("report")}
            onNavigateToAssistant={() => setCurrentPage("assistant")}
          />
        )}
        
        {currentPage === "report" && (
          <ReportIssue 
            onIssueCreated={handleAddNewIssue}
            currentUser={currentUser}
          />
        )}

        {currentPage === "dashboard" && (
          <CitizenDashboard 
            issues={issues}
            onUpdateStatus={handleUpdateStatus}
            onVerifyIssue={handleVerifyIssue}
            onDeleteReport={handleDeleteIssue}
            currentUser={currentUser}
          />
        )}

        {currentPage === "assistant" && (
          <AIAssistant 
            currentUser={currentUser}
          />
        )}

        {currentPage === "geo" && (
          <GeoIntelligenceCenter 
            issues={issues}
            setCurrentPage={setCurrentPage}
            onVerifyIssue={handleVerifyIssue}
          />
        )}

        {currentPage === "digitaltwin" && (
          <DigitalTwin 
            issues={issues}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === "leaderboard" && (
          <Leaderboard 
            heroPoints={heroPoints}
            trustScore={trustScore}
            currentUser={currentUser}
          />
        )}

        {currentPage === "agentcenter" && (
          <AgentActivityCenter 
            issues={issues}
            onAddNewIssue={handleAddNewIssue}
            currentUser={currentUser}
          />
        )}

        {currentPage === "showcase" && (
          <ShowcasePage 
            onBackToOverview={() => setCurrentPage("landing")}
          />
        )}
      </main>

      {/* Footer System coordinates */}
      <footer className="border-t border-white/5 py-6 bg-slate-950/40 text-center shrink-0">
        <div className="mx-auto max-w-7xl px-4 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CivicOS • Autonomous Multi-Agent Civic Ledger Node</span>
          <span>Security Protocol Active • SHA-256 Ledger Locked</span>
        </div>
      </footer>

    </div>
  );
}
