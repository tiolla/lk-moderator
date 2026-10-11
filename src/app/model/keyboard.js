import { useEffect } from 'react'
import { getState, update } from '@/shared/model/store.js'
import { openCard, queueList } from '@/entities/application'
import { closeModal, undoDecision } from '@/features/decision'

function press(selector) {
  const b = document.querySelector(selector)
  if (b && !b.disabled) b.click()
}

function onKey(e) {
  const s = getState()
  const tag = (e.target.tagName || '').toUpperCase()
  const field = /^(INPUT|TEXTAREA|SELECT)$/.test(tag)
  const onButton = /^(BUTTON|A)$/.test(tag) || (e.target.getAttribute && e.target.getAttribute('role') === 'button')
  if (onButton && (e.key === 'Enter' || e.key === ' ')) return
  if (e.key === 'Escape' && s.modal) { closeModal(); return }
  if (field || e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === '?') { update((d) => { d.modal = { type: 'keys' } }); return }
  if (s.modal) return
  const letter = e.key.toLowerCase()
  if ((letter === 'z' || letter === 'я') && s.keysOn && s.undo) { undoDecision(s.undo); return }

  if (s.screen === 'queue') {
    const list = queueList(s)
    if (e.key === 'ArrowDown') { update((d) => { d.cursor = Math.min(d.cursor + 1, list.length - 1) }); e.preventDefault() }
    else if (e.key === 'ArrowUp') { update((d) => { d.cursor = Math.max(d.cursor - 1, 0) }); e.preventDefault() }
    else if (e.key === 'Enter' && list[s.cursor]) openCard(list[s.cursor].id, list.map((a) => a.id))
    return
  }
  if (s.screen === 'card') {
    if (!s.keysOn && /^[a-zа-яё]$/.test(letter)) return
    if (letter === 'a' || letter === 'ф') press('[data-act="approve"], [data-act="anketa-approve"], [data-act="pass"], [data-act="anketa-pass"]')
    else if (letter === 'r' || letter === 'к') press('[data-act="return"], [data-act="anketa-return"]')
    else if (letter === 'o' || letter === 'щ') press('[data-act="postpone"]')
    else if (e.key === 'ArrowRight') press('[data-nav="next"]')
    else if (e.key === 'ArrowLeft') press('[data-nav="prev"]')
  }
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
