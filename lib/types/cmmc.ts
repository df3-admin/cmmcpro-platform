export interface CMMCControl {
  id: string;
  title: string;
  domain: string;
  practice: string;
  evidenceTypes: string[];
  guidance: string;
  assessmentQuestion: string;
  dependencies: string[];
  points: number;
  examples?: string[];
}

export interface CMMCLevel {
  name: string;
  description: string;
  totalControls: number;
  controls: CMMCControl[];
}

export interface CMMCData {
  levels: {
    [key: string]: CMMCLevel;
  };
  domains: string[];
}

export type ControlStatus = 'not_started' | 'in_progress' | 'evidence_uploaded' | 'ai_reviewing' | 'approved' | 'needs_rework';
export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';
export type Industry = 'defense_contractor' | 'it_services' | 'manufacturing' | 'healthcare' | 'other';

