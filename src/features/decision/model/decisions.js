import { dateIn, stamp } from '@/shared/lib/dates.js'
import { plural } from '@/shared/lib/plural.js'
import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { currentRole, myName } from '@/entities/staff'
import { STUDY_BY } from '@/entities/study'
import { badDocs, commentCount, mismatches, nextNumber, openApp, visitNumber } from '@/entities/application'
import { next } from '@/entities/application'
import { newUndo } from './undo-log.js'

export const POSTPONE_REASONS = ['Уточняю у коллеги', 'Нужна консультация специалиста', 'Вернусь позже']

export const postponedLabel = (p) => (!p ? '' : p.until ? 'до ' + p.until : p.since || '')

export const questionOpen = (a) => !!(a.question && a.question.status === 'open')

function notesToDoctor(a, kind, me) {
  a.coordNotes = a.coordNotes || {}
  a.comments = a.comments || {}
  let n = 0
  Object.keys(a.comments).forEach((k) => {
    const anketaNote = k.indexOf('a_') === 0
    const ours = kind === 'anketa' ? k.indexOf('a_' + visitNumber(a) + ':') === 0 : !anketaNote
    if (!ours) return
    if (String(a.comments[k]).trim()) { a.coordNotes[k] = { text: a.comments[k], who: me }; n++ }
    delete a.comments[k]
  })
  return n
}

function handToDoctor(d, a, c) {
  const anketa = c.kind === 'anketa-pass'
  const missed = anketa ? [] : mismatches(a)
  const notes = notesToDoctor(a, anketa ? 'anketa' : 'app', c.me)
  if (questionOpen(a)) {
    Object.assign(a.question, { answer: c.reason, status: 'answered', answeredBy: c.me, answeredAt: stamp() })
  } else if (c.reason) {
    a.noteToDoctor = a.noteToDoctor || {}
    a.noteToDoctor[anketa ? 'anketa' : 'app'] = { text: c.reason, who: c.me, when: stamp() }
  }
  if (anketa) a.anketaWithDoctor = true
  else a.withDoctor = true
  a.history.unshift({
    text: (anketa ? (a.kind === 'visit' ? 'Анкета визита ' + a.visitNo : 'Анкета') + ' просмотрена координатором, передана врачу' : 'Проверено координатором, передано врачу') +
      (missed.length ? '. Не сходится: ' + missed.join('; ') : '') + (notes ? '. Замечаний для врача: ' + notes : '') +
      (c.reason ? '. Комментарий: ' + c.reason : ''),
    when: stamp(), who: c.me,
  })
  pushToast(d, notes || c.reason ? 'Передано врачу с замечаниями' : 'Передано врачу', 'Участник ничего не получит — для него шаг на проверке. 10 секунд на отмену (Z)', 'ok', c.undoKey)
}

function reject(d, a, c) {
  const anketa = c.kind === 'anketa-reject'
  a.status = 'rejected'
  a.waited = '—'
  a.waitH = 0
  a.coordRejection = c.role === 'coord' ? { who: c.me, when: stamp(), reason: c.reason, kind: anketa ? 'anketa' : 'app' } : null
  a.history.unshift({ text: (anketa ? 'Анкета отклонена, участник не продолжает исследование' : 'Заявка отклонена') + (c.reason ? ': ' + c.reason : ''), when: stamp(), who: c.me })
  pushToast(d, anketa ? 'Анкета отклонена' : 'Заявка отклонена', 'Причина уйдёт участнику через 10 с — до этого можно отменить (Z)', 'warn', c.undoKey)
}

