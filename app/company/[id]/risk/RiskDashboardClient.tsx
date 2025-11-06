'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Shield, 
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface ControlRisk {
  controlId: string;
  controlName: string;
  domain: string;
  status: string;
  evidenceCount: number;
  riskScore: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isCritical: boolean;
  lastChecked?: Date;
  monitoringStatus?: string;
}

interface DomainRisk {
  domain: string;
  controls: ControlRisk[];
  avgRiskScore: number;
}

interface Props {
  companyId: string;
  companyName: string;
  overallRiskScore: number;
  riskBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  controlRisks: ControlRisk[];
  domainRisks: DomainRisk[];
  targetLevel: number;
}

export default function RiskDashboardClient({
  companyId,
  companyName,
  overallRiskScore,
  riskBreakdown,
  controlRisks,
  domainRisks,
  targetLevel,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score > 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score > 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'outline',
      low: 'secondary',
    };
    return variants[severity as keyof typeof variants] || 'secondary';
  };

  const filteredControls = selectedFilter === 'all' 
    ? controlRisks 
    : controlRisks.filter(c => c.severity === selectedFilter);

  const riskLevel = overallRiskScore > 70 ? 'High Risk' : 
                     overallRiskScore > 40 ? 'Moderate Risk' : 
                     overallRiskScore > 20 ? 'Low Risk' : 'Minimal Risk';

  const riskTrend = 'stable' as 'stable' | 'improving' | 'worsening'; // In a real app, calculate from historical data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive risk analysis for {companyName}
        </p>
      </div>

      {/* Overall Risk Score */}
      <Card className={`border-2 ${getRiskColor(overallRiskScore)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center"
                     style={{ 
                       borderColor: overallRiskScore > 70 ? '#dc2626' : 
                                   overallRiskScore > 40 ? '#f97316' : 
                                   overallRiskScore > 20 ? '#eab308' : '#16a34a' 
                     }}>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{overallRiskScore}</div>
                    <div className="text-xs text-gray-600">Risk Score</div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{riskLevel}</h2>
                <p className="text-gray-600 mb-3">
                  Overall organizational risk based on control compliance
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {riskTrend === 'improving' ? (
                      <><TrendingDown className="w-3 h-3 mr-1" /> Improving</>
                    ) : riskTrend === 'worsening' ? (
                      <><TrendingUp className="w-3 h-3 mr-1" /> Worsening</>
                    ) : (
                      <>Stable</>
                    )}
                  </Badge>
                  <Badge>CMMC Level {targetLevel}</Badge>
                </div>
              </div>
            </div>
            <Shield className="w-24 h-24 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900">Critical Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-red-600">{riskBreakdown.critical}</div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-red-700 mt-2">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-orange-600">{riskBreakdown.high}</div>
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 mt-2">Action needed soon</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-900">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-yellow-600">{riskBreakdown.medium}</div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-700 mt-2">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-green-600">{riskBreakdown.low}</div>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 mt-2">Well controlled</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix & Domain Analysis */}
      <Tabs defaultValue="controls" className="space-y-6">
        <TabsList>
          <TabsTrigger value="controls">Control Risks</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Control Risks Tab */}
        <TabsContent value="controls" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Control-Level Risks</CardTitle>
                  <CardDescription>
                    Detailed risk assessment for each control
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedFilter === 'critical' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedFilter('critical')}
                  >
                    Critical
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedFilter === 'high' ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter('high')}
                  >
                    High
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredControls.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {selectedFilter !== 'all' && selectedFilter} risks found
                    </h3>
                    <p className="text-gray-600">
                      {selectedFilter === 'all' 
                        ? 'Complete controls to see risk assessment'
                        : `No controls currently have ${selectedFilter} risk level`
                      }
                    </p>
                  </div>
                ) : (
                  filteredControls.map((control) => (
                    <div 
                      key={control.controlId}
                      className={`p-4 border-2 rounded-lg ${getRiskColor(control.riskScore)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{control.controlId}</h4>
                            <Badge variant={getSeverityBadge(control.severity)}>
                              {control.severity.toUpperCase()}
                            </Badge>
                            {control.isCritical && (
                              <Badge variant="destructive">Critical Control</Badge>
                            )}
                          </div>
                          <p className="text-sm opacity-90 mb-2">{control.controlName}</p>
                          <div className="flex items-center gap-4 text-xs opacity-70">
                            <span>Domain: {control.domain}</span>
                            <span>•</span>
                            <span>Status: {control.status}</span>
                            <span>•</span>
                            <span>Evidence: {control.evidenceCount} files</span>
                            {control.monitoringStatus && (
                              <>
                                <span>•</span>
                                <span>Monitor: {control.monitoringStatus}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold">{control.riskScore}</div>
                          <div className="text-xs opacity-60">Risk Score</div>
                          <Progress 
                            value={100 - control.riskScore} 
                            className="h-2 mt-2 w-24" 
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Analysis Tab */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Domain-Level Risk Analysis
              </CardTitle>
              <CardDescription>
                Risk aggregated by CMMC domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domainRisks.map((domain) => (
                  <div key={domain.domain} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{domain.domain}</h4>
                        <p className="text-sm text-gray-600">
                          {domain.controls.length} controls in this domain
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          domain.avgRiskScore > 70 ? 'text-red-600' :
                          domain.avgRiskScore > 40 ? 'text-orange-600' :
                          domain.avgRiskScore > 20 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {domain.avgRiskScore}
                        </div>
                        <div className="text-xs text-gray-600">Avg Risk</div>
                      </div>
                    </div>
                    <Progress 
                      value={100 - domain.avgRiskScore} 
                      className="h-3"
                    />
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {domain.controls.slice(0, 3).map(control => (
                        <Badge key={control.controlId} variant="outline" className="text-xs">
                          {control.controlId}
                        </Badge>
                      ))}
                      {domain.controls.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{domain.controls.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trends</CardTitle>
              <CardDescription>
                Historical risk analysis and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Trend Analysis Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  Historical risk trends will be available after accumulating data over time
                </p>
                <Badge variant="outline">Feature In Development</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {(riskBreakdown.critical > 0 || riskBreakdown.high > 0) && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="w-5 h-5" />
              Risk Mitigation Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-900">
            <ul className="space-y-2 list-disc list-inside">
              {riskBreakdown.critical > 0 && (
                <li>
                  <strong>{riskBreakdown.critical} critical risk controls</strong> require immediate attention
                </li>
              )}
              {riskBreakdown.high > 0 && (
                <li>
                  <strong>{riskBreakdown.high} high risk controls</strong> should be addressed within 30 days
                </li>
              )}
              <li>
                Connect more integrations to enable automated monitoring and reduce risk
              </li>
              <li>
                Upload additional evidence for high-risk controls to demonstrate compliance
              </li>
              <li>
                Consider scheduling training sessions for controls with compliance gaps
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

