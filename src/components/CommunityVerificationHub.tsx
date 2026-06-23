import React, { useState } from "react";
import { 
  CheckCircle, 
  XOctagon, 
  ThumbsUp, 
  ThumbsDown, 
  Upload, 
  Check, 
  HelpCircle, 
  Image as ImageIcon,
  Loader2,
  Lock,
  Heart
} from "lucide-react";
import { IssueReport, CommunityVerification } from "../types";

interface CommunityVerificationHubProps {
  issue: IssueReport;
  onVerify: (id: string, action: "verify" | "reject", severityVote?: string, evidenceUrl?: string) => void;
}

const PRESET_EVIDENCE_PHOTOS = [
  { name: "Damaged Surface", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80" },
  { name: "Clogged Drain Outlet", url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=80" },
  { name: "Safety Barrier Tape", url: "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=500&q=80" },
  { name: "General Debris Field", url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=500&q=80" }
];

export default function CommunityVerificationHub({ issue, onVerify }: CommunityVerificationHubProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const verification: CommunityVerification = issue.communityVerification || {
    verificationsCount: 0,
    rejectionsCount: 0,
    evidenceUrls: [],
    severityVotes: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    trustScore: 75,
    confidenceScore: 50
  };

  const handleActionClick = (action: "verify" | "reject") => {
    onVerify(issue.id, action);
    setHasVoted(true);
    setFeedbackMsg(action === "verify" ? "✓ Report confirmation lock queued to ledger." : "✗ Rejection registered in peer validator list.");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSeverityVote = (severity: "Low" | "Medium" | "High" | "Critical") => {
    onVerify(issue.id, "verify", severity);
    setFeedbackMsg(`✓ Registered ${severity} severity vote on ledger.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleEvidenceUploadSimulate = (evidenceUrl: string) => {
    setIsUploading(true);
    setTimeout(() => {
      onVerify(issue.id, "verify", undefined, evidenceUrl);
      setIsUploading(false);
      setFeedbackMsg("📸 Evidence file compiled into peer audit trail.");
      setTimeout(() => setFeedbackMsg(null), 3500);
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simulate reading dropped file, use a random preset photo
      const randPhoto = PRESET_EVIDENCE_PHOTOS[Math.floor(Math.random() * PRESET_EVIDENCE_PHOTOS.length)].url;
      handleEvidenceUploadSimulate(randPhoto);
    }
  };

  const totalVotes = verification.verificationsCount + verification.rejectionsCount;

  return (
    <div 
      className="rounded-2xl border border-[#1e293b] bg-[#0b1329]/50 overflow-hidden"
      id={`community-verification-hub-${issue.id}`}
    >
      {/* Banner Indicator */}
      <div className="bg-[#1e293b]/30 px-4 py-2.5 border-b border-[#1e293b] flex items-center justify-between text-xs text-slate-350">
        <div className="flex items-center space-x-2">
          <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span className="font-semibold text-[11px] uppercase tracking-wider font-display text-slate-100">
            Citizen Validation & Verification Hub
          </span>
        </div>
        <span className="font-mono text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-tight">
          Trust Profile: {verification.trustScore}%
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Dynamic Metric Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Verification Confidence
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-display font-extrabold text-teal-400">
                {verification.confidenceScore}%
              </span>
              <span className="text-[10px] text-slate-500">of community</span>
            </div>
            {/* mini progress bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${verification.confidenceScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Community Confirmations
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-display font-extrabold text-indigo-400">
                {verification.verificationsCount}
              </span>
              <span className="text-[10px] text-slate-500">confirmations</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Minimum required: 2 for verified status
            </span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Audit Contestation
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-display font-extrabold text-slate-350">
                {verification.rejectionsCount}
              </span>
              <span className="text-[10px] text-slate-500">rejections</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">
              {totalVotes === 0 ? "No validations logged" : `${totalVotes} total validations cast`}
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="border-t border-slate-900 pt-4 grid grid-cols-1 md:grid-cols-2 gap-5 leading-normal">
          {/* Main verification vote block */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              1. Validate of Physical Hazard
            </span>
            <p className="text-xs text-slate-450 m-0">
              Are you currently near this coordinates and can verify its presence or confirm repair completion?
            </p>
            <div className="flex items-center space-x-3.5">
              <button
                onClick={() => handleActionClick("verify")}
                className="flex-1 py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 border border-teal-500/25 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Confirm Hazard</span>
              </button>
              <button
                onClick={() => handleActionClick("reject")}
                className="flex-1 py-2 px-3 bg-slate-800/40 hover:bg-slate-800/80 text-slate-350 hover:text-white border border-slate-700/50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Reject / Finished</span>
              </button>
            </div>

            {/* Severity voting subgroup */}
            <div className="space-y-2 pt-2 border-t border-slate-900/50">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block font-semibold">
                Vote severity weight
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {(["Low", "Medium", "High", "Critical"] as const).map((sev) => {
                  const voteCount = verification.severityVotes[sev] || 0;
                  return (
                    <button
                      key={sev}
                      onClick={() => handleSeverityVote(sev)}
                      className="py-1.5 px-1 bg-slate-950/50 hover:bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-850 rounded-lg text-[10px] font-semibold transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                      <span className="block text-[8px] font-mono text-slate-500 mb-0.5">{sev}</span>
                      <span className="font-bold text-slate-300">{voteCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Supporting Evidence uploading simulated block */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              2. Upload Supporting Evidence
            </span>
            <p className="text-xs text-slate-450 m-0">
              Drag images here or select below to submit diagnostic screenshots of active conditions.
            </p>

            {/* Drag and Drop Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-indigo-400 bg-indigo-500/5" 
                  : isUploading 
                    ? "border-slate-800 bg-slate-950/10 cursor-not-allowed" 
                    : "border-slate-800 hover:border-slate-705 bg-slate-900/10 hover:bg-slate-900/20"
              }`}
            >
              {isUploading ? (
                <div className="space-y-2 flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  <span className="text-[11px] font-mono text-indigo-300">Broadcasting evidence hash...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 text-slate-500 mx-auto" />
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Drag and drop file here
                  </span>
                  <span className="text-[9px] text-slate-550 block">PNG, JPG up to 10MB</span>
                </div>
              )}
            </div>

            {/* Quick pre-select preset files */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-wider block">
                Quick snap (illustration simulations)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_EVIDENCE_PHOTOS.map((pres, i) => (
                  <button
                    key={i}
                    onClick={() => handleEvidenceUploadSimulate(pres.url)}
                    className="p-1 border border-slate-850 hover:border-indigo-500/30 bg-slate-950/40 rounded-lg text-[9px] text-slate-450 hover:text-indigo-450 transition-all font-mono text-center truncate cursor-pointer uppercase"
                    title={pres.name}
                  >
                    {pres.name.replace(" ", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic validation log/re-calculations feed */}
        {feedbackMsg && (
          <div className="bg-teal-500/10 border border-teal-500/20 px-3.5 py-2.5 rounded-xl text-xs font-mono text-teal-300 animate-fade-in flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <span className="text-[10px] text-slate-500 font-sans">Synced with Prioritization Agent</span>
          </div>
        )}

        {/* Existing uploaded supporting evidence grid */}
        {verification.evidenceUrls && verification.evidenceUrls.length > 0 && (
          <div className="pt-3 border-t border-slate-900 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block font-semibold flex items-center space-x-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Evidence Ledger Attachments ({verification.evidenceUrls.length})</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              {verification.evidenceUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="relative group block rounded-lg overflow-hidden border border-slate-800 bg-slate-950/50"
                >
                  <img 
                    src={url} 
                    alt={`Evidence ${i}`} 
                    className="w-12 h-12 object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
