import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

import type { CopilotFlag, GenerateRequest, GenerateResponse, SelectionBox } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const GENERATION_SYSTEM = `You are an expert UI developer. Convert the provided wireframe or sketch into clean, modern HTML with Tailwind CSS classes.

Rules:
- Output ONLY the raw HTML markup — no markdown fences, no explanations, no <!DOCTYPE>, no <html>/<head>/<body> tags
- Use Tailwind CSS utility classes for all styling
- Make it visually polished, modern, and responsive
- Use semantic HTML elements
- Include realistic placeholder text
- If a specific region is described, focus your output on that area only`

const COPILOT_SYSTEM = `You are a UX auditor. Analyse the provided HTML and identify missing critical UX elements.
Return a JSON array only — no markdown, no explanation.

Each item: { "id": "<unique-slug>", "severity": "error"|"warning"|"info", "message": "<what is missing>", "suggestion": "<how to fix it>" }

Check for: login/auth buttons, error states, empty states, loading indicators, form validation feedback, mobile responsiveness, accessibility (alt text, labels, aria), clear CTAs, navigation.`

function isValidSelectionBox(value: unknown): value is SelectionBox {
  if (typeof value !== 'object' || value === null) return false
  const b = value as Record<string, unknown>
  return (
    typeof b.x === 'number' && Number.isFinite(b.x) &&
    typeof b.y === 'number' && Number.isFinite(b.y) &&
    typeof b.width === 'number' && Number.isFinite(b.width) &&
    typeof b.height === 'number' && Number.isFinite(b.height)
  )
}

function stripBase64Prefix(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (!match) throw new Error('Invalid image data URL')
  return { mimeType: match[1], data: match[2] }
}

function buildGenerationPrompt(prompt?: string, selectionBox?: SelectionBox, imageWidth?: number, imageHeight?: number): string {
  let text = prompt?.trim() || 'Convert this wireframe into clean HTML with Tailwind CSS.'

  if (selectionBox && imageWidth && imageHeight) {
    const xPct = Math.round((selectionBox.x / imageWidth) * 100)
    const yPct = Math.round((selectionBox.y / imageHeight) * 100)
    const wPct = Math.round((selectionBox.width / imageWidth) * 100)
    const hPct = Math.round((selectionBox.height / imageHeight) * 100)
    text = `Focus ONLY on the region at approximately x:${xPct}%, y:${yPct}%, width:${wPct}%, height:${hPct}% of the image.\n\n${text}`
  }

  return text
}

export async function POST(request: Request) {
  try {
    let body: GenerateRequest & { imageWidth?: number; imageHeight?: number }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (typeof body.image !== 'string' || body.image.length === 0) {
      return NextResponse.json({ error: 'Missing required field: image' }, { status: 400 })
    }

    if (body.selectionBox !== undefined && !isValidSelectionBox(body.selectionBox)) {
      return NextResponse.json({ error: 'Invalid selectionBox' }, { status: 400 })
    }

    const { data, mimeType } = stripBase64Prefix(body.image)
    const prompt = buildGenerationPrompt(body.prompt, body.selectionBox, body.imageWidth, body.imageHeight)

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: GENERATION_SYSTEM,
    })

    const generationResult = await model.generateContent([
      { inlineData: { data, mimeType } },
      { text: prompt },
    ])

    const html = generationResult.response.text().trim()

    // Copilot analysis
    const copilotModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: COPILOT_SYSTEM,
    })

    const copilotResult = await copilotModel.generateContent(
      `Analyse this UI HTML for missing UX elements:\n\n${html}`
    )

    let flags: CopilotFlag[] = []
    try {
      const raw = copilotResult.response.text().trim()
      const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      flags = JSON.parse(cleaned)
      if (!Array.isArray(flags)) flags = []
    } catch {
      flags = []
    }

    const response: GenerateResponse = { html, flags }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
