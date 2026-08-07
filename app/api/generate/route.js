import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { enforceRateLimit, rejectCrossSite, rejectLargeBody } from '../_security';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
]);

function getOutputText(response) {
  if (response.output_text) return response.output_text;
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) return content.text;
    }
  }
  return '';
}

function decodeXmlText(value) {
  return value
    .replace(/<a:br\s*\/>/g, '\n')
    .replace(/<w:tab\s*\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractOfficeText(bytes, mimeType) {
  const zip = await JSZip.loadAsync(bytes);
  const isPowerPoint = mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const pattern = isPowerPoint ? /^ppt\/slides\/slide\d+\.xml$/ : /^word\/document\.xml$/;
  const entries = Object.values(zip.files)
    .filter((entry) => pattern.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const expandedBytes = entries.reduce((total, entry) => total + Number(entry?._data?.uncompressedSize || 0), 0);
  if (expandedBytes > 8 * 1024 * 1024) throw new Error('Expanded Office document is too large.');

  const sections = await Promise.all(entries.map(async (entry, index) => {
    const xml = await entry.async('string');
    const text = decodeXmlText(xml);
    return isPowerPoint ? `Slide ${index + 1}: ${text}` : text;
  }));
  return sections.filter(Boolean).join('\n\n').slice(0, 120000);
}

export async function POST(request) {
  const blocked = rejectCrossSite(request) || rejectLargeBody(request, 12 * 1024 * 1024) || enforceRateLimit(request, { limit: 10, windowMs: 60 * 60 * 1000, scope: 'generate' });
  if (blocked) return blocked;
  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!openAIKey && !geminiKey) {
    return NextResponse.json(
      { error: 'AI generation is not configured yet. Add OPENAI_API_KEY or GEMINI_API_KEY to .env.local and restart the app.' },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const notes = String(formData.get('notes') || '').trim();
    const subject = String(formData.get('subject') || 'General');
    const title = String(formData.get('title') || 'Study set');
    const file = formData.get('file');

    if (!notes && !(file instanceof File)) {
      return NextResponse.json({ error: 'Add notes or upload a file first.' }, { status: 400 });
    }

    if (file instanceof File && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'That file is larger than 10 MB.' }, { status: 413 });
    }
    if (file instanceof File && file.type && !allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'That file type is not supported.' }, { status: 415 });
    }

    let filePayload = null;
    let extractedFileText = '';
    if (file instanceof File) {
      const bytes = Buffer.from(await file.arrayBuffer());
      filePayload = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        base64: bytes.toString('base64'),
      };
      if (
        filePayload.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        filePayload.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        try {
          extractedFileText = await extractOfficeText(bytes, filePayload.type);
        } catch {
          return NextResponse.json({ error: 'That Office file is invalid, damaged, or expands beyond the safe processing limit.' }, { status: 422 });
        }
        if (!extractedFileText) {
          return NextResponse.json({ error: 'We could not find readable text in that Office file.' }, { status: 422 });
        }
        filePayload = null;
      }
    }

    const prompt = `Create 8–16 high-quality flashcards for a ${subject} course titled "${title}".

Prioritize facts, concepts, definitions, processes, formulas, cause-and-effect relationships, and likely exam questions. Keep each front focused on one recall target. Make each back accurate, concise, and independently understandable. Do not invent facts that are absent from the source. Avoid duplicate or trivial cards.

Student notes:
${notes || '(No additional typed notes.)'}

Extracted document content:
${extractedFileText || '(Use the attached source file.)'}`;

    if (openAIKey) {
      const content = [{ type: 'input_text', text: prompt }];
      if (filePayload) {
        const dataUrl = `data:${filePayload.type};base64,${filePayload.base64}`;
        if (filePayload.type.startsWith('image/')) {
          content.push({ type: 'input_image', image_url: dataUrl, detail: 'high' });
        } else {
          content.push({ type: 'input_file', filename: filePayload.name, file_data: dataUrl });
        }
      }

      const apiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5.6-sol',
          input: [{ role: 'user', content }],
          text: {
            format: {
              type: 'json_schema',
              name: 'flashcard_set',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  cards: {
                    type: 'array',
                    minItems: 8,
                    maxItems: 16,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        front: { type: 'string' },
                        back: { type: 'string' },
                      },
                      required: ['front', 'back'],
                    },
                  },
                },
                required: ['cards'],
              },
            },
          },
        }),
      });

      const responseData = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error('OpenAI generation failed:', responseData?.error?.message || apiResponse.statusText);
        return NextResponse.json(
          { error: responseData?.error?.message || 'The AI service could not generate this set.' },
          { status: apiResponse.status },
        );
      }

      const output = getOutputText(responseData);
      if (!output) throw new Error('The model returned no flashcards.');
      const parsed = JSON.parse(output);
      return NextResponse.json({ cards: parsed.cards });
    }

    const parts = [{ text: prompt }];
    if (filePayload) {
      parts.push({ inlineData: { mimeType: filePayload.type, data: filePayload.base64 } });
    }
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-3.6-flash'}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                cards: {
                  type: 'ARRAY',
                  minItems: 8,
                  maxItems: 16,
                  items: {
                    type: 'OBJECT',
                    properties: {
                      front: { type: 'STRING' },
                      back: { type: 'STRING' },
                    },
                    required: ['front', 'back'],
                  },
                },
              },
              required: ['cards'],
            },
          },
        }),
      },
    );
    const geminiData = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error('Gemini generation failed:', geminiData?.error?.message || geminiResponse.statusText);
      return NextResponse.json(
        { error: geminiData?.error?.message || 'The AI service could not generate this set.' },
        { status: geminiResponse.status },
      );
    }
    const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!geminiText) throw new Error('The model returned no flashcards.');
    return NextResponse.json({ cards: JSON.parse(geminiText).cards });
  } catch (error) {
    console.error('Flashcard generation failed:', error);
    return NextResponse.json({ error: 'We could not read that material. Try a different file or paste the notes.' }, { status: 500 });
  }
}
