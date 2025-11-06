# CMMCPro Integrations System

## Overview

The CMMCPro integrations system allows automatic evidence collection and continuous compliance monitoring by connecting to third-party services. Think of it as the "W-2" in TurboTax - connect your services once, and the app automatically pulls compliance data.

## Features

### ✅ Implemented
1. **Integration Framework** - Base classes and registry for all integrations
2. **Settings Page** - Integration marketplace with connection flows
3. **Auto-Evidence Collection** - Automatic evidence gathering from connected services
4. **Continuous Monitoring** - Daily sync via Vercel Cron jobs
5. **Azure AD Integration** - Microsoft Entra ID for identity and access monitoring
6. **AWS Integration** - Cloud infrastructure and security monitoring
7. **Sync Engine** - Background sync for all integrations
8. **Integration UI** - Cards, status indicators, and connection dialogs

### 🚧 In Progress
- Microsoft Intune integration
- Google Workspace integration
- Additional security tool integrations

## How It Works

### 1. User Connects Integration
```
User → Settings Page → Select Integration → Enter Credentials → Test Connection → Save
```

### 2. Automatic Evidence Collection
```
User → Wizard → Control Page → Click "Auto-Collect Evidence" → System queries all integrations → Evidence automatically uploaded
```

### 3. Continuous Monitoring
```
Daily Cron (9 AM) → Sync all company integrations → Collect fresh evidence → Update compliance status
```

## Available Integrations

### Identity & Access Management
- **Microsoft Entra ID (Azure AD)** ✅
  - User access monitoring
  - MFA status tracking
  - Authentication logs
  - Role-based access control
  - Controls: AC.1.001, AC.1.002, IA.1.076, IA.2.078, AU.2.041

- **Google Workspace** (Planned)
  - User management
  - 2FA enforcement
  - Admin activity logs

- **Okta** (Planned)
  - SSO configuration
  - MFA policies
  - User provisioning

### Cloud Infrastructure
- **AWS** ✅
  - CloudTrail logging
  - IAM policies
  - EC2 instance security
  - Security Hub findings
  - Config rules
  - Controls: AC.1.001, AU.2.041, CM.2.061, SI.2.214

- **Microsoft Azure** (Planned)
  - Activity logs
  - Security Center
  - Policy compliance

- **Google Cloud Platform** (Planned)
  - Asset inventory
  - Security Command Center

### Endpoint Security
- **Microsoft Intune** (Planned)
  - Device compliance
  - Patch status
  - Encryption verification
  - Controls: CM.2.061, CM.2.062, MP.2.120, SI.2.214

- **CrowdStrike Falcon** (Planned)
  - EDR monitoring
  - Threat detection

- **SentinelOne** (Planned)
  - Endpoint protection
  - Security events

### Security Tools
- **Qualys** (Planned)
  - Vulnerability scanning
  - Asset inventory

- **Cloudflare** (Planned)
  - DDoS protection
  - WAF rules

### Backup & Recovery
- **Veeam** (Planned)
  - Backup status
  - Recovery testing

### DevOps
- **GitHub** (Planned)
  - Repository security
  - Code scanning

### Collaboration
- **Slack** (Planned)
  - Compliance notifications

## Integration Setup

### Azure AD Setup

1. **Navigate to Settings**
   - Go to Company → Settings → Integrations

2. **Click Connect on Azure AD**
   - Find Microsoft Entra ID card
   - Click "Connect"

3. **Enter Credentials**
   ```
   Tenant ID: Your Azure AD tenant ID
   Client ID: Application (client) ID from Azure portal
   Client Secret: App registration secret
   ```

4. **Test Connection**
   - System automatically tests the connection
   - Shows success or error message

5. **Start Syncing**
   - Click "Sync" to pull initial data
   - Daily automatic syncs will run at 9 AM

### AWS Setup

1. **Create IAM User**
   ```bash
   # In AWS Console:
   # 1. Go to IAM → Users → Create User
   # 2. Select "Programmatic access"
   # 3. Attach policies: ReadOnlyAccess or specific policies
   # 4. Save Access Key ID and Secret Access Key
   ```

2. **Connect in CMMCPro**
   - Go to Settings → Integrations
   - Click "Connect" on AWS card
   - Enter:
     - Access Key ID
     - Secret Access Key
     - Region (e.g., us-east-1)

3. **Test & Sync**
   - Connection is tested automatically
   - Initial sync begins

## Auto-Evidence Collection

### How to Use

1. **Connect Integrations First**
   - Go to Settings → Integrations
   - Connect relevant services for your controls

2. **Navigate to Any Control**
   - Go to Wizard → Select any control

3. **Click "Auto-Collect Evidence"**
   - System queries all connected integrations
   - Collects relevant evidence for that control
   - Automatically uploads and validates
   - Updates control status

### What Gets Collected

For **AC.1.001 (User Access Control)**:
- From Azure AD: List of users, access status, roles
- From AWS: IAM user summary, policies
- Automatic validation of access controls

For **IA.1.076 (MFA)**:
- From Azure AD: MFA enrollment status per user
- Percentage of users with MFA enabled
- Compliance status (compliant if >80% have MFA)

