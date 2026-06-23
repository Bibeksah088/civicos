import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot, ArrowRight, Activity, ShieldAlert } from "lucide-react";
import { ChatMessage } from "../types";

interface AIAssistantProps {
  currentUser: string;
}

export default function AIAssistant({ currentUser }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: `Hello, ${currentUser || "citizen"}! I am the CivicOS Autonomous Municipal AI Assistant. 

I coordinate directly with our dedicated network of seven agents:
• **Detection Agent** (Agent 1)
• **Emergency Escalation Agent** (Agent 1.5)
• **Verification Agent** (Agent 2)
• **Prioritization & Impact Agent** (Agent 3)
• **Authority Routing Agent** (Agent 4)
• **Resolution Planner Agent** (Agent 5)
• **Risk Prediction Agent** (Agent 6)

Ask me anything about our active hazards, how to earn **Hero Points** to boost your municipal **Trust Score**, or request real-time status analysis of our smart city!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions
  const PROMPT_SUGGESTIONS = [
    "What reports are currently active?",
    "Explain how the 6-agent pipeline works",
    "How can I boost my Trust Score?",
    "Give me an active city health summary"
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsGenerating(true);

    try {
      const activeHistory = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: activeHistory })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: "assistant",
          text: data.text || "Apologies, I encountered a connection delay with our primary central municipal coordination node.",
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          sender: "assistant",
          text: "System response blocked. Please verify your municipal Express server connectivity.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col border border-slate-800 rounded-3xl bg-slate-950/60 overflow-hidden bento-card shadow-xl" id="chat-assistant-panel">
      
      {/* Top chat status bar */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-indigo-500/10 border border-indigo-505/20 rounded-xl flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100 m-0">Civic Coordination Operator</h3>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 mt-0.5 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Operator Connected • Core secure twin sync</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">Gemini Active Operator</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/20 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div 
              key={m.id} 
              className={`flex items-start gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div 
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                  isUser 
                    ? "bg-indigo-600/10 border-indigo-500/25 text-slate-100 rounded-tr-none" 
                    : "bg-slate-900/60 border-slate-800 text-slate-300 rounded-tl-none"
                }`}
              >
                <div className="m-0 whitespace-pre-wrap">{m.text}</div>
                <span className="block text-[10px] font-mono text-slate-500 mt-2 text-right leading-none">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Generate pulse placeholder */}
        {isGenerating && (
          <div className="flex items-start gap-4 animate-fade-in">
            <div className="h-8 w-8 rounded-xl bg-slate-950 border border-slate-805 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-450 animate-pulse">Orchestrator formulating responses...</span>
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion prompt tags container */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap gap-2 shrink-0">
        <span className="text-[9px] font-mono text-slate-500 flex items-center uppercase tracking-wider mr-1 select-none font-bold">
          Suggestions:
        </span>
        {PROMPT_SUGGESTIONS.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(tag)}
            className="text-[11px] font-mono text-indigo-450 hover:text-white bg-indigo-500/5 hover:bg-indigo-600/10 border border-indigo-505/10 hover:border-indigo-500/30 rounded-xl px-3 py-1.5 text-left transition-all max-w-xs truncate cursor-pointer whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Input controls box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3 shrink-0">
        <input 
          type="text" 
          placeholder="Consult central city operations database..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(inputText);
            }
          }}
          disabled={isGenerating}
          className="flex-1 text-xs sm:text-sm bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-slate-150 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-sans"
          id="assistant-input-box"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isGenerating}
          className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl p-3 shadow-lg hover:shadow-indigo-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          id="send-assistant-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
