export interface TemplateProps {
  headline: string
  caption: string
  cta: string
  hashtags: string[]
  imageUrl?: string
  platform: "instagram" | "linkedin" | "facebook"
  primaryColor?: string
}
