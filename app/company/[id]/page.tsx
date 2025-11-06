import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies, controlProgress, complianceScores } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Trophy, Target, Clock, CheckCircle2 } from 'lucide-react';

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600 mt-2">
          CMMC Level {company.targetLevel} Compliance Dashboard
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-600" />
            Compliance Progress
          </CardTitle>
          <CardDescription>Your journey to CMMC certification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{stats.not_started}</div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
          </div>

          {completionPercentage === 100 ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">🎉 Ready for CB Audit!</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Congratulations! You've completed all controls. You can now contact a Certified Assessor.
              </p>
            </div>
          ) : (
            <Link href={`/company/${id}/wizard`}>
              <Button className="w-full gap-2 mt-4" size="lg">
                {stats.approved === 0 ? 'Start Compliance Wizard' : 'Continue Compliance Wizard'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href={`/company/${id}/wizard`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Controls</h3>
              <p className="text-sm text-gray-600 mt-1">Work on compliance controls</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/evidence`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold">Evidence</h3>
              <p className="text-sm text-gray-600 mt-1">Manage uploaded evidence</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/monitoring`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <Clock className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Monitoring</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time compliance monitoring</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/risk`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold">Risk Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">Risk analysis & scoring</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/policies`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold">Policies</h3>
              <p className="text-sm text-gray-600 mt-1">Manage security policies</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/vendors`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="font-semibold">Vendors</h3>
              <p className="text-sm text-gray-600 mt-1">Vendor risk management</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/training`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <svg className="w-8 h-8 text-teal-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-semibold">Training</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule training sessions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/company/${id}/audit-prep`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <Trophy className="w-8 h-8 text-yellow-600 mb-2" />
              <h3 className="font-semibold">Audit Prep</h3>
              <p className="text-sm text-gray-600 mt-1">CB audit preparation</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

