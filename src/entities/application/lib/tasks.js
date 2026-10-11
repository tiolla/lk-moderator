import { STUDY_BY, STUDIES } from '@/entities/study/@x/application.js'
import { currentRole } from '@/entities/staff/@x/application.js'

export function visitCaption(a) {
  const single = STUDY_BY[a.study] && STUDY_BY[a.study].visits < 2
  return single ? 'Визит' : 'Визит ' + (a.kind === 'visit' ? a.visitNo : 1)
}

export const STAGES = [
  { k: 'anketa', title: 'Анкета' },
  { k: 'date', title: 'Выбор даты и времени' },
  { k: 'blood', title: 'Сдача крови' },
]

export function stageIndex(a) {
  if (a.kind === 'app' || a.status === 'dropped') return -1
  if (['approved', 'anketa', 'anketaBack'].includes(a.status)) return 0
  return a.stage === 'blood' ? 2 : 1
}

export function stageKey(a) {
  const i = stageIndex(a)
  return i < 0 ? '' : STAGES[i].k
}

export const WAITING_TASKS = [{ k: 'anketa', title: 'Анкета' }]

export function taskKey(a) {
  if (a.status === 'rejected' && a.coordRejection) return 'reject-review'
  if (a.kind === 'app') return 'app'
  if (a.status === 'anketa') return 'anketa'
  return ''
}

export const taskVerb = (a) => (taskKey(a) === 'reject-review' ? 'Посмотреть отказ' : 'Проверить')

export const taskName = (k) => (WAITING_TASKS.find((d) => d.k === k) || {}).title || ''

export function whatWaits(a) {
  const k = taskKey(a)
  if (k === 'reject-review') return 'Отказ координатора'
  if (k === 'app') return 'Отбор'
  if (k === 'anketa') return a.kind === 'visit' ? 'Анкета визита' : 'Анкета участника'
  return taskName(k)
}

export function taskDetails(s, a) {
  const k = taskKey(a)
  if (k === 'reject-review') return [a.kind === 'app' ? 'отбор' : visitCaption(a), a.coordRejection.reason]
  if (k === 'app') return a.withDoctor && currentRole(s) === 'doctor' ? ['проверил координатор'] : []
  return [visitCaption(a)]
}

export function taskLine(a) {
  if (taskKey(a) === 'reject-review') return 'отказ координатора · ' + a.coordRejection.reason
  return stageCaption(a)
}

export function stageCaption(a) {
  if (a.kind === 'visit') return visitCaption(a) + ' · анкета визита'
  if (a.kind === 'anketa') return visitCaption(a) + ' · анкета участника'
  return 'Отбор'
}

export const queueTabOf = (a) => (a.kind === 'app' ? 'app' : 'v' + (a.kind === 'visit' ? a.visitNo : 1))

export function queueTabs(s) {
  const n = s.study === 'all' ? Math.max(...STUDIES.map((x) => x.visits)) : STUDY_BY[s.study].visits
  const tabs = [{ k: 'all', label: 'Все' }, { k: 'app', label: 'Отбор' }]
  for (let i = 1; i <= n; i++) {
    const tab = { k: 'v' + i, label: n === 1 ? 'Визит' : 'Визит ' + i }
    if (s.study === 'all') {
      const whose = STUDIES.filter((x) => x.visits >= i).map((x) => x.short)
      if (whose.length < STUDIES.length) tab.title = 'Есть у исследований: ' + whose.join(', ')
      if (whose.length <= 2) tab.label += ' · ' + whose.join(', ')
    }
    tabs.push(tab)
  }
  return tabs
}
