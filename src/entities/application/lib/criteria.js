import { plural } from '@/shared/lib/plural.js'
import { GROUP_LABEL, CITIES } from '@/entities/study/@x/application.js'
import { ageOf } from './core.js'

const isBadDoc = (d) => d.mark === 'bad' || d.mark === 'need'
export const badDocs = (a) => a.docs.filter(isBadDoc)

export function criteria(a) {
  const f = a.form
  const age = ageOf(f.birth)
  const years = (n) => plural(n, ['год', 'года', 'лет'])
  const needsSummary = f.studyGroup === 'main'
  const bad = badDocs(a).length
  return [
    { k: 'group', title: 'Группа исследования выбрана', fact: f.studyGroup ? GROUP_LABEL[f.studyGroup] : 'Не выбрана', ok: !!f.studyGroup },
    {
      k: 'age',
      title: 'Возраст попадает в протокол',
      fact: age === null ? 'Дата рождения не распознана'
        : a.study === 'dm1' ? years(age) + ', протокол до 20 лет' : years(age) + ', ограничения нет',
      ok: age !== null && (a.study !== 'dm1' || age <= 20),
    },
    {
      k: 'city',
      title: 'Город обслуживается',
      fact: f.city ? (CITIES.includes(f.city) ? f.city : f.city + ' — точки забора нет') : 'Город не указан',
      ok: !!f.city && CITIES.includes(f.city),
    },
    {
      k: 'doc',
      title: 'Выписка приложена и читается',
      fact: needsSummary
        ? a.docs.length
          ? plural(a.docs.length, ['документ', 'документа', 'документов']) + ' во вложении' +
            (bad ? ', из них ' + bad + ' с отметкой «не читается» или «нужен другой»' : '')
          : 'Документов нет'
        : 'Для этой группы документы не требуются' + (bad ? ', но ' + bad + ' с отметкой «не читается» или «нужен другой»' : ''),
      ok: (!needsSummary || a.docs.length > 0) && !bad,
    },
    {
      k: 'contacts',
      title: 'Контакты заполнены',
      fact: (f.email || 'почты нет') + ' · ' + (f.phone || 'телефона нет'),
      ok: !!(f.phone && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || '')),
    },
  ]
}

export function criterionResult(a, c) {
  const manual = (a.criteria || {})[c.k]
  if (manual === 'ok') return 'ok'
  if (manual === 'bad') return 'bad'
  return c.ok ? 'ok' : 'bad'
}

export const mismatches = (a) => criteria(a).filter((c) => criterionResult(a, c) === 'bad').map((c) => c.title)

export const CRITERION_FIELD = {
  group: () => ({ field: 'studyGroup', text: 'Выберите группу исследования.' }),
  age: () => ({ field: 'birth', text: 'Возраст не подходит под протокол исследования — проверьте дату рождения.' }),
  city: (a) => ({ field: 'city', text: 'В городе «' + a.form.city + '» нет точки забора биоматериала. Выберите город из списка: ' + CITIES.join(', ') + '.' }),
  contacts: (a) => (a.form.phone
    ? { field: 'email', text: 'Проверьте адрес почты — в нём нет домена (например, @mail.ru).' }
    : { field: 'phone', text: 'Укажите телефон — он нужен для связи перед визитом.' }),
}
