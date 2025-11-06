// Integration registry - all available integrations

import type { IntegrationConfig, IntegrationRegistry } from './base';

export const INTEGRATION_REGISTRY: IntegrationRegistry = {
  azure_ad: {
    id: 'azure_ad',
    name: 'Microsoft Entra ID (Azure AD)',
    type: 'azure_ad',
    description: 'Monitor user access, MFA status, authentication logs, and identity security',
    category: 'identity',
    authType: 'oauth2',
    icon: '🔐',
    docsUrl: 'https://learn.microsoft.com/en-us/azure/active-directory/',
    setupInstructions: 'Connect your Microsoft Entra ID to automatically monitor user access controls, MFA enforcement, and authentication logs.',
    requiredScopes: [
      'User.Read.All',
      'AuditLog.Read.All',
      'Directory.Read.All',
      'Policy.Read.All'
    ],
    controlsMapped: [
      'AC.1.001', 'AC.1.002', 'AC.2.007', 'AC.2.008', 
      'IA.1.076', 'IA.1.077', 'IA.2.078', 'IA.2.079',
      'AU.2.041', 'AU.2.042'
    ]
  },

  aws: {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    type: 'aws',
    description: 'Monitor AWS infrastructure, CloudTrail logs, security configurations, and IAM policies',
    category: 'cloud',
    authType: 'api_key',
    icon: '☁️',
    docsUrl: 'https://docs.aws.amazon.com/',
    setupInstructions: 'Connect your AWS account using an IAM user with ReadOnly access to automatically monitor your cloud infrastructure.',
    requiredPermissions: [
      'cloudtrail:LookupEvents',
      'config:DescribeConfigRules',
      'iam:GetAccountSummary',
      'iam:ListUsers',
      'iam:ListPolicies',
      'ec2:DescribeInstances',
      'guardduty:ListFindings',
      'securityhub:GetFindings'
    ],
    controlsMapped: [
      'AC.1.001', 'AC.1.003', 'AC.2.016',
      'AU.2.041', 'AU.2.042', 'AU.2.043',
      'CM.2.061', 'CM.2.062',
      'SC.2.179', 'SC.2.181',
      'SI.2.214', 'SI.2.216'
    ]
  },

  microsoft_intune: {
    id: 'microsoft_intune',
    name: 'Microsoft Intune',
    type: 'microsoft_intune',
    description: 'Monitor device compliance, patch status, encryption, and endpoint security',
    category: 'endpoint',
    authType: 'oauth2',
    icon: '📱',
    docsUrl: 'https://learn.microsoft.com/en-us/mem/intune/',
    setupInstructions: 'Connect Microsoft Intune to automatically monitor device compliance, patch management, and security configurations.',
    requiredScopes: [
      'DeviceManagementManagedDevices.Read.All',
      'DeviceManagementConfiguration.Read.All',
      'DeviceManagementApps.Read.All'
    ],
    controlsMapped: [
      'CM.2.061', 'CM.2.062', 'CM.2.063', 'CM.2.064',
      'MP.2.120', 'MP.2.121',
      'SI.2.214', 'SI.2.216'
    ]
  },

  google_workspace: {
    id: 'google_workspace',
    name: 'Google Workspace',
    type: 'google_workspace',
    description: 'Monitor user management, 2FA status, access reports, and security settings',
    category: 'identity',
    authType: 'oauth2',
    icon: '🔍',
    docsUrl: 'https://developers.google.com/admin-sdk',
    setupInstructions: 'Connect Google Workspace to monitor user access, 2FA enforcement, and admin activity.',
    requiredScopes: [
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.reports.audit.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.readonly'
    ],
    controlsMapped: [
      'AC.1.001', 'AC.1.002',
      'IA.1.076', 'IA.1.077', 'IA.2.078',
      'AU.2.041', 'AU.2.042'
    ]
  },

  microsoft_365: {
    id: 'microsoft_365',
    name: 'Microsoft 365 Security',
    type: 'microsoft_365',
    description: 'Monitor email security, DLP policies, encryption status, and compliance features',
    category: 'security',
    authType: 'oauth2',
    icon: '📧',
    docsUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/',
    setupInstructions: 'Connect Microsoft 365 to monitor email security, data loss prevention, and compliance policies.',
    requiredScopes: [
      'SecurityEvents.Read.All',
      'ThreatIndicators.Read.All',
      'InformationProtectionPolicy.Read.All'
    ],
    controlsMapped: [
      'MP.2.120', 'MP.2.121',
      'SC.2.179', 'SC.2.181',
      'SI.2.221'
    ]
  },

  okta: {
    id: 'okta',
    name: 'Okta',
    type: 'okta',
    description: 'Monitor SSO, MFA enforcement, user provisioning, and access policies',
    category: 'identity',
    authType: 'api_key',
    icon: '🔑',
    docsUrl: 'https://developer.okta.com/',
    setupInstructions: 'Connect Okta to monitor single sign-on, MFA enforcement, and identity management.',
    controlsMapped: [
      'AC.1.001', 'AC.1.002', 'AC.2.007',
      'IA.1.076', 'IA.1.077', 'IA.2.078', 'IA.2.081'
    ]
  },

  crowdstrike: {
    id: 'crowdstrike',
    name: 'CrowdStrike Falcon',
    type: 'crowdstrike',
    description: 'Monitor endpoint detection and response, threat intelligence, and security incidents',
    category: 'security',
    authType: 'api_key',
    icon: '🦅',
    docsUrl: 'https://falcon.crowdstrike.com/documentation/',
    setupInstructions: 'Connect CrowdStrike to monitor endpoint security, threat detection, and incident response.',
    controlsMapped: [
      'IR.2.092', 'IR.2.093', 'IR.2.096',
      'SI.2.214', 'SI.2.216', 'SI.2.219'
    ]
  },

  sentinelone: {
    id: 'sentinelone',
    name: 'SentinelOne',
    type: 'sentinelone',
    description: 'Monitor EDR, threat detection, device compliance, and security events',
    category: 'security',
    authType: 'api_key',
    icon: '🛡️',
    docsUrl: 'https://developers.sentinelone.com/',
    setupInstructions: 'Connect SentinelOne to monitor endpoint security and threat protection.',
    controlsMapped: [
      'IR.2.092', 'IR.2.093',
      'SI.2.214', 'SI.2.215', 'SI.2.216'
    ]
  },

  qualys: {
    id: 'qualys',
    name: 'Qualys VMDR',
    type: 'qualys',
    description: 'Monitor vulnerability scanning, asset inventory, and compliance reporting',
    category: 'security',
    authType: 'api_key',
    icon: '🔬',
    docsUrl: 'https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf',
    setupInstructions: 'Connect Qualys to monitor vulnerabilities and asset compliance.',
    controlsMapped: [
      'RA.2.138', 'RA.2.139',
      'SI.2.214', 'SI.2.216'
    ]
  },

  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare',
    type: 'cloudflare',
    description: 'Monitor DDoS protection, WAF rules, DNS security, and access controls',
    category: 'network',
    authType: 'api_key',
    icon: '🌐',
    docsUrl: 'https://developers.cloudflare.com/api/',
    setupInstructions: 'Connect Cloudflare to monitor network security and DNS protection.',
    controlsMapped: [
      'SC.2.179', 'SC.2.180', 'SC.2.181',
      'SI.2.219'
    ]
  },

  github: {
    id: 'github',
    name: 'GitHub',
    type: 'github',
    description: 'Monitor repository security, code scanning, secret scanning, and branch protection',
    category: 'devops',
    authType: 'oauth2',
    icon: '💻',
    docsUrl: 'https://docs.github.com/en/rest',
    setupInstructions: 'Connect GitHub to monitor code repository security and access controls.',
    requiredScopes: [
      'repo',
      'read:org',
      'read:user'
    ],
    controlsMapped: [
      'AC.1.001', 'AC.1.002',
      'CM.2.061', 'CM.2.062',
      'SA.2.157'
    ]
  },

  veeam: {
    id: 'veeam',
    name: 'Veeam Backup',
    type: 'veeam',
    description: 'Monitor backup status, recovery testing, and backup compliance',
    category: 'backup',
    authType: 'api_key',
    icon: '💾',
    docsUrl: 'https://helpcenter.veeam.com/docs/backup/rest/',
    setupInstructions: 'Connect Veeam to monitor backup jobs and recovery compliance.',
    controlsMapped: [
      'CP.2.055', 'CP.2.056', 'CP.2.057'
    ]
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    type: 'slack',
    description: 'Send compliance alerts and notifications to your team',
    category: 'collaboration',
    authType: 'oauth2',
    icon: '💬',
    docsUrl: 'https://api.slack.com/',
    setupInstructions: 'Connect Slack to receive compliance alerts and notifications.',
    requiredScopes: [
      'chat:write',
      'channels:read'
    ],
    controlsMapped: []
  }
};

export function getIntegrationConfig(type: string): IntegrationConfig | undefined {
  return INTEGRATION_REGISTRY[type];
}

export function getAllIntegrations(): IntegrationConfig[] {
  return Object.values(INTEGRATION_REGISTRY);
}

export function getIntegrationsByCategory(category: string): IntegrationConfig[] {
  return Object.values(INTEGRATION_REGISTRY).filter(
    (integration) => integration.category === category
  );
}

export function getIntegrationsForControl(controlId: string): IntegrationConfig[] {
  return Object.values(INTEGRATION_REGISTRY).filter((integration) =>
    integration.controlsMapped.includes(controlId)
  );
}


