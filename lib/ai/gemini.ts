import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set - AI features will be disabled');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  feedback: string;
  missingElements?: string[];
}

export class GeminiService {
  async explainControl(controlId: string, title: string, practice: string): Promise<string> {
    if (!genAI) {
      return 'AI explanation is currently unavailable. Please check your API key configuration.';
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are a CMMC 2.0 compliance expert helping businesses understand cybersecurity controls.

Control ID: ${controlId}
Title: ${title}
Practice: ${practice}

Explain this control in simple, plain English that a small business owner can understand. Focus on:
1. What this control means in practical terms
2. Why it's important for security
3. Common ways to implement it
4. What evidence would demonstrate compliance

Keep the explanation conversational, helpful, and under 200 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Unable to generate AI explanation at this time. Please try again later.';
    }
  }

  async validateEvidence(
    controlId: string,
    controlTitle: string,
    controlPractice: string,
    evidenceDescription: string,
    fileName: string
  ): Promise<ValidationResult> {
    if (!genAI) {
      return {
        valid: true,
        confidence: 50,
        feedback: 'Automatic validation is currently unavailable. Evidence has been uploaded for manual review.',
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are a CMMC 2.0 compliance auditor evaluating evidence for a security control.

Control ID: ${controlId}
Control Title: ${controlTitle}
Control Practice: ${controlPractice}

Evidence Submitted:
- File Name: ${fileName}
- Description: ${evidenceDescription}

Evaluate if this evidence adequately demonstrates compliance with this control. Respond in JSON format with:
{
  "valid": true or false,
  "confidence": 0-100 (your confidence in the assessment),
  "feedback": "detailed explanation of your assessment",
  "missingElements": ["list", "of", "missing", "items"] or []
}

Be thorough but fair in your assessment.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return {
        valid: true,
        confidence: 70,
        feedback: text,
      };
    } catch (error) {
      console.error('Gemini validation error:', error);
      return {
        valid: true,
        confidence: 50,
        feedback: 'Automatic validation encountered an error. Evidence has been uploaded for manual review.',
      };
    }
  }

  async generateRecommendations(controlId: string, title: string, practice: string): Promise<string[]> {
    if (!genAI) {
      return ['AI recommendations are currently unavailable.'];
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are a CMMC 2.0 implementation consultant.

Control: ${controlId} - ${title}
Practice: ${practice}

Provide 3-5 specific, actionable recommendations for implementing this control. Focus on practical, cost-effective solutions suitable for small to medium businesses.

Format each recommendation as a separate line starting with a dash (-).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse recommendations
      const recommendations = text
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(1).trim());

      return recommendations.length > 0 ? recommendations : [text];
    } catch (error) {
      console.error('Gemini recommendations error:', error);
      return ['Unable to generate recommendations at this time.'];
    }
  }

  async generatePolicy(controlIds: string[], companyName: string): Promise<string> {
    if (!genAI) {
      return 'AI policy generation is currently unavailable.';
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are a cybersecurity policy writer.

Generate a professional security policy document for ${companyName} that addresses CMMC controls: ${controlIds.join(', ')}.

The policy should include:
1. Purpose and Scope
2. Policy Statements
3. Procedures
4. Roles and Responsibilities
5. Compliance and Enforcement

Format the document professionally and make it specific enough to be useful but general enough to be adaptable.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini policy generation error:', error);
      return 'Unable to generate policy at this time.';
    }
  }
}

export const geminiService = new GeminiService();

