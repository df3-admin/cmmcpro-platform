'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  handlesCUI: boolean;
  dodContracts: boolean;
  currentSecurityLevel: string;
  targetLevel: 1 | 2 | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    companySize: '',
    handlesCUI: false,
    dodContracts: false,
    currentSecurityLevel: '',
    targetLevel: null,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const getRecommendedLevel = (): 1 | 2 => {
    // Level recommendation algorithm
    if (data.dodContracts && data.handlesCUI) {
      return 2; // DoD contracts with CUI = Level 2
    }
    if (data.handlesCUI) {
      return 2; // Handling CUI = Level 2
    }
    return 1; // Basic compliance = Level 1
  };

  const handleNext = () => {
    if (step === 4) {
      // Set recommended level
      const recommended = getRecommendedLevel();
      setData({ ...data, targetLevel: recommended });
    }
    setStep((step + 1) as Step);
  };

  const handleBack = () => {
    setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!data.targetLevel) {
      toast.error('Please select a target level');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create company');

      const result = await response.json();
      toast.success('Company created successfully!');
      router.push(`/company/${result.companyId}/wizard`);
    } catch (error) {
      toast.error('Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to CMMCPro</CardTitle>
          <CardDescription>
            Let's get your company set up for CMMC compliance
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-600 mt-2">Step {step} of {totalSteps}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Company Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={data.industry} onValueChange={(value) => setData({ ...data, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense_contractor">Defense Contractor</SelectItem>
                    <SelectItem value="it_services">IT Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={data.companySize} onValueChange={(value) => setData({ ...data, companySize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1-50 employees)</SelectItem>
                    <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                    <SelectItem value="large">Large (251-1000 employees)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full"
                disabled={!data.companyName || !data.industry || !data.companySize}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: DoD Contracts */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">DoD Contract Information</h3>
              <p className="text-sm text-gray-600">
                This helps us recommend the right CMMC level for your business.
              </p>
              <div className="space-y-4">
                <Label>Do you have or plan to have DoD contracts?</Label>
                <RadioGroup
                  value={data.dodContracts ? 'yes' : 'no'}
                  onValueChange={(value) => setData({ ...data, dodContracts: value === 'yes' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="dod-yes" />
                    <Label htmlFor="dod-yes" className="font-normal cursor-pointer">
                      Yes, we have or plan to have DoD contracts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="dod-no" />
                    <Label htmlFor="dod-no" className="font-normal cursor-pointer">
                      No, we don't have DoD contracts
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: CUI Handling */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Controlled Unclassified Information (CUI)</h3>
              <p className="text-sm text-gray-600">
                CUI is information that requires safeguarding or dissemination controls.
              </p>
              <div className="space-y-4">
                <Label>Does your company handle CUI?</Label>
                <RadioGroup
                  value={data.handlesCUI ? 'yes' : 'no'}
                  onValueChange={(value) => setData({ ...data, handlesCUI: value === 'yes' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="cui-yes" />
                    <Label htmlFor="cui-yes" className="font-normal cursor-pointer">
                      Yes, we handle CUI
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="cui-no" />
                    <Label htmlFor="cui-no" className="font-normal cursor-pointer">
                      No, we don't handle CUI
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Security Maturity */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Security Posture</h3>
              <p className="text-sm text-gray-600">
                Help us understand your current security maturity.
              </p>
              <div className="space-y-2">
                <Label>What best describes your current security level?</Label>
                <Select value={data.currentSecurityLevel} onValueChange={(value) => setData({ ...data, currentSecurityLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Passwords and antivirus</SelectItem>
                    <SelectItem value="moderate">Moderate - Some security policies and tools</SelectItem>
                    <SelectItem value="advanced">Advanced - Comprehensive security program</SelectItem>
                    <SelectItem value="expert">Expert - Mature security operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={!data.currentSecurityLevel}>
                  Get Recommendation
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Level Recommendation */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">CMMC Level Recommendation</h3>
              
              {/* Recommended Level */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Recommended: CMMC Level {data.targetLevel}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {data.targetLevel === 2
                          ? 'Based on your DoD contracts and CUI handling, we recommend Level 2 (Advanced). This includes 110 NIST 800-171 controls.'
                          : 'Based on your requirements, we recommend Level 1 (Foundational). This includes 17 basic cybersecurity controls.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level Selection */}
              <div className="space-y-4">
                <Label>Choose your target CMMC level:</Label>
                <RadioGroup
                  value={data.targetLevel?.toString() || ''}
                  onValueChange={(value) => setData({ ...data, targetLevel: parseInt(value) as 1 | 2 })}
                >
                  <Card className={`cursor-pointer ${data.targetLevel === 1 ? 'border-blue-500 border-2' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="level-1" />
                        <Label htmlFor="level-1" className="font-normal cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold">Level 1 - Foundational</div>
                            <div className="text-sm text-gray-600">17 basic controls • Best for basic FCI protection</div>
                          </div>
                        </Label>
                        {getRecommendedLevel() === 1 && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer ${data.targetLevel === 2 ? 'border-blue-500 border-2' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="level-2" />
                        <Label htmlFor="level-2" className="font-normal cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold">Level 2 - Advanced</div>
                            <div className="text-sm text-gray-600">110 NIST 800-171 controls • Required for CUI</div>
                          </div>
                        </Label>
                        {getRecommendedLevel() === 2 && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> You can always start with a lower level and upgrade later. 
                  However, DoD contracts requiring CUI protection must achieve Level 2.
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={!data.targetLevel || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Start Compliance Journey'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

