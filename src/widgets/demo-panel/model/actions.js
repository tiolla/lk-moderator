import { stamp } from '@/shared/lib/dates.js'
import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { PEOPLE, currentRole, describePerson, switchUser } from '@/entities/staff'
import { CITIES, STUDIES, STUDY_BY, STUDY_SHORT } from '@/entities/study'
import {
  MOD_FIELDS, NAMES_F, clearSavedApps, NAMES_M, PATRONYMICS_F, SURNAMES, anketaKey, byStudy, doc, nextNumber, openApp, openCard, queueList,
  queueTabOf, visitName, waitsForMe,
} from '@/entities/application'

let demoCount = 0

function newApplication(study) {
  demoCount++
  const s = study || (getState().study === 'all' ? STUDIES[demoCount % STUDIES.length] : STUDY_BY[getState().study])
  const fio = SURNAMES[(demoCount * 7) % SURNAMES.length] + 'а ' + NAMES_F[(demoCount * 3) % NAMES_F.length] + ' ' + PATRONYMICS_F[demoCount % PATRONYMICS_F.length]
  return {
    id: 'ЗАЯВ-2026-1' + (100 + demoCount), study: s.id, status: 'new', kind: 'app',
    visitNo: 0, num: null, family: null, familyRole: '', repeat: false, changed: [],
    postponed: null, moderator: 'Соколова К. В.',
    submitted: 'сегодня', waitH: 0, waited: '0 ч',
    form: {
      applicantFullName: fio, participantFullName: fio, studyGroup: 'main',
      birth: '14.03.2011', email: 'demo' + demoCount + '@example.com',
      phone: '+7 (012) 000-0' + (10 + demoCount % 80), city: CITIES[demoCount % CITIES.length],
      comment: '', consentData: true, consentTerms: true,
    },
    docs: [doc('vypiska_demo' + demoCount + '.pdf', 'PDF', '1,4 МБ', 'сегодня', 'Выписка из истории болезни')],
    comments: {}, criteria: {}, history: [{ text: 'Заявка отправлена участником', when: stamp() }],
  }
}

const first = (s, fn) => byStudy(s, s.apps).find(fn)
const draftOf = (d, a) => d.apps.find((x) => x.id === a.id)
const queueIds = () => queueList(getState()).map((x) => x.id)

function signIn(code) {
  update((d) => {
    switchUser(d, code)
    pushToast(d, (code === 'petrov' ? 'Вошёл ' : 'Вошла ') + PEOPLE[code].name, describePerson(d, code))
  })
}

function participantStatus(status, text) {
  update((d) => {
    const a = draftOf(d, first(getState(), (x) => x.num && x.status !== 'dropped'))
    a.status = status
    a.waitH = 0
    a.postponed = null
    a.history.unshift({ text, when: stamp() })
    d.screen = 'people'
    d.view = 'list'
    d.peopleState = 'accepted'
    pushToast(d, text, a.form.participantFullName + ' · № ' + a.num + ' · виден в списке участников', 'warn')
  })
}

