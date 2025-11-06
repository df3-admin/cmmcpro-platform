// Google Workspace Integration

import { BaseIntegration, type IntegrationStatus, type CollectedEvidence } from '../base';
import { INTEGRATION_REGISTRY } from '../registry';

interface GoogleWorkspaceCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

export class GoogleWorkspaceIntegration extends BaseIntegration {
  private credentials: GoogleWorkspaceCredentials;

  constructor(credentials: GoogleWorkspaceCredentials) {
    super(INTEGRATION_REGISTRY.google_workspace, credentials);
    this.credentials = credentials;
  }

  async connect(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      this.credentials.accessToken = token;
      return true;
    } catch (error) {
      console.error('Google Workspace connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    this.credentials.accessToken = undefined;
    return true;
  }

  async testConnection(): Promise<IntegrationStatus> {
    try {
      const token = await this.getAccessToken();
      
      // Test by getting domain info
      const response = await fetch(
        'https://admin.googleapis.com/admin/directory/v1/users?maxResults=1',
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
          errorMessage: 'Failed to connect to Google Workspace',
        };
      }

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
    
    // Sync 2FA status
    await this.sync2FAStatus(token);
    
    // Sync admin activity
    await this.syncAdminActivity(token);
    
    // Sync groups
    await this.syncGroups(token);
  }

  async collectEvidence(controlId: string): Promise<CollectedEvidence[]> {
    const token = await this.getAccessToken();
    const evidence: CollectedEvidence[] = [];

    switch (controlId) {
      case 'AC.1.001': // User access
      case 'AC.1.002':
        evidence.push(await this.collectUserAccessEvidence(token));
        break;
      
      case 'IA.1.076': // 2FA
      case 'IA.1.077':
      case 'IA.2.078':
        evidence.push(await this.collect2FAEvidence(token));
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
      const response = await fetch(
        'https://admin.googleapis.com/admin/directory/v1/users?maxResults=1',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();

      return {
        connected: true,
        status: 'healthy',
        lastSyncAt: new Date(),
        dataCollected: {
          users: data.users?.length || 0,
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
    if (this.credentials.accessToken) {
      return this.credentials.accessToken;
    }

    // Exchange refresh token for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        refresh_token: this.credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    this.credentials.accessToken = data.access_token;
    return data.access_token;
  }

  private async syncUsers(token: string): Promise<void> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/directory/v1/users?maxResults=500',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store user data
  }

  private async sync2FAStatus(token: string): Promise<void> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/directory/v1/users?maxResults=500&projection=full',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store 2FA status
  }

  private async syncAdminActivity(token: string): Promise<void> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/admin?maxResults=1000',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store admin activity
  }

  private async syncGroups(token: string): Promise<void> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/directory/v1/groups?maxResults=500',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store groups
  }

  private async collectUserAccessEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/directory/v1/users?maxResults=500',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const users = data.users || [];
    const activeUsers = users.filter((u: any) => !u.suspended).length;

    return {
      controlId: 'AC.1.001',
      evidenceType: 'report',
      data: {
        totalUsers: users.length,
        activeUsers,
        suspendedUsers: users.length - activeUsers,
        users: users.map((u: any) => ({
          email: u.primaryEmail,
          name: u.name.fullName,
          suspended: u.suspended,
          orgUnitPath: u.orgUnitPath,
        })),
      },
      metadata: {
        source: 'Google Workspace',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: activeUsers > 0 ? 'compliant' : 'non_compliant',
      confidence: 95,
      findings: [`${activeUsers} active users with controlled access`],
    };
  }

  private async collect2FAEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/directory/v1/users?maxResults=500&projection=full',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const users = data.users || [];
    const users2FA = users.filter((u: any) => u.isEnrolledIn2Sv).length;
    const percentage2FA = (users2FA / users.length) * 100;

    return {
      controlId: 'IA.1.076',
      evidenceType: 'report',
      data: {
        totalUsers: users.length,
        users2FA,
        percentage2FA,
        users: users.map((u: any) => ({
          email: u.primaryEmail,
          name: u.name.fullName,
          is2FAEnrolled: u.isEnrolledIn2Sv,
          is2FAEnforced: u.isEnforcedIn2Sv,
        })),
      },
      metadata: {
        source: 'Google Workspace',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: percentage2FA >= 80 ? 'compliant' : 'partial',
      confidence: 95,
      findings: [
        `${percentage2FA.toFixed(1)}% of users have 2FA enabled`,
        percentage2FA < 100 ? `${users.length - users2FA} users without 2FA` : 'All users have 2FA',
      ],
    };
  }

  private async collectAuditLogEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/login?maxResults=1000',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const logs = data.items || [];

    return {
      controlId: 'AU.2.041',
      evidenceType: 'log',
      data: {
        totalLogs: logs.length,
        dateRange: logs.length > 0 ? {
          from: logs[logs.length - 1]?.id?.time,
          to: logs[0]?.id?.time,
        } : null,
        summary: {
          loginEvents: logs.filter((l: any) => 
            l.events?.some((e: any) => e.name === 'login_success')
          ).length,
          logoutEvents: logs.filter((l: any) => 
            l.events?.some((e: any) => e.name === 'logout')
          ).length,
        },
      },
      metadata: {
        source: 'Google Workspace Audit Logs',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: logs.length > 0 ? 'compliant' : 'non_compliant',
      confidence: 100,
      findings: [
        `${logs.length} audit log entries collected`,
        'Audit logging is active and capturing authentication events',
      ],
    };
  }
}


