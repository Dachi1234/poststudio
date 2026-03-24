"use client"

import { useState } from "react"
import { Square, Briefcase, LayoutDashboard, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CODELESS_BRAND } from "@/lib/brand"
import { generateCopy } from "@/lib/api"
import { GeneratedPost, PostBrief } from "@/types"
import PostCard from "@/components/PostCard"
import CanvasEditor from "@/components/CanvasEditor"
import TemplateSelector from "@/components/TemplateSelector"
import TemplateExporter from "@/components/TemplateExporter"

type Platform = "instagram" | "linkedin" | "facebook"

const platformConfig = [
  { id: "instagram" as Platform, label: "Instagram", Icon: Square },
  { id: "linkedin"  as Platform, label: "LinkedIn",  Icon: Briefcase },
  { id: "facebook"  as Platform, label: "Facebook",  Icon: LayoutDashboard },
]

const goalOptions = [
  "Brand Awareness",
  "Student Recruitment",
  "Announce New Cohort",
  "Student Success Story",
  "What is CodeLess?",
  "Behind the Scenes",
]

const toneOptions = [
  { value: "default",  label: "CodeLess Default (mentor voice)" },
  { value: "formal",   label: "More Formal" },
  { value: "casual",   label: "More Casual" },
  { value: "playful",  label: "More Playful" },
]

const variationOptions: Array<1 | 2 | 4> = [1, 2, 4]

export default function CreatePage() {
  const [platform, setPlatform]     = useState<Platform | null>(null)
  const [goal, setGoal]             = useState<string>("")
  const [prompt, setPrompt]         = useState("")
  const [toneOverride, setTone]     = useState("default")
  const [variations, setVariations] = useState<1 | 2 | 4>(2)
  const [isLoading, setIsLoading]   = useState(false)
  const [posts, setPosts]           = useState<GeneratedPost[]>([])

  // Modal states
  const [editorPost, setEditorPost]                     = useState<GeneratedPost | null>(null)
  const [templateSelectorPost, setTemplateSelectorPost] = useState<GeneratedPost | null>(null)
  const [exporterState, setExporterState]               = useState<{ post: GeneratedPost; templateId: string } | null>(null)

  const canGenerate  = platform !== null && prompt.length >= 20
  const hasGenerated = posts.length > 0

  async function handleGenerate() {
    if (!canGenerate || !platform) return
    setIsLoading(true)
    try {
      const data = await generateCopy({ platform, goal, prompt, toneOverride, variations })
      const newPosts: GeneratedPost[] = data.posts
      setPosts(newPosts)

      const brief: PostBrief = { platform, goal, prompt, toneOverride, variations }
      const history = JSON.parse(localStorage.getItem("cl_history") || "[]")
      history.unshift({
        id: Date.now().toString(),
        brief,
        posts: newPosts,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("cl_history", JSON.stringify(history.slice(0, 50)))
    } catch {
      toast.error("Generation failed — please try again")
    } finally {
      setIsLoading(false)
    }
  }

  function handleImageUpdate(id: string, imageUrl: string, imageModel: string) {
    setPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, imageUrl, imageModel: imageModel as GeneratedPost["imageModel"] } : p)
    )
  }

  const gridClass =
    posts.length === 1
      ? "max-w-xl mx-auto"
      : "grid grid-cols-1 md:grid-cols-2 gap-6"

  return (
    <div className="flex h-[calc(100vh-56px)]">

      {/* LEFT SIDEBAR */}
      <aside className="w-80 flex-shrink-0 bg-[#2E2E2E] h-full overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FD8D6E]" />
          <span className="font-[family-name:var(--font-inter)] font-semibold text-[14px] text-white">PostStudio</span>
          <span className="font-[family-name:var(--font-space-mono)] text-[11px] text-white/40 ml-1">by CodeLess</span>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
            Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {platformConfig.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all text-[13px] font-[family-name:var(--font-inter)] font-medium ${
                  platform === id
                    ? "border-[#FD8D6E] bg-[#FD8D6E]/10 text-[#FD8D6E]"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                }`}
              >
                <Icon size={16} />
                <span className="text-[11px]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
            Post Goal
          </label>
          <Select onValueChange={(v) => setGoal(String(v ?? ""))}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
              <SelectValue placeholder="Select a goal…" />
            </SelectTrigger>
            <SelectContent>
              {goalOptions.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brief */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
            Campaign Brief
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
            placeholder="What's this post about? The more specific, the better."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[100px] text-sm"
          />
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-white/40 text-right">
            {prompt.length} / 300
          </p>
        </div>

        {/* Tone */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
            Tone Override
          </label>
          <Select defaultValue="default" onValueChange={(v) => setTone(String(v ?? "default"))}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Variations */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase"
                 style={{ color: CODELESS_BRAND.colors.coral }}>
            Variations
          </label>
          <div className="flex gap-2">
            {variationOptions.map((v) => (
              <button
                key={v}
                onClick={() => setVariations(v)}
                className={`flex-1 py-1.5 rounded-full text-sm font-[family-name:var(--font-inter)] font-medium transition-all ${
                  variations === v
                    ? "bg-[#FD8D6E] text-[#2E2E2E]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className={`w-full h-11 bg-[#FD8D6E] text-[#2E2E2E] font-[family-name:var(--font-inter)] font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity mt-auto ${
            !canGenerate || isLoading ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Posts"
          )}
        </button>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 bg-[#F9F9F9] overflow-y-auto p-8">
        {isLoading ? (
          <div className={gridClass}>
            {Array.from({ length: variations }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl h-[600px] w-full" />
            ))}
          </div>
        ) : hasGenerated ? (
          <div className={gridClass}>
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                platform={platform!}
                index={i}
                onEdit={() => setEditorPost(post)}
                onChooseTemplate={() => setTemplateSelectorPost(post)}
                onImageUpdate={handleImageUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl px-16 py-20 flex flex-col items-center gap-3">
              <p className="font-[family-name:var(--font-inter)] font-medium text-lg text-[#2E2E2E]/40">
                Your posts will appear here
              </p>
              <p className="font-[family-name:var(--font-inter)] text-sm text-[#2E2E2E]/30">
                Select a platform and write a brief to get started
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Canvas Editor */}
      {editorPost && platform && (
        <CanvasEditor
          post={editorPost}
          platform={platform}
          onClose={() => setEditorPost(null)}
        />
      )}

      {/* Template Selector */}
      {templateSelectorPost && platform && (
        <TemplateSelector
          post={templateSelectorPost}
          platform={platform}
          onSelect={(templateId) => {
            setExporterState({ post: templateSelectorPost, templateId })
            setTemplateSelectorPost(null)
          }}
          onSkip={() => setTemplateSelectorPost(null)}
        />
      )}

      {/* Template Exporter */}
      {exporterState && platform && (
        <TemplateExporter
          post={exporterState.post}
          platform={platform}
          templateId={exporterState.templateId}
          onExported={() => {}}
          onEditInCanvas={() => {
            setEditorPost(exporterState.post)
            setExporterState(null)
          }}
          onClose={() => setExporterState(null)}
        />
      )}
    </div>
  )
}
