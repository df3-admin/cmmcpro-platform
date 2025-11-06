import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { evidence, controlProgress, companies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { geminiService } from '@/lib/ai/gemini';
import { getControlById } from '@/lib/cmmc/controls';
import { syncUser } from '@/lib/clerk/sync-user';

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await syncUser();
    if (!user) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;
    const controlId = formData.get('controlId') as string;

    if (!file || !companyId || !controlId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get company to determine level
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const control = getControlById(controlId, company.targetLevel as 1 | 2);
    
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    // Upload file to Vercel Blob (or store locally if blob token not configured)
    let fileUrl: string;
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`${companyId}/${controlId}/${file.name}`, file, {
        access: 'public',
      });
      fileUrl = blob.url;
    } else {
      // Fallback: store file reference (in production, use proper storage)
      fileUrl = `/uploads/${companyId}/${controlId}/${file.name}`;
    }

    // Get AI validation
    const validation = await geminiService.validateEvidence(
      control.id,
      control.title,
      control.practice,
      `File type: ${file.type}, Size: ${file.size} bytes`,
      file.name
    );

    // Save evidence to database
    const [newEvidence] = await db
      .insert(evidence)
      .values({
        companyId,
        controlId,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        uploaderId: user.id,
        aiReviewStatus: validation.valid ? 'approved' : 'needs_rework',
        aiFeedback: validation.feedback,
        aiConfidence: validation.confidence,
      })
      .returning();

    // Update control progress
    const [currentProgress] = await db
      .select()
      .from(controlProgress)
      .where(
        and(
          eq(controlProgress.companyId, companyId),
          eq(controlProgress.controlId, controlId)
        )
      )
      .limit(1);

    const newEvidenceCount = (currentProgress?.evidenceCount || 0) + 1;
    const newStatus = validation.valid && validation.confidence >= 80 
      ? 'approved' 
      : 'evidence_uploaded';

    await db
      .update(controlProgress)
      .set({
        status: newStatus,
        evidenceCount: newEvidenceCount,
        completionPercentage: validation.valid && validation.confidence >= 80 ? 100 : 75,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(controlProgress.companyId, companyId),
          eq(controlProgress.controlId, controlId)
        )
      );

    return NextResponse.json({ 
      success: true,
      evidence: newEvidence,
      validation,
    });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

