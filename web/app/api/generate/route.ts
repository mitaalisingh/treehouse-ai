import { NextResponse } from 'next/server'

import type { GenerateRequest, GenerateResponse, SelectionBox } from '@/types'

function isValidSelectionBox(value: unknown): value is SelectionBox {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const box = value as Record<string, unknown>

  return (
    typeof box.x === 'number' &&
    Number.isFinite(box.x) &&
    typeof box.y === 'number' &&
    Number.isFinite(box.y) &&
    typeof box.width === 'number' &&
    Number.isFinite(box.width) &&
    typeof box.height === 'number' &&
    Number.isFinite(box.height)
  )
}

export async function POST(request: Request) {
  try {
    let body: GenerateRequest

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (typeof body.image !== 'string' || body.image.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: image' },
        { status: 400 },
      )
    }

    if (body.selectionBox !== undefined && !isValidSelectionBox(body.selectionBox)) {
      return NextResponse.json({ error: 'Invalid selectionBox' }, { status: 400 })
    }

    // Gemini call goes here — send body.image, body.prompt, and body.selectionBox.

    const response: GenerateResponse = {
      html: '<div>hello from placeholder</div>',
      flags: [],
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
