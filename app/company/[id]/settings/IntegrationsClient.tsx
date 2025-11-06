'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  Zap, 
  Settings2,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import type { IntegrationConfig } from '@/lib/integrations/base';

interface Props {
  companyId: string;
  existingIntegrations: any[];
  availableIntegrations: IntegrationConfig[];
  categories: {
    [key: string]: IntegrationConfig[];
  };
}

export default function IntegrationsClient({
  companyId,
  existingIntegrations: initialIntegrations,
  availableIntegrations,
  categories,
}: Props) {
  const [existingIntegrations, setExistingIntegrations] = useState(initialIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupData, setSetupData] = useState<any>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = (type: string) => {
    return existingIntegrations.some((i) => i.integrationType === type);
  };

  const getIntegrationStatus = (type: string) => {
    return existingIntegrations.find((i) => i.integrationType === type);
  };

  const handleConnectClick = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setSetupData({});
    setShowSetupDialog(true);
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;

    setIsConnecting(true);

    try {
      const response = await fetch(`/api/integrations/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          integrationType: selectedIntegration.type,
          credentials: setupData,
        }),
      });

      if (!response.ok) throw new Error('Failed to connect');

      const result = await response.json();
      
      toast.success(`${selectedIntegration.name} connected successfully!`);
      setShowSetupDialog(false);
      
      // Refresh integrations
      const refreshResponse = await fetch(`/api/integrations/list?companyId=${companyId}`);
      const refreshData = await refreshResponse.json();
      setExistingIntegrations(refreshData.integrations);
    } catch (error) {
      toast.error('Failed to connect integration');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (integrationId: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      toast.success(`${name} disconnected`);
      
      // Refresh integrations
      const refreshResponse = await fetch(`/api/integrations/list?companyId=${companyId}`);
      const refreshData = await refreshResponse.json();
      setExistingIntegrations(refreshData.integrations);
    } catch (error) {
      toast.error('Failed to disconnect integration');
    }
  };

  const handleSync = async (integrationId: string, name: string) => {
    toast.info(`Syncing ${name}...`);

    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to sync');

      toast.success(`${name} synced successfully!`);
    } catch (error) {
      toast.error('Failed to sync integration');
    }
  };

  const renderSetupForm = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.authType) {
      case 'oauth2':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You'll be redirected to {selectedIntegration.name} to authorize access.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? 'Connecting...' : 'Connect with OAuth'}
            </Button>
          </div>
        );

      case 'api_key':
        if (selectedIntegration.type === 'aws') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessKeyId">Access Key ID</Label>
                <Input
                  id="accessKeyId"
                  placeholder="AKIA..."
                  value={setupData.accessKeyId || ''}
                  onChange={(e) => setSetupData({ ...setupData, accessKeyId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                <Input
                  id="secretAccessKey"
                  type="password"
                  placeholder="Enter secret key"
                  value={setupData.secretAccessKey || ''}
                  onChange={(e) => setSetupData({ ...setupData, secretAccessKey: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="us-east-1"
                  value={setupData.region || ''}
                  onChange={(e) => setSetupData({ ...setupData, region: e.target.value })}
                />
              </div>
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? 'Connecting...' : 'Connect AWS'}
              </Button>
            </div>
          );
        }

        if (selectedIntegration.type === 'azure_ad') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={setupData.tenantId || ''}
                  onChange={(e) => setSetupData({ ...setupData, tenantId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="clientId">Client ID (Application ID)</Label>
                <Input
                  id="clientId"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={setupData.clientId || ''}
                  onChange={(e) => setSetupData({ ...setupData, clientId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  placeholder="Enter client secret"
                  value={setupData.clientSecret || ''}
                  onChange={(e) => setSetupData({ ...setupData, clientSecret: e.target.value })}
                />
              </div>
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? 'Connecting...' : 'Connect Azure AD'}
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                value={setupData.apiKey || ''}
                onChange={(e) => setSetupData({ ...setupData, apiKey: e.target.value })}
              />
            </div>
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected ({existingIntegrations.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="cloud">Cloud</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(categories).map(([category, integrations]) => (
            integrations.length > 0 && (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      status={getIntegrationStatus(integration.type)}
                      isConnected={isConnected(integration.type)}
                      onConnect={() => handleConnectClick(integration)}
                      onDisconnect={(id, name) => handleDisconnect(id, name)}
                      onSync={(id, name) => handleSync(id, name)}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </TabsContent>

        <TabsContent value="connected">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingIntegrations.map((existing) => {
              const config = availableIntegrations.find((i) => i.type === existing.integrationType);
              if (!config) return null;
              
              return (
                <IntegrationCard
                  key={existing.id}
                  integration={config}
                  status={existing}
                  isConnected={true}
                  onConnect={() => {}}
                  onDisconnect={(id, name) => handleDisconnect(id, name)}
                  onSync={(id, name) => handleSync(id, name)}
                />
              );
            })}
          </div>
        </TabsContent>

        {Object.entries(categories).map(([category, integrations]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  status={getIntegrationStatus(integration.type)}
                  isConnected={isConnected(integration.type)}
                  onConnect={() => handleConnectClick(integration)}
                  onDisconnect={(id, name) => handleDisconnect(id, name)}
                  onSync={(id, name) => handleSync(id, name)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.setupInstructions}
            </DialogDescription>
          </DialogHeader>
          
          {renderSetupForm()}

          {selectedIntegration?.docsUrl && (
            <a
              href={selectedIntegration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
            >
              View documentation <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function IntegrationCard({
  integration,
  status,
  isConnected,
  onConnect,
  onDisconnect,
  onSync,
}: {
  integration: IntegrationConfig;
  status?: any;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: (id: string, name: string) => void;
  onSync: (id: string, name: string) => void;
}) {
  return (
    <Card className={isConnected ? 'border-green-200 bg-green-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {integration.category}
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {integration.description}
        </p>

        {integration.controlsMapped.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {integration.controlsMapped.slice(0, 3).map((controlId) => (
              <Badge key={controlId} variant="secondary" className="text-xs">
                {controlId}
              </Badge>
            ))}
            {integration.controlsMapped.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{integration.controlsMapped.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {isConnected && status ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Zap className="w-3 h-3" />
              Last synced: {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleDateString() : 'Never'}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSync(status.id, integration.name)}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDisconnect(status.id, integration.name)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={onConnect} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


