import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { openCard } from '@/entities/application'
import { undoEntry } from './undo-log.js'

const undone = new Set()

export function undoDecision(entry) {
  entry = entry || getState().undo
  if (!entry || undone.has(entry.key)) return
  undone.add(entry.key)
  if (!getState().apps.some((x) => x.id === entry.id)) return
  update((d) => {
    d.toasts = d.toasts.filter((t) => t.undoKey !== entry.key)
    const i = d.apps.findIndex((x) => x.id === entry.id)
    d.apps[i] = entry.before
    if (d.undo && d.undo.key === entry.key) d.undo = null
    if (!d.nav.includes(entry.id)) d.nav.unshift(entry.id)
  }, { render: false })
  openCard(entry.id, getState().nav)
  update((d) => pushToast(d, 'Решение отменено', 'Заявка вернулась в прежнее состояние, участник ничего не получил'), { render: false })
}

export const undoByKey = (key) => undoDecision(undoEntry(key))
