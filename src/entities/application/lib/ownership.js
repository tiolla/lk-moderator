import { currentRole, hasCoordinator, studiesOfRole } from '@/entities/staff/@x/application.js'
import { visitNumber } from './core.js'

export function withCoordinator(s, a) {
  if (!hasCoordinator(s, a.study)) return false
  if (a.kind === 'app') return a.status === 'new' && !a.withDoctor
  return a.status === 'anketa' && !a.anketaWithDoctor
}

export const mine = (s, a) => (currentRole(s) === 'coord' ? withCoordinator(s, a) : !withCoordinator(s, a))

export function notesExist(a, kind) {
  if ((a.noteToDoctor || {})[kind]) return true
  return Object.keys(a.coordNotes || {}).some((k) => (kind === 'anketa' ? k.indexOf('a_' + visitNumber(a) + ':') === 0 : k.indexOf('a_') !== 0))
}

export function unreadNote(a) {
  return ['app', 'anketa'].some((kind) => notesExist(a, kind) && !(a.notesRead || {})[kind])
}

export const COORD_REJECT_REASONS = {
  app: ['Возраст не подходит под протокол', 'В городе нет точки забора крови', 'Нет обязательного документа', 'Повторная заявка того же участника'],
  anketa: ['Участник сам отказался от участия', 'Анкета заполнена не на того участника', 'Возраст не подходит под протокол'],
}

export function waitsForMe(s, a) {
  if (a.postponed) return false
  if (!mine(s, a)) return false
  if (a.status === 'new' || a.status === 'anketa') return true
  return a.status === 'rejected' && !!a.coordRejection && !a.coordRejection.reviewed && currentRole(s) === 'doctor'
}

export const myPostponed = (s, list) => list.filter((a) => a.postponed && mine(s, a))

export function canDecide(s, a, kind) {
  return kind === 'anketa' ? a.status === 'anketa' && mine(s, a) : a.status === 'new' && mine(s, a)
}

export function byStudy(s, list) {
  const mineStudies = studiesOfRole(s, currentRole(s))
  return list.filter((a) => (s.study === 'all' || a.study === s.study) && mineStudies.includes(a.study))
}