For **AU.2.041 (Audit Logs)**:
- From Azure AD: Sign-in logs, audit events
- From AWS: CloudTrail events
- Verification that logging is active

## Continuous Monitoring

### Daily Sync (9 AM)
- Runs automatically via Vercel Cron
- Syncs all company integrations
- Updates evidence for all controls
- Sends alerts if issues detected

### Weekly Evidence Renewal (Sunday Midnight)
- Refreshes evidence for approved controls
- Ensures evidence stays current
- Re-validates compliance status

### Manual Sync
- Click "Sync" button on any integration card
- Forces immediate data refresh
- Useful after making changes in external services

## API Endpoints

### Connect Integration
```typescript
POST /api/integrations/connect
Body: {
  companyId: string,
  integrationType: string,
  credentials: object
}
```

### List Integrations
```typescript
GET /api/integrations/list?companyId=<id>
Response: {
  integrations: Integration[]
}
```

### Sync Integration
```typescript
POST /api/integrations/[id]/sync
```

### Collect Evidence
```typescript
POST /api/integrations/collect-evidence
Body: {
  companyId: string,
  controlId: string
}
Response: {
  evidenceCount: number,
  complianceStatus: string,
  confidence: number
}
```

### Remove Integration
```typescript
DELETE /api/integrations/[id]
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         User Interface (Settings)           │
│  - Integration Cards                        │
│  - Connection Dialogs                       │
│  - Status Indicators                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      Integration Service Layer              │
│  - addIntegration()                         │
│  - syncIntegration()                        │
│  - collectEvidence()                        │
│  - getStatus()                              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│        Provider Implementations             │
│  - AzureADIntegration                       │
│  - AWSIntegration                           │
│  - (Future providers)                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      External APIs                          │
│  - Microsoft Graph API                      │
│  - AWS APIs                                 │
│  - Other third-party APIs                   │
└─────────────────────────────────────────────┘
```

## Database Schema

### integrations table
```typescript
{
  id: UUID,
  companyId: UUID,
  integrationType: string,
  credentialsEncrypted: string,  // Base64 for now, use AES-256 in production
  status: 'connected' | 'error' | 'disconnected',
  lastSyncAt: timestamp,
  errorMessage: string?,
  config: JSONB,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Considerations

### Credential Storage
⚠️ **Current**: Base64 encoding (NOT SECURE for production)
✅ **TODO**: Implement AES-256 encryption with secret key

### API Permissions
- Request minimum required scopes
- Use read-only access where possible
- Implement token refresh for OAuth2

### Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Cache responses where appropriate

## Adding New Integrations

### 1. Create Provider Class

```typescript
// lib/integrations/providers/my-service.ts
import { BaseIntegration } from '../base';

export class MyServiceIntegration extends BaseIntegration {
  async connect() { /* ... */ }
  async sync() { /* ... */ }
  async collectEvidence(controlId) { /* ... */ }
  async getStatus() { /* ... */ }
}
```

### 2. Add to Registry

```typescript
// lib/integrations/registry.ts
export const INTEGRATION_REGISTRY = {
  my_service: {
    id: 'my_service',
    name: 'My Service',
    type: 'my_service',
    description: '...',
    category: 'security',
    authType: 'api_key',
    icon: '🔐',
    docsUrl: '...',
    setupInstructions: '...',
    controlsMapped: ['AC.1.001', 'IA.1.076'],
  },
  // ... other integrations
};
```

### 3. Update Service

```typescript
// lib/integrations/service.ts
private async getIntegrationProvider(integration: any) {
  switch (integration.integrationType) {
    case 'my_service':
      return new MyServiceIntegration(credentials);
    // ... other cases
  }
}
```

### 4. Test

```bash
# Connect integration via UI
# Click "Sync"
# Click "Auto-Collect Evidence" on relevant controls
# Verify evidence is collected
```

## Troubleshooting

### "Failed to connect"
- Verify credentials are correct
- Check API permissions/scopes
- Ensure service is accessible (not firewalled)
- Check API rate limits

### "No evidence collected"
- Verify integration is connected (status = "connected")
- Check if integration maps to the control
- Review logs for API errors
- Manually sync integration first

### "Sync failed"
- Check integration status for error message
- Verify credentials haven't expired
- Check API service status
- Review cron job logs in Vercel

## Future Enhancements

1. **OAuth2 Flow** - Implement proper OAuth redirects
2. **Webhook Support** - Real-time updates instead of polling
3. **Integration Marketplace** - Community-contributed integrations
4. **Smart Recommendations** - Suggest integrations based on stack
5. **Data Mapping** - Visual mapping of integration data to controls
6. **Compliance Reporting** - Integration-specific compliance reports
7. **Multi-Region Support** - Handle region-specific deployments
8. **Advanced Filtering** - Filter evidence by date, source, quality

## Resources

- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Status**: Integration system is operational with Azure AD and AWS. Additional integrations can be added using the extensible framework.

The system provides the "W-2 experience" for CMMC compliance - connect once, automatic evidence collection forever.


