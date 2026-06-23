import React from "react";
import { 
  ShieldAlert, 
  UserCheck, 
  BrainCircuit, 
  Network, 
  Hammer, 
  LineChart, 
  ArrowRight, 
  Sparkles,
  Zap,
  Activity,
  Award
} from "lucide-react";
import { motion } from "motion/react";
import { CityHealthStats } from "../types";

interface LandingPageProps {
  stats: CityHealthStats;
  onNavigateToReport: () => void;
  onNavigateToAssistant: () => void;
}

export default function LandingPage({ stats, onNavigateToReport, onNavigateToAssistant }: LandingPageProps) {
  
  // The 6 CivicOS autonomous agents
  const agents = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-emerald-400" />,
      title: "1. Detection Agent",
      role: "Image & Core Hazard Analyzer",
      desc: "Uses Gemini Vision to read uploaded photos, categorize structural hazards, parse material degradation indexes, and estimate aggregate severity in real-time."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-teal-400" />,
      title: "2. Verification Agent",
      role: "Duplicate Auditer & Authenticator",
      desc: "Auto-scans geo-locations and past logs to block duplicate reports. Scores authenticity and filters potential spam with advanced consistency calculations."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
      title: "3. Prioritization Agent",
      role: "Impact & Risk Formulator",
      desc: "Assigns a dynamic Civic Impact Score (1-100) by combining hazard danger metrics with local pedestrian density data to classify levels as Low, Medium, High, or Critical."
    },
    {
      icon: <Network className="w-6 h-6 text-purple-400" />,
      title: "4. Authority Routing Agent",
      role: "Municipal Dispatch Dispatcher",
      desc: "Automatically triggers dispatch handshaking, formats structural logs, assigns specialists, and maps tasks to corresponding departments for instant remediation."
    },
    {
      icon: <Hammer className="w-6 h-6 text-blue-400" />,
      title: "5. Resolution Agent",
      role: "Repair Architect & Cost Estimator",
      desc: "Autonomously drafts deep, step-by-step physical engineering blueprints, estimates material costs in USD, and timetables aggregate personnel hours needed."
    },
    {
      icon: <LineChart className="w-6 h-6 text-indigo-400" />,
      title: "6. Prediction Agent",
      role: "Regional Twin Analyst",
      desc: "Projects geographic risk multipliers if left unmitigated. Correlates localized infrastructure data to warn communities and suggest micro-policies."
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Header SECTION - Restyled as a gorgeous large bento grid hero banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 px-6 py-12 text-center sm:px-12 md:py-16 lg:px-16 shadow-xl" id="hero-landing">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)] opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

        <div className="mx-auto max-w-3xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-mono font-medium text-indigo-300 mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Civic Intelligence Ledger</span>
          </motion.div>
 
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Empower Your Community with <span className="text-indigo-400 font-extrabold">Multi-Agent AI</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans"
          >
            CivicOS utilizes six autonomous specialized agents coordinating to analyze, verify, prioritize, route, resolve, and predict city hazards. Report community issues and watch AI and humans collaborate in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onNavigateToReport}
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all cursor-pointer"
              id="cta-report"
            >
              <span>Submit Hazard Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToAssistant}
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-950/60 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-900/80 hover:text-white transition-all cursor-pointer"
              id="cta-assistant"
            >
              <span>Consult Assistant Node</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Live System Stats CARDS - Styled as fine Bento grid tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="civic-health-dashboard">
        {[
          {
            label: "Municipal Health Index",
            value: `${stats.healthScore}/100`,
            detail: "Live tracking of infrastructure decay",
            icon: <Activity className="w-4 h-4 text-emerald-400" />
          },
          {
            label: "Active Tracked Tasks",
            value: stats.activeIssues,
            detail: "Unresolved civic hazard tickets",
            icon: <ShieldAlert className="w-4 h-4 text-rose-400" />
          },
          {
            label: "Aggregate Resolved",
            value: stats.resolvedIssues,
            detail: "Successfully remediated reports",
            icon: <Zap className="w-4 h-4 text-amber-400" />
          },
          {
            label: "Toxicity Block Reduction",
            value: `${stats.carbonImpactReductionKg} kg`,
            detail: "Carbon emissions saved from rerouting",
            icon: <Award className="w-4 h-4 text-indigo-400" />
          }
        ].map((item, i) => (
          <div key={i} className="rounded-3xl bg-slate-900/50 border border-slate-800 p-5 flex flex-col justify-between hover:bg-slate-900/85 transition-all duration-200">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider column-label">{item.label}</span>
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                {item.icon}
              </div>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">{item.value}</p>
              <p className="text-[10px] font-mono text-slate-500 m-0 mt-2">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 6-agent Framework Segment */}
      <section className="space-y-6" id="agent-orchestration">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight">Consolidated Collaborative Agent Network</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Watch how our six specialized AI modules chain output structures in sequence to coordinate the entire civic maintenance pipeline.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">6 Active Nodes Registered</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between hover:border-slate-705 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {agent.icon}
                  </div>
                  <span className="text-[9px] font-mono tracking-wider bg-slate-950 text-indigo-400 border border-slate-800 px-2.5 py-0.5 rounded-full uppercase">
                    Agent Model
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-medium text-xs text-slate-300">{agent.title}</h4>
                  <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-tight m-0">{agent.role}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed m-0">{agent.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hero points / Game mechanics */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8" id="rewards-info">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-display text-lg font-bold text-slate-200 tracking-tight">Become a Digital Twin Hero</h3>
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              Submitting verified structural defects boosts your personalized **Trust Score** and rewards you with **Hero Points**. Claim civic awards, compete on the local district leaderboard, and directly trigger local budget prioritizations.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-6 shrink-0 bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
            <div className="text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Report Verified</span>
              <span className="text-base font-display font-bold text-emerald-400 mt-1 block">+100 pts</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Trust Multiplier</span>
              <span className="text-base font-display font-bold text-indigo-300 mt-1 block">0.05 rise</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-bold">District Rank</span>
              <span className="text-base font-display font-bold text-amber-400 mt-1 block">Level milestone</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
