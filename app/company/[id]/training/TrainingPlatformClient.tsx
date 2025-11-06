'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Calendar, 
  Video, 
  Gift, 
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  Mail
} from 'lucide-react';

interface TrainingSession {
  id: string;
  companyId: string;
  userId?: string | null;
  status: string;
  scheduledDate?: Date | null;
  completedDate?: Date | null;
  instructorName?: string | null;
  sessionType: string;
  isFreeSession: boolean;
  meetingUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  companyId: string;
  companyName: string;
  sessions: TrainingSession[];
  memberCount: number;
  hasUsedFreeSession: boolean;
}

const TRAINING_TOPICS = [
  {
    id: 'cmmc_intro',
    name: 'CMMC 2.0 Introduction',
    description: 'Overview of CMMC requirements and framework',
    duration: '60 minutes',
    level: 'Beginner',
  },
  {
    id: 'access_control',
    name: 'Access Control Best Practices',
    description: 'Implementing strong access control policies',
    duration: '90 minutes',
    level: 'Intermediate',
  },
  {
    id: 'incident_response',
    name: 'Incident Response Planning',
    description: 'Creating and testing incident response plans',
    duration: '90 minutes',
    level: 'Intermediate',
  },
  {
    id: 'security_awareness',
    name: 'Security Awareness Training',
    description: 'Employee security awareness and best practices',
    duration: '60 minutes',
    level: 'Beginner',
  },
  {
    id: 'data_protection',
    name: 'Data Protection & Encryption',
    description: 'Protecting CUI and sensitive data',
    duration: '90 minutes',
    level: 'Advanced',
  },
  {
    id: 'audit_prep',
    name: 'CB Audit Preparation',
    description: 'Preparing for your CMMC assessment',
    duration: '120 minutes',
    level: 'Advanced',
  },
];

export default function TrainingPlatformClient({
  companyId,
  companyName,
  sessions: initialSessions,
  memberCount,
  hasUsedFreeSession,
}: Props) {
  const [sessions, setSessions] = useState(initialSessions);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState({
    preferredDate: '',
    preferredTime: '',
    attendeeCount: memberCount.toString(),
    notes: '',
  });

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic(topic);
    setShowScheduleDialog(true);
  };

  const handleScheduleSession = async () => {
    if (!scheduleData.preferredDate || !scheduleData.preferredTime) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledDateTime = new Date(`${scheduleData.preferredDate}T${scheduleData.preferredTime}`);
    
    try {
      const response = await fetch('/api/training/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          topic: selectedTopic?.name,
          scheduledDate: scheduledDateTime,
          attendeeCount: parseInt(scheduleData.attendeeCount),
          notes: scheduleData.notes,
          isFreeSession: !hasUsedFreeSession,
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule session');

      const { session } = await response.json();
      
      setSessions([session, ...sessions]);
      setShowScheduleDialog(false);
      setScheduleData({
        preferredDate: '',
        preferredTime: '',
        attendeeCount: memberCount.toString(),
        notes: '',
      });
      toast.success('Training session scheduled successfully!');
    } catch (error) {
      toast.error('Failed to schedule session');
      console.error(error);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this training session?')) return;

    try {
      const response = await fetch(`/api/training/${sessionId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel session');

      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, status: 'cancelled' } : s
      ));
      toast.success('Session cancelled');
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'scheduled':
        return <Badge>Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Platform</h1>
        <p className="text-gray-600 mt-2">
          Schedule live instructor-led training sessions for {companyName}
        </p>
      </div>

      {/* Free Session Banner */}
      {!hasUsedFreeSession && (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Gift className="w-12 h-12 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Free Training Session Available!
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  Your company is eligible for one complimentary live instructor training session. 
                  Choose any topic below and schedule your free session today!
                </p>
                <Badge className="bg-green-600">1 Free Session Per Year</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{sessions.length}</div>
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">{completedSessions}</div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-blue-600">{scheduledSessions}</div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{memberCount}</div>
              <span className="text-sm text-gray-600">attendees</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Available Training Topics</CardTitle>
          <CardDescription>
            Choose from our expert-led training sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRAINING_TOPICS.map((topic) => (
              <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{topic.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {topic.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{topic.level}</Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => handleTopicSelect(topic)}
                >
                  <Calendar className="w-3 h-3" />
                  Schedule Session
                  {!hasUsedFreeSession && (
                    <Badge className="ml-2 bg-green-600">FREE</Badge>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Training Sessions</CardTitle>
          <CardDescription>
            Scheduled and completed training sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No training sessions yet</h3>
              <p className="text-gray-600 mb-4">
                Schedule your first training session to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Training Session</h4>
                        {getStatusBadge(session.status)}
                        {session.isFreeSession && (
                          <Badge className="bg-green-600 gap-1">
                            <Gift className="w-3 h-3" />
                            Free
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {session.scheduledDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.scheduledDate).toLocaleDateString()} at{' '}
                            {new Date(session.scheduledDate).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                        {session.instructorName && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            Instructor: {session.instructorName}
                          </div>
                        )}
                      </div>

                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                      )}

                      {session.meetingUrl && session.status === 'scheduled' && (
                        <div className="mt-3">
                          <a
                            href={session.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {session.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Info */}
      {hasUsedFreeSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <DollarSign className="w-12 h-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Additional Training Sessions
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  You've used your complimentary training session. Additional sessions are available for purchase.
                  Contact our team for pricing and availability.
                </p>
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Training: {selectedTopic?.name}</DialogTitle>
            <DialogDescription>
              {selectedTopic?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {selectedTopic?.duration}
              </Badge>
              <Badge variant="secondary">{selectedTopic?.level}</Badge>
              {!hasUsedFreeSession && (
                <Badge className="bg-green-600">
                  <Gift className="w-3 h-3 mr-1" />
                  Free Session
                </Badge>
              )}
            </div>

            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={scheduleData.preferredDate}
                onChange={(e) => setScheduleData({ ...scheduleData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Input
                id="preferredTime"
                type="time"
                value={scheduleData.preferredTime}
                onChange={(e) => setScheduleData({ ...scheduleData, preferredTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="attendeeCount">Number of Attendees</Label>
              <Input
                id="attendeeCount"
                type="number"
                value={scheduleData.attendeeCount}
                onChange={(e) => setScheduleData({ ...scheduleData, attendeeCount: e.target.value })}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="Any specific topics or questions you'd like to cover..."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                After scheduling, our team will confirm your session and send you a meeting link. 
                Training sessions are conducted via video conference.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleSession}
                disabled={!scheduleData.preferredDate || !scheduleData.preferredTime}
              >
                Schedule Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