export const DEMO_ACTIONS = {
  userSokolova: { label: 'Вошла Соколова', hint: 'врач; руководит СД1, ВДКН, Моногенными', can: (s) => s.user !== 'sokolova', run: () => signIn('sokolova') },
  userOrlova: { label: 'Вошла Орлова', hint: 'координатор', can: (s) => s.user !== 'orlova', run: () => signIn('orlova') },
  userPetrov: { label: 'Вошёл Петров', hint: 'врач; руководит Ожирением и Щитовидной', can: (s) => s.user !== 'petrov', run: () => signIn('petrov') },
  new: {
    label: 'Пришла новая заявка', hint: 'встанет в конец: список отсортирован по ожиданию',
    can: () => true,
    run() {
      const a = newApplication()
      update((d) => {
        d.apps.unshift(a)
        d.screen = 'queue'; d.queueTab = 'app'; d.queueStep = 'all'; d.showPostponed = false; d.query = ''
      }, { render: false })
      update((d) => {
        d.cursor = Math.max(0, queueIds().indexOf(a.id))
        pushToast(d, 'Пришла новая заявка', STUDY_SHORT[a.study] + ' · ' + a.form.participantFullName + ' · в конце очереди')
      })
    },
  },
  fixed: {
    label: 'Участник исправил и вернул', hint: 'возвращённая придёт как повторная',
    can: (s) => !!first(s, (a) => a.status === 'returned' || a.status === 'docRequest'),
    run() {
      update((d) => {
        const a = draftOf(d, first(getState(), (x) => x.status === 'returned' || x.status === 'docRequest'))
        Object.assign(a, { status: 'new', kind: 'app', withDoctor: false, repeat: true, changed: ['email', 'phone'], waitH: 1, postponed: null, num: null })
        a.history.unshift({ text: 'Участник исправил замечания и отправил заявку снова', when: stamp() })
        d.screen = 'queue'; d.queueTab = 'app'; d.queueStep = 'all'
        pushToast(d, 'Участник исправил и отправил снова', a.form.participantFullName + ' · помечена как повторная', 'warn')
      })
    },
  },
  anketa: {
    label: 'Отправил анкету участника', hint: 'одобренная заявка встанет в таб «Визит 1»',
    can: (s) => !!first(s, (a) => a.status === 'approved'),
    run() {
      update((d) => {
        const a = draftOf(d, first(getState(), (x) => x.status === 'approved'))
        Object.assign(a, { status: 'anketa', kind: 'anketa', waitH: 1, anketaWithDoctor: false })
        a.history.unshift({ text: 'Анкета отправлена на проверку', when: stamp() })
        d.screen = 'queue'; d.queueTab = 'v1'
        pushToast(d, 'Участник отправил анкету', a.form.participantFullName + ' · № ' + a.num)
      })
    },
  },
  visit: {
    label: 'Заполнил анкету визита', hint: 'только там, где визитов больше одного',
    can: (s) => !!first(s, (a) => a.status === 'done' && STUDY_BY[a.study].visits > 1),
    run() {
      update((d) => {
        const a = draftOf(d, first(getState(), (x) => x.status === 'done' && STUDY_BY[x.study].visits > 1))
        Object.assign(a, { status: 'anketa', kind: 'visit', waitH: 1, anketaWithDoctor: false })
        a.visitNo = Math.min((a.visitNo || 1) + 1, STUDY_BY[a.study].visits)
        a.history.unshift({ text: 'Анкета визита ' + a.visitNo + ' отправлена на проверку', when: stamp() })
        d.screen = 'queue'; d.queueTab = queueTabOf(a); d.queueStep = 'all'
        pushToast(d, 'Заполнил анкету визита', a.form.participantFullName + ' · визит ' + a.visitNo)
      })
    },
  },
  dropped: {
    label: 'Выбыл из исследования',
    can: (s) => !!first(s, (a) => a.num && a.status !== 'dropped'),
    run: () => participantStatus('dropped', 'Участник выбыл из исследования'),
  },
  compare: {
    label: 'Сравнение визитов', hint: 'анкета визита 3 и дальше: что изменилось с прошлого визита',
    can: (s) => !!first(s, (a) => a.kind === 'visit' && a.status === 'anketa'),
    run() {
      const s = getState()
      const a = first(s, (x) => x.kind === 'visit' && x.status === 'anketa' && x.visitNo >= 3) || first(s, (x) => x.kind === 'visit' && x.status === 'anketa')
      update((d) => { d.screen = 'queue'; d.queueTab = queueTabOf(a); d.queueStep = 'all'; d.showPostponed = false; d.query = '' }, { render: false })
      openCard(a.id, queueIds())
      update((d) => {
        d.sub = 2
        pushToast(d, 'Открыта анкета ' + visitName(a, a.visitNo).toLowerCase(), 'Раздел «Антропометрия»: синие метки — что изменилось с визита ' + (a.visitNo - 1))
      })
    },
  },
  fill: {
    label: 'Проставить три замечания', hint: 'чтобы проверить возврат',
    can: (s) => s.screen === 'card' && !!openApp(s),
    run() {
      update((d) => {
        const a = d.apps.find((x) => x.id === d.appId)
        a.comments = a.comments || {}
        if (d.tab === 'anketa') {
          MOD_FIELDS.slice(0, 3).forEach((p, i) => {
            a.comments[anketaKey(a, p[0])] = ['Уточните формулировку', 'Ответ не сходится с выпиской', 'Заполните поле полностью'][i]
          })
        } else {
          a.comments.email = 'Адрес почты без домена — проверьте и укажите заново.'
          a.comments.phone = 'Телефон нужен для связи перед визитом.'
          a.comments.birth = 'Дата рождения не сходится с выпиской.'
        }
        pushToast(d, 'Проставлены три замечания', 'Кнопка возврата включилась')
      })
    },
  },
  baddoc: {
    label: 'Документ «не читается»', hint: 'автопроверка покраснеет',
    can: (s) => s.screen === 'card' && !!openApp(s) && openApp(s).docs.length > 0,
    run() {
      update((d) => {
        d.apps.find((x) => x.id === d.appId).docs[0].mark = 'bad'
        d.autoOpen = true
        pushToast(d, 'Документ отмечен «не читается»', 'Критерий выписки ушёл в «Проверьте»', 'warn')
      })
    },
  },
  add10: {
    label: 'Добавить 10 заявок', hint: 'чтобы посмотреть длинный список',
    can: () => true,
    run() {
      const added = Array.from({ length: 10 }, () => newApplication())
      update((d) => {
        added.forEach((a) => d.apps.unshift(a))
        d.screen = 'queue'; d.queueTab = 'app'; d.queueStep = 'all'
        pushToast(d, 'Добавлено 10 заявок', 'Все ждут отбора')
      })
    },
  },
  family: {
    label: 'Добавить родственную группу', hint: 'три человека одной семьёй',
    can: () => true,
    run() {
      const cur = getState().study
      const s = STUDY_BY[cur] && STUDY_BY[cur].families ? STUDY_BY[cur] : STUDY_BY.ait
      const id = 'СЕМ-2026-0' + (30 + demoCount)
      const surname = SURNAMES[(demoCount * 7) % SURNAMES.length]
      const people = [['Основной участник', false, 'Сергеевич'], ['Мать', true, 'Андреевна'], ['Брат', false, 'Сергеевич']].map((r, i) => {
        const a = newApplication(s)
        const name = r[1] ? NAMES_F[(demoCount + i) % NAMES_F.length] : NAMES_M[(demoCount + i) % NAMES_M.length]
        a.form.participantFullName = surname + (r[1] ? 'а' : '') + ' ' + name + ' ' + r[2]
        a.form.applicantFullName = surname + 'а ' + NAMES_F[demoCount % NAMES_F.length] + ' Андреевна'
        a.family = id
        a.familyRole = r[0]
        a.form.studyGroup = r[0] === 'Основной участник' ? 'main' : 'relatives'
        return a
      })
      update((d) => {
        people.forEach((a) => d.apps.unshift(a))
        d.screen = 'people'; d.view = 'groups'; d.peopleState = 'all'; d.group = id; d.study = s.id
        pushToast(d, 'Добавлена родственная группа', id + ' · ' + s.short + ' · 3 человека')
      })
    },
  },
  accept5: {
    label: 'Принять пять заявок', hint: 'у них появятся номера',
    can: (s) => byStudy(s, s.apps).filter((a) => !a.num && a.status !== 'rejected').length > 0,
    run() {
      const ids = byStudy(getState(), getState().apps).filter((a) => !a.num && a.status !== 'rejected').slice(0, 5).map((a) => a.id)
      update((d) => {
        ids.forEach((id) => {
          const a = d.apps.find((x) => x.id === id)
          a.num = nextNumber(d.apps, a.study)
          Object.assign(a, { status: 'approved', kind: 'anketa', waitH: 0 })
          a.history.unshift({ text: 'Принят в исследование под № ' + a.num, when: stamp() })
        })
        d.screen = 'people'; d.view = 'list'; d.peopleState = 'accepted'
        pushToast(d, 'Принято заявок: ' + ids.length, 'Номера присвоены')
      })
    },
  },
  clear: {
    label: 'Разобрать всю очередь', hint: 'посмотреть пустое состояние',
    can: (s) => byStudy(s, s.apps).filter((a) => waitsForMe(s, a)).length > 0,
    run() {
      const s = getState()
      const ids = byStudy(s, s.apps).filter((a) => waitsForMe(s, a)).map((a) => a.id)
      const coord = currentRole(s) === 'coord'
      update((d) => {
        ids.forEach((id) => {
          const a = d.apps.find((x) => x.id === id)
          if (a.kind === 'app' && coord) a.withDoctor = true
          else if (a.kind === 'app') { a.status = 'approved'; a.kind = 'anketa'; if (!a.num) a.num = nextNumber(d.apps, a.study) }
          else { a.status = 'done'; a.stage = 'date' }
          a.waitH = 0
        })
        d.screen = 'queue'
        pushToast(d, 'Разобрано заявок: ' + ids.length, 'Очередь пуста')
      })
    },
  },
  reset: {
    label: 'Сбросить демо-данные', hint: 'вернуть исходный набор',
    can: () => true,
    run: () => { clearSavedApps(); location.reload() },
  },
}

