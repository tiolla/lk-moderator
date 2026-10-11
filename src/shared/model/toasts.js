import { update } from './store.js'

let nextId = 1

export function pushToast(draft, text, sub, tone, undoKey) {
  draft.toasts.push({ id: nextId++, text, sub: sub || '', tone: tone || 'ok', undoKey: undoKey || null })
}

export function toast(text, sub, tone, undoKey) {
  update((d) => pushToast(d, text, sub, tone, undoKey), { render: false })
}

export function closeToast(id) {
  update((d) => {
    const t = d.toasts.find((x) => x.id === id)
    d.toasts = d.toasts.filter((x) => x.id !== id)
    if (t && t.undoKey && d.undo && d.undo.key === t.undoKey) d.undo = null
  }, { render: false })
}
