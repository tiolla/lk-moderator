import { STUDY_BY, STUDY_SHORT, GROUP_LABEL } from '@/entities/study/@x/application.js'
import { visitNumber } from './core.js'
import { byStudy, waitsForMe } from './ownership.js'
import { stageIndex, stageKey, STAGES } from './tasks.js'
import { statusBadge } from '../model/statuses.js'
import { waitLabel } from './queue.js'

export const PEOPLE_VIEWS = [
  { k: 'list', label: 'Список' },
  { k: 'groups', label: 'Родственные группы' },
  { k: 'graph', label: 'Граф' },
]

export const PEOPLE_STATES = [
  { k: 'all', label: 'Все' },
  { k: 'app', label: 'Заявки' },
  { k: 'accepted', label: 'Принятые' },
]

function visitInTable(a) {
  const study = STUDY_BY[a.study]
  if (a.kind === 'app') return 'Отбор'
  if (study.visits < 2) return 'Визит'
  return 'Визит ' + visitNumber(a) + ' из ' + study.visits
}
const visitRank = (a) => (a.kind === 'app' ? 0 : visitNumber(a))
const stageRank = (a) => stageIndex(a) + 1
function stageText(a) {
  const i = stageIndex(a)
  return i < 0 ? '—' : STAGES[i].title
}

export function peopleColumns(s) {
  const cols = [
    { k: 'num', label: '№', val: (a) => (a.num ? String(a.num) : '—'), strong: true, nw: true },
    { k: 'fio', label: 'ФИО', val: (a) => a.form.participantFullName, strong: true },
  ]
  if (s.study === 'all') cols.push({ k: 'study', label: 'Исследование', val: (a) => STUDY_SHORT[a.study] })
  cols.push({ k: 'group', label: 'Группа', val: (a) => GROUP_LABEL[a.form.studyGroup] || '—' })
  cols.push({ k: 'city', label: 'Город', val: (a) => a.form.city || '—' })
  if (s.study !== 'all' && STUDY_BY[s.study].families) {
    cols.push({ k: 'family', label: 'Семья', val: (a) => a.family || '—', nw: true })
    cols.push({ k: 'role', label: 'Связь', val: (a) => a.familyRole || '—' })
  }
  cols.push({ k: 'stage', label: 'Визит', val: visitInTable, nw: true, rank: (a) => visitRank(a) * 10 + stageRank(a) })
  cols.push({ k: 'step', label: 'Этап', val: stageText, rank: (a) => stageRank(a) * 100 + visitRank(a) })
  cols.push({ k: 'status', label: 'Статус', val: (a) => statusBadge(a).label, badge: true, nw: true })
  cols.push({ k: 'wait', label: 'Ждёт', val: (a) => (waitsForMe(s, a) ? waitLabel(a) : '—'), nw: true })
  return cols
}

export function peopleBase(s) {
  return byStudy(s, s.apps).filter((a) => (s.peopleState === 'accepted' ? !!a.num : s.peopleState === 'app' ? !a.num : true))
}

export const peopleStateCount = (s, k) => byStudy(s, s.apps).filter((a) => (k === 'accepted' ? !!a.num : k === 'app' ? !a.num : true)).length

export const stageMatches = (a, k) => k === 'all' || stageKey(a) === k

export function tableRows(s) {
  const q = s.query.trim().toLowerCase()
  let rows = peopleBase(s).filter((a) => stageMatches(a, s.stageFilter))
  if (q) {
    rows = rows.filter((a) => (a.form.participantFullName + ' ' + a.form.applicantFullName + ' ' + a.id + ' ' + (a.num || '') + ' ' + (a.family || ''))
      .toLowerCase().indexOf(q) >= 0)
  }
  const col = peopleColumns(s).find((c) => c.k === s.sort)
  if (col) {
    const empty = (v) => v === '—' || v === '' || v === null || v === undefined
    rows = rows.slice().sort((x, y) => {
      const vx = col.val(x)
      const vy = col.val(y)
      if (empty(vx) !== empty(vy)) return empty(vx) ? 1 : -1
      const sign = s.asc ? 1 : -1
      if (s.sort === 'wait') return sign * (x.waitH - y.waitH)
      if (s.sort === 'num') return sign * ((x.num || 0) - (y.num || 0))
      if (col.rank) return sign * (col.rank(x) - col.rank(y)) || (x.num || 0) - (y.num || 0)
      return sign * String(vx).localeCompare(String(vy), 'ru')
    })
  }
  return rows
}

export const PAGE_SIZE = 50
export const pageCount = (s) => Math.max(1, Math.ceil(tableRows(s).length / PAGE_SIZE))

export function families(s) {
  const map = {}
  const order = []
  peopleBase(s).forEach((a) => {
    if (!a.family) return
    if (!map[a.family]) { map[a.family] = []; order.push(a.family) }
    map[a.family].push(a)
  })
  return order.map((id) => {
    const people = map[id]
    const main = people.find((x) => x.familyRole === 'Основной участник') || people[0]
    const surname = (main.form.participantFullName || '').split(' ')[0].replace(/а$/, '')
    return { id, study: people[0].study, title: 'Семья ' + surname + 'ых', main, people }
  })
}

export const studyHasFamilies = (s) => s.study === 'all' || STUDY_BY[s.study].families
