import { NextResponse } from 'next/server'

import type { GenerateRequest, GenerateResponse } from '@/types'

export async function POST(request: Request) {
  let body: GenerateRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const response: GenerateResponse = {
    html: '<div>hello from placeholder</div>',
    flags: [],
  }

  return NextResponse.json(response)
}
