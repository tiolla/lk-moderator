import { stamp } from '@/shared/lib/dates.js'
import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { PEOPLE, ROLES, alignRole, leads, myName, saveAssignments } from '@/entities/staff'
import { STUDY_SHORT } from '@/entities/study'
import { withCoordinator } from '@/entities/application'

export function assign(study, role, code) {
  const s = getState()
  const list = s.assignments[study]
  if (!leads(s, study) || PEOPLE[code].role !== role || list[role].includes(code)) return
  const first = role === 'coord' && !list.coord.length
  update((d) => {
    if (first) d.apps.forEach((a) => { if (a.study === study && a.kind === 'app' && a.status === 'new') a.withDoctor = true })
    d.assignments[study][role].push(code)
    pushToast(d, PEOPLE[code].name + ' — ' + ROLES[role].caption + ' в «' + STUDY_SHORT[study] + '»', first ? 'Новые заявки сначала проверит координатор' : 'Назначение сохранено')
  })
  saveAssignments(getState().assignments)
}

export function unassign(study, role, code) {
  const s = getState()
  const list = s.assignments[study]
  if (!leads(s, study) || (role === 'doctor' && list.doctor.length < 2)) return
  const handed = role === 'coord' && list.coord.length === 1 ? s.apps.filter((a) => a.study === study && withCoordinator(s, a)).map((a) => a.id) : []
  const me = myName(s)
  update((d) => {
    d.assignments[study][role] = d.assignments[study][role].filter((x) => x !== code)
    d.apps.forEach((a) => {
      if (handed.includes(a.id)) a.history.unshift({ text: 'В исследовании не осталось координатора — заявка перешла к врачу', when: stamp(), who: me })
    })
    pushToast(d, PEOPLE[code].name + ' снят(а) с отбора в «' + STUDY_SHORT[study] + '»', handed.length ? 'Координатора больше нет — к врачу перешло заявок: ' + handed.length : 'Назначение сохранено')
    alignRole(d)
  })
  saveAssignments(getState().assignments)
}

export function setCoordMedical(study, checked) {
  if (!leads(getState(), study)) return
  update((d) => {
    d.assignments[study].coordMedical = checked
    pushToast(d, checked ? 'Координатор видит медицинские разделы' : 'Медицинские разделы — только врачу', '«' + STUDY_SHORT[study] + '»: настройка сохранена')
  })
  saveAssignments(getState().assignments)
}
