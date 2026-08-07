import { NextResponse } from 'next/server';
import { enforceRateLimit, rejectCrossSite, rejectLargeBody } from '../_security';

export async function POST(request) {
  const blocked = rejectCrossSite(request) || rejectLargeBody(request, 128 * 1024) || enforceRateLimit(request, { limit: 30, windowMs: 60 * 60 * 1000, scope: 'tutor' });
  if (blocked) return blocked;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: 'Gemini is not configured.' }, { status: 503 });

  try {
    const { deck, question } = await request.json();
    if (typeof question !== 'string' || question.length > 2000 || !Array.isArray(deck?.cards) || !deck.cards.length || deck.cards.length > 100) return NextResponse.json({ error: 'A valid study set and question are required.' }, { status: 400 });
    const source = deck.cards.slice(0, 50).map((card, index) => `${index + 1}. ${card.front}\n${card.back}`).join('\n\n');
    const prompt = `You are Studii Tutor, a patient tutor for high-school and college students. Answer using the supplied study material as your primary source. Explain reasoning clearly and concisely. Use an example or analogy when helpful. If asked to quiz the student, ask one question without revealing the answer. Never claim unsupported facts are in the source.

Course: ${deck.subject}\nSet: ${deck.title}\n\nStudy material:\n${source}\n\nStudent: ${question}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 700 } }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || 'The tutor could not answer right now.' }, { status: response.status });
    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    return NextResponse.json({ answer: answer || 'I could not form an answer from this set.' });
  } catch (error) {
    console.error('Tutor request failed:', error);
    return NextResponse.json({ error: 'The tutor could not process that question.' }, { status: 500 });
  }
}
