import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, templateName, controls, targetLevel } = await request.json();

    if (!genAI) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a comprehensive ${templateName} document for ${companyName}, a company working towards CMMC Level ${targetLevel} certification.

The policy must address the following CMMC controls: ${controls.join(', ')}

The policy should include:
1. Purpose and Scope
2. Policy Statement
3. Roles and Responsibilities
4. Procedures and Guidelines
5. Compliance and Enforcement
6. Review and Revision

Format the policy professionally with clear sections and actionable guidance. Make it specific to CMMC requirements.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Policy generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate policy' },
      { status: 500 }
    );
  }
}

