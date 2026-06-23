export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
}

export interface DetectionAgentOutput {
  issueType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidenceScore: number;
  identifiedElements: string[];
  notes: string;
}

export interface VerificationAgentOutput {
  isDuplicate: boolean;
  duplicateReferenceId: string | null;
  verificationStatus: "Authentic" | "Unverified" | "Spam";
  confidenceScore: number;
  crossReferenceNotes: string;
}

export interface PrioritizationAgentOutput {
  civicImpactScore: number; // 0 - 100
  priorityCategory: "Low" | "Medium" | "High" | "Critical";
  factors: string[];
  affectedPopulationEst: number;
}

export interface RoutingAgentOutput {
  department: string;
  assignedOfficer: string;
  dispatchPriority: "Standard" | "Expedited" | "Immediate";
  contactChannel: string;
}

export interface ResolutionAgentOutput {
  suggestedPlan: string[];
  estimatedCost: number;
  estimatedHours: number;
  requiredSkills: string[];
}

export interface PredictionAgentOutput {
  regionalTrendGroup: string;
  riskIncreasePercent: number;
  hotspotWarning: boolean;
  preventativeAction: string;
}

export interface EmergencyEscalationAgentOutput {
  isEscalated: boolean;
  triggerFound: "Fallen electrical wires" | "Open manholes" | "Major road collapse" | "Flooding" | "Gas leaks" | null;
  escalatedPriority: "Critical";
  authorityNotified: string;
  notificationTimestamp: string;
  bannerMessage: string;
  decisionNotes: string;
}

export interface AgentTrace {
  detection: DetectionAgentOutput;
  emergencyEscalation?: EmergencyEscalationAgentOutput;
  verification: VerificationAgentOutput;
  prioritization: PrioritizationAgentOutput;
  routing: RoutingAgentOutput;
  resolution: ResolutionAgentOutput;
  prediction: PredictionAgentOutput;
}

export interface CommunityVerification {
  verificationsCount: number;
  rejectionsCount: number;
  evidenceUrls: string[];
  severityVotes: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  trustScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
}

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  location: LocationData;
  imageUrl: string;
  imageUrlRaw?: string; // used for Gemini upload if local
  status: "Reported" | "Verified" | "Prioritized" | "Routing" | "Resolving" | "Resolved";
  createdAt: string;
  updatedAt: string;
  reporterName: string;
  agentTrace?: AgentTrace;
  communityVerification?: CommunityVerification;
}

export interface CitizenNotification {
  id: string;
  issueId: string;
  issueTitle: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "verification" | "prioritization" | "routing" | "resolution" | "resolved";
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  reportsSubmitted: number;
  reportsResolved: number;
  trustScore: number;
  badges: string[];
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface CityHealthStats {
  healthScore: number; // 0 - 100
  activeIssues: number;
  resolvedIssues: number;
  averageResolutionHours: number;
  publicSafetyIndex: number; // 0 - 100
  carbonImpactReductionKg: number;
}
