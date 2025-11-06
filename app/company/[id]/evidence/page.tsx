import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies, evidence as evidenceTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get all evidence
  const allEvidence = await db
    .select()
    .from(evidenceTable)
    .where(eq(evidenceTable.companyId, id))
    .orderBy(desc(evidenceTable.uploadedAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evidence Management</h1>
        <p className="text-gray-600 mt-2">
          All evidence uploaded for {company.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Evidence</p>
                <p className="text-3xl font-bold">{allEvidence.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {allEvidence.filter(e => e.aiReviewStatus === 'approved').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {allEvidence.filter(e => e.aiReviewStatus === 'needs_rework').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence List */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Files</CardTitle>
          <CardDescription>All uploaded evidence organized by control</CardDescription>
        </CardHeader>
        <CardContent>
          {allEvidence.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No evidence uploaded yet</h3>
              <p className="text-gray-600 mb-4">Start uploading evidence through the compliance wizard</p>
              <Link href={`/company/${id}/wizard`}>
                <Button>Go to Wizard</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {allEvidence.map((evidence) => (
                <div key={evidence.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{evidence.fileName}</h4>
                        <Badge variant="outline">{evidence.controlId}</Badge>
                        {evidence.aiReviewStatus === 'approved' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {evidence.aiReviewStatus === 'needs_rework' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Needs Review
                          </Badge>
                        )}
                      </div>
                      {evidence.aiFeedback && (
                        <p className="text-sm text-gray-600">{evidence.aiFeedback}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evidence.uploadedAt).toLocaleDateString()}
                        </span>
                        {evidence.fileSize && (
                          <span>{(evidence.fileSize / 1024).toFixed(2)} KB</span>
                        )}
                        {evidence.aiConfidence && (
                          <span>AI Confidence: {evidence.aiConfidence}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

