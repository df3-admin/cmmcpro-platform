// Microsoft Entra ID (Azure AD) Integration

import { BaseIntegration, type IntegrationStatus, type CollectedEvidence } from '../base';
import { INTEGRATION_REGISTRY } from '../registry';

interface AzureADCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  accessToken?: string;
  [key: string]: string | number | boolean | undefined;
}

export class AzureADIntegration extends BaseIntegration {
  constructor(credentials: AzureADCredentials) {
    super(INTEGRATION_REGISTRY.azure_ad, credentials);
  }
  
  private getCredentials(): AzureADCredentials {
    return this.credentials as AzureADCredentials;
  }

  async connect(): Promise<boolean> {
    try {
      // Get access token
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error('Azure AD connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  async testConnection(): Promise<IntegrationStatus> {
    try {
      const token = await this.getAccessToken();
      
      // Test by getting organization info
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/organization',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return {
          connected: false,
          status: 'error',
          errorMessage: 'Failed to connect to Azure AD',
        };
      }

      const data = await response.json();
      
      return {
        connected: true,
        status: 'healthy',
        lastSyncAt: new Date(),
      };
    } catch (error) {
      return {
        connected: false,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sync(): Promise<void> {
    const token = await this.getAccessToken();
    
    // Sync users
    await this.syncUsers(token);
    
    // Sync MFA status
    await this.syncMFAStatus(token);
    
    // Sync audit logs
    await this.syncAuditLogs(token);
    
    // Sync policies
    await this.syncPolicies(token);
  }

  async collectEvidence(controlId: string): Promise<CollectedEvidence[]> {
    const token = await this.getAccessToken();
    const evidence: CollectedEvidence[] = [];

    // Map controls to data collection methods
    switch (controlId) {
      case 'AC.1.001': // Limit system access
        evidence.push(await this.collectUserAccessEvidence(token));
        break;
      
      case 'AC.1.002': // Limit functions
        evidence.push(await this.collectRBACEvidence(token));
        break;
      
      case 'IA.1.076': // MFA
      case 'IA.2.078':
        evidence.push(await this.collectMFAEvidence(token));
        break;
      
      case 'AU.2.041': // Audit logs
      case 'AU.2.042':
        evidence.push(await this.collectAuditLogEvidence(token));
        break;
    }

    return evidence;
  }

  async getStatus(): Promise<IntegrationStatus> {
    try {
      const token = await this.getAccessToken();
      
      // Get user count
      const usersResponse = await fetch(
        'https://graph.microsoft.com/v1.0/users/$count',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ConsistencyLevel: 'eventual',
          },
        }
      );
      
      const userCount = await usersResponse.text();

      return {
        connected: true,
        status: 'healthy',
        lastSyncAt: new Date(),
        dataCollected: {
          users: parseInt(userCount),
        },
      };
    } catch (error) {
      return {
        connected: false,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async getAccessToken(): Promise<string> {
    const creds = this.getCredentials();
    if (creds.accessToken) {
      return creds.accessToken;
    }

    const response = await fetch(
      `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    );

    const data = await response.json();
    (this.credentials as AzureADCredentials).accessToken = data.access_token;
    return data.access_token;
  }

  private async syncUsers(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/users?$select=id,displayName,userPrincipalName,accountEnabled',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store user data in database
    // This would be implemented to save to the integrations table
  }

  private async syncMFAStatus(token: string): Promise<void> {
    // Get MFA status for all users
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/reports/credentialUserRegistrationDetails',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store MFA status
  }

  private async syncAuditLogs(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/auditLogs/signIns?$top=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store audit logs
  }

  private async syncPolicies(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/policies/conditionalAccessPolicies',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store policies
  }

  private async collectUserAccessEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/users?$select=id,displayName,accountEnabled',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const users = data.value;
    const enabledUsers = users.filter((u: any) => u.accountEnabled).length;

    return {
      controlId: 'AC.1.001',
      evidenceType: 'report',
      data: {
        totalUsers: users.length,
        enabledUsers,
        users: users.map((u: any) => ({
          id: u.id,
          name: u.displayName,
          enabled: u.accountEnabled,
        })),
      },
      metadata: {
        source: 'Azure AD',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: enabledUsers > 0 ? 'compliant' : 'non_compliant',
      confidence: 95,
      findings: [`${enabledUsers} active users with controlled access`],
    };
  }

  private async collectRBACEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/directoryRoles',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const roles = data.value;

    return {
      controlId: 'AC.1.002',
      evidenceType: 'configuration',
      data: {
        totalRoles: roles.length,
        roles: roles.map((r: any) => ({
          id: r.id,
          displayName: r.displayName,
          description: r.description,
        })),
      },
      metadata: {
        source: 'Azure AD',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: roles.length > 0 ? 'compliant' : 'partial',
      confidence: 90,
      findings: [`${roles.length} roles configured for access control`],
    };
  }

  private async collectMFAEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/reports/credentialUserRegistrationDetails',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const users = data.value;
    const mfaUsers = users.filter((u: any) => u.isMfaRegistered).length;
    const mfaPercentage = (mfaUsers / users.length) * 100;

    return {
      controlId: 'IA.1.076',
      evidenceType: 'report',
      data: {
        totalUsers: users.length,
        mfaEnabledUsers: mfaUsers,
        mfaPercentage,
        users: users.map((u: any) => ({
          userPrincipalName: u.userPrincipalName,
          isMfaRegistered: u.isMfaRegistered,
        })),
      },
      metadata: {
        source: 'Azure AD',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: mfaPercentage >= 80 ? 'compliant' : 'partial',
      confidence: 95,
      findings: [
        `${mfaPercentage.toFixed(1)}% of users have MFA enabled`,
        mfaPercentage < 100 ? `${users.length - mfaUsers} users without MFA` : 'All users have MFA',
      ],
    };
  }

  private async collectAuditLogEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/auditLogs/signIns?$top=1000',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const logs = data.value;

    return {
      controlId: 'AU.2.041',
      evidenceType: 'log',
      data: {
        totalLogs: logs.length,
        dateRange: {
          from: logs[logs.length - 1]?.createdDateTime,
          to: logs[0]?.createdDateTime,
        },
        summary: {
          successfulLogins: logs.filter((l: any) => l.status.errorCode === 0).length,
          failedLogins: logs.filter((l: any) => l.status.errorCode !== 0).length,
        },
      },
      metadata: {
        source: 'Azure AD Audit Logs',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: logs.length > 0 ? 'compliant' : 'non_compliant',
      confidence: 100,
      findings: [
        `${logs.length} audit log entries collected`,
        'Audit logging is active and capturing events',
      ],
    };
  }
}