export const DEMO_TONE = {
  userSokolova: 'show', userOrlova: 'show', userPetrov: 'show', compare: 'show',
  new: 'ok', fixed: 'ok', anketa: 'ok', visit: 'ok', accept5: 'ok',
  fill: 'warn', add10: 'warn', family: 'warn',
  dropped: 'danger', baddoc: 'danger', clear: 'danger', reset: 'danger',
}

export function demoGroups(s) {
  const shown = { compare: 1 }
  const here = s.screen === 'card' ? ['fill', 'baddoc'] : s.screen === 'people' ? ['accept5', 'family', 'dropped'] : s.screen === 'queue' ? ['fixed'] : []
  here.forEach((k) => { shown[k] = 1 })
  const events = ['new', 'anketa', 'visit', 'fixed', 'dropped'].filter((k) => !shown[k])
  events.forEach((k) => { shown[k] = 1 })
  const data = ['add10', 'family', 'accept5', 'clear', 'reset'].filter((k) => !shown[k])
  return [
    { title: 'Что показать', keys: ['userSokolova', 'userOrlova', 'userPetrov', 'compare'] },
    { title: 'Здесь и сейчас', keys: here },
    { title: 'Со стороны участника', keys: events },
    { title: 'Демо-данные', keys: data },
  ]
}

export function simulate(k) {
  const action = DEMO_ACTIONS[k]
  if (!action || !action.can(getState())) return
  action.run()
}
