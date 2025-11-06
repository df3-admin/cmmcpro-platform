'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  Trophy,
  Target,
  ChevronRight,
  FileCheck,
  Zap
} from 'lucide-react';
import type { CMMCControl } from '@/lib/types/cmmc';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  companyId: string;
  company: any;
  currentControl: CMMCControl;
  currentProgress: any;
  allControls: CMMCControl[];
  progressData: any[];
  overallProgress: number;
}

export default function WizardClient({
  companyId,
  company,
  currentControl,
  currentProgress: initialProgress,
  allControls,
  progressData: initialProgressData,
  overallProgress: initialOverallProgress,
}: Props) {
  const router = useRouter();
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const currentIndex = allControls.findIndex(c => c.id === currentControl.id);
  const hasNext = currentIndex < allControls.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNavigate = (direction: 'next' | 'prev' | 'skip') => {
    let targetIndex = currentIndex;
    
    if (direction === 'next') {
      targetIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      targetIndex = currentIndex - 1;
    } else if (direction === 'skip') {
      // Find next incomplete control
      const nextIncomplete = allControls.findIndex((c, i) => 
        i > currentIndex && !initialProgressData.find(p => p.controlId === c.id && p.status === 'approved')
      );
      targetIndex = nextIncomplete !== -1 ? nextIncomplete : currentIndex + 1;
    }

    if (targetIndex >= 0 && targetIndex < allControls.length) {
      router.push(`/company/${companyId}/wizard?control=${allControls[targetIndex].id}`);
    }
  };

  const handleGetAIHelp = async () => {
    setIsLoadingAI(true);
    setShowAIHelp(true);

    try {
      const response = await fetch('/api/ai/explain-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlId: currentControl.id,
          level: company.targetLevel,
        }),
      });

      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (error) {
      toast.error('Failed to get AI explanation');
      setShowAIHelp(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const isCompleted = initialProgress?.status === 'approved';

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Overall Progress
              </h2>
              <p className="text-sm text-gray-600">
                Control {currentIndex + 1} of {allControls.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-blue-600">
                {initialOverallProgress}%
              </span>
            </div>
          </div>
          <Progress value={initialOverallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Control Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentControl.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{currentControl.id}</Badge>
                    <Badge>{currentControl.domain}</Badge>
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{currentControl.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {currentControl.practice}
                  </CardDescription>
                </div>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Help & Auto-Collect Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGetAIHelp}
                  className="gap-2"
                  disabled={isLoadingAI}
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoadingAI ? 'Getting AI Help...' : 'Get AI Explanation'}
                </Button>
                
                <AutoCollectButton
                  companyId={companyId}
                  controlId={currentControl.id}
                  onCollected={() => {
                    toast.success('Evidence collected automatically!');
                    router.refresh();
                  }}
                />
              </div>

              {/* AI Explanation */}
              {showAIHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-2">AI Assistant</h4>
                          <p className="text-sm text-purple-800 whitespace-pre-wrap">
                            {aiExplanation || 'Generating explanation...'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <Separator />

              {/* Guidance */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Implementation Guidance
                </h3>
                <p className="text-sm text-gray-700">{currentControl.guidance}</p>
              </div>

              {/* Assessment Question */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Assessment Question</h4>
                <p className="text-sm text-blue-800">{currentControl.assessmentQuestion}</p>
              </div>

              {/* Evidence Types */}
              <div>
                <h3 className="font-semibold mb-2">Required Evidence Types</h3>
                <div className="flex flex-wrap gap-2">
                  {currentControl.evidenceTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Examples */}
              {currentControl.examples && currentControl.examples.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Examples</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {currentControl.examples.map((example, i) => (
                      <li key={i} className="text-sm text-gray-700">{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Evidence Upload Section */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  Upload Evidence
                </h3>
                <EvidenceUploadSection
                  companyId={companyId}
                  controlId={currentControl.id}
                  currentProgress={initialProgress}
                  onUploadComplete={() => {
                    toast.success('Evidence uploaded successfully!');
                    router.refresh();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => handleNavigate('prev')}
          disabled={!hasPrev}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleNavigate('skip')}
          >
            Skip for Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={() => handleNavigate('next')}
            disabled={!hasNext}
          >
            Next Control
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Auto-Collect Evidence Button
function AutoCollectButton({
  companyId,
  controlId,
  onCollected,
}: {
  companyId: string;
  controlId: string;
  onCollected: () => void;
}) {
  const [isCollecting, setIsCollecting] = useState(false);

  const handleAutoCollect = async () => {
    setIsCollecting(true);

    try {
      const response = await fetch('/api/integrations/collect-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          controlId,
        }),
      });

      if (!response.ok) throw new Error('Failed to collect evidence');

      const result = await response.json();
      
      if (result.evidenceCount > 0) {
        toast.success(`Collected ${result.evidenceCount} evidence item(s) automatically!`);
        onCollected();
      } else {
        toast.info('No evidence available from connected integrations. Try connecting services in Settings.');
      }
    } catch (error) {
      toast.error('Failed to auto-collect evidence');
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleAutoCollect}
      disabled={isCollecting}
      className="gap-2"
    >
      <Zap className="w-4 h-4" />
      {isCollecting ? 'Collecting...' : 'Auto-Collect Evidence'}
    </Button>
  );
}

// Evidence Upload Component
function EvidenceUploadSection({ 
  companyId, 
  controlId, 
  currentProgress,
  onUploadComplete 
}: { 
  companyId: string; 
  controlId: string; 
  currentProgress: any;
  onUploadComplete: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('companyId', companyId);
      formData.append('controlId', controlId);

      // Upload evidence
      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success('Evidence uploaded and being validated by AI');
      setSelectedFile(null);
      onUploadComplete();
    } catch (error) {
      toast.error('Failed to upload evidence');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${controlId}`}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.json,.xml"
        />
        <label
          htmlFor={`file-upload-${controlId}`}
          className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
        >
          Click to upload
        </label>
        <span className="text-gray-600"> or drag and drop</span>
        <p className="text-sm text-gray-500 mt-2">
          PDF, images, documents up to 10MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-600">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            size="sm"
          >
            {isUploading ? 'Uploading...' : 'Upload & Validate'}
          </Button>
        </div>
      )}

      {currentProgress?.evidenceCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              {currentProgress.evidenceCount} evidence file(s) uploaded
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

