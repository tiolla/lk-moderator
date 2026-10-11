import { GROUP_LABEL, groupCaption } from '@/entities/study/@x/application.js'
import { DEMO_FORM } from '../model/anketa-fields.js'

export const byId = (s, id) => s.apps.find((a) => a.id === id)
export const openApp = (s) => s.apps.find((a) => a.id === s.appId)

export function initials(fio) {
  const p = String(fio || '').trim().split(/\s+/)
  return ((p[0] || '').charAt(0) + (p[1] || '').charAt(0)).toUpperCase()
}

export function ageOf(birth) {
  const p = String(birth || '').split('.')
  if (p.length !== 3) return null
  const d = new Date(+p[2], +p[1] - 1, +p[0])
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}

export function valueOf(a, k) {
  const v = a.form[k]
  if (k === 'studyGroup') return GROUP_LABEL[v] || ''
  if (k === 'consentData' || k === 'consentTerms') return v ? 'Отмечено' : 'Не отмечено'
  return v || ''
}

export const visitNumber = (a) => (a.kind === 'visit' ? a.visitNo : 1)

export const anketaKey = (a, field, visit) => 'a_' + (visit || visitNumber(a)) + ':' + field

export function commentCount(a, kind) {
  let n = 0
  const c = a.comments || {}
  for (const k in c) {
    if (!c[k] || !String(c[k]).trim()) continue
    const anketaNote = k.indexOf('a_') === 0
    if (kind === 'anketa' && k.indexOf('a_' + visitNumber(a) + ':') !== 0) continue
    if (kind === 'app' && anketaNote) continue
    n++
  }
  return n
}

export function withParticipant(a, kind) {
  return kind === 'anketa' ? a.status === 'anketaBack' : ['returned', 'docRequest'].includes(a.status)
}

function personalValue(a, k) {
  const f = a.form
  if (k === 'fio') return f.participantFullName
  if (k === 'birth') return f.birth
  if (k === 'phone') return f.phone
  if (k === 'email') return f.email
  if (k === 'sex') return /вна$/.test(f.participantFullName || '') ? 'Женский' : 'Мужской'
  if (k === 'group' && !(a.study === 'dm1' && f.studyGroup === 'main')) return groupCaption(f.studyGroup)
  return undefined
}

export function anketaValue(k, a) {
  const own = a ? personalValue(a, k) : undefined
  if (own !== undefined) return own || ''
  const v = DEMO_FORM[k]
  if (Array.isArray(v)) return v.join(', ')
  if (v === true) return 'Да'
  if (v === false) return 'Нет'
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v.slice(8, 10) + '.' + v.slice(5, 7) + '.' + v.slice(0, 4)
  return v === undefined || v === null || v === '' ? '' : String(v)
}

export function nextNumber(apps, study) {
  let m = 0
  apps.forEach((x) => { if (x.study === study && x.num) m = Math.max(m, +x.num) })
  return m + 1
}
