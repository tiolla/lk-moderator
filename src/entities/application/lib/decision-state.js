import { currentRole } from '@/entities/staff/@x/application.js'
import { commentCount, withParticipant } from './core.js'
import { canDecide, mine } from './ownership.js'
import { mismatches, badDocs } from './criteria.js'
import { SUB_TITLES } from '../model/anketa-fields.js'

export const seenKey = (a) => a.id + ':' + a.kind + ':' + a.visitNo
export const seenOf = (s, a) => s.seen[seenKey(a)] || {}
export const seenCount = (s, a) => Object.keys(seenOf(s, a)).length

export function stepSummary(s, a, kind) {
  if (((kind === 'app' && a.kind === 'app' && a.status === 'new') || (kind === 'anketa' && a.status === 'anketa')) && !mine(s, a)) {
    const what = kind === 'anketa' ? 'Анкету' : 'Отбор'
    return currentRole(s) === 'coord'
      ? 'Координатор просмотрел и передал врачу — решение за ним.'
      : what + ' сначала смотрит координатор. Решение — после того, как он передаст.'
  }
  if (currentRole(s) === 'coord' && kind === 'anketa') return 'Анкету проверяет врач.'
  if (withParticipant(a, kind)) {
    return (kind === 'anketa' ? 'Анкета' : 'Заявка') + ' у участника на доработке. Решение — после того, как он отправит её снова.'
  }
  if (kind === 'anketa') {
    if (a.status === 'approved') return 'Участник ещё не отправил анкету.'
    if (a.status === 'done') return a.kind === 'visit' ? 'Анкета визита ' + a.visitNo + ' подтверждена.' : 'Анкета подтверждена.'
    return 'Анкета не на проверке.'
  }
  if (a.status === 'rejected') return 'Заявка отклонена.'
  if (a.num) return 'Отбор пройден: участник принят под № ' + a.num + '.'
  return 'Заявка не на проверке.'
}

export function applicationClean(s, a) {
  return canDecide(s, a, 'app') && !mismatches(a).length && commentCount(a, 'app') === 0 && !badDocs(a).length
}

export function anketaClean(s, a) {
  return canDecide(s, a, 'anketa') && commentCount(a, 'anketa') === 0 && seenCount(s, a) === SUB_TITLES.length
}
