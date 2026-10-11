import { STUDY_BY } from '@/entities/study/@x/application.js'
import { visitNumber } from './core.js'

export const viewedVisit = (s, a) => s.visit || visitNumber(a)

export const VISIT_STATE_CAPTION = {
  done: 'проверен', review: 'на проверке', back: 'у участника', wait: 'ждём анкету', dropped: 'выбыл', future: 'впереди',
}

export function visitsOf(a) {
  const study = STUDY_BY[a.study]
  const cur = visitNumber(a)
  const list = []
  if (a.kind === 'app') return list
  for (let n = 1; n <= study.visits; n++) {
    const state = n < cur ? 'done' : n > cur ? 'future'
      : ({ anketa: 'review', anketaBack: 'back', done: 'done', approved: 'wait', dropped: 'dropped' })[a.status] || 'wait'
    list.push({ n, state })
  }
  return list
}

export const visitName = (a, n) => (STUDY_BY[a.study].visits < 2 ? 'Визит' : 'Визит ' + n)
