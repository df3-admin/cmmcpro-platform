'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Copy,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  version: string;
  status: string;
  controlIds: any;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  creatorName?: string | null;
}

interface Props {
  companyId: string;
  companyName: string;
  policies: Policy[];
  targetLevel: number;
}

const POLICY_TEMPLATES = [
  {
    id: 'access_control',
    name: 'Access Control Policy',
    description: 'Defines user access management and authentication requirements',
    controls: ['AC.1.001', 'AC.1.002', 'AC.1.003', 'AC.2.007', 'AC.2.008'],
    category: 'Security',
  },
  {
    id: 'incident_response',
    name: 'Incident Response Policy',
    description: 'Procedures for detecting, responding to, and recovering from security incidents',
    controls: ['IR.2.092', 'IR.2.093', 'IR.2.094', 'IR.2.095', 'IR.2.096'],
    category: 'Operations',
  },
  {
    id: 'data_protection',
    name: 'Data Protection Policy',
    description: 'Guidelines for protecting sensitive data and CUI',
    controls: ['MP.2.120', 'MP.2.121', 'SC.2.179', 'SC.2.180', 'SC.2.181'],
    category: 'Security',
  },
  {
    id: 'backup_recovery',
    name: 'Backup and Recovery Policy',
    description: 'Procedures for data backup and disaster recovery',
    controls: ['CP.2.055', 'CP.2.056', 'CP.2.057'],
    category: 'Operations',
  },
  {
    id: 'vulnerability_management',
    name: 'Vulnerability Management Policy',
    description: 'Process for identifying and remediating security vulnerabilities',
    controls: ['RA.2.138', 'RA.2.139', 'RA.2.141', 'SI.2.214', 'SI.2.216'],
    category: 'Security',
  },
  {
    id: 'personnel_security',
    name: 'Personnel Security Policy',
    description: 'Background checks, training, and security awareness requirements',
    controls: ['PS.2.127', 'PS.2.128', 'PS.2.129', 'PS.2.130'],
    category: 'Human Resources',
  },
  {
    id: 'media_protection',
    name: 'Media Protection Policy',
    description: 'Protection and disposal of physical and digital media',
    controls: ['MP.1.118', 'MP.1.119', 'MP.2.120', 'MP.2.121'],
    category: 'Security',
  },
  {
    id: 'change_management',
    name: 'Change Management Policy',
    description: 'Process for managing system and configuration changes',
    controls: ['CM.2.061', 'CM.2.062', 'CM.2.063', 'CM.2.064'],
    category: 'Operations',
  },
];

export default function PolicyManagementClient({
  companyId,
  companyName,
  policies: initialPolicies,
  targetLevel,
}: Props) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    content: '',
    controlIds: [] as string[],
  });

  const handleCreateFromTemplate = (template: any) => {
    setSelectedTemplate(template);
    setNewPolicy({
      title: template.name,
      content: '',
      controlIds: template.controls,
    });
    setShowCreateDialog(true);
  };

  const handleGenerateWithAI = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/policies/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyName,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          controls: selectedTemplate.controls,
          targetLevel,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate policy');

      const { content } = await response.json();
      
      setNewPolicy(prev => ({ ...prev, content }));
      toast.success('Policy generated with AI!');
    } catch (error) {
      toast.error('Failed to generate policy');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePolicy = async (status: 'draft' | 'approved') => {
    if (!newPolicy.title || !newPolicy.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/policies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          ...newPolicy,
          status,
        }),
      });

      if (!response.ok) throw new Error('Failed to create policy');

      const { policy } = await response.json();
      
      setPolicies([policy, ...policies]);
      setShowCreateDialog(false);
      setNewPolicy({ title: '', content: '', controlIds: [] });
      setSelectedTemplate(null);
      toast.success(`Policy ${status === 'draft' ? 'saved as draft' : 'created and approved'}!`);
    } catch (error) {
      toast.error('Failed to save policy');
      console.error(error);
    }
  };

  const handleViewPolicy = async (policy: Policy) => {
    setSelectedPolicy(policy);
    
    // Fetch full policy content
    try {
      const response = await fetch(`/api/policies/${policy.id}`);
      if (!response.ok) throw new Error('Failed to fetch policy');
      
      const data = await response.json();
      setSelectedPolicy(data.policy);
      setShowViewDialog(true);
    } catch (error) {
      toast.error('Failed to load policy');
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete policy');

      setPolicies(policies.filter(p => p.id !== policyId));
      toast.success('Policy deleted');
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="outline">Pending Approval</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage compliance policies for {companyName}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{policies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {policies.filter(p => p.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {policies.filter(p => p.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {POLICY_TEMPLATES.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* My Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policy Documents</CardTitle>
              <CardDescription>
                All policy documents for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No policies yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create policies from templates or start from scratch
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{policy.title}</h4>
                            {getStatusBadge(policy.status)}
                            <Badge variant="outline">{policy.version}</Badge>
                          </div>
                          {policy.controlIds && Array.isArray(policy.controlIds) && policy.controlIds.length > 0 && (
                            <div className="flex gap-1 flex-wrap my-2">
                              {policy.controlIds.slice(0, 5).map((controlId: string) => (
                                <Badge key={controlId} variant="secondary" className="text-xs">
                                  {controlId}
                                </Badge>
                              ))}
                              {policy.controlIds.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{policy.controlIds.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 mt-2">
                            Created {new Date(policy.createdAt).toLocaleDateString()} 
                            {policy.creatorName && ` by ${policy.creatorName}`}
                            {policy.approvedAt && ` • Approved ${new Date(policy.approvedAt).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPolicy(policy)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                Policy Templates
              </CardTitle>
              <CardDescription>
                Pre-built templates to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POLICY_TEMPLATES.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-3">
                      {template.controls.slice(0, 3).map((controlId) => (
                        <Badge key={controlId} variant="secondary" className="text-xs">
                          {controlId}
                        </Badge>
                      ))}
                      {template.controls.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.controls.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => handleCreateFromTemplate(template)}
                    >
                      <Sparkles className="w-3 h-3" />
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Create ${selectedTemplate.name}` : 'Create New Policy'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? 'Use AI to generate a policy based on this template'
                : 'Create a custom policy from scratch'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Policy Title</Label>
              <Input
                id="title"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                placeholder="e.g., Access Control Policy"
              />
            </div>

            {selectedTemplate && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateWithAI} 
                  disabled={isGenerating}
                  className="gap-2"
                  variant="outline"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="content">Policy Content</Label>
              <Textarea
                id="content"
                value={newPolicy.content}
                onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                placeholder="Enter policy content or generate with AI..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSavePolicy('draft')}
                disabled={!newPolicy.title || !newPolicy.content}
              >
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSavePolicy('approved')}
                disabled={!newPolicy.title || !newPolicy.content}
              >
                Create & Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Policy Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPolicy?.title}</DialogTitle>
            <DialogDescription>
              Version {selectedPolicy?.version} • {selectedPolicy?.status}
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
              {(selectedPolicy as any)?.content}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

