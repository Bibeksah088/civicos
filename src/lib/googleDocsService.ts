import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required scopes for Google Docs and Google Drive file creation
provider.addScope("https://www.googleapis.com/auth/documents");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and request appropriate scopes
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google OAuth access token from authorization response.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign-in / Token Request Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface ExportResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  error?: string;
}

// Function to generate the Google Doc
export const createProjectProposalDoc = async (accessToken: string): Promise<ExportResult> => {
  try {
    // 1. Create a blank Google Document
    const createResponse = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "CivicOS - Project Description & Strategy Proposal"
      })
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      throw new Error(`Google Docs Creation Failed: ${errText}`);
    }

    const docObj = await createResponse.json();
    const documentId = docObj.documentId;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // 2. Format the document text beautifully
    const docText = `CivicOS — Project Description & Strategy Proposal

1. PROBLEM STATEMENT SELECTED
In modern municipalities, standard 311 citizen reporting systems and municipal work-order pipelines are plagued by severe structural bottlenecks:
- Triage Latency & Under-staffing: Massive volumes of citizen reports are manually analyzed, causing critical safety hazards (such as exposed electrical wires or water main breaks) to sit in queues for days before they are humanly routed.
- Duplicate Report Storms: During key seasonal road damages or storms, hundreds of duplicate reports are filed for the exact same potholes or fallen trees, leading to wasted labor hours and redundant work orders.
- Static & Subjective Prioritization: Standard maintenance operates on a "first-come, first-served" basis instead of an intelligent "highest dynamic impact" calculation, meaning minor issues block emergency infrastructure fixes.
- Lack of Verification & Trust: Reporting portals frequently process fake, exaggerated, or vague submissions without real-time visual proof, draining municipal inspection budgets.
- Geospatial & Operational Blindness: City planners and emergency dispatchers operate on disconnected lists, lacking a unified predictive Digital Twin to forecast municipal decay zones or dynamically track live worker vehicle routes.

---------------------------------------------------------

2. SOLUTION OVERVIEW
CivicOS is an Autonomous Multi-Agent Civic Intelligence Platform that empowers citizens and integrates city authorities using a self-orchestrating swarm of specialized AI agents. CivicOS transforms raw community inputs (photographs, voice descriptions, and location signals) into authenticated, structured, prioritized, and dispatches real-time municipal work orders.

By linking citizen reporting seamlessly with a real-time Geospatial Google Maps dashboard and a predictive Digital Twin API, CivicOS closes the loop between local community reports and active municipal resolution. Multi-agent processing guarantees that emergency events bypass standard administrative processes entirely, triggering instant emergency alerts to the fire department or utility companies, while standard maintenance is clustered, routed, and predicted with optimal resource efficiency.

---------------------------------------------------------

3. KEY FEATURES
• Intelligent Intake Hub: Enables multi-modal citizen report submissions, permitting drag-and-drop of photos (base64 analysis) and text-to-agent processing.
• Autonomous Multi-Agent Processing Pipeline:
  - Detection Agent: Leverages advanced computer vision and text analysis to diagnose issue type, severity metrics, confidence scores, and safety risks.
  - Verification Agent: Detects duplicate filings using geographic, temporal, and visual comparisons, safeguarding the queue from clutter.
  - Prioritization Agent: Automatically calculates a dynamic Civic Impact Score (0-100) based on municipal safety guidelines, estimated affected population, and active structural threat levels.
  - Dynamic Routing Agent: Allocates specific departments (e.g., SFFD, SF Public Works) and designates dispatch priorities based on jurisdictional constraints.
• Emergency Escalation Engine: An override supervisor agent executing sub-second pattern checks for high-severity hazards (gas leaks, down live wires, severe floods, open manholes) to instantaneously register critical incidents with regional emergency operational command.
• Interactive Geo-Intelligence Center: Rich geospatial command center rendering incident clusters, dynamic dispatch boundaries, custom safety buffer zones, live responder route simulations, and high-contrast Google Maps heatmaps.
• Predictive Digital Twin Matrix: Utilizes active and historic incidents to model simulated structural rot degradation, compute regional municipal health scores, and project infrastructural vulnerabilities 6 to 12 months into the future.
• Community Verification Hub: Gamifies local civic engagement by awarding "Citizen Hero Points" and trust rankings to local users for crowdsourced verification tasks.

---------------------------------------------------------

4. TECHNOLOGIES USED
• Frontend Core: React 18+ with TypeScript, Vite (build engine), and Tailwind CSS for optimized rendering and ultra-fast UI updates.
• Animations / Styling: Framer Motion (motion/react) for seamless transitions, staggered multi-agent step indicators, and slick status animations; Lucide React for consistent and crisp semantic vector icon packs.
• Full-Stack Orchestration Server: Express Node.js backend facilitating lazy-loaded service architectures, secure proxy patterns, demo data persistence layer, and synthetic agent simulators.
• Deployment Platform: Cloud Run managed dockerized containers, with reverse proxy Nginx configurations securely routing ingress on Port 3000.

---------------------------------------------------------

5. GOOGLE TECHNOLOGIES UTILIZED
• Google Gemini API (developer.google.com): Powered by the state-of-the-art @google/genai SDK running server-side (models/gemini-2.5-flash or newer). Multi-modal vision capability handles image decoding to verify subgrade cracks, water leaks, and safety indicators, and structural JSON schema generation for structured agent outputs.
• Google Maps Platform (@vis.gl/react-google-maps):
  - Advanced Markers & Map Customization: Renders customizable, high-performance indicators representing different hazard departments and density matrices.
  - Polygon and Polyline Drawing Libraries: Configures active geographic safe zones, dynamic dispatch areas, and overlays real-time route pathfinding simulations.
  - API Provider Setup: Securely authenticates API instances safely utilizing backend secret proxying to fully mask developer keys from the client-side browser context.
`;

    // 3. Send batchUpdate to fill the text and apply some typography
    const batchResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: docText,
              location: {
                index: 1
              }
            }
          }
        ]
      })
    });

    if (!batchResponse.ok) {
      const errText = await batchResponse.text();
      throw new Error(`Google Docs Formatting Failed: ${errText}`);
    }

    return {
      success: true,
      documentId,
      documentUrl
    };

  } catch (error: any) {
    console.error("Export Project Proposal Error:", error);
    return {
      success: false,
      error: error.message || "Unknown error exporting to Google Docs"
    };
  }
};
