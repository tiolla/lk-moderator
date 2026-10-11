import { stamp } from '@/shared/lib/dates.js'
import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { myName } from '@/entities/staff'
import { openApp } from '@/entities/application'
import { next } from '@/entities/application'
import { newUndo } from './undo-log.js'

const ACTIONS = {
  'rk-ok'(d, a, c) {
    a.coordRejection.reviewed = { who: c.me, when: c.when }
    a.history.unshift({ text: 'Врач согласен с отказом координатора', when: c.when, who: c.me })
    d.undo = c.undo
    pushToast(d, 'Отказ подтверждён', 'Заявка ушла из очереди. 10 секунд на отмену (Z)', 'ok', c.undo.key)
    return 'next'
  },
  'rk-review'(d, a, c) {
    const anketa = a.coordRejection.kind === 'anketa'
    a.status = anketa ? 'anketa' : 'new'
    if (anketa) a.anketaWithDoctor = true
    else a.withDoctor = true
    a.coordRejection.reviewed = { who: c.me, when: c.when, revisit: true }
    a.history.unshift({ text: 'Врач пересматривает отказ координатора — ' + (anketa ? 'анкета' : 'заявка') + ' снова на проверке у врача', when: c.when, who: c.me })
    d.undo = c.undo
    pushToast(d, 'Отказ на пересмотре', 'Участник получит ваше новое решение. 10 секунд на отмену (Z)', 'ok', c.undo.key)
    d.tab = anketa ? 'anketa' : 'app'
    return 'render'
  },
  answer(d, a, c) {
    const text = d.answerDraft.trim()
    if (!text) return 'focus-answer'
    Object.assign(a.question, { answer: text, status: 'answered', answeredBy: c.me, answeredAt: c.when })
    d.answerDraft = ''
    if (a.question.kind === 'anketa') a.anketaWithDoctor = true
    else a.withDoctor = true
    a.history.unshift({ text: 'Ответ координатора на вопрос врача: ' + text, when: c.when, who: c.me })
    d.undo = c.undo
    pushToast(d, 'Ответ отправлен врачу', 'Заявка вернулась к врачу. 10 секунд на отмену (Z)', 'ok', c.undo.key)
    return 'next'
  },
  qclose(d, a, c) {
    a.question.status = 'closed'
    a.history.unshift({ text: 'Вопрос координатору закрыт', when: c.when, who: c.me })
    return 'render'
  },
  read(d, a, c) {
    const kind = d.tab === 'anketa' ? 'anketa' : 'app'
    a.notesRead = a.notesRead || {}
    a.notesRead[kind] = { who: c.me, when: c.when }
    a.history.unshift({ text: 'Замечания координатора прочитаны', when: c.when, who: c.me })
    return 'render'
  },
}

export function roleAction(k) {
  const s = getState()
  const a = openApp(s)
  if (!ACTIONS[k]) return
  const c = { me: myName(s), when: stamp(), undo: newUndo(a) }
  let then = null
  update((d) => { then = ACTIONS[k](d, d.apps.find((x) => x.id === a.id), c) }, { render: false })
  if (then === 'next') next()
  else if (then === 'focus-answer') document.getElementById('answer')?.focus()
  else update(() => {})
}
