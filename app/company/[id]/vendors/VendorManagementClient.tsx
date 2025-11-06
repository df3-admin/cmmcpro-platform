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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Mail,
  Calendar,
  Shield,
  FileCheck,
  Trash2,
  Edit,
  Send
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  contactEmail?: string | null;
  riskScore?: number | null;
  assessmentStatus: string;
  hasAccess: boolean;
  accessDetails?: string | null;
  contractStart?: Date | null;
  contractEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  companyId: string;
  companyName: string;
  vendors: Vendor[];
}

const SECURITY_QUESTIONNAIRE = [
  { id: 'soc2', question: 'Does your organization have SOC 2 Type II certification?', category: 'Compliance' },
  { id: 'encryption', question: 'Do you encrypt data at rest and in transit?', category: 'Data Security' },
  { id: 'mfa', question: 'Is multi-factor authentication required for all users?', category: 'Access Control' },
  { id: 'incident', question: 'Do you have a documented incident response plan?', category: 'Incident Response' },
  { id: 'backup', question: 'Are regular backups performed and tested?', category: 'Business Continuity' },
  { id: 'training', question: 'Do employees receive security awareness training?', category: 'Personnel' },
  { id: 'audit', question: 'Are access logs maintained and regularly reviewed?', category: 'Audit' },
  { id: 'vulnerability', question: 'Do you perform regular vulnerability assessments?', category: 'Risk Management' },
  { id: 'access', question: 'Is access to data based on least privilege principle?', category: 'Access Control' },
  { id: 'contract', question: 'Are security requirements included in contracts?', category: 'Compliance' },
];

