import { currentRole } from '@/entities/staff/@x/application.js'
import { visitNumber } from './core.js'
import { byStudy, mine, myPostponed, waitsForMe, withCoordinator } from './ownership.js'
import { queueTabOf, queueTabs, taskKey } from './tasks.js'

export function queueBase(s) {
  return byStudy(s, s.apps).filter((a) => (s.showPostponed ? !!a.postponed && mine(s, a) : waitsForMe(s, a)))
}

export const hasTaskChips = (s) => s.queueTab !== 'app' && s.queueTab !== 'all' && !s.showPostponed
const inTab = (s, a) => s.showPostponed || s.queueTab === 'all' || queueTabOf(a) === s.queueTab

export function queueForTask(s, k) {
  return queueBase(s).filter((a) => inTab(s, a) && (k === 'all' || taskKey(a) === k))
}

export function queueList(s) {
  const q = s.query.trim().toLowerCase()
  const base = q ? queueBase(s) : queueForTask(s, hasTaskChips(s) ? s.queueStep : 'all')
  return base
    .filter((a) => q || s.showPostponed || !s.onlyRepeat || a.repeat)
    .filter((a) => {
      if (!q) return true
      return (a.form.participantFullName + ' ' + a.form.applicantFullName + ' ' + a.id + ' ' + (a.num || '')).toLowerCase().indexOf(q) >= 0
    })
    .sort(s.showPostponed
      ? (x, y) => ((x.postponed.untilIso || '9999') < (y.postponed.untilIso || '9999') ? -1 : 1)
      : (x, y) => y.waitH - x.waitH || (x.num || 0) - (y.num || 0))
}

export function emptyQueueHint(s, base) {
  const others = queueTabs(s).filter((k) => k.k !== 'all')
    .map((k) => ({ tab: k, n: base.filter((a) => queueTabOf(a) === k.k).length }))
    .filter((x) => x.n && x.tab.k !== s.queueTab)
  const postponed = myPostponed(s, byStudy(s, s.apps))
  const nearest = postponed.map((a) => a.postponed.untilIso || '9999').sort()[0]
  const nearestOne = (postponed.find((a) => (a.postponed.untilIso || '9999') === nearest) || {}).postponed
  return { others, postponed: postponed.length, nearestUntil: nearestOne && nearestOne.until }
}

export const waitLabel = (a) => (a.waitH >= 24 ? Math.round(a.waitH / 24) + ' д' : a.waitH + ' ч')

export function reviewProgress(s, tab = 'all') {
  let n = 0
  let m = 0
  byStudy(s, s.apps).forEach((a) => {
    if (currentRole(s) === 'coord') {
      if (a.kind === 'app' || a.status !== 'approved') { m++; if (!withCoordinator(s, a)) n++ }
      return
    }
    if (withCoordinator(s, a)) return
    const rejectionWaits = a.coordRejection && !a.coordRejection.reviewed
    if (tab === 'all' || tab === 'app') { m++; if (!(a.kind === 'app' && a.status === 'new') && !rejectionWaits) n++ }
    if (tab === 'app' || a.kind === 'app') return
    const cur = visitNumber(a)
    for (let k = 1; k <= cur; k++) {
      if (tab !== 'all' && tab !== 'v' + k) continue
      if (k < cur) { m += 3; n += 3; continue }
      if (a.status === 'anketa') m++
      else if (['anketaBack', 'done'].includes(a.status)) { m++; n++ }
      if (a.status === 'done' && a.stage === 'blood') { m++; n++ }
    }
  })
  return { n, m }
}
