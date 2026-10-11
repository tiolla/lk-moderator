import { plural } from '@/shared/lib/plural.js'
import { currentRole } from '@/entities/staff'
import { STUDY_BY } from '@/entities/study'
import {
  COORD_REJECT_REASONS, MOD_FIELDS, SELECTION_FIELDS, SUB_SHORT, SUB_TITLES, anketaKey, badDocs, commentCount,
  criteria, criterionResult, docComments, nextNumber, openApp, seenCount,
} from '@/entities/application'
import { questionOpen } from '../model/decisions.js'
import { FieldNotesLine, Mismatches } from './Mismatches.jsx'

const BASE = {
  pass: { title: 'Передать врачу?', tone: 'm-info--ok', confirmLabel: 'Передать врачу', confirmClass: 'm-btn--primary', noteToDoctor: true,
    body: 'Заявка уйдёт врачу на проверку отбора. Участник ничего не получит — для него заявка остаётся на проверке.' },
  'anketa-pass': { title: 'Передать анкету врачу?', tone: 'm-info--ok', confirmLabel: 'Передать врачу', confirmClass: 'm-btn--primary', noteToDoctor: true,
    body: 'Анкета уйдёт врачу. Участник ничего не получит — для него анкета остаётся на проверке.' },
  reject: { title: 'Отклонить заявку?', tone: 'm-info--warn', confirmLabel: 'Отклонить', confirmClass: 'm-btn--danger-outline', needWhy: true,
    whyLabel: 'Причина отклонения — её увидит участник', whyPlaceholder: 'Например: по выписке участник не подходит под критерии исследования',
    body: 'Участник получит отказ с вашей причиной, заявка закроется.' },
  'anketa-reject': { title: 'Отклонить анкету?', tone: 'm-info--warn', confirmLabel: 'Отклонить', confirmClass: 'm-btn--danger-outline', needWhy: true,
    whyLabel: 'Причина — её увидит участник', whyPlaceholder: 'Например: по ответам анкеты участник не подходит под критерии исследования',
    body: 'Участник не продолжит исследование и получит вашу причину.' },
  approve: { title: 'Одобрить заявку?', tone: 'm-info--ok', confirmLabel: 'Одобрить', confirmClass: 'm-btn--primary',
    body: 'Участник получит уведомление «Заявка одобрена» и сможет заполнить анкету. Замечания, если они остались в полях, отправлены не будут.' },
  return: { title: 'Вернуть заявку на доработку?', tone: 'm-info--warn', confirmLabel: 'Вернуть', confirmClass: 'm-btn--danger-outline',
    body: 'Участник увидит заявку с вашими замечаниями в тех же полях и сможет исправить их и отправить снова.' },
  doc: { title: 'Запросить документ?', tone: 'm-info--warn', confirmLabel: 'Запросить', confirmClass: 'm-btn--warning', needReason: true,
    body: 'Участник получит запрос и загрузит новый файл. Заявка останется на его стороне до повторной отправки.' },
  'anketa-approve': { title: 'Подтвердить анкету?', tone: 'm-info--ok', confirmLabel: 'Подтвердить', confirmClass: 'm-btn--primary',
    body: 'Анкета уйдёт в исследование, участник перейдёт к записи на сдачу биоматериала.' },
  'anketa-return': { title: 'Вернуть анкету на доработку?', tone: 'm-info--warn', confirmLabel: 'Вернуть', confirmClass: 'm-btn--danger-outline',
    body: 'Замечания встанут в те же разделы анкеты у участника, остальные ответы сохранятся.' },
  question: { title: 'Вопрос координатору', tone: 'm-info--neutral', confirmLabel: 'Отправить вопрос', confirmClass: 'm-btn--primary', needWhy: true,
    whyLabel: 'Вопрос — его увидит только координатор', whyPlaceholder: 'Например: уточните по телефону, есть ли выписка свежее 2024 года',
    body: 'Заявка вернётся к координатору с вашим вопросом. Участник ничего не получит — для него шаг на проверке.' },
  postpone: { title: 'Отложить?', tone: 'm-info--neutral', confirmLabel: 'Отложить', confirmClass: 'm-btn--primary', postpone: true,
    body: <>Заявка уйдёт из «ждут меня» в фильтр «отложенные» и вернётся в очередь в выбранный день. <b>Участник этого не увидит</b> — для него заявка остаётся на проверке. Коллеги увидят, кто отложил и почему.</> },
}

