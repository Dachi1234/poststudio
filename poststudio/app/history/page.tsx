"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PostHistory, GeneratedPost } from "@/types"
import { PLATFORM_SIZES } from "@/lib/brand"
import CanvasEditor from "@/components/CanvasEditor"

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function HistoryPage() {
  const [history, setHistory] = useState<PostHistory[]>([])
  const [editorState, setEditorState] = useState<{ post: GeneratedPost; platform: "instagram" | "linkedin" | "facebook" } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("cl_history")
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        setHistory([])
      }
    }
  }, [])

  function clearHistory() {
    localStorage.removeItem("cl_history")
    setHistory([])
  }

  const totalPosts = history.reduce((acc, h) => acc + h.posts.length, 0)

  return (
    <main className="min-h-screen bg-[#F9F9F9] px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-[family-name:var(--font-inter)] font-semibold text-[28px] text-[#2E2E2E]">
            Post History
          </h1>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger className="text-sm text-[#2E2E2E]/40 hover:text-[#2E2E2E]/70 transition-colors font-[family-name:var(--font-inter)] bg-transparent border-0 cursor-pointer">
                Clear History
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {totalPosts} saved posts. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-red-500 hover:bg-red-600">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="font-[family-name:var(--font-inter)] text-sm text-[#2E2E2E]/40 mb-8">
          {totalPosts} post{totalPosts !== 1 ? "s" : ""} generated
        </p>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="font-[family-name:var(--font-inter)] text-lg text-gray-400">No posts yet</p>
            <Link
              href="/create"
              className="font-[family-name:var(--font-inter)] text-sm font-medium text-[#FD8D6E] hover:opacity-70 transition-opacity"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.flatMap((item) =>
              item.posts.map((post) => (
                <div
                  key={`${item.id}-${post.id}`}
                  className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#2E2E2E]/50 font-[family-name:var(--font-space-mono)]">
                      {formatDate(item.createdAt)} · {PLATFORM_SIZES[item.brief.platform].label}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-inter)] font-semibold text-[14px] text-[#2E2E2E] leading-snug line-clamp-2">
                    {post.headline}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#FD8D6E]/10 text-[#FD8D6E]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setEditorState({ post, platform: item.brief.platform })}
                    className="mt-auto text-sm font-[family-name:var(--font-inter)] font-medium text-[#FD8D6E] hover:opacity-70 transition-opacity text-left"
                  >
                    Re-edit →
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {editorState && (
        <CanvasEditor
          post={editorState.post}
          platform={editorState.platform}
          onClose={() => setEditorState(null)}
        />
      )}
    </main>
  )
}
