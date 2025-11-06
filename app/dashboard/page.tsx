import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { userCompanies, companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Get user's companies
  const userComps = await db
    .select({
      company: companies,
    })
    .from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .where(eq(userCompanies.userId, session.user.id));

  // If no companies, redirect to onboarding
  if (userComps.length === 0) {
    redirect('/onboarding');
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Companies</h1>
          <p className="text-gray-600 mt-2">
            Manage CMMC compliance for your organizations
          </p>
        </div>
        <Link href="/onboarding">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Company
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userComps.map(({ company }) => (
          <Link key={company.id} href={`/company/${company.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>
                  CMMC Level {company.targetLevel} • {company.industry || 'Not specified'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Company Size:</span> {company.companySize || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    {company.onboardingComplete ? (
                      <span className="text-green-600 font-medium">✓ Onboarding Complete</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">⚠ Onboarding Incomplete</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}