export default function VendorManagementClient({
  companyId,
  companyName,
  vendors: initialVendors,
}: Props) {
  const [vendors, setVendors] = useState(initialVendors);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssessDialog, setShowAssessDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contactEmail: '',
    hasAccess: false,
    accessDetails: '',
    contractStart: '',
    contractEnd: '',
  });
  const [assessmentResponses, setAssessmentResponses] = useState<Record<string, 'yes' | 'no' | 'partial' | ''>>({});

  const handleAddVendor = async () => {
    if (!newVendor.name) {
      toast.error('Vendor name is required');
      return;
    }

    try {
      const response = await fetch('/api/vendors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          ...newVendor,
          contractStart: newVendor.contractStart || null,
          contractEnd: newVendor.contractEnd || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add vendor');

      const { vendor } = await response.json();
      
      setVendors([vendor, ...vendors]);
      setShowAddDialog(false);
      setNewVendor({
        name: '',
        contactEmail: '',
        hasAccess: false,
        accessDetails: '',
        contractStart: '',
        contractEnd: '',
      });
      toast.success('Vendor added successfully!');
    } catch (error) {
      toast.error('Failed to add vendor');
      console.error(error);
    }
  };

  const handleStartAssessment = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setAssessmentResponses({});
    setShowAssessDialog(true);
  };

  const handleSubmitAssessment = async () => {
    if (!selectedVendor) return;

    const answeredCount = Object.keys(assessmentResponses).length;
    if (answeredCount < SECURITY_QUESTIONNAIRE.length) {
      toast.error('Please answer all questions');
      return;
    }

    // Calculate risk score (0-100)
    const yesCount = Object.values(assessmentResponses).filter(r => r === 'yes').length;
    const partialCount = Object.values(assessmentResponses).filter(r => r === 'partial').length;
    const noCount = Object.values(assessmentResponses).filter(r => r === 'no').length;
    
    const riskScore = 100 - Math.round(
      ((yesCount * 100) + (partialCount * 50)) / SECURITY_QUESTIONNAIRE.length
    );

    try {
      const response = await fetch(`/api/vendors/${selectedVendor.id}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: assessmentResponses,
          riskScore,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      // Update vendor in list
      setVendors(vendors.map(v => 
        v.id === selectedVendor.id 
          ? { ...v, riskScore, assessmentStatus: 'completed' }
          : v
      ));

      setShowAssessDialog(false);
      toast.success('Assessment completed!');
    } catch (error) {
      toast.error('Failed to submit assessment');
      console.error(error);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vendor');

      setVendors(vendors.filter(v => v.id !== vendorId));
      toast.success('Vendor deleted');
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  const getRiskBadge = (riskScore?: number | null) => {
    if (!riskScore) return <Badge variant="outline">Not Assessed</Badge>;
    
    if (riskScore > 70) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore > 40) return <Badge className="bg-orange-600">Medium Risk</Badge>;
    if (riskScore > 20) return <Badge className="bg-yellow-600">Low Risk</Badge>;
    return <Badge className="bg-green-600">Minimal Risk</Badge>;
  };

  const highRiskVendors = vendors.filter(v => v.riskScore && v.riskScore > 70).length;
  const assessedVendors = vendors.filter(v => v.riskScore).length;
  const vendorsWithAccess = vendors.filter(v => v.hasAccess).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Manage third-party vendor relationships and security assessments
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{vendors.length}</div>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{assessedVendors}</div>
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vendors.length - assessedVendors} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-red-600">{highRiskVendors}</div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">System Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{vendorsWithAccess}</div>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Have access to systems
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <CardDescription>
            All registered vendors and their risk assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors yet</h3>
              <p className="text-gray-600 mb-4">
                Add vendors to track third-party security risks
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Vendor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{vendor.name}</h4>
                        {getRiskBadge(vendor.riskScore)}
                        {vendor.hasAccess && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Has Access
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {vendor.contactEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {vendor.contactEmail}
                          </div>
                        )}
                        {vendor.contractEnd && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Contract ends {new Date(vendor.contractEnd).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {vendor.riskScore !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Risk Score</span>
                            <span className="font-semibold">{vendor.riskScore}/100</span>
                          </div>
                          <Progress value={100 - vendor.riskScore} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!vendor.riskScore && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartAssessment(vendor)}
                          className="gap-1"
                        >
                          <FileCheck className="w-4 h-4" />
                          Assess
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteVendor(vendor.id)}
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

      {/* Add Vendor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Add a vendor to your risk management inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                placeholder="e.g., Acme Cloud Services"
              />
            </div>

            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={newVendor.contactEmail}
                onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                placeholder="security@vendor.com"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasAccess"
                checked={newVendor.hasAccess}
                onChange={(e) => setNewVendor({ ...newVendor, hasAccess: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="hasAccess" className="cursor-pointer">
                This vendor has access to our systems/data
              </Label>
            </div>

            {newVendor.hasAccess && (
              <div>
                <Label htmlFor="accessDetails">Access Details</Label>
                <Textarea
                  id="accessDetails"
                  value={newVendor.accessDetails}
                  onChange={(e) => setNewVendor({ ...newVendor, accessDetails: e.target.value })}
                  placeholder="Describe what systems or data this vendor can access..."
                  rows={3}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractStart">Contract Start</Label>
                <Input
                  id="contractStart"
                  type="date"
                  value={newVendor.contractStart}
                  onChange={(e) => setNewVendor({ ...newVendor, contractStart: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contractEnd">Contract End</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={newVendor.contractEnd}
                  onChange={(e) => setNewVendor({ ...newVendor, contractEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVendor} disabled={!newVendor.name}>
                Add Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={showAssessDialog} onOpenChange={setShowAssessDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Security Assessment: {selectedVendor?.name}</DialogTitle>
            <DialogDescription>
              Complete the security questionnaire to assess vendor risk
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {SECURITY_QUESTIONNAIRE.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <div className="mb-2">
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                  <p className="font-medium">{item.question}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={assessmentResponses[item.id] === 'yes' ? 'default' : 'outline'}
                    onClick={() => setAssessmentResponses({ ...assessmentResponses, [item.id]: 'yes' })}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={assessmentResponses[item.id] === 'partial' ? 'default' : 'outline'}
                    onClick={() => setAssessmentResponses({ ...assessmentResponses, [item.id]: 'partial' })}
                    className="flex-1"
                  >
                    Partial
                  </Button>
                  <Button
                    size="sm"
                    variant={assessmentResponses[item.id] === 'no' ? 'destructive' : 'outline'}
                    onClick={() => setAssessmentResponses({ ...assessmentResponses, [item.id]: 'no' })}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssessDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAssessment}
                disabled={Object.keys(assessmentResponses).length < SECURITY_QUESTIONNAIRE.length}
              >
                Submit Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

