"use client"

import { useState, useEffect } from "react"
import {
  Square, Briefcase, LayoutDashboard, Loader2,
  Megaphone, UserPlus, Sparkles, BookOpen,
  Star, Camera, MessageCircleQuestion, CalendarPlus,
  Mic2, AlignJustify, Smile, Zap,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { generateCopy, savePost } from "@/lib/api"
import { GeneratedPost } from "@/types"
import PostCard from "@/components/PostCard"
import CanvasEditor from "@/components/CanvasEditor"
import TemplateEditor from "@/components/template-editor/TemplateEditor"
import TemplateSelector from "@/components/TemplateSelector"
import TemplateExporter from "@/components/TemplateExporter"
import PremiumSelect, { SelectOption } from "@/components/PremiumSelect"
import ErrorBoundary from "@/components/ErrorBoundary"

type Platform = "instagram" | "linkedin" | "facebook"

interface ActiveBrand {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  toneOfVoice?: string
  description?: string
  audience?: string
}

const platformConfig = [
  { id: "instagram" as Platform, label: "Instagram", Icon: Square },
  { id: "linkedin"  as Platform, label: "LinkedIn",  Icon: Briefcase },
  { id: "facebook"  as Platform, label: "Facebook",  Icon: LayoutDashboard },
]

const GOAL_OPTIONS: SelectOption[] = [
  { value: "Brand Awareness",        label: "Brand Awareness",        description: "Introduce or reinforce your brand identity",  icon: <Megaphone size={14} /> },
  { value: "Lead Generation",        label: "Lead Generation",        description: "Drive sign-ups, inquiries or conversions",     icon: <UserPlus size={14} /> },
  { value: "Product / Service Launch",label: "Product Launch",        description: "Announce something new to the world",          icon: <Sparkles size={14} /> },
  { value: "Educational Post",       label: "Educational",            description: "Teach, explain or share expertise",            icon: <BookOpen size={14} /> },
  { value: "Customer Success Story", label: "Success Story",          description: "Showcase a client win or testimonial",         icon: <Star size={14} /> },
  { value: "Behind the Scenes",      label: "Behind the Scenes",      description: "Show your process, team or culture",           icon: <Camera size={14} /> },
  { value: "Engagement / Question",  label: "Engagement Post",        description: "Spark comments and conversations",             icon: <MessageCircleQuestion size={14} /> },
  { value: "Event Promotion",        label: "Event Promotion",        description: "Build hype around a live event",               icon: <CalendarPlus size={14} /> },
]

const TONE_OPTIONS: SelectOption[] = [
  { value: "default",  label: "Brand Default",  description: "Follows your brand's tone of voice",   icon: <Mic2 size={14} /> },
  { value: "formal",   label: "More Formal",    description: "Professional, polished and measured",  icon: <AlignJustify size={14} /> },
  { value: "casual",   label: "More Casual",    description: "Relaxed, natural, like a conversation", icon: <Smile size={14} /> },
  { value: "playful",  label: "More Playful",   description: "Light, punchy, energetic",              icon: <Zap size={14} /> },
]

const variationOptions: Array<1 | 2 | 4> = [1, 2, 4]

const SESSION_KEY = "ps_create_v1"

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function CreatePage() {
  const [platform, setPlatform]     = useState<Platform | null>(null)
  const [goal, setGoal]             = useState<string>("")
  const [prompt, setPrompt]         = useState("")
  const [toneOverride, setTone]     = useState("default")
  const [variations, setVariations] = useState<1 | 2 | 4>(2)
  const [isLoading, setIsLoading]   = useState(false)
  const [posts, setPosts]           = useState<GeneratedPost[]>([])
  const [activeBrand, setActiveBrand] = useState<ActiveBrand | null>(null)
  const [dbIdMap, setDbIdMap]       = useState<Record<string, string>>({})

  // Modal states
  const [editorPost, setEditorPost]                     = useState<GeneratedPost | null>(null)
  const [editorCtx,  setEditorCtx]                      = useState<{ templateId: string; colorTheme: string } | null>(null)
  const [templateSelectorPost, setTemplateSelectorPost] = useState<GeneratedPost | null>(null)
  const [exporterState, setExporterState]               = useState<{ post: GeneratedPost; templateId: string } | null>(null)

  // Restore session once on mount (client-only — avoids SSR hydration mismatch)
  useEffect(() => {
    const saved = loadSession()
    if (!saved) return
    if (saved.platform)    setPlatform(saved.platform)
    if (saved.goal)        setGoal(saved.goal)
    if (saved.prompt)      setPrompt(saved.prompt)
    if (saved.toneOverride) setTone(saved.toneOverride)
    if (saved.variations)  setVariations(saved.variations)
    if (saved.posts?.length) setPosts(saved.posts)
    if (saved.dbIdMap)     setDbIdMap(saved.dbIdMap)
  }, [])

  // Persist session whenever key state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        platform, goal, prompt, toneOverride, variations, posts, dbIdMap,
      }))
    } catch {}
  }, [platform, goal, prompt, toneOverride, variations, posts, dbIdMap])

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => setActiveBrand(d.activeBrand ?? null))
      .catch(() => {})
  }, [])

  function handleClear() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
    setPlatform(null)
    setGoal("")
    setPrompt("")
    setTone("default")
    setVariations(2)
    setPosts([])
    setDbIdMap({})
  }

  const canGenerate  = platform !== null && prompt.length >= 20
  const hasGenerated = posts.length > 0

  async function handleGenerate() {
    if (!canGenerate || !platform) return
    setIsLoading(true)
    try {
      const brand = activeBrand
        ? {
            name:           activeBrand.name,
            description:    activeBrand.description,
            audience:       activeBrand.audience,
            toneOfVoice:    activeBrand.toneOfVoice,
            primaryColor:   activeBrand.primaryColor,
            accentColor:    activeBrand.accentColor,
            secondaryColor: activeBrand.secondaryColor,
          }
        : undefined

      const data = await generateCopy({ platform, goal, prompt, toneOverride, variations, brand })
      const newPosts: GeneratedPost[] = data.posts
      setPosts(newPosts)

      // Save posts to DB and capture DB ids for template saving
      const saved = await Promise.allSettled(
        newPosts.map((p) =>
          savePost({
            platform,
            goal,
            brief: prompt,
            headline: p.headline,
            caption: p.caption,
            hashtags: p.hashtags,
            cta: p.cta,
          })
        )
      )
      const idMap: Record<string, string> = {}
      let saveFailures = 0
      newPosts.forEach((p, i) => {
        const r = saved[i]
        if (r.status === "fulfilled" && r.value?.post?.id) {
          idMap[p.id] = r.value.post.id
        } else {
          saveFailures++
        }
      })
      setDbIdMap(idMap)
      if (saveFailures > 0) {
        toast.error("Posts generated but couldn't save to history — check your brand setup")
      }
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
        {/* Active brand indicator */}
        {activeBrand && (
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeBrand.primaryColor }}
            />
            <span className="text-white/70 text-xs font-medium truncate">{activeBrand.name}</span>
          </div>
        )}

        {/* Platform */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase text-[#FD8D6E]">
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
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase text-[#FD8D6E]">
            Post Goal
          </label>
          <PremiumSelect
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
            placeholder="What's the purpose?"
          />
        </div>

        {/* Brief */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase text-[#FD8D6E]">
            Campaign Brief
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 2000))}
            placeholder="What's this post about? Paste a full creative brief, tone notes, key messages, target audience — the more detail, the better the output."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-y min-h-[140px] text-sm"
          />
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-white/40 text-right">
            {prompt.length} / 2000
          </p>
        </div>

        {/* Tone */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase text-[#FD8D6E]">
            Tone Override
          </label>
          <PremiumSelect
            options={TONE_OPTIONS}
            value={toneOverride}
            onChange={setTone}
          />
        </div>

        {/* Variations */}
        <div className="flex flex-col gap-2">
          <label className="font-[family-name:var(--font-inter)] font-semibold text-[11px] tracking-widest uppercase text-[#FD8D6E]">
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

        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className={`w-full h-11 bg-[#FD8D6E] text-[#2E2E2E] font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity ${
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

          {posts.length > 0 && (
            <button
              onClick={handleClear}
              className="w-full h-8 text-white/30 hover:text-white/60 text-xs transition-colors rounded-lg"
            >
              ✕ Clear &amp; start new
            </button>
          )}
        </div>
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
              <ErrorBoundary key={post.id} label={`Post #${i + 1}`}>
                <PostCard
                  post={post}
                  platform={platform!}
                  index={i}
                  postDbId={dbIdMap[post.id]}
                  brand={activeBrand ? {
                    name:           activeBrand.name,
                    primaryColor:   activeBrand.primaryColor,
                    accentColor:    activeBrand.accentColor,
                    secondaryColor: activeBrand.secondaryColor,
                  } : undefined}
                  onEdit={() => setEditorPost(post)}
                  onChooseTemplate={() => setTemplateSelectorPost(post)}
                  onImageUpdate={handleImageUpdate}
                />
              </ErrorBoundary>
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

      {/* Template Editor (HTML-based — when a template is selected) */}
      {editorPost && platform && editorCtx && (
        <ErrorBoundary
          label="Template Editor"
          fallback={
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
              <div className="bg-white rounded-xl p-8 max-w-md text-center flex flex-col gap-3">
                <p className="font-semibold text-red-700">Template Editor crashed</p>
                <p className="text-sm text-gray-500">The editor encountered an error. Your post data is safe.</p>
                <button
                  onClick={() => { setEditorPost(null); setEditorCtx(null) }}
                  className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#FD8D6E] text-[#2E2E2E] hover:opacity-90 transition-opacity"
                >
                  Close Editor
                </button>
              </div>
            </div>
          }
        >
          <TemplateEditor
            key={`tpl-${editorPost.id}-${editorCtx.templateId}-${editorCtx.colorTheme}`}
            post={editorPost}
            platform={platform}
            templateId={editorCtx.templateId}
            colorTheme={editorCtx.colorTheme}
            postDbId={dbIdMap[editorPost.id]}
            onClose={() => { setEditorPost(null); setEditorCtx(null) }}
          />
        </ErrorBoundary>
      )}

      {/* Canvas Editor (Fabric.js — freestyle mode, no template) */}
      {editorPost && platform && !editorCtx && (
        <ErrorBoundary
          label="Canvas Editor"
          fallback={
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
              <div className="bg-white rounded-xl p-8 max-w-md text-center flex flex-col gap-3">
                <p className="font-semibold text-red-700">Canvas Editor crashed</p>
                <p className="text-sm text-gray-500">The editor encountered an error. Your post data is safe.</p>
                <button
                  onClick={() => { setEditorPost(null); setEditorCtx(null) }}
                  className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#FD8D6E] text-[#2E2E2E] hover:opacity-90 transition-opacity"
                >
                  Close Editor
                </button>
              </div>
            </div>
          }
        >
          <CanvasEditor
            key={`canvas-${editorPost.id}`}
            post={editorPost}
            platform={platform}
            postDbId={dbIdMap[editorPost.id]}
            onClose={() => { setEditorPost(null); setEditorCtx(null) }}
          />
        </ErrorBoundary>
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
        <ErrorBoundary label="Template Exporter">
          <TemplateExporter
            post={exporterState.post}
            platform={platform}
            templateId={exporterState.templateId}
            postDbId={dbIdMap[exporterState.post.id]}
            onExported={() => {}}
            onEditInCanvas={(tid, ct) => {
              setEditorPost(exporterState.post)
              setEditorCtx({ templateId: tid, colorTheme: ct })
              setExporterState(null)
            }}
            onClose={() => setExporterState(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
