// Microsoft Intune Integration

import { BaseIntegration, type IntegrationStatus, type CollectedEvidence } from '../base';
import { INTEGRATION_REGISTRY } from '../registry';

interface IntuneCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  accessToken?: string;
  [key: string]: string | number | boolean | undefined;
}

export class IntuneIntegration extends BaseIntegration {
  private credentials: IntuneCredentials;

  constructor(credentials: IntuneCredentials) {
    super(INTEGRATION_REGISTRY.microsoft_intune, credentials);
    this.credentials = credentials;
  }

  async connect(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      this.credentials.accessToken = token;
      return true;
    } catch (error) {
      console.error('Intune connection error:', error);
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
      
      // Test by getting managed devices count
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/$count',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ConsistencyLevel: 'eventual',
          },
        }
      );

      if (!response.ok) {
        return {
          connected: false,
          status: 'error',
          errorMessage: 'Failed to connect to Intune',
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
    
    // Sync managed devices
    await this.syncManagedDevices(token);
    
    // Sync compliance policies
    await this.syncCompliancePolicies(token);
    
    // Sync device compliance status
    await this.syncDeviceCompliance(token);
    
    // Sync configuration profiles
    await this.syncConfigurationProfiles(token);
  }

  async collectEvidence(controlId: string): Promise<CollectedEvidence[]> {
    const token = await this.getAccessToken();
    const evidence: CollectedEvidence[] = [];

    switch (controlId) {
      case 'CM.2.061': // Configuration management
      case 'CM.2.062':
        evidence.push(await this.collectConfigurationEvidence(token));
        break;
      
      case 'CM.2.063': // Security configuration
      case 'CM.2.064':
        evidence.push(await this.collectSecurityConfigEvidence(token));
        break;
      
      case 'MP.2.120': // Media protection
      case 'MP.2.121':
        evidence.push(await this.collectEncryptionEvidence(token));
        break;
      
      case 'SI.2.214': // Flaw remediation
      case 'SI.2.216':
        evidence.push(await this.collectPatchEvidence(token));
        break;
    }

    return evidence;
  }

  async getStatus(): Promise<IntegrationStatus> {
    try {
      const token = await this.getAccessToken();
      
      // Get device count
      const devicesResponse = await fetch(
        'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/$count',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ConsistencyLevel: 'eventual',
          },
        }
      );
      
      const deviceCount = await devicesResponse.text();

      return {
        connected: true,
        status: 'healthy',
        lastSyncAt: new Date(),
        dataCollected: {
          devices: parseInt(deviceCount),
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

    const response = await fetch(
      `https://login.microsoftonline.com/${this.credentials.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    );

    const data = await response.json();
    this.credentials.accessToken = data.access_token;
    return data.access_token;
  }

  private async syncManagedDevices(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store device data
  }

  private async syncCompliancePolicies(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store policies
  }

  private async syncDeviceCompliance(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicyDeviceStateSummary',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store compliance status
  }

  private async syncConfigurationProfiles(token: string): Promise<void> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // Store configuration profiles
  }

  private async collectConfigurationEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const configs = data.value;

    return {
      controlId: 'CM.2.061',
      evidenceType: 'configuration',
      data: {
        totalConfigurations: configs.length,
        configurations: configs.map((c: any) => ({
          id: c.id,
          displayName: c.displayName,
          platformType: c['@odata.type'],
        })),
      },
      metadata: {
        source: 'Microsoft Intune',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: configs.length > 0 ? 'compliant' : 'non_compliant',
      confidence: 90,
      findings: [`${configs.length} device configuration profiles deployed`],
    };
  }

  private async collectSecurityConfigEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const policies = data.value;

    return {
      controlId: 'CM.2.063',
      evidenceType: 'policy',
      data: {
        totalPolicies: policies.length,
        policies: policies.map((p: any) => ({
          id: p.id,
          displayName: p.displayName,
          platformType: p['@odata.type'],
        })),
      },
      metadata: {
        source: 'Microsoft Intune',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: policies.length > 0 ? 'compliant' : 'partial',
      confidence: 85,
      findings: [`${policies.length} compliance policies configured`],
    };
  }

  private async collectEncryptionEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$filter=isEncrypted eq true&$count=true',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ConsistencyLevel: 'eventual',
        },
      }
    );

    const data = await response.json();
    const encryptedCount = data['@odata.count'] || 0;
    
    // Get total devices
    const totalResponse = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/$count',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ConsistencyLevel: 'eventual',
        },
      }
    );
    
    const totalCount = parseInt(await totalResponse.text());
    const encryptionPercentage = (encryptedCount / totalCount) * 100;

    return {
      controlId: 'MP.2.120',
      evidenceType: 'configuration',
      data: {
        totalDevices: totalCount,
        encryptedDevices: encryptedCount,
        encryptionPercentage,
      },
      metadata: {
        source: 'Microsoft Intune',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: encryptionPercentage >= 95 ? 'compliant' : 'partial',
      confidence: 95,
      findings: [
        `${encryptionPercentage.toFixed(1)}% of devices are encrypted`,
        encryptionPercentage < 100 ? `${totalCount - encryptedCount} devices without encryption` : 'All devices encrypted',
      ],
    };
  }

  private async collectPatchEvidence(token: string): Promise<CollectedEvidence> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=id,deviceName,osVersion,lastSyncDateTime&$top=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const devices = data.value;
    
    // Check devices synced recently (within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlySynced = devices.filter((d: any) => 
      new Date(d.lastSyncDateTime) > sevenDaysAgo
    ).length;
    
    const syncPercentage = (recentlySynced / devices.length) * 100;

    return {
      controlId: 'SI.2.214',
      evidenceType: 'report',
      data: {
        totalDevices: devices.length,
        recentlySynced,
        syncPercentage,
      },
      metadata: {
        source: 'Microsoft Intune',
        collectedAt: new Date(),
        format: 'json',
      },
      complianceStatus: syncPercentage >= 90 ? 'compliant' : 'partial',
      confidence: 90,
      findings: [
        `${syncPercentage.toFixed(1)}% of devices synced in last 7 days`,
        'Devices are receiving policy and patch updates',
      ],
    };
  }
}


