import { getState, update } from '@/shared/model/store.js'
import { toast } from '@/shared/model/toasts.js'
import { CRITERION_FIELD, SUB_TITLES, newDocKey, openApp, seenKey, visitNumber } from '@/entities/application'

const withOpenApp = (recipe, options) => update((d) => { recipe(d.apps.find((x) => x.id === d.appId), d) }, options)


export function openNote(key) {
  update((d) => { d.note = key })
}

export function setComment(key, value) {
  withOpenApp((a) => {
    a.comments = a.comments || {}
    const v = value.trim()
    if (v) a.comments[key] = v
    else delete a.comments[key]
  }, { render: false })
}

export function noteFromCriterion(k) {
  withOpenApp((a, d) => {
    const m = CRITERION_FIELD[k](a)
    a.comments = a.comments || {}
    if (!a.comments[m.field]) a.comments[m.field] = m.text
    d.note = m.field
  })
}


export function toggleCriterion(k, v) {
  withOpenApp((a) => {
    a.criteria = a.criteria || {}
    if (a.criteria[k] === v) delete a.criteria[k]
    else a.criteria[k] = v
  })
}

export function toggleAutoCheck() {
  update((d) => { d.autoOpen = !d.autoOpen })
}

export function toggleSeen(n) {
  update((d) => {
    const a = d.apps.find((x) => x.id === d.appId)
    const key = seenKey(a)
    const seen = d.seen[key] || (d.seen[key] = {})
    if (seen[n]) { delete seen[n]; return }
    seen[n] = true
    for (let i = 1; i <= SUB_TITLES.length; i++) {
      const j = (n + i - 1) % SUB_TITLES.length + 1
      if (!seen[j]) { d.sub = j; break }
    }
  })
}

export function revealSnils() {
  update((d) => { d.snilsShown = true })
  toast('СНИЛС показан', 'В рабочей системе показ пишется в журнал доступа')
}

export function openStep(k) {
  const a = openApp(getState())
  update((d) => {
    if (k === 'app') d.tab = 'app'
    else {
      d.tab = 'anketa'
      d.visit = +k === visitNumber(a) ? null : +k
      d.sub = 1
      d.onlyChangedAnswers = false
    }
    d.note = null
  })
}

export function openTab(k) {
  update((d) => { d.tab = k })
}

export function openSection(n) {
  update((d) => { d.sub = n })
}

export function toggleOnlyChanged() {
  update((d) => { d.onlyChangedAnswers = !d.onlyChangedAnswers })
}


export function markDoc(i, v) {
  withOpenApp((a) => { a.docs[i].mark = a.docs[i].mark === v ? '' : v })
}

export function selectDoc(i) {
  update((d) => { d.doc = i })
}

export function openViewer(i, focusInput) {
  update((d) => { d.doc = i; d.docRot = 0; d.modal = { type: 'doc', i, focusInput: !!focusInput } })
}

export function viewerSelect(j) {
  update((d) => { d.modal.i = j; d.doc = j; d.docRot = 0 })
}

export function addDocComment(text) {
  const t = text.trim()
  if (!t) return false
  update((d) => {
    const a = d.apps.find((x) => x.id === d.appId)
    a.comments = a.comments || {}
    a.comments[newDocKey(a, d.modal.i)] = t
    d.modal.focusInput = true
  })
  return true
}

export function deleteDocComment(key) {
  withOpenApp((a) => { delete a.comments[key] })
}

export function zoomDoc(dir) {
  update((d) => { d.docZoom = Math.max(0.5, Math.min(2, (d.docZoom || 1) + 0.25 * dir)) })
}

export function rotateDoc() {
  update((d) => { d.docRot = ((d.docRot || 0) + 90) % 360 })
}
