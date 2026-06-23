import React, { useState } from "react";
import { Shield, Sparkles, Heart, Bell, User, Flame, Activity } from "lucide-react";
import { CityHealthStats, CitizenNotification } from "../types";

interface HeaderProps {
  stats: CityHealthStats;
  heroPoints: number;
  trustScore: number;
  notifications: CitizenNotification[];
  onMarkNotificationsRead: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: string;
}

export default function Header({
  stats,
  heroPoints,
  trustScore,
  notifications,
  onMarkNotificationsRead,
  currentPage,
  setCurrentPage,
  currentUser,
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "verification":
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case "prioritization":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "routing":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 border-b border-slate-900 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl bg-slate-900/50 border border-slate-800/80 rounded-2xl px-6 py-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentPage("landing")} 
          className="flex cursor-pointer items-center justify-between md:justify-start gap-4 group"
          id="logo-brand"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              C
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white m-0">
                Civic<span className="text-indigo-400">OS</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 m-0 uppercase mt-0.5">Autonomous Control Node</p>
            </div>
          </div>
          
          <div className="hidden sm:flex ml-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-mono font-medium text-indigo-300 uppercase tracking-wider">AI Collective Active</span>
          </div>
        </div>

        {/* Global Municipal Indicators - Clean Bento styled stat clusters */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 md:gap-8">
          
          <div className="flex flex-row items-center gap-6">
            <div className="flex flex-col items-start md:items-end leading-tight">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">City Health Score</span>
              <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">{stats.healthScore}</span>
            </div>
            
            <div className="w-[1px] h-8 bg-slate-800"></div>

            <div className="flex flex-col items-start md:items-end leading-tight">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Trust Score</span>
              <span className="text-base sm:text-lg font-mono font-bold text-amber-400">{(trustScore / 100).toFixed(2)}</span>
            </div>

            <div className="w-[1px] h-8 bg-slate-800"></div>

            <div className="flex flex-col items-start md:items-end leading-tight">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Hero Points</span>
              <span className="text-base sm:text-lg font-mono font-bold text-indigo-400">{heroPoints}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-800 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-start">
            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="relative rounded-xl border border-slate-800 bg-slate-950/45 p-2 text-slate-300 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
                id="notif-bell"
              >
                <Bell className="h-4.5 w-4.5 text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <h3 className="font-display font-semibold text-xs text-slate-200">Municipal Agency Trace</h3>
                    <span className="text-[9px] font-mono text-indigo-400 uppercase">Live Operations</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No recent agency responses reported.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            notif.read ? "bg-slate-900/40 border-slate-800/60" : "bg-indigo-500/5 border-indigo-500/20"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1">
                            {getNotifIcon(notif.type)}
                            <span className="font-semibold text-slate-300 truncate">{notif.issueTitle}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed m-0">{notif.message}</p>
                          <p className="text-[9px] font-mono text-slate-500 m-0 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Citizen Account Chip */}
            <div className="flex items-center space-x-2.5 rounded-xl border border-slate-800 bg-slate-950/45 p-1 px-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 font-mono font-bold text-white text-xs">
                {currentUser.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-medium text-slate-200 m-0 leading-none truncate max-w-[90px]">{currentUser}</p>
                <p className="text-[9px] font-mono text-slate-500 m-0 mt-0.5">Municipal Operative</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub Nav Bar */}
      <div className="mx-auto max-w-7xl mt-3 overflow-x-auto scrollbar-thin">
        <div className="flex items-center space-x-2 py-1 text-xs">
          {[
            { id: "geo", label: "Geo Intelligence Center 🗺️" },
            { id: "digitaltwin", label: "Interactive Digital Twin 🌐" },
            { id: "landing", label: "About CivicOS" },
            { id: "dashboard", label: "Registry Docket" },
            { id: "report", label: "Report Hazard" },
            { id: "agentcenter", label: "Agent Activity Center" },
            { id: "showcase", label: "Google AI Showcase" },
            { id: "assistant", label: "Orchestrator Assistant" },
            { id: "leaderboard", label: "Municipal Leaderboard" },
          ].map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium font-display tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent"
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
