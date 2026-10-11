import { configureStore, useStore } from '@/shared/model/store.js'
import { rememberFocus } from '@/shared/lib/focus.js'
import { alignRole, loadAssignments, rolesIn, signedInUser } from '@/entities/staff'
import { buildDemoSet, pageCount, queueList, queueTabs, saveApps, savedApps, studyHasFamilies } from '@/entities/application'
import { readKeysSetting } from '@/features/keyboard'

export function reconcile(d) {
  if (d.study !== 'all' && !rolesIn(d, d.study).length) d.study = 'all'
  if (d.study !== 'all' && !rolesIn(d, d.study).includes(d.role)) d.role = rolesIn(d, d.study)[0]
  const tabs = queueTabs(d)
  if (!tabs.some((k) => k.k === d.queueTab)) d.queueTab = tabs[0].k
  if (d.screen === 'queue') {
    const n = queueList(d).length
    if (d.cursor >= n) d.cursor = Math.max(0, n - 1)
  }
  if (d.screen === 'people') {
    if (!studyHasFamilies(d)) d.view = 'list'
    if (d.view === 'list') {
      const pages = pageCount(d)
      if (d.page > pages) d.page = pages
    }
  }
}

function openFromAddress(state, search) {
  const q = new URLSearchParams(search)
  const id = q.get('app')
  if (!id) return
  const found = state.apps.find((a) => a.id === id || a.id.indexOf(id) >= 0)
  if (!found) return
  state.appId = found.id
  state.screen = 'card'
  state.nav = state.apps.map((a) => a.id)
  state.tab = q.get('tab') === 'anketa' ? 'anketa' : 'app'
  state.sub = +(q.get('sub') || 1)
  state.visit = +(q.get('visit') || 0) || null
}

export function initStore() {
  const search = typeof location !== 'undefined' ? location.search : ''
  const assignments = loadAssignments()
  const demo = buildDemoSet(assignments)
  const state = {
    renderTick: 0,
    screen: 'queue',
    queueTab: 'all',
    queueStep: 'all',
    study: 'all',
    appId: null, tab: 'app', sub: 1, visit: null,
    query: '', modal: null, apps: demo, nav: [],
    onlyRepeat: false, showPostponed: false,
    stageFilter: 'all', view: 'list', peopleState: 'all', group: null,
    note: null, doc: 0, from: 'queue', autoOpen: false,
    page: 1, sort: 'wait', asc: false, cursor: 0, undo: null, soon: '',
    onlyChangedAnswers: false, docZoom: 1, docRot: 0, snilsShown: false,
    keysOn: readKeysSetting(), answerDraft: '', focusTitle: false,
    role: 'doctor', user: signedInUser(search),
    assignments, seen: {}, exports: [], toasts: [],
  }
  alignRole(state)
  state.apps = savedApps(demo.length) || demo
  openFromAddress(state, search)
  reconcile(state)
  useStore.setState(state)
  configureStore({ beforeRender: rememberFocus, reconcile })
  useStore.subscribe((s, prev) => { if (s.apps !== prev.apps) saveApps(s.apps) })
}
