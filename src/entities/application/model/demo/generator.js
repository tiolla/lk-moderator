import { STUDIES, CITIES } from '@/entities/study/@x/application.js'
import { doc } from './handwritten.js'

export const SURNAMES = ['Соколов', 'Петров', 'Морозов', 'Волков', 'Лебедев', 'Егоров', 'Никитин', 'Орлов', 'Крылов', 'Зайцев',
  'Гусев', 'Беляев', 'Тарасов', 'Белов', 'Комаров', 'Щербаков', 'Блинов', 'Киселёв', 'Макаров', 'Андреев',
  'Ковалёв', 'Ильин', 'Гордеев', 'Савельев', 'Богданов', 'Воронов', 'Панов', 'Ерофеев', 'Шилов', 'Дьяконов']
export const NAMES_M = ['Артём', 'Кирилл', 'Данила', 'Матвей', 'Илья', 'Тимур', 'Роман', 'Глеб', 'Михаил', 'Пётр']
export const NAMES_F = ['Мария', 'Анна', 'Дарья', 'Полина', 'София', 'Ксения', 'Алиса', 'Вера', 'Ольга', 'Елена']
const PATRONYMICS_M = ['Игоревич', 'Сергеевич', 'Андреевич', 'Петрович', 'Дмитриевич', 'Олегович']
export const PATRONYMICS_F = ['Игоревна', 'Сергеевна', 'Андреевна', 'Петровна', 'Дмитриевна', 'Олеговна']
const MODERATORS = ['Соколова К. В.', 'Иванова Е. С.', 'Петров Д. А.']
const FAMILY_ROLES = ['Основной участник', 'Мать', 'Отец', 'Сестра', 'Брат']

const LAYOUT = [
  { n: 13, status: 'new', kind: 'app' },
  { n: 9, status: 'anketa', kind: 'anketa' },
  { n: 8, status: 'anketa', kind: 'visit' },
  { n: 3, status: 'new', kind: 'app', postponed: true },
  { n: 9, status: 'returned', kind: 'app' },
  { n: 4, status: 'docRequest', kind: 'app' },
  { n: 12, status: 'approved', kind: 'anketa' },
  { n: 24, status: 'done', kind: 'visit' },
  { n: 5, status: 'rejected', kind: 'app' },
  { n: 4, status: 'dropped', kind: 'visit' },
  { n: 3, status: 'noshow', kind: 'visit' },
]

