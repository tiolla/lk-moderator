import { useStore } from '@/shared/model/store.js'
import { pressed } from '@/shared/ui'
import { coordSeesMedical, currentRole } from '@/entities/staff'
import { STUDY_BY } from '@/entities/study'
import {
  MOD_FIELDS, SUB_SHORT, SUB_TITLES, VISIT_STATE_CAPTION, anketaKey, canDecide, seenCount, seenOf, viewedVisit, visitAnswer,
  visitName, visitNumber, visitsOf,
} from '@/entities/application'
import { openSection, revealSnils, toggleOnlyChanged, toggleSeen } from '@/features/review'
import { FieldRow } from './FieldRow.jsx'

export function AnketaStep({ a }) {
  const s = useStore()
  const v = viewedVisit(s, a)
  const cur = visitNumber(a)
  const name = visitName(a, v)
  const what = v === 1 ? 'анкета участника' : 'анкета визита'
  if (v === cur && !['anketa', 'anketaBack', 'done'].includes(a.status)) {
    const none = a.status === 'dropped'
    const why = none ? 'Участник выбыл из исследования — анкеты нет.'
      : (v === 1 ? 'Участник заполняет анкету после того, как заявка одобрена.' : 'Участник ещё не заполнил анкету этого визита.') +
        ' Как только он отправит её на проверку, разделы появятся здесь.'
    return (
      <div className="m-card" style={{ marginTop: 'var(--spacing-16)' }}>
        <h2 className="m-card__title">{name + (none ? ': анкеты нет' : ': анкета ещё не отправлена')}</h2>
        <div className="m-info m-info--neutral">{why}</div>
      </div>
    )
  }
  const current = v === cur
  const can = current && canDecide(s, a, 'anketa')
  const prev = v > 1 ? v - 1 : 0
  const seen = current ? seenOf(s, a) : {}
  const changedField = (k) => !!prev && visitAnswer(a, k, v) !== visitAnswer(a, k, prev)
  const total = SUB_TITLES.length
  const fields = MOD_FIELDS.filter((p) => p[2] === s.sub)
  const changedHere = fields.filter((p) => changedField(p[0])).length
  const closed = currentRole(s) === 'coord' && !coordSeesMedical(s, a.study) && s.sub >= 2
  const state = (visitsOf(a)[v - 1] || {}).state

  let rows
  if (closed) {
    rows = (
      <div className="m-info m-info--neutral" style={{ marginTop: 'var(--spacing-8)' }}>
        Медицинские разделы в этом исследовании смотрит только врач — так настроил руководитель. Проверьте раздел 1 и передайте анкету врачу.
      </div>
    )
  } else {
    const list = fields.filter((p) => !s.onlyChangedAnswers || changedField(p[0]))
    rows = list.length
      ? list.map((p) => {
        const key = anketaKey(a, p[0], v)
        const answer = visitAnswer(a, p[0], v)
        const snils = p[0] === 'snils' && answer && !s.snilsShown
        return (
          <FieldRow key={key} label={p[1]} value={snils ? answer.replace(/^\d{3}-\d{3}/, '•••-•••') : answer} fieldKey={key}
            comment={(a.comments || {})[key]} can={can} compare={prev ? { was: visitAnswer(a, p[0], prev), visit: prev } : null}
            coordNote={(a.coordNotes || {})[key]}
            extra={snils ? <> <button className="m-linkbtn" data-reveal="1" style={{ marginLeft: 'var(--spacing-8)', fontSize: 'var(--font-size-12)' }} onClick={revealSnils}>показать</button></> : null} />
        )
      })
      : <div className="m-empty" style={{ padding: 'var(--spacing-24) 0' }}>В этом разделе ответы не изменились с визита {prev}.</div>
  }

  const legend = prev
    ? (
      <div className="m-legend">
        <span><b>Сравнение с визитом {prev}.</b> Синяя черта слева и метка «изменилось» — ответ другой, серым под ним — что было на визите {prev}. Без метки — ответ тот же.</span>
        <button className="m-chip" data-onlychg="1" {...pressed(s.onlyChangedAnswers)} onClick={toggleOnlyChanged}>
          Только изменившиеся в разделе<span className="m-chip__count">{changedHere}</span>
        </button>
      </div>
    )
    : current && STUDY_BY[a.study].visits > 1
      ? <div className="m-legend"><span><b>Первый визит</b> — сравнивать пока не с чем. С визита 2 здесь появится сравнение с предыдущим.</span></div>
      : null

  return (
    <div className="m-anketa">
      <nav className="m-srail" aria-label="Разделы анкеты">
        <div className="m-srail__title">Разделы · как у участника</div>
        {SUB_TITLES.map((title, i) => {
          const n = i + 1
          const own = MOD_FIELDS.filter((p) => p[2] === n)
          const notes = own.filter((p) => (a.comments || {})[anketaKey(a, p[0], v)]).length
          const changed = own.filter((p) => changedField(p[0])).length
          return (
            <button key={n} className="m-srail__item" data-sub={n} {...pressed(s.sub === n)} data-seen={seen[n] ? '1' : '0'}
              title={title + (changed ? ' · изменилось ответов: ' + changed : '') + (seen[n] ? ' · отмечен просмотренным' : '')} onClick={() => openSection(n)}>
              <span className="m-srail__mark">{seen[n] ? '✓' : n}</span>
              <span className="m-srail__name">{SUB_SHORT[i] || title}</span>
              {changed > 0 && <span className="m-srail__chg" aria-label={'изменилось ' + changed}>{changed} изм.</span>}
              {notes > 0 && <span className="m-chip__count">{notes}</span>}
            </button>
          )
        })}
        <div className="m-srail__foot" data-seencount="1">{current ? 'Просмотрено ' + seenCount(s, a) + ' из ' + total : 'Только просмотр'}</div>
      </nav>
      <div className="m-card" style={{ marginTop: 0 }}>
        {!current && (
          <div className="m-info m-info--neutral" style={{ margin: '0 0 var(--spacing-12)' }}>
            {name} — анкета проверена, только просмотр. Сейчас идёт {visitName(a, cur).toLowerCase()} — {VISIT_STATE_CAPTION[(visitsOf(a)[cur - 1] || {}).state] || ''}.
          </div>
        )}
        <div className="m-overline">{name + ' · ' + what + ' · ' + (VISIT_STATE_CAPTION[state] || '')}</div>
        <div className="m-anketa__top">
          <h2 className="m-anketa__head">{s.sub}. {SUB_TITLES[s.sub - 1]}</h2>
          {can && (
            <button className={'m-btn m-btn--sm ' + (seen[s.sub] ? 'm-btn--secondary' : 'm-btn--outline')} data-seentoggle={s.sub} onClick={() => toggleSeen(s.sub)}>
              {seen[s.sub] ? '✓ Просмотрен — снять отметку' : 'Отметить раздел просмотренным'}
            </button>
          )}
        </div>
        {can
          ? (
            <div className="m-card__hint">
              {currentRole(s) === 'coord' ? 'Замечание уйдёт участнику, если вернёте анкету, или врачу, если передадите её ему.' : 'Замечание встанет в этот же раздел анкеты у участника.'} Отметка «просмотрен» — для вас, участник её не видит.
            </div>
          )
          : current ? <div className="m-card__hint">Анкета не на проверке — ответы только для просмотра.</div> : null}
        {legend}
        <div style={{ marginTop: 'var(--spacing-8)' }}>{rows}</div>
      </div>
    </div>
  )
}
