import { STUDIES, STUDY_SHORT } from '@/entities/study/@x/staff.js'
import { PEOPLE, ROLES } from '../model/people.js'

export const me = (s) => PEOPLE[s.user] || PEOPLE.sokolova
export const myCode = (s) => (PEOPLE[s.user] ? s.user : 'sokolova')
export const myName = (s) => me(s).name

export function rolesIn(s, study) {
  const person = me(s)
  const assigned = (s.assignments[study] || {})[person.role] || []
  return assigned.includes(myCode(s)) ? [person.role] : []
}

export function studiesOfRole(s, role) {
  return STUDIES.filter((x) => rolesIn(s, x.id).includes(role)).map((x) => x.id)
}

export const personRoles = (s) => [me(s).role]
export const currentRole = (s) => (s.role === 'coord' ? 'coord' : 'doctor')
export const leads = (s, study) => me(s).leads.includes(study)

export function studyLead(study) {
  const code = Object.keys(PEOPLE).find((k) => PEOPLE[k].leads.includes(study))
  return code ? PEOPLE[code].name : ''
}

export const hasCoordinator = (s, study) => ((s.assignments[study] || {}).coord || []).length > 0

export const coordSeesMedical = (s, study) => (s.assignments[study] || {}).coordMedical !== false

export function describePerson(s, code) {
  const person = PEOPLE[code]
  const where = STUDIES.filter((x) => (s.assignments[x.id][person.role] || []).includes(code)).map((x) => x.short)
  return ROLES[person.role].caption + (where.length ? ': ' + where.join(', ') : ', ни в одном исследовании') +
    (person.leads.length ? '; руководит: ' + person.leads.map((x) => STUDY_SHORT[x]).join(', ') : '')
}