export function buildAsk(s, kind, onGoto) {
  const a = openApp(s)
  const m = { ...BASE[kind] }
  let body = m.body
  if ((kind === 'pass' || kind === 'anketa-pass') && questionOpen(a)) {
    m.noteToDoctor = false
    m.needWhy = true
    m.whyLabel = 'Ответ на вопрос врача — обязательно'
    m.whyPlaceholder = 'Например: позвонила, выписка будет к пятнице'
    body = 'Врач спросил: «' + a.question.text + '». Ваш ответ уйдёт врачу вместе с заявкой. Участник ничего не получит.'
  }
  if ((kind === 'reject' || kind === 'anketa-reject') && currentRole(s) === 'coord') {
    m.needWhy = false
    m.rejectReasons = COORD_REJECT_REASONS[kind === 'reject' ? 'app' : 'anketa']
    body = 'Участник получит отказ с выбранной причиной. Врач увидит отказ в своей очереди и сможет его пересмотреть.'
  }
  if (kind === 'anketa-pass') {
    const n = commentCount(a, 'anketa')
    if (n) body = <>{body}{<FieldNotesLine n={n} />}</>
  }
  if (kind === 'pass') {
    const crit = criteria(a).filter((c) => criterionResult(a, c) === 'bad')
    const docs = badDocs(a)
    const n = commentCount(a, 'app')
    if (crit.length || docs.length) {
      m.tone = 'm-info--neutral'
      body = <><Mismatches crit={crit} docs={docs} onGoto={onGoto} /><br />Врач увидит этот список в истории заявки. Участник ничего не получит.</>
    }
    if (n) body = <>{body}{<FieldNotesLine n={n} />}</>
  }
  if (kind === 'approve') {
    const crit = criteria(a).filter((c) => criterionResult(a, c) === 'bad')
    const docs = badDocs(a)
    const number = a.num || nextNumber(s.apps, a.study)
    body = <>{body}<br /><br /><b>Участник будет принят в исследование под № {number}.</b> До приёма номера у него нет.</>
    if (crit.length || docs.length) {
      m.tone = 'm-info--neutral'
      m.confirmLabel = 'Всё равно одобрить'
      m.confirmClass = 'm-btn--danger-outline'
      m.needWhy = true
      body = (
        <>
          <Mismatches crit={crit} docs={docs} onGoto={onGoto} />
          <br />Одобрить всё равно можно — это ваше решение. Оно попадёт в историю вместе с этим списком и вашей причиной.
          <br /><br /><b>Участник будет принят под № {number}.</b>
        </>
      )
    }
  }
  if (kind === 'return' || kind === 'anketa-return') {
    const list = kind === 'return'
      ? SELECTION_FIELDS.filter((f) => (a.comments || {})[f.k]).map((f) => [f.label, a.comments[f.k]])
        .concat(a.docs.flatMap((d, j) => docComments(a, j).map((c) => ['Документ «' + d.name + '»', c.text])))
      : MOD_FIELDS.filter((p) => (a.comments || {})[anketaKey(a, p[0])]).map((p) => [(SUB_SHORT[p[2] - 1] || '') + ' · ' + p[1], a.comments[anketaKey(a, p[0])]])
    body = (
      <>
        {body}<br /><br /><b>Уйдёт участнику:</b>
        <ul className="m-list">{list.map((x, i) => <li key={i}><b>{x[0]}:</b> {x[1]}</li>)}</ul>
      </>
    )
  }
  if (kind === 'anketa-approve') {
    const n = commentCount(a, 'anketa')
    const seen = seenCount(s, a)
    if (a.kind === 'visit') {
      m.title = 'Подтвердить анкету визита ' + a.visitNo + '?'
      body = 'Анкета визита ' + a.visitNo + ' уйдёт в исследование. ' +
        (a.visitNo >= STUDY_BY[a.study].visits ? 'Это последний визит по протоколу.' : 'Следующим будет визит ' + (a.visitNo + 1) + '.')
    }
    if (n) {
      m.tone = 'm-info--warn'
      m.confirmLabel = 'Подтвердить без замечаний'
      body = 'В анкете есть непогашенные замечания — ' + plural(n, ['замечание', 'замечания', 'замечаний']) +
        '. При подтверждении участник их не увидит: они останутся только у вас. ' +
        'Чтобы передать замечания, вернитесь и нажмите «Вернуть с замечаниями».'
    }
    if (seen < SUB_TITLES.length) {
      body = <>{body}<br /><br /><b>Отмечено просмотренными: {seen} из {SUB_TITLES.length}.</b> Остальные вы не отметили — подтверждение всё равно возможно.</>
    }
  }
  m.body = body
  return m
}