const DECISIONS = {
  pass: handToDoctor,
  'anketa-pass': handToDoctor,
  reject,
  'anketa-reject': reject,
  approve(d, a, c) {
    const missed = mismatches(a)
    const bad = badDocs(a).length
    a.status = 'approved'
    a.waited = '—'
    a.waitH = 0
    a.kind = 'anketa'
    if (!a.num) a.num = nextNumber(d.apps, a.study)
    a.history.unshift({
      text: 'Принят в исследование под № ' + a.num + ', участнику открыта анкета' +
        (missed.length ? '. Одобрено при несоответствиях: ' + missed.join('; ') : '') +
        (bad ? '. Документов с отметкой: ' + bad : '') + (c.reason ? '. Причина: ' + c.reason : ''),
      when: stamp(), who: c.me,
    })
    pushToast(d, 'Заявка одобрена · принят под № ' + a.num, (missed.length || bad ? 'Записано в историю вместе с несоответствиями. ' : '') +
      'Уведомление уйдёт участнику через 10 с — до этого можно отменить (Z)', missed.length || bad ? 'warn' : 'ok', c.undoKey)
  },
  return(d, a, c) {
    const words = plural(c.n, ['замечание', 'замечания', 'замечаний'])
    a.status = 'returned'
    a.waited = '—'
    a.waitH = 0
    a.withDoctor = false
    a.history.unshift({ text: 'Возвращена участнику: ' + words, when: stamp(), who: c.me })
    pushToast(d, 'Заявка возвращена', words + ' уйдут участнику через 10 с — до этого можно отменить (Z)', 'warn', c.undoKey)
  },
  doc(d, a, c) {
    a.status = 'docRequest'
    a.waited = '—'
    a.waitH = 0
    a.withDoctor = false
    a.history.unshift({ text: 'Запрошен документ: ' + (c.reason || 'нужен читаемый файл'), when: stamp(), who: c.me })
    pushToast(d, 'Документ запрошен', 'Запрос уйдёт участнику через 10 с — до этого можно отменить (Z)', 'warn', c.undoKey)
  },
  'anketa-approve'(d, a, c) {
    const visit = a.kind === 'visit'
    const last = visit && a.visitNo >= STUDY_BY[a.study].visits
    a.status = 'done'
    a.stage = 'date'
    a.waited = '—'
    a.waitH = 0
    a.anketaWithDoctor = false
    a.history.unshift({ text: visit ? 'Анкета визита ' + a.visitNo + ' подтверждена' : 'Анкета участника подтверждена', when: stamp(), who: c.me })
    pushToast(d, visit ? 'Анкета визита ' + a.visitNo + ' подтверждена' : 'Анкета подтверждена',
      !visit ? 'Участник перешёл к записи на сдачу биоматериала' : last ? 'Это последний визит по протоколу' : 'Следующим будет визит ' + (a.visitNo + 1), 'ok', c.undoKey)
  },
  'anketa-return'(d, a, c) {
    a.status = 'anketaBack'
    a.waited = '—'
    a.waitH = 0
    a.anketaWithDoctor = false
    a.history.unshift({ text: (a.kind === 'visit' ? 'Анкета визита ' + a.visitNo : 'Анкета') + ' возвращена: ' + plural(c.n, ['замечание', 'замечания', 'замечаний']), when: stamp(), who: c.me })
    pushToast(d, 'Анкета возвращена', 'Замечания уйдут участнику через 10 с — до этого можно отменить (Z)', 'warn', c.undoKey)
  },
}

const PAUSES = {
  question(d, a, c) {
    const kind = c.tab === 'anketa' ? 'anketa' : 'app'
    a.question = { text: c.reason, from: c.me, when: stamp(), status: 'open', kind }
    if (kind === 'anketa') a.anketaWithDoctor = false
    else a.withDoctor = false
    a.history.unshift({ text: 'Вопрос координатору: ' + c.reason, when: stamp(), who: c.me })
    pushToast(d, 'Вопрос отправлен координатору', 'Заявка вернётся к вам с ответом. 10 секунд на отмену (Z)', 'ok', c.undoKey)
  },
  postpone(d, a, c) {
    a.postponed = { reason: c.reason || POSTPONE_REASONS[0], until: null, untilIso: null, since: dateIn(0), who: c.me }
    a.returnedFromPostponed = false
    a.history.unshift({ text: 'Отложена (' + a.postponed.reason + ')', when: stamp(), who: c.me })
    pushToast(d, 'Заявка отложена', 'Ушла из «ждут меня». Участник этого не видит', 'ok', c.undoKey)
  },
}

function unpostpone() {
  const s = getState()
  update((d) => {
    const a = d.apps.find((x) => x.id === s.appId)
    a.postponed = null
    a.history.unshift({ text: 'Возвращена в очередь из отложенных', when: stamp(), who: myName(s) })
    d.modal = null
    pushToast(d, 'Вернули в очередь', 'Заявка снова ждёт решения')
  })
}

export function decide(kind, reason) {
  if (kind === 'unpostpone') { unpostpone(); return }
  const s = getState()
  const a = openApp(s)
  const undo = newUndo(a)
  const c = {
    kind, reason, undoKey: undo.key, me: myName(s), role: currentRole(s), tab: s.tab,
    n: commentCount(a, kind.indexOf('anketa') === 0 ? 'anketa' : 'app'),
  }
  update((d) => {
    const da = d.apps.find((x) => x.id === a.id)
    d.undo = undo
    if (PAUSES[kind]) PAUSES[kind](d, da, c)
    else {
      da.postponed = null
      da.repeat = false
      da.changed = []
      da.returnedFromPostponed = false
      if (DECISIONS[kind]) DECISIONS[kind](d, da, c)
    }
    d.modal = null
  }, { render: false })
  next()
}

