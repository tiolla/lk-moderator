import { useStore } from '@/shared/model/store.js'
import { pressed } from '@/shared/ui'
import { STUDY_BY, STUDY_SHORT } from '@/entities/study'
import { STAGES, VISIT_STATE_CAPTION, stageIndex, viewedVisit, visitName, visitNumber, visitsOf } from '@/entities/application'
import { openStep, openTab } from '@/features/review'

export function Stepper({ a }) {
  const s = useStore()
  const visits = visitsOf(a)
  if (!visits.length) return null
  const single = STUDY_BY[a.study].visits < 2
  return (
    <div className="m-steps">
      <div className="m-steps__cap">
        {single ? 'Путь участника: отбор и один визит по протоколу исследования.'
          : 'Путь участника: отбор, затем ' + visits.length + ' визитов по протоколу ' + STUDY_SHORT[a.study] + '. Пройденный визит открывается на просмотр — со сравнением с предыдущим.'}
      </div>
      <div className="m-steps__row">
        <button className="m-step" data-step="app" data-state="done" {...pressed(s.tab === 'app')} title="Отбор: заявка, документы и критерии включения" onClick={() => openStep('app')}>
          Отбор<small>✓ {a.num ? 'принят, № ' + a.num : 'пройден'}</small>
        </button>
        {visits.map((x) => {
          const on = s.tab === 'anketa' && viewedVisit(s, a) === x.n
          const what = x.n === 1 ? 'анкета участника' : 'анкета визита'
          return (
            <button key={x.n} className="m-step" data-step={x.n} data-state={x.state} {...pressed(on)} disabled={x.state === 'future'}
              title={visitName(a, x.n) + ': ' + what + ' — ' + VISIT_STATE_CAPTION[x.state]} onClick={() => openStep(String(x.n))}>
              {visitName(a, x.n)}<small>{(x.state === 'done' ? '✓ ' : '') + VISIT_STATE_CAPTION[x.state]}</small>
            </button>
          )
        })}
      </div>
      {s.tab !== 'app' && <Stages a={a} />}
    </div>
  )
}

function Stages({ a }) {
  const s = useStore()
  const v = viewedVisit(s, a)
  const cur = visitNumber(a)
  const now = v < cur ? 3 : stageIndex(a)
  const error = a.status === 'anketaBack'
  return (
    <div className="m-chips m-etaps" role="group" aria-label={visitName(a, v) + ': этапы'}>
      {STAGES.map((e, i) => {
        const state = i < now ? 'done' : i > now ? 'next' : error ? 'error' : 'now'
        const can = i === 0 && v === cur && now < 3
        return (
          <button key={e.k} className="m-etap" data-state={state} {...pressed(can && s.tab === 'anketa')}
            data-tab={can ? 'anketa' : undefined} disabled={!can} aria-current={state === 'now' || state === 'error' ? 'step' : undefined}
            onClick={() => openTab('anketa')}>
            {(state === 'done' ? '✓ ' : '') + e.title}
          </button>
        )
      })}
    </div>
  )
}
