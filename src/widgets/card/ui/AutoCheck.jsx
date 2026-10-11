import { useStore } from '@/shared/model/store.js'
import { Chevron, pressed } from '@/shared/ui'
import { CRITERION_FIELD, SELECTION_FIELDS, canDecide, criteria, criterionResult } from '@/entities/application'
import { noteFromCriterion, toggleAutoCheck, toggleCriterion } from '@/features/review'
import { ask } from '@/features/decision'

export function AutoCheck({ a }) {
  const s = useStore()
  const all = criteria(a)
  const can = canDecide(s, a, 'app')
  const doubtful = all.filter((c) => criterionResult(a, c) !== 'ok')
  const manual = all.filter((c) => (a.criteria || {})[c.k])
  const bad = doubtful.length > 0
  const red = bad && can
  const open = s.autoOpen || red
  const visible = open ? (red ? all.filter((c) => doubtful.includes(c) || manual.includes(c)) : all) : []
  const title = !can
    ? 'Автопроверка при отборе: ' + (bad ? doubtful.length + ' из ' + all.length + ' не сходилось' : all.length + ' из ' + all.length + ' сходится') + ' · только просмотр'
    : bad
      ? 'Автопроверка: ' + doubtful.length + ' из ' + all.length + ' требуют вашего решения'
      : 'Автопроверка: ' + all.length + ' из ' + all.length + ' сходится' + (manual.length ? ', из них ' + manual.length + ' — по вашей отметке' : '')

  return (
    <div className={'m-auto' + (red ? ' m-auto--bad' : '')} data-open={open ? '1' : '0'}>
      <button className="m-auto__head" data-auto="1" aria-expanded={open ? 'true' : 'false'} onClick={toggleAutoCheck}>
        {title}<Chevron className="m-auto__chev" size={18} />
      </button>
      {open && (
        <div className="m-auto__body">
          <div className="m-card__hint" style={{ marginBottom: 'var(--spacing-12)' }}>
            {!can ? 'Отбор не на проверке — критерии для справки.'
              : red ? 'Показаны критерии, где автоматика не уверена, и те, что вы отметили сами. Остальные сошлись.'
                : 'Критерии включения протокола. Слева — что прислал участник, справа — ваша отметка.'}
          </div>
          {visible.map((c) => <Criterion key={c.k} a={a} c={c} can={can} />)}
        </div>
      )}
    </div>
  )
}

function Criterion({ a, c, can }) {
  const manual = (a.criteria || {})[c.k]
  const decides = can && (criterionResult(a, c) !== 'ok' || manual)
  let toField = null
  if (can && !c.ok && CRITERION_FIELD[c.k]) {
    const field = SELECTION_FIELDS.find((f) => f.k === CRITERION_FIELD[c.k](a).field) || {}
    toField = (
      <button className="m-addnote" style={{ padding: 0, marginTop: 'var(--spacing-4)' }} data-critnote={c.k} onClick={() => noteFromCriterion(c.k)}>
        + Замечание к полю «{field.label || ''}»
      </button>
    )
  } else if (can && !c.ok && c.k === 'doc') {
    const i = a.docs.length ? 0 : -1
    toField = (
      <button className="m-addnote" style={{ padding: 0, marginTop: 'var(--spacing-4)' }} data-docreq={i} onClick={() => ask('doc', i)}>+ Запросить документ</button>
    )
  }
  return (
    <div className="m-criterion">
      <div>
        <div className="m-criterion__title">{c.title}</div>
        <div className="m-criterion__fact">{c.fact}</div>
        {toField}
        {!can && manual && <div className="m-criterion__fact">Отметка модератора: {manual === 'ok' ? 'соответствует' : 'не соответствует'}</div>}
      </div>
      {c.ok ? <span className="m-badge m-badge--ok">Сходится</span> : <span className="m-badge m-badge--danger">Проверьте</span>}
      {decides
        ? (
          <div className="m-seg">
            <button data-crit={c.k} data-val="ok" {...pressed(manual === 'ok')} onClick={() => toggleCriterion(c.k, 'ok')}>Соответствует</button>
            <button data-crit={c.k} data-val="bad" data-tone="bad" {...pressed(manual === 'bad')} onClick={() => toggleCriterion(c.k, 'bad')}>Нет</button>
          </div>
        )
        : <span />}
    </div>
  )
}
