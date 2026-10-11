import { getState, update } from '@/shared/model/store.js'
import { toast } from '@/shared/model/toasts.js'
import { byId } from '../lib/core.js'
import { navList, stepToReview } from '../lib/navigation.js'
import { waitsForMe } from '../lib/ownership.js'

export function goTo(id) {
  const a = byId(getState(), id)
  if (!a) return
  update((d) => {
    d.appId = a.id
    d.tab = stepToReview(a)
    d.sub = 1
    d.note = null
    d.doc = 0
    d.autoOpen = false
    d.visit = null
    d.onlyChangedAnswers = false
    d.answerDraft = ''
    d.focusTitle = true
    d.docZoom = 1
    d.docRot = 0
    d.snilsShown = false
  })
}

export function openCard(id, nav) {
  update((d) => {
    if (d.screen !== 'card') d.from = d.screen === 'people' ? 'people' : 'queue'
    d.nav = nav || []
    d.screen = 'card'
  }, { render: false })
  goTo(id)
}

export function next() {
  const s = getState()
  const list = s.nav.length ? s.nav : s.apps.map((a) => a.id)
  const i = list.indexOf(s.appId)
  const waiting = list.filter((id) => { const x = byId(s, id); return x && x.id !== s.appId && waitsForMe(s, x) }).length
  for (let step = 1; step <= list.length; step++) {
    const candidate = byId(s, list[(i + step) % list.length])
    if (candidate && candidate.id !== s.appId && waitsForMe(s, candidate)) {
      if (s.from === 'queue') update((d) => { d.nav = d.nav.filter((id) => id !== s.appId) }, { render: false })
      goTo(candidate.id)
      toast('Открыта следующая заявка', 'Ждут решения в этом списке: ' + waiting)
      return
    }
  }
  toast('Заявок, ждущих решения, больше нет', 'Вернулись к очереди')
  update((d) => { d.screen = d.from || 'queue'; d.appId = null })
}

export function backToList() {
  update((d) => { d.screen = d.from || 'queue'; d.appId = null; d.note = null })
}

export function step(dir) {
  const s = getState()
  const mode = navList(s)
  const i = mode.list.indexOf(s.appId)
  const j = dir === 'next' ? i + 1 : i - 1
  if (j < 0 || j >= mode.list.length) return
  goTo(mode.list[j])
  if (mode.what === 'анкета' && getState().tab !== 'anketa') update((d) => { d.tab = 'anketa' })
}
