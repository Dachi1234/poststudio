import type { GeneratedPost } from "@/types"

export interface ElementOverride {
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  textAlign?: string
  translateX?: number
  translateY?: number
  width?: number
  height?: number
  rotate?: number
  opacity?: number
  locked?: boolean
  // Shape controls (CTA buttons etc.)
  borderRadius?: number
  backgroundColor?: string
  paddingX?: number
  paddingY?: number
  borderWidth?: number
  borderColor?: string
  letterSpacing?: number
  lineHeight?: number
}

export interface EditorState {
  overrides: Record<string, ElementOverride>
  selectedField: string | null
}

export interface FieldInfo {
  field: string
  tag: string
  text: string
  hasBackground: boolean
}

export interface TemplateEditorProps {
  post: GeneratedPost
  platform: "instagram" | "linkedin" | "facebook"
  templateId: string
  colorTheme: string
  postDbId?: string
  onClose: () => void
}
