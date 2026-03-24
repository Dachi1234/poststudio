export interface PostBrief {
  platform: "instagram" | "linkedin" | "facebook"
  goal: string
  prompt: string
  toneOverride: string
  variations: 1 | 2 | 4
}

export interface GeneratedPost {
  id: string
  headline: string
  caption: string
  hashtags: string[]
  cta: string
  imagePrompt: string
  imageUrl?: string
  imageModel?: "flux" | "ideogram"
}

export interface PostHistory {
  id: string
  brief: PostBrief
  posts: GeneratedPost[]
  createdAt: string
}
