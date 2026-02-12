import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const TONE_PROMPTS: Record<string, string> = {
  professional: 'Use a professional, polished tone. Clear and authoritative.',
  casual: 'Use a friendly, approachable, casual tone. Conversational but not sloppy.',
  bold: 'Use a bold, confident, attention-grabbing tone. Punchy and direct.',
  minimal: 'Use a minimal, clean tone. Short sentences. No fluff.',
};

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, tone = 'professional' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'text is required' },
        { status: 400 }
      );
    }

    const toneGuide = TONE_PROMPTS[tone] || TONE_PROMPTS.professional;

    const prompt = `You are an expert marketing copywriter. Rewrite the following text to be more compelling, concise, and action-oriented. Use British English throughout.

Tone: ${toneGuide}

Rules:
- Keep the core message intact
- Make it more engaging and persuasive
- Fix any grammar or spelling issues
- Keep similar length (don't expand unnecessarily)
- Return ONLY the improved text, no commentary

Text to improve:
${text}`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { success: false, error: 'AI enhancement failed' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const enhanced =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!enhanced) {
      return NextResponse.json(
        { success: false, error: 'No output from AI' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      original: text,
      enhanced,
      tone,
    });
  } catch (error) {
    console.error('enhance-copy error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
