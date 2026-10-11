import { momentOf } from '@/shared/lib/dates.js'
import { STUDY_BY } from '@/entities/study/@x/application.js'
import { PEOPLE, hasCoordinator } from '@/entities/staff/@x/application.js'
import { waitsForMe } from '../../lib/ownership.js'
import { handwrittenApps, complete } from './handwritten.js'
import { generateApps } from './generator.js'

const STAGE_CYCLE = ['date', 'date', 'blood', 'blood', 'blood', 'blood']

function layOutStages(apps) {
  apps.filter((a) => a.kind !== 'app' && (a.status === 'done' || a.status === 'noshow'))
    .forEach((a, i) => { a.stage = a.status === 'noshow' ? 'blood' : STAGE_CYCLE[i % 6] })
}

function numberAccepted(apps) {
  apps.filter((a) => !a.generated && a.kind !== 'app' && !a.num).forEach((a) => {
    a.num = 1 + Math.max(...apps.map((x) => (x.study === a.study && x.num ? x.num : 0)))
  })
}

function signHistory(apps) {
  apps.forEach((a) => {
    if (!a.generated) {
      a.history.forEach((h) => { if (!/отправлен/.test(h.text)) h.who = 'Соколова К. В.' })
      return
    }
    const day = parseInt(a.submitted, 10) || 1
    const h = [{ text: 'Заявка отправлена участником', when: day + ' сентября, 10:00' }]
    const at = (n) => Math.min(28, day + n) + ' сентября, ' + (10 + n % 7) + ':' + (n % 2 ? '30' : '05')
    if (a.num) h.push({ text: 'Принят в исследование под № ' + a.num + ', участнику открыта анкета', when: at(1), who: a.moderator })
    let upTo = a.kind === 'visit' ? a.visitNo - 1 : a.status === 'done' ? 1 : 0
    if (a.kind === 'visit' && a.status === 'done') upTo = a.visitNo
    for (let k = 1; k <= upTo; k++) {
      h.push({ text: (k === 1 ? 'Анкета участника' : 'Анкета визита ' + k) + ' подтверждена', when: at(1 + k), who: a.moderator })
    }
    if (a.status === 'anketa') h.push({ text: (a.kind === 'visit' ? 'Анкета визита ' + a.visitNo : 'Анкета участника') + ' отправлена на проверку', when: at(2 + upTo) })
    if (a.status === 'returned') h.push({ text: 'Возвращена участнику: 2 замечания', when: at(1), who: a.moderator })
    if (a.status === 'rejected') h.push({ text: 'Заявка отклонена', when: at(1), who: a.moderator })
    if (a.postponed && !a.postponed.until) a.postponed.since = at(1).split(',')[0]
    if (a.postponed) h.push({ text: 'Отложена (' + a.postponed.reason + ')' + (a.postponed.until ? ', вернётся в очередь ' + a.postponed.until : ''), when: at(1), who: a.postponed.who })
    a.history = h.reverse()
  })
}

function handSelectionToDoctor(apps, ctx) {
  apps.filter((a) => a.kind === 'app' && a.status === 'new' && hasCoordinator(ctx, a.study)).forEach((a, i) => {
    const handed = a.id !== 'ЗАЯВ-2026-0417' && i % 2 === 1
    a.withDoctor = handed
    if (a.postponed) a.postponed.who = handed ? a.postponed.who : PEOPLE.orlova.name
    if (handed) a.history.splice(a.postponed ? 1 : 0, 0, { text: 'Проверено координатором, передано врачу', when: a.history[0].when, who: PEOPLE.orlova.name })
  })
}

function handAnketasToDoctor(apps, ctx) {
  const groups = {}
  const onReview = apps.filter((a) => a.status === 'anketa' && hasCoordinator(ctx, a.study))
  onReview.forEach((a) => {
    const g = a.study + ':' + (a.kind === 'visit' ? a.visitNo : 1);
    (groups[g] = groups[g] || []).push(a)
  })
  onReview.forEach((a) => {
    const g = groups[a.study + ':' + (a.kind === 'visit' ? a.visitNo : 1)]
    a.anketaWithDoctor = a.id === 'ЗАЯВ-2026-0402' || !(g.length > 1 && g[0] === a)
    if (a.anketaWithDoctor) {
      a.history.unshift({
        text: (a.kind === 'visit' ? 'Анкета визита ' + a.visitNo : 'Анкета') + ' просмотрена координатором, передана врачу',
        when: a.history.map((h) => h.when).sort((x, y) => momentOf(y) - momentOf(x))[0],
        who: PEOPLE.orlova.name,
      })
    }
  })
}

function orderHistory(apps) {
  apps.forEach((a) => {
    a.history = a.history.map((h, i) => ({ h, i }))
      .sort((x, y) => momentOf(y.h.when) - momentOf(x.h.when) || x.i - y.i)
      .map((x) => x.h)
  })
}

export function buildDemoSet(assignments) {
  const ctx = { user: 'sokolova', role: 'doctor', study: 'all', assignments }
  const apps = handwrittenApps().map(complete).concat(generateApps((a) => waitsForMe(ctx, a), (id) => STUDY_BY[id].visits))
  layOutStages(apps)
  numberAccepted(apps)
  signHistory(apps)
  handSelectionToDoctor(apps, ctx)
  handAnketasToDoctor(apps, ctx)
  orderHistory(apps)
  return apps.filter((a) => a.status !== 'noshow')
}
