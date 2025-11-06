import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies, controlProgress, evidence } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ExternalLink, 
  FileCheck,
  ShieldCheck,
  Trophy,
  XCircle
} from 'lucide-react';

export default async function AuditPrepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  if (!company) {
    redirect('/dashboard');
  }

  // Get control progress statistics
  const progressStats = await db
    .select({
      status: controlProgress.status,
      count: sql<number>`count(*)::int`,
    })
    .from(controlProgress)
    .where(eq(controlProgress.companyId, id))
    .groupBy(controlProgress.status);

  const stats = {
    total: progressStats.reduce((sum, stat) => sum + stat.count, 0),
    approved: progressStats.find(s => s.status === 'approved')?.count || 0,
    in_progress: progressStats.find(s => s.status === 'in_progress')?.count || 0,
    not_started: progressStats.find(s => s.status === 'not_started')?.count || 0,
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const isReadyForAudit = completionPercentage === 100;

  // Get evidence count
  const evidenceStats = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(evidence)
    .where(eq(evidence.companyId, id));

  const totalEvidence = evidenceStats[0]?.count || 0;

  // CB Directory (simplified for now)
  const cbDirectory = [
    {
      name: 'Cyber AB',
      website: 'https://cyberab.org',
      description: 'Official CMMC Accreditation Body - Find certified assessors',
    },
    {
      name: 'CMMC-AB Marketplace',
      website: 'https://cmmcmarketplace.com',
      description: 'Directory of Certified Third-Party Assessment Organizations (C3PAOs)',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CB Audit Preparation</h1>
        <p className="text-gray-600 mt-2">
          Prepare for your Certified Assessor (CB) audit
        </p>
      </div>

      {/* Readiness Status */}
      <Card className={isReadyForAudit ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isReadyForAudit ? (
              <>
                <Trophy className="w-6 h-6 text-green-600" />
                <span className="text-green-900">Ready for CB Audit!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <span className="text-yellow-900">Audit Preparation in Progress</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isReadyForAudit 
              ? 'Congratulations! Your compliance is at 100%. You can now schedule your CB audit.'
              : `Complete ${stats.total - stats.approved} more controls to become audit-ready.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Readiness</span>
                <span className="text-sm font-bold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.not_started}</div>
                <div className="text-xs text-gray-600">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Audit Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            Pre-Audit Checklist
          </CardTitle>
          <CardDescription>
            Ensure you've completed all requirements before scheduling your audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ChecklistItem
              checked={completionPercentage === 100}
              text="All controls completed and approved"
            />
            <ChecklistItem
              checked={totalEvidence >= stats.total}
              text={`Evidence uploaded for all controls (${totalEvidence} files)`}
            />
            <ChecklistItem
              checked={false}
              text="System Security Plan (SSP) reviewed and updated"
            />
            <ChecklistItem
              checked={false}
              text="All policies and procedures documented"
            />
            <ChecklistItem
              checked={false}
              text="Team trained on security awareness"
            />
            <ChecklistItem
              checked={false}
              text="Incident response plan tested"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evidence Package */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evidence Package</CardTitle>
            <CardDescription>
              Download all evidence for CB submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/audit/export-matrix" method="POST">
              <input type="hidden" name="companyId" value={id} />
              <Button type="submit" className="w-full gap-2" disabled={!isReadyForAudit}>
                <Download className="w-4 h-4" />
                Download Evidence Package
              </Button>
            </form>
            <p className="text-xs text-gray-600 mt-2">
              Includes all uploaded evidence, compliance matrix, and documentation
            </p>
          </CardContent>
        </Card>

        {/* Compliance Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Matrix</CardTitle>
            <CardDescription>
              Export your compliance status report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/audit/export-matrix" method="POST">
              <input type="hidden" name="companyId" value={id} />
              <Button type="submit" className="w-full gap-2" variant="outline">
                <Download className="w-4 h-4" />
                Export Compliance Matrix (CSV)
              </Button>
            </form>
            <p className="text-xs text-gray-600 mt-2">
              CSV format showing all controls and their status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 100% Pass Guarantee */}
      {isReadyForAudit && (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <ShieldCheck className="w-12 h-12 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  100% First-Time Pass Guarantee
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  You've achieved 100% compliance in CMMCPro. We're confident you'll pass your CB audit on the first attempt. 
                  If you don't, we'll cover the cost of your failed audit.
                </p>
                <Badge variant="default" className="bg-green-600">
                  Guarantee Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CB Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Certified Assessor (CB)</CardTitle>
          <CardDescription>
            Contact an authorized CB to schedule your official CMMC assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cbDirectory.map((cb) => (
              <div key={cb.name} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-semibold">{cb.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{cb.description}</p>
                </div>
                <a 
                  href={cb.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button size="sm" variant="outline" className="gap-2">
                    Visit Site
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Warning */}
      {!isReadyForAudit && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Not Ready for Audit:</strong> Complete all controls before scheduling your CB audit. 
            <Link href={`/company/${id}/wizard`} className="text-blue-600 hover:underline ml-1">
              Continue working on controls →
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ChecklistItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
      )}
      <span className={checked ? 'text-gray-900' : 'text-gray-600'}>{text}</span>
    </div>
  );
}

