"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, List, ListOrdered, Minus } from "lucide-react"
import { useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (plainText: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        active
          ? "bg-[#FD8D6E]/20 text-[#FD8D6E]"
          : "text-[#666] hover:text-[#aaa] hover:bg-[#2a2a2a]"
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  minHeight = 80,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-[#444] before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      // Extract plain text for storage (strip HTML tags)
      const text = editor.getText()
      onChange(text)
    },
    editorProps: {
      attributes: {
        class: "outline-none text-white/90 text-sm leading-relaxed",
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g. when URL analysis auto-fills)
  useEffect(() => {
    if (!editor) return
    const current = editor.getText()
    if (value !== current) {
      editor.commands.setContent(value || "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  return (
    <div className="bg-[#222] border border-[#333] rounded-lg overflow-hidden focus-within:border-[#FD8D6E] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#2a2a2a]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={13} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#333] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered size={13} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#333] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Divider"
        >
          <Minus size={13} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>

      {/* TipTap global styles */}
      <style>{`
        .ProseMirror ul { list-style-type: disc; padding-left: 1.2em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.2em; }
        .ProseMirror li + li { margin-top: 0.2em; }
        .ProseMirror hr { border-color: #333; margin: 0.5em 0; }
        .ProseMirror strong { font-weight: 600; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror p + p { margin-top: 0.4em; }
      `}</style>
    </div>
  )
}
