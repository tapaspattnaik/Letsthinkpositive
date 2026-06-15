import { useEffect, useRef } from 'react'

// Accessible modal behaviour: focus the dialog on open, trap Tab inside it,
// close on Escape, lock background scroll, and restore focus on close.
// Returns a ref to attach to the dialog container that holds the focusables.
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return
    const node = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusables = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter(el => el.offsetParent !== null)
        : []

    // Move focus into the dialog
    ;(getFocusables()[0] ?? node)?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const els = getFocusables()
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return ref
}