export function generateApps(waitsForMe, visitsOf) {
  let seed = 20260923
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  const pick = (m) => m[Math.floor(rnd() * m.length) % m.length]
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1))

  const list = []
  let number = 799
  const numbers = {}
  const families = {}
  const wave = {}
  let familyNo = 11
  let visitPick = 0
  STUDIES.forEach((s) => { numbers[s.id] = 40 })

  LAYOUT.forEach((row) => {
    for (let i = 0; i < row.n; i++) {
      let s = pick(STUDIES)
      if (row.kind === 'visit' && s.visits < 2) s = STUDIES.filter((x) => x.visits > 1)[visitPick++ % 4]
      const female = rnd() < 0.5
      let fio = pick(SURNAMES) + (female ? 'а' : '') + ' ' + (female ? pick(NAMES_F) : pick(NAMES_M)) + ' ' + (female ? pick(PATRONYMICS_F) : pick(PATRONYMICS_M))
      let applicant = rnd() < 0.45 ? fio : pick(SURNAMES) + 'а ' + pick(NAMES_F) + ' ' + pick(PATRONYMICS_F)
      const accepted = ['approved', 'done', 'dropped', 'noshow'].includes(row.status) || row.kind !== 'app'
      const group = rnd() < 0.68 ? 'main' : rnd() < 0.5 ? 'control' : 'relatives'
      const year = row.kind === 'visit' || s.id !== 'dm1' ? int(1972, 2012) : int(2008, 2019)
      const hours = row.status === 'new' || row.status === 'anketa' ? int(1, 96) : int(24, 600)
      let family = null
      let familyRole = ''
      if (s.families && rnd() < 0.8) {
        const base = s.id + '-' + Math.floor(rnd() * 3)
        let key = base + '/' + (wave[base] || 0)
        if (families[key] && families[key].n >= 4) { wave[base] = (wave[base] || 0) + 1; key = base + '/' + wave[base] }
        if (!families[key]) families[key] = { id: 'СЕМ-2026-00' + familyNo++, hasMain: false, n: 0, surname: fio.split(' ')[0].replace(/а$/, '') }
        family = families[key].id
        families[key].n++
        if (!families[key].hasMain) { familyRole = FAMILY_ROLES[0]; families[key].hasMain = true }
        else {
          familyRole = (female ? ['Мать', 'Сестра', 'Дочь', 'Сестра'] : ['Отец', 'Брат', 'Сын', 'Брат'])[Math.floor(rnd() * 4)]
          const selfApplicant = applicant === fio
          fio = families[key].surname + (female ? 'а' : '') + ' ' + fio.split(' ').slice(1).join(' ')
          if (selfApplicant) applicant = fio
        }
      }
      const repeat = (row.status === 'new' || row.status === 'anketa') && rnd() < 0.3

      const a = {
        id: 'ЗАЯВ-2026-0' + number--,
        study: s.id,
        status: row.status,
        kind: row.kind,
        visitNo: row.kind === 'visit' ? int(2, Math.max(2, s.visits)) : 0,
        num: accepted ? numbers[s.id]++ : null,
        family,
        familyRole,
        repeat,
        changed: repeat ? ['email', 'phone'] : [],
        postponed: row.postponed
          ? { reason: pick(['Уточняю у генетика', 'Жду ответа коллеги', 'Нужна консультация специалиста']), until: null, untilIso: null, who: MODERATORS[number % MODERATORS.length] }
          : null,
        moderator: pick(MODERATORS),
        submitted: int(1, 22) + ' сентября',
        waitH: hours,
        waited: hours < 24 ? hours + ' ч' : Math.round(hours / 24) + ' д',
        generated: true,
        form: {
          applicantFullName: applicant,
          participantFullName: fio,
          studyGroup: group,
          birth: int(10, 28) + '.0' + int(1, 9) + '.' + year,
          email: 'user' + int(100, 999) + '@example.com',
          phone: '+7 (0' + int(10, 99) + ') ' + int(100, 999) + '-' + int(10, 99) + '-' + int(10, 99),
          city: pick(CITIES),
          comment: '',
          consentData: true,
          consentTerms: (rnd(), true),
        },
        docs: rnd() < 0.85 ? [doc('vypiska_' + int(1000, 9999) + '.pdf', 'PDF', int(4, 29) / 10 + ' МБ', int(1, 20) + ' сентября', 'Выписка из истории болезни')] : [],
        comments: {},
        criteria: {},
        history: [{ text: 'Заявка отправлена участником', when: int(1, 20) + ' сентября, 10:00' }],
      }
      list.push(a)
    }
  })
  const repeatDm1 = list.find((a) => a.study === 'dm1' && a.kind === 'anketa' && waitsForMe(a))
  if (repeatDm1) { repeatDm1.repeat = true; repeatDm1.changed = ['email', 'phone'] }
  for (let v = 2; v <= visitsOf('dm1'); v++) {
    if (list.some((a) => a.study === 'dm1' && a.kind === 'visit' && a.visitNo === v && waitsForMe(a))) continue
    const passed = list.find((a) => a.study === 'dm1' && a.kind === 'visit' && a.status === 'done')
    if (!passed) break
    passed.status = 'anketa'
    passed.visitNo = v
    passed.waitH = 6 + v * 7
    passed.waited = passed.waitH < 24 ? passed.waitH + ' ч' : Math.round(passed.waitH / 24) + ' д'
  }
  return list
}
