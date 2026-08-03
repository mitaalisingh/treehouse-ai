export interface SelectionBox {
  x: number
  y: number
  width: number
  height: number
}

export interface GenerateRequest {
  image: string
  prompt?: string
  selectionBox?: SelectionBox
}

export interface CopilotFlag {
  id: string
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion: string
}

export interface GenerateResponse {
  html: string
  flags: CopilotFlag[]
}
