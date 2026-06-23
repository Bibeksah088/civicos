import React from "react";
import { Award, Trophy, Star, ShieldAlert, Sparkles, User, Shield, CheckCircle } from "lucide-react";
import { LeaderboardUser } from "../types";

interface LeaderboardProps {
  heroPoints: number;
  trustScore: number;
  currentUser: string;
}

export default function Leaderboard({ heroPoints, trustScore, currentUser }: LeaderboardProps) {
  
  // Seed leader board data containing fun local heroes
  const leaders: LeaderboardUser[] = [
    {
      rank: 1,
      name: "Arthur Pendelton",
      points: 2450,
      reportsSubmitted: 21,
      reportsResolved: 18,
      trustScore: 99,
      badges: ["Infrastructure Sage", "Drainage Master", "Transit Safe-guard"],
      avatarUrl: "AP"
    },
    {
      rank: 2,
      name: "Marcus Vance",
      points: 1800,
      reportsSubmitted: 14,
      reportsResolved: 11,
      trustScore: 95,
      badges: ["Pothole Slayer", "Civil Inspector"],
      avatarUrl: "MV"
    },
    {
      rank: 3,
      name: "Sienna Miller",
      points: 1450,
      reportsSubmitted: 10,
      reportsResolved: 9,
      trustScore: 92,
      badges: ["Sanitation Warden", "Neighborhood Watch"],
      avatarUrl: "SM"
    },
    {
      rank: 4,
      name: currentUser || "Anonymous Citizen",
      points: heroPoints,
      reportsSubmitted: heroPoints > 0 ? Math.ceil(heroPoints / 100) : 0,
      reportsResolved: heroPoints > 200 ? 1 : 0,
      trustScore: trustScore,
      badges: heroPoints >= 200 ? ["Apprentice Remediat", "First Responder"] : ["Novice Reporter"],
      avatarUrl: currentUser.substring(0, 2).toUpperCase(),
      isCurrentUser: true
    },
    {
      rank: 5,
      name: "David Cole",
      points: 800,
      reportsSubmitted: 6,
      reportsResolved: 5,
      trustScore: 88,
      badges: ["Grid Scribe"],
      avatarUrl: "DC"
    }
  ];

  // Sort leaders dynamically by points
  const sortedLeaders = [...leaders].sort((a, b) => b.points - a.points);
  
  // Assign updated rank
  sortedLeaders.forEach((leader, idx) => {
    leader.rank = idx + 1;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="community-leaderboard">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100 italic tracking-tight">Municipal Hero Lead Board</h2>
          <p className="text-xs text-slate-400 mt-1">
            Compete on the town leaderboard. Verified reports and accurate diagnostics elevate your rank and build trust metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-xs font-mono text-indigo-400 font-bold">
          <Trophy className="w-4 h-4 text-indigo-400" />
          <span>Active Season: Cycle 03</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Leader Table */}
        <div className="md:col-span-8 rounded-3xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6 shadow-2xl bento-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Top District Remediaters</span>
            <span className="text-[9px] font-mono text-slate-500 font-semibold">Updated Real-Time</span>
          </div>

          <div className="space-y-3">
            {sortedLeaders.map((user) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;
              const isMe = user.isCurrentUser;

              return (
                <div 
                  key={user.name}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isMe 
                      ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.02)]" 
                      : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    {/* Rank signifier */}
                    <div className="shrink-0 flex items-center justify-center w-6 text-center">
                      {isFirst ? (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      ) : isSecond ? (
                        <Trophy className="w-5 h-5 text-slate-400" />
                      ) : isThird ? (
                        <Trophy className="w-5 h-5 text-amber-500" />
                      ) : (
                        <span className="font-mono font-bold text-slate-500 text-xs">{user.rank}</span>
                      )}
                    </div>

                    {/* Badge Avatar */}
                    <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono font-bold text-slate-300">
                      {user.avatarUrl}
                    </div>

                    {/* Identifiers */}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate m-0">
                        {user.name} {isMe && <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full ml-1.5 uppercase tracking-wide">YOU</span>}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {user.badges.slice(0, 2).map((badge, idx) => (
                          <span key={idx} className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="flex items-center space-x-8 text-right shrink-0">
                    <div className="hidden sm:block">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Reports Filed</span>
                      <span className="text-xs font-semibold text-slate-300 leading-none">{user.reportsSubmitted} subm / {user.reportsResolved} res</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Trust Score</span>
                      <span className="text-xs font-mono font-bold text-indigo-400 leading-none">{user.trustScore}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Points</span>
                      <span className="text-xs font-display font-extrabold text-indigo-400 leading-none">{user.points} pts</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Current user progression details on Right */}
        <div className="md:col-span-4 space-y-6">
          
          {/* User Progress overview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 space-y-4 bento-card">
            <div className="border-b border-slate-800 pb-2.5">
              <h3 className="font-display font-bold text-sm text-slate-200">Your Badge Wallet</h3>
              <p className="text-[9px] font-mono text-slate-450 m-0 uppercase font-bold tracking-wide">Verify issues to unlock milestones</p>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-350">
                <span>Account Tier:</span>
                <span className="font-semibold text-indigo-400 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                  <span>District Patrol</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Active Rank:</span>
                <span className="font-semibold text-slate-200">Tier 4 (of 50)</span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Next Milestone:</span>
                <span className="font-semibold text-slate-400">1000 pts (+{1000 - heroPoints} needed)</span>
              </div>
            </div>

            {/* Custom progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Milestone Progress</span>
                <span>{heroPoints}/1000 Pts</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (heroPoints / 1000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gamified Achievements locks */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 space-y-3.5 bento-card">
            <h3 className="font-display font-bold text-sm text-slate-200">Season Trophies</h3>
            
            <div className="space-y-3">
              {[
                { title: "First Responder Badge", desc: "Report 1 validated local hazard report", unlocked: heroPoints > 0 },
                { title: "Sanitation Sentinel", desc: "Successfully resolve 3 garbage accumulation tickets", unlocked: false },
                { title: "Structural Sage", desc: "Attain 90% trust score credentials", unlocked: trustScore >= 90 }
              ].map((achievement, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border flex items-start space-x-2.5 transition-all ${
                  achievement.unlocked ? "border-emerald-500/20 bg-emerald-500/5 text-slate-300" : "border-slate-900 bg-slate-950/10 text-slate-500"
                }`}>
                  <div className={`mt-0.5 ${achievement.unlocked ? "text-emerald-400 animate-pulse" : "text-slate-700"}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <h4 className={`font-bold m-0 ${achievement.unlocked ? "text-slate-200" : "text-slate-500"}`}>{achievement.title}</h4>
                    <p className="text-[10px] m-0 leading-tight mt-0.5 text-slate-500">{achievement.desc}</p>
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
