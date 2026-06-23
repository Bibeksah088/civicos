import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Hammer, 
  BadgeAlert, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  User, 
  Eye, 
  Flame, 
  AlertTriangle,
  FileSpreadsheet,
  Activity
} from "lucide-react";
import { IssueReport } from "../types";
import CommunityVerificationHub from "./CommunityVerificationHub";

interface CitizenDashboardProps {
  issues: IssueReport[];
  onUpdateStatus: (id: string, nextStatus: "Reported" | "Verified" | "Prioritized" | "Routing" | "Resolving" | "Resolved") => void;
  onVerifyIssue: (id: string, action: "verify" | "reject", severityVote?: string, evidenceUrl?: string) => void;
  onDeleteReport: (id: string) => void;
  currentUser: string;
}

export default function CitizenDashboard({ issues, onUpdateStatus, onVerifyIssue, onDeleteReport, currentUser }: CitizenDashboardProps) {
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  // Status mapping
  const statusConfig = {
    Reported: { color: "bg-slate-500/20 text-slate-400 border-slate-500/30", label: "Reported Feed" },
    Verified: { color: "bg-teal-500/25 text-teal-400 border-teal-500/30", label: "Awaiting Prioritization" },
    Prioritized: { color: "bg-orange-500/25 text-orange-400 border-orange-500/30", label: "Impact Formulating" },
    Routing: { color: "bg-purple-500/25 text-purple-400 border-purple-500/30", label: "Authority Routing" },
    Resolving: { color: "bg-blue-500/25 text-blue-400 border-blue-500/30", label: "Active Remediation" },
    Resolved: { color: "bg-emerald-500/25 text-emerald-400 border-emerald-500/30", label: "Fully Resolved" }
  };

  const getStatusDisplay = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || { color: "bg-slate-800 text-slate-400 border-transparent", label: status };
  };

  const toggleExpand = (id: string) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  // Helper to progress issue status
  const handleProgressStatus = (id: string, currentStatus: string) => {
    const statuses: Array<"Reported" | "Verified" | "Prioritized" | "Routing" | "Resolving" | "Resolved"> = [
      "Reported", "Verified", "Prioritized", "Routing", "Resolving", "Resolved"
    ];
    const currentIndex = statuses.indexOf(currentStatus as any);
    if (currentIndex !== -1 && currentIndex < statuses.length - 1) {
      onUpdateStatus(id, statuses[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="citizen-dashboard-container">
      
      {/* Dashboard Headline Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-100 tracking-tight">Municipal Hazard Lockers</h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor reported community issues, track multi-agent diagnostic traces, and progress repairs to resolution.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-450">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Total: {issues.length} Issues</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved: {issues.filter(i => i.status === "Resolved").length}</span>
          </div>
        </div>
      </div>

      {/* Submitted issues list */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-12 text-center space-y-3">
            <p className="text-slate-405 text-sm m-0">No municipal hazard logs currently filed.</p>
            <p className="text-slate-500 text-xs m-0">Go to the "Report Hazard" page to spin up our autonomous agency nodes!</p>
          </div>
        ) : (
          issues.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;
            const trace = issue.agentTrace;
            const statusInfo = getStatusDisplay(issue.status);

            return (
              <div 
                key={issue.id} 
                className={`rounded-3xl border transition-all duration-250 ${
                  isExpanded ? "border-slate-705 bg-slate-900/60" : "border-slate-800 bg-slate-900/30 hover:border-slate-705 hover:bg-slate-900/40"
                }`}
                id={`issue-card-${issue.id}`}
              >
                
                {/* Collapsed top bar layout */}
                <div 
                  onClick={() => toggleExpand(issue.id)}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start space-x-4 min-w-0 flex-1">
                    {/* Compact Image or preview placeholder */}
                    <div className="shrink-0">
                      <img 
                        src={issue.imageUrl} 
                        alt={issue.title}
                        className="w-16 h-16 rounded-2xl border border-slate-800 object-cover bg-slate-950"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Information */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 text-indigo-450 px-2.5 py-0.5 rounded-full uppercase tracking-tight font-bold">
                          {issue.id}
                        </span>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase border ${statusInfo.color}`}>
                          {issue.status}
                        </span>
                        {trace?.prioritization?.priorityCategory === "Critical" && (
                          <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-0.5 font-bold">
                            <BadgeAlert className="w-3 h-3 text-rose-500" />
                            <span>CRITICAL RISK</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-sm sm:text-base text-slate-100 truncate m-0 max-w-sm sm:max-w-md">
                        {issue.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 leading-none">
                        <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span className="truncate text-slate-400">{issue.location.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / status controls */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-800 pt-3.5 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-mono text-slate-500 m-0 tracking-wider font-bold">REPORT DEPOSITED</p>
                      <p className="text-xs text-slate-450 m-0 font-medium">
                        {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {issue.status !== "Resolved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProgressStatus(issue.id, issue.status);
                          }}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-650 border border-indigo-500/20 rounded-xl text-xs font-mono font-medium text-indigo-400 hover:text-white transition-all flex items-center space-x-1 cursor-pointer"
                          title="Simulate municipal work progress"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Remediate</span>
                        </button>
                      )}
                      
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Trace views */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-800/80 pt-6 space-y-6 bg-slate-950/20" id="expanded-trace-details">
                    
                    {/* Narrative Description */}
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-1">
                      <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest block font-extrabold text-[9px]">Citizen's Original Narrative</span>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed m-0 whitespace-pre-wrap">{issue.description}</p>
                      <div className="flex items-center space-x-1.5 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-900 mt-2">
                        <User className="w-3.5 h-3.5 text-slate-600" />
                        <span>Submitted by: {issue.reporterName}</span>
                      </div>
                    </div>

                    {/* Community Verification Hub */}
                    <CommunityVerificationHub 
                      issue={issue}
                      onVerify={onVerifyIssue}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-medium text-xs tracking-wider text-slate-450 uppercase">
                          Autonomous Collaborative Agency outputs (Simultaneous Chain)
                        </h4>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">
                          Diagnostic Manifest
                        </span>
                      </div>

                      {/* Diagnostic Trace grid cards (6 Agents visual outputs) */}
                      {trace ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          {/* Card 1: Detection Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">1. Detection Agent</span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded uppercase font-semibold">Active Vision</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Detected Issue Type</span>
                                <span className="font-semibold text-slate-200">{trace.detection.issueType}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Severity Assessment</span>
                                <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                                  trace.detection.severity === "Critical" ? "bg-rose-500/10 text-rose-400" :
                                  trace.detection.severity === "High" ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                                }`}>{trace.detection.severity}</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed">
                                {trace.detection.notes}
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Verification Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">2. Verification Agent</span>
                              <span className="text-[9px] font-mono text-teal-400 bg-teal-500/5 px-2 py-0.5 rounded uppercase font-semibold">Consolidation</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Duplicate Overlay Check</span>
                                <span className="font-semibold text-slate-200">{trace.verification.isDuplicate ? "Duplicate Detected!" : "Unique Ticket Locked"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Confidence Matrix Weight</span>
                                <span className="font-semibold text-teal-400">{Math.round(trace.verification.confidenceScore * 100)}% Match</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed">
                                {trace.verification.crossReferenceNotes}
                              </div>
                            </div>
                          </div>

                          {/* Card 3: Prioritization Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">3. Prioritization Agent</span>
                              <span className="text-[9px] font-mono text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded uppercase font-semibold">Hazard Matrix</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Civic Impact Score</span>
                                <span className="font-display font-bold text-lg text-orange-400">{trace.prioritization.civicImpactScore}/100</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Residents Affected / Day</span>
                                <span className="font-semibold text-slate-200">{trace.prioritization.affectedPopulationEst} est</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {trace.prioritization.factors.slice(0, 3).map((f: string, i: number) => (
                                  <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Card 4: Routing Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">4. Routing Agent</span>
                              <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded uppercase font-bold text-purple-300">Dispatch Handshake</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Municipal Dept</span>
                                <span className="font-semibold text-slate-100">{trace.routing.department}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Assigned Supervisor</span>
                                <span className="font-semibold text-slate-300">{trace.routing.assignedOfficer}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Secure Comms Dispatch Channel</span>
                                <span className="font-mono text-[10px] text-purple-300">{trace.routing.contactChannel}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card 5: Resolution Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">5. Resolution Agent</span>
                              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded uppercase font-semibold">Restoration Draft</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-505 block uppercase">Est Cost (USD)</span>
                                  <span className="font-mono font-bold text-blue-400">${trace.resolution.estimatedCost}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-slate-505 block uppercase">Est Worktime</span>
                                  <span className="font-semibold text-slate-200">{trace.resolution.estimatedHours} hours</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase mb-1">Suggested Blueprint Roadmap</span>
                                <ul className="space-y-1 m-0 pl-4 list-decimal text-[11px] text-slate-400 leading-relaxed">
                                  {trace.resolution.suggestedPlan.slice(0, 3).map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Card 6: Prediction Agent */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 flex flex-col justify-between hover:border-slate-705 transition-all">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-[11px] font-display font-bold text-slate-200">6. Prediction Agent</span>
                              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded uppercase font-semibold">Predictive Twin</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Micro-climate trend cluster</span>
                                <span className="font-semibold text-slate-200">{trace.prediction.regionalTrendGroup}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-505 block uppercase">Risk Decay Multiplier if Ignored</span>
                                <span className="font-bold text-rose-400 text-xs">+{trace.prediction.riskIncreasePercent}% hazard increase</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-[11px] text-indigo-300 leading-relaxed">
                                <span className="font-semibold block text-[9px] font-mono text-indigo-400 uppercase tracking-wide">Preventative Strategy</span>
                                {trace.prediction.preventativeAction}
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-950 p-6 text-center text-xs text-slate-500 border border-slate-850 font-mono">
                          Trace variables not generated yet.
                        </div>
                      )}
                    </div>

                    {/* Maintenance Sandbox delete trigger */}
                    <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs flex-wrap gap-2 text-slate-500 font-mono">
                      <span>Ledger Cryptographic Verification Key Locked</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReport(issue.id);
                        }}
                        className="text-rose-500 hover:text-rose-400 hover:underline cursor-pointer bg-transparent border-none text-xs font-mono"
                      >
                        Delete Lock locks/report-{issue.id}
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
