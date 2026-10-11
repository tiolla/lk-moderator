import { useStore, update } from '@/shared/model/store.js'
import { currentRole } from '@/entities/staff'
import { criteria, visitNumber } from '@/entities/application'
import { act, postponedLabel, roleAction } from '@/features/decision'

const TOP = { marginTop: 'var(--spacing-16)' }
const HINT = { margin: 'var(--spacing-8) 0 0' }
const ACTIONS = { marginTop: 'var(--spacing-12)' }

export function Banners({ a }) {
  const s = useStore()
  const doctor = currentRole(s) === 'doctor'
  const kind = s.tab === 'anketa' ? 'anketa' : 'app'
  const out = []

  const general = (a.noteToDoctor || {})[kind]
  const fieldNotes = Object.keys(a.coordNotes || {}).filter((k) => (kind === 'anketa' ? k.indexOf('a_' + visitNumber(a) + ':') === 0 : k.indexOf('a_') !== 0)).length
  if (general || fieldNotes) {
    const read = (a.notesRead || {})[s.tab]
    out.push(
      <div key="notes" className="m-info m-info--neutral" style={TOP}>
        <b>Координатор {(general || {}).who || ''} передал(а) с замечаниями.</b>{' '}
        {general ? '«' + general.text + '» ' : ''}{fieldNotes ? 'Замечаний у полей: ' + fieldNotes + ' — отмечены «Координатор:». ' : ''}Участник их не видит.
        {read
          ? <div className="m-card__hint" style={HINT}>✓ Прочитано: {read.who + ', ' + read.when}</div>
          : doctor ? <div className="m-doc__actions" style={ACTIONS}><button className="m-btn m-btn--sm m-btn--secondary" data-ra="read" onClick={() => roleAction('read')}>Прочитано</button></div> : null}
      </div>,
    )
  }

  const rejection = a.coordRejection
  if (rejection && a.status === 'rejected' && rejection.kind === kind) {
    const k = /возраст/i.test(rejection.reason) ? 'age' : /город|забор/i.test(rejection.reason) ? 'city' : /документ/i.test(rejection.reason) ? 'doc' : ''
    const fact = k && a.kind === 'app' ? criteria(a).find((c) => c.k === k) : null
    out.push(
      <div key="rejection" className="m-info m-info--warn" style={TOP}>
        <b>Отказ координатора {rejection.who}, {rejection.when}.</b> Причина: «{rejection.reason}». Участник получил отказ.
        {fact && (
          <div style={{ marginTop: 'var(--spacing-8)' }}>
            Автопроверка: {fact.title.toLowerCase() + ' — ' + fact.fact}.{' '}
            {fact.ok ? <b className="m-text-danger">По автопроверке критерий сходится — сверьте причину.</b> : 'Автопроверка тоже видит несоответствие.'}
          </div>
        )}
        {rejection.reviewed
          ? <div className="m-card__hint" style={HINT}>Просмотрено врачом: {rejection.reviewed.who + ', ' + rejection.reviewed.when}</div>
          : doctor
            ? (
              <div className="m-doc__actions" style={ACTIONS}>
                <button className="m-btn m-btn--sm m-btn--outline" data-ra="rk-review" onClick={() => roleAction('rk-review')}>Пересмотреть</button>
                <button className="m-btn m-btn--sm m-btn--secondary" data-ra="rk-ok" onClick={() => roleAction('rk-ok')}>Согласен с отказом</button>
              </div>
            )
            : null}
      </div>,
    )
  }

  const q = a.question
  if (q && q.kind === kind && q.status !== 'closed') {
    out.push(
      <div key="question" className="m-info m-info--neutral" style={TOP}>
        <b>Вопрос врача {q.from}, {q.when}:</b> «{q.text}»
        {q.status === 'answered' && <><br /><b>Ответ координатора {q.answeredBy}:</b> «{q.answer}»</>}
        <div className="m-card__hint" style={HINT}>Участник этого не видит.</div>
        {q.status === 'open' && !doctor
          ? (
            <>
              <label className="m-label" htmlFor="answer" style={{ display: 'block', marginTop: 'var(--spacing-12)' }}>Ответ врачу</label>
              <textarea className="m-textarea" id="answer" style={{ marginTop: 'var(--spacing-8)' }} placeholder="Например: позвонила, выписка будет к пятнице"
                value={s.answerDraft} onChange={(e) => update((d) => { d.answerDraft = e.target.value }, { render: false })} />
              <div className="m-doc__actions" style={ACTIONS}><button className="m-btn m-btn--sm m-btn--primary" data-ra="answer" onClick={() => roleAction('answer')}>Ответить и вернуть врачу</button></div>
            </>
          )
          : q.status === 'answered' && doctor
            ? <div className="m-doc__actions" style={ACTIONS}><button className="m-btn m-btn--sm m-btn--secondary" data-ra="qclose" onClick={() => roleAction('qclose')}>Закрыть вопрос</button></div>
            : q.status === 'open' ? <div className="m-card__hint" style={{ margin: 'var(--spacing-4) 0 0' }}>Ждём ответа координатора.</div> : null}
      </div>,
    )
  }

  if (a.postponed) {
    const label = postponedLabel(a.postponed)
    out.push(
      <div key="postponed" className="m-info m-info--neutral" style={TOP}>
        Отложена{label ? ' ' + label : ''} — {a.postponed.reason}{a.postponed.who ? '. Отложил(а): ' + a.postponed.who : ''}. Участник этого не видит: для него заявка на проверке.
        <div className="m-doc__actions" style={ACTIONS}><button className="m-btn m-btn--sm m-btn--secondary" data-act="unpostpone" onClick={() => act('unpostpone')}>Вернуть в очередь</button></div>
      </div>,
    )
  }
  return out
}
