import { plural } from '@/shared/lib/plural.js'
import { useStore } from '@/shared/model/store.js'
import { currentRole } from '@/entities/staff'
import {
  VISIT_STATE_CAPTION, anketaClean, applicationClean, badDocs, canDecide, commentCount, stepSummary, viewedVisit, visitName,
  visitNumber, visitsOf,
} from '@/entities/application'
import { openStep } from '@/features/review'
import { act } from '@/features/decision'

export function DecisionPanel({ a }) {
  const s = useStore()
  const kind = s.tab === 'anketa' ? 'anketa' : 'app'
  if (kind === 'anketa' && viewedVisit(s, a) !== visitNumber(a)) {
    const cur = visitNumber(a)
    return (
      <div className="m-decision m-decision--done">
        <div className="m-decision__state">{visitName(a, viewedVisit(s, a)) + ' уже проверен — решение по нему принято.'}</div>
        <span className="m-header__spacer" />
        <button className="m-btn m-btn--secondary" data-step={cur} onClick={() => openStep(String(cur))}>
          К визиту {cur} — {VISIT_STATE_CAPTION[(visitsOf(a)[cur - 1] || {}).state] || ''}
        </button>
      </div>
    )
  }
  const n = commentCount(a, kind)
  if (!canDecide(s, a, kind)) {
    return (
      <div className="m-decision m-decision--done">
        <div className="m-decision__state">{stepSummary(s, a, kind) + (n ? ' ' + plural(n, ['замечание', 'замечания', 'замечаний']) + ' в полях.' : '')}</div>
      </div>
    )
  }
  const docs = badDocs(a).length
  const coord = currentRole(s) === 'coord'
  const atOnce = coord && kind === 'anketa' ? n === 0 : kind === 'anketa' ? anketaClean(s, a) : applicationClean(s, a)
  const main = coord ? (kind === 'anketa' ? 'anketa-pass' : 'pass') : kind === 'anketa' ? 'anketa-approve' : 'approve'
  const back = kind === 'anketa' ? 'anketa-return' : 'return'
  const reject = kind === 'anketa' ? 'anketa-reject' : 'reject'
  const keys = s.keysOn
  return (
    <div className="m-decision">
      <div className="m-decision__count">Замечаний: {n}{kind === 'app' && docs ? ' · документов с отметкой: ' + docs : ''}</div>
      <div className="m-card__hint m-decision__hint" hidden={!atOnce}>
        {coord ? 'Замечаний нет — уйдёт врачу сразу, без окна; 10 секунд на отмену.'
          : (kind === 'anketa' ? 'Все разделы просмотрены, замечаний нет' : 'Всё сходится, замечаний нет') + ' — подтвердится сразу, без окна; 10 секунд на отмену.'}
      </div>
      <span className="m-header__spacer" />
      <div className="m-decision__acts">
        <button className="m-btn m-btn--danger-outline" data-act={reject} onClick={() => act(reject)}>Отклонить</button>
        <button className="m-btn m-btn--outline" data-act={back} disabled={!n} title={keys ? 'Клавиша R' : undefined} onClick={() => act(back)}>
          {(coord ? 'Вернуть участнику (' : 'Вернуть с замечаниями (') + n + ')'}
        </button>
        <button className="m-btn m-btn--primary m-btn--lg" data-act={main} title={keys ? 'Клавиша A' : undefined} onClick={() => act(main)}>
          {coord ? (n ? 'Передать врачу с замечаниями (' + n + ')' : 'Передать врачу') : kind === 'anketa' ? 'Подтвердить анкету' : 'Одобрить заявку'}
        </button>
      </div>
    </div>
  )
}
