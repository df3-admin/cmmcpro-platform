'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  Activity, 
  Plug, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  TrendingUp,
  Shield,
  AlertTriangle,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';

interface Props {
  companyId: string;
  companyName: string;
  integrations: any[];
  recentChecks: any[];
  controlStats: {
    total: number;
    approved: number;
    in_progress: number;
  };
  monitoringStats: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export default function MonitoringDashboardClient({
  companyId,
  companyName,
  integrations: initialIntegrations,
  recentChecks: initialChecks,
  controlStats,
  monitoringStats: initialMonitoringStats,
}: Props) {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [recentChecks, setRecentChecks] = useState(initialChecks);
  const [monitoringStats, setMonitoringStats] = useState(initialMonitoringStats);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(
    recentChecks.length > 0 ? new Date(recentChecks[0].checkedAt) : null
  );

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');
  const healthPercentage = monitoringStats.total > 0 
    ? Math.round((monitoringStats.passed / monitoringStats.total) * 100) 
    : 100;

  const handleRunChecks = async () => {
    setIsRunningChecks(true);
    
    try {
      // Trigger monitoring check for all integrations
      const response = await fetch(`/api/monitoring/run-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      if (response.ok) {
        // Refresh the page to get new checks
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to run checks:', error);
    } finally {
      setIsRunningChecks(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Continuous Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time compliance monitoring for {companyName}
          </p>
        </div>
        <Link href={`/company/${companyId}/settings`}>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage Integrations
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{healthPercentage}%</div>
              <Shield className={`w-5 h-5 ${healthPercentage >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <Progress value={healthPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{connectedIntegrations.length}</div>
              <Plug className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {integrations.length} total configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Checks Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">{monitoringStats.passed}</div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              of {monitoringStats.total} total checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-red-600">
                {monitoringStats.failed + monitoringStats.warnings}
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {monitoringStats.failed} critical, {monitoringStats.warnings} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="checks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="checks">Recent Checks</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Recent Checks Tab */}
        <TabsContent value="checks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Monitoring Checks
                  </CardTitle>
                  <CardDescription>
                    {lastCheckTime 
                      ? `Last checked ${lastCheckTime.toLocaleString()}`
                      : 'No checks run yet'
                    }
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleRunChecks} 
                  disabled={isRunningChecks || connectedIntegrations.length === 0}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningChecks ? 'animate-spin' : ''}`} />
                  {isRunningChecks ? 'Running...' : 'Run Checks Now'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentChecks.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No monitoring checks yet</h3>
                  <p className="text-gray-600 mb-4">
                    {connectedIntegrations.length === 0 
                      ? 'Connect integrations to enable automated monitoring'
                      : 'Click "Run Checks Now" to start monitoring your controls'
                    }
                  </p>
                  {connectedIntegrations.length === 0 ? (
                    <Link href={`/company/${companyId}/settings`}>
                      <Button>
                        Connect Integrations
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={handleRunChecks} disabled={isRunningChecks}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRunningChecks ? 'animate-spin' : ''}`} />
                      Run First Check
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentChecks.map((check) => (
                    <div 
                      key={check.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {check.status === 'pass' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : check.status === 'fail' ? (
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{check.controlId}</p>
                          <p className="text-sm opacity-80">{check.checkType}</p>
                          {check.details && typeof check.details === 'object' && check.details.message && (
                            <p className="text-sm mt-1 opacity-70">{check.details.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          check.status === 'pass' ? 'default' : 
                          check.status === 'fail' ? 'destructive' : 'outline'
                        }>
                          {check.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(check.checkedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-purple-600" />
                Connected Integrations
              </CardTitle>
              <CardDescription>
                Integrations providing automated compliance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <div className="text-center py-12">
                  <Plug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
                  <p className="text-gray-600 mb-4">
                    Connect your systems to enable automated monitoring
                  </p>
                  <Link href={`/company/${companyId}/settings`}>
                    <Button>
                      Configure Integrations
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold capitalize">
                            {integration.integrationType.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {integration.status === 'connected' 
                              ? 'Actively monitoring' 
                              : 'Connection issue'
                            }
                          </p>
                        </div>
                        <Badge variant={integration.status === 'connected' ? 'default' : 'destructive'}>
                          {integration.status}
                        </Badge>
                      </div>
                      {integration.lastSyncAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Monitoring Schedule
              </CardTitle>
              <CardDescription>
                Automated checks run on a regular schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Daily Sync (9:00 AM)</h4>
                    <p className="text-sm text-gray-600">
                      Syncs all connected integrations and collects fresh evidence for approved controls.
                    </p>
                    <Badge variant="outline" className="mt-2">Active</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Weekly Evidence Renewal (Sundays)</h4>
                    <p className="text-sm text-gray-600">
                      Refreshes all evidence to ensure compliance documentation stays current.
                    </p>
                    <Badge variant="outline" className="mt-2">Active</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                  <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Real-Time Alerts</h4>
                    <p className="text-sm text-gray-600">
                      Get notified immediately when monitoring checks detect compliance issues.
                    </p>
                    <Badge variant="outline" className="mt-2">Coming Soon</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Control Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Control Coverage
          </CardTitle>
          <CardDescription>
            Compliance controls being monitored
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{controlStats.total}</div>
              <p className="text-sm text-gray-600">Total Controls</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{controlStats.approved}</div>
              <p className="text-sm text-gray-600">Approved & Monitored</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{controlStats.in_progress}</div>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

