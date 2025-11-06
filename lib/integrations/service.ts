// Integration service - manages all third-party integrations

import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { IntegrationConfig, IntegrationStatus, CollectedEvidence } from './base';
import { AzureADIntegration } from './providers/azure-ad';
import { AWSIntegration } from './providers/aws';
import { IntuneIntegration } from './providers/intune';
import { GoogleWorkspaceIntegration } from './providers/google-workspace';
import { getIntegrationConfig } from './registry';

export class IntegrationService {
  async addIntegration(
    companyId: string,
    integrationType: string,
    credentials: any
  ): Promise<string> {
    const config = getIntegrationConfig(integrationType);
    
    if (!config) {
      throw new Error('Integration type not found');
    }

    // Encrypt credentials
    const encryptedCredentials = await this.encryptCredentials(JSON.stringify(credentials));

    // Save to database
    const [integration] = await db
      .insert(integrations)
      .values({
        companyId,
        integrationType,
        credentialsEncrypted: encryptedCredentials,
        status: 'connected',
        config: config,
      })
      .returning();

    // Test connection
    await this.testIntegration(integration.id);

    return integration.id;
  }

  async removeIntegration(integrationId: string): Promise<boolean> {
    await db.delete(integrations).where(eq(integrations.id, integrationId));
    return true;
  }

  async testIntegration(integrationId: string): Promise<IntegrationStatus> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, integrationId))
      .limit(1);

    if (!integration) {
      throw new Error('Integration not found');
    }

    const provider = await this.getIntegrationProvider(integration);
    const status = await provider.testConnection();

    // Update status in database
    await db
      .update(integrations)
      .set({
        status: status.connected ? 'connected' : 'error',
        errorMessage: status.errorMessage,
        lastSyncAt: status.lastSyncAt,
      })
      .where(eq(integrations.id, integrationId));

    return status;
  }

  async syncIntegration(integrationId: string): Promise<void> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, integrationId))
      .limit(1);

    if (!integration) {
      throw new Error('Integration not found');
    }

    const provider = await this.getIntegrationProvider(integration);

    // Update status to syncing
    await db
      .update(integrations)
      .set({ status: 'connected' })
      .where(eq(integrations.id, integrationId));

    try {
      await provider.sync();

      await db
        .update(integrations)
        .set({
          status: 'connected',
          lastSyncAt: new Date(),
          errorMessage: null,
        })
        .where(eq(integrations.id, integrationId));
    } catch (error) {
      await db
        .update(integrations)
        .set({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Sync failed',
        })
        .where(eq(integrations.id, integrationId));

      throw error;
    }
  }

  async collectEvidenceForControl(
    companyId: string,
    controlId: string
  ): Promise<CollectedEvidence[]> {
    // Get all integrations for this company
    const companyIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.companyId, companyId),
          eq(integrations.status, 'connected')
        )
      );

    const allEvidence: CollectedEvidence[] = [];

    // Collect evidence from each integration
    for (const integration of companyIntegrations) {
      try {
        const provider = await this.getIntegrationProvider(integration);
        const evidence = await provider.collectEvidence(controlId);
        allEvidence.push(...evidence);
      } catch (error) {
        console.error(`Failed to collect evidence from ${integration.integrationType}:`, error);
      }
    }

    return allEvidence;
  }

  async getIntegrationStatus(integrationId: string): Promise<IntegrationStatus> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, integrationId))
      .limit(1);

    if (!integration) {
      throw new Error('Integration not found');
    }

    const provider = await this.getIntegrationProvider(integration);
    return await provider.getStatus();
  }

  async getCompanyIntegrations(companyId: string) {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.companyId, companyId));
  }

  private async getIntegrationProvider(integration: any): Promise<any> {
    const credentials = JSON.parse(
      await this.decryptCredentials(integration.credentialsEncrypted)
    );

    switch (integration.integrationType) {
      case 'azure_ad':
        return new AzureADIntegration(credentials);
      
      case 'aws':
        return new AWSIntegration(credentials);
      
      case 'microsoft_intune':
        return new IntuneIntegration(credentials);
      
      case 'google_workspace':
        return new GoogleWorkspaceIntegration(credentials);
      
      // Add more providers here as they're implemented
      
      default:
        throw new Error(`Provider ${integration.integrationType} not implemented`);
    }
  }

  private async encryptCredentials(data: string): Promise<string> {
    // In production, use proper encryption (AES-256 with a secret key)
    // For now, use base64 (NOT SECURE - replace in production)
    return Buffer.from(data).toString('base64');
  }

  private async decryptCredentials(encrypted: string): Promise<string> {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }

  async syncAllIntegrations(companyId: string): Promise<void> {
    const companyIntegrations = await this.getCompanyIntegrations(companyId);

    for (const integration of companyIntegrations) {
      try {
        await this.syncIntegration(integration.id);
      } catch (error) {
        console.error(`Failed to sync ${integration.integrationType}:`, error);
      }
    }
  }
}

export const integrationService = new IntegrationService();

