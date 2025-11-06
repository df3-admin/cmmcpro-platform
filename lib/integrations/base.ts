// Base integration class and types for all third-party integrations

export type IntegrationType = 
  | 'azure_ad'
  | 'aws'
  | 'google_workspace'
  | 'microsoft_intune'
  | 'microsoft_365'
  | 'okta'
  | 'crowdstrike'
  | 'sentinelone'
  | 'qualys'
  | 'tenable'
  | 'palo_alto'
  | 'cloudflare'
  | 'github'
  | 'gitlab'
  | 'slack'
  | 'veeam';

export type AuthType = 'oauth2' | 'api_key' | 'service_account';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  description: string;
  category: 'identity' | 'cloud' | 'endpoint' | 'network' | 'security' | 'devops' | 'backup' | 'collaboration';
  authType: AuthType;
  icon: string;
  docsUrl: string;
  setupInstructions: string;
  requiredScopes?: string[];
  requiredPermissions?: string[];
  controlsMapped: string[]; // Which CMMC controls this integration helps with
}

export interface IntegrationCredentials {
  [key: string]: string | number | boolean;
}

export interface IntegrationStatus {
  connected: boolean;
  lastSyncAt?: Date;
  status: 'healthy' | 'error' | 'warning' | 'syncing';
  errorMessage?: string;
  dataCollected?: {
    users?: number;
    devices?: number;
    policies?: number;
    logs?: number;
  };
}

export interface CollectedEvidence {
  controlId: string;
  evidenceType: 'policy' | 'screenshot' | 'configuration' | 'log' | 'report';
  data: any;
  metadata: {
    source: string;
    collectedAt: Date;
    format: string;
  };
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  confidence: number; // 0-100
  findings?: string[];
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;
  protected credentials: IntegrationCredentials;

  constructor(config: IntegrationConfig, credentials: IntegrationCredentials) {
    this.config = config;
    this.credentials = credentials;
  }

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<boolean>;
  abstract testConnection(): Promise<IntegrationStatus>;
  abstract sync(): Promise<void>;
  abstract collectEvidence(controlId: string): Promise<CollectedEvidence[]>;
  abstract getStatus(): Promise<IntegrationStatus>;

  getConfig(): IntegrationConfig {
    return this.config;
  }

  // Helper to encrypt sensitive data
  protected async encryptCredentials(data: string): Promise<string> {
    // In production, use proper encryption (AES-256)
    // For now, base64 (NOT SECURE - replace in production)
    return Buffer.from(data).toString('base64');
  }

  protected async decryptCredentials(encrypted: string): Promise<string> {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }
}

export interface IntegrationRegistry {
  [key: string]: IntegrationConfig;
}


