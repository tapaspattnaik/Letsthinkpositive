'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

// ── Toolbar button ─────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`
        h-8 w-8 flex items-center justify-center rounded-lg text-[0.8rem] font-semibold
        transition-colors select-none
        ${active
          ? 'bg-teal-deep text-white'
          : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />
}

// ── Props ──────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string                   // HTML string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number              // px, default 280
  maxHeight?: number              // px, optional scroll cap
  compact?: boolean               // fewer toolbar items (for community posts)
}

// ── Editor ─────────────────────────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something…',
  minHeight = 280,
  maxHeight,
  compact = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we don't want
        codeBlock: false,
        code:      false,
        strike:    false,
        // Headings: only H2 and H3
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Return empty string if the editor is empty (avoids <p></p>)
      onChange(editor.isEmpty ? '' : html)
    },
  })

  // Sync external value resets (e.g. form reset)
  useEffect(() => {
    if (editor && value === '' && !editor.isEmpty) {
      editor.commands.clearContent(true)
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="border border-teal-light rounded-[16px] overflow-hidden bg-white transition-colors focus-within:border-teal-mid">

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 flex-wrap">

        {/* Text style */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolBtn>

        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolBtn>

        {!compact && (
          <>
            <Divider />

            {/* Headings */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              H2
            </ToolBtn>

            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              H3
            </ToolBtn>
          </>
        )}

        <Divider />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          {/* Bullet list icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="1.5" cy="3" r="1.5" fill="currentColor"/>
            <rect x="4.5" y="2.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
            <circle cx="1.5" cy="7" r="1.5" fill="currentColor"/>
            <rect x="4.5" y="6.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
            <circle cx="1.5" cy="11" r="1.5" fill="currentColor"/>
            <rect x="4.5" y="10.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </ToolBtn>

        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          {/* Numbered list icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <text x="0" y="4.5" fontSize="5" fill="currentColor" fontFamily="sans-serif" fontWeight="600">1.</text>
            <rect x="4.5" y="2.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
            <text x="0" y="8.5" fontSize="5" fill="currentColor" fontFamily="sans-serif" fontWeight="600">2.</text>
            <rect x="4.5" y="6.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
            <text x="0" y="12.5" fontSize="5" fill="currentColor" fontFamily="sans-serif" fontWeight="600">3.</text>
            <rect x="4.5" y="10.25" width="9" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </ToolBtn>

        {!compact && (
          <>
            <Divider />

            {/* Blockquote */}
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 3h4v4H3c0 1.1.9 2 2 2v2C2.2 11 1 9.8 1 8V3z" fill="currentColor"/>
                <path d="M8 3h4v4h-2c0 1.1.9 2 2 2v2c-2.8 0-4-1.2-4-3V3z" fill="currentColor"/>
              </svg>
            </ToolBtn>
          </>
        )}

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M2.5 2.5A5 5 0 1 1 1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <polyline points="1,3.5 1,7 4.5,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </ToolBtn>

        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M10.5 2.5A5 5 0 1 0 12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <polyline points="12,3.5 12,7 8.5,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </ToolBtn>

        {/* Character / word count (right-aligned) */}
        <span className="ml-auto text-[0.65rem] text-text-xlight tabular-nums">
          {editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      {/* ── Content area ─────────────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        style={{ minHeight, maxHeight: maxHeight ?? undefined, overflowY: maxHeight ? 'auto' : undefined }}
        className="prose prose-sm max-w-none px-5 py-4 text-[0.94rem] leading-[1.85] text-charcoal
          focus:outline-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[inherit]
          [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.is-editor-empty:first-child::before]:text-text-xlight
          [&_.is-editor-empty:first-child::before]:float-left
          [&_.is-editor-empty:first-child::before]:pointer-events-none
          [&_.is-editor-empty:first-child::before]:h-0
          [&_h2]:text-[1.15rem] [&_h2]:font-bold [&_h2]:text-charcoal [&_h2]:mt-5 [&_h2]:mb-2
          [&_h3]:text-[1rem] [&_h3]:font-semibold [&_h3]:text-charcoal [&_h3]:mt-4 [&_h3]:mb-1.5
          [&_strong]:font-bold [&_strong]:text-charcoal
          [&_em]:italic
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
          [&_li]:text-[0.94rem]
          [&_blockquote]:border-l-4 [&_blockquote]:border-teal-light [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-mid
          [&_p]:mb-2 [&_p:last-child]:mb-0"
      />
    </div>
  )
}
