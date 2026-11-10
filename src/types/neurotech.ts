export type NeurotechDomain =
  | 'all'
  | 'bci_decoding'
  | 'ai_neurology'
  | 'neuro_robotics'
  | 'biochips'
  | 'clinical_trials';

export interface ResearchBreakthrough {
  id: string;
  title: string;
  authors: string[];
  institutions: string[];
  year: number;
  journal: string;
  domain: NeurotechDomain;
  abstract: string;
  methodology: string;
  hardwareSpecs: {
    channelCount: number;
    samplingRateKHz: number;
    latencyMs: number;
    powerConsumptionMicroWatts?: number;
    implantType: string;
  };
  clinicalPhase: 'Preclinical' | 'Phase I Early Feasibility' | 'Phase II IDE' | 'FDA Approved / CE Mark' | 'Investigational Device';
  collaboratingLabs: string[];
  doi: string;
  tags: string[];
  citationCount: number;
}

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  role: 'Neural Engineer' | 'Clinical Neurosurgeon' | 'Biochip Architect' | 'Computational Neuroscientist' | 'Robotics Director';
  institution: string;
  labName: string;
  location: string;
  researchFocus: string[];
  activeClinicalTrials: string[];
  collaborationStatus: 'Actively Recruiting' | 'Open for Joint Grants' | 'Clinical Enrolling' | 'Industry Partnering';
  hIndex: number;
  publicationsCount: number;
  bio: string;
  verifiedEmailDomain: string;
  forumLinks: {
    platform: string;
    handleOrUrl: string;
  }[];
}

export interface AcademicInstitution {
  id: string;
  name: string;
  location: string;
  departments: string[];
  coreFacilities: string[];
  prominentPIs: string[];
  currentCollaborations: string[];
  specialtyHighlight: string;
  openPostdocsAndFellowships: number;
  website: string;
}

export interface CommunityForum {
  id: string;
  name: string;
  type: 'Working Group' | 'Discord Community' | 'Professional Society' | 'Open Source Org' | 'Academic Preprint Forum';
  memberCount: string;
  description: string;
  primaryTopics: string[];
  keyChannels: string[];
  url: string;
  accessType: 'Open Access' | 'Peer Verification Required' | 'IEEE Membership' | 'Invitation / Application';
}

export interface NeuralDspMetrics {
  snrDb: number;
  carNoiseReductionDb: number;
  detectedSpikesPerSec: number;
  estimatedLatencyMs: number;
  channelPowerBands: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export interface DeepAnalysisResult {
  query: string;
  modelUsed: string;
  thinkingMode: boolean;
  timestamp: string;
  executiveSummary: string;
  systemArchitecture: {
    sensorAndElectrodes: string;
    biochipAndAnalogFrontEnd: string;
    realTimeDspAndSpikeSorting: string;
    aiMlDecodingModels: string;
    actuatorOrClosedLoopDelivery: string;
  };
  ongoingClinicalTrialsAndRegulatory: string;
  keyResearchersAndLabs: string[];
  recommendedCommunitiesAndForums: string[];
  recommendedNextSteps: string[];
}
