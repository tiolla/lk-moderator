import { useStore, update } from '@/shared/model/store.js'
import { currentRole, hasCoordinator } from '@/entities/staff'
import { backToList, navList, statusBadge, step, waitsForMe } from '@/entities/application'
import { act } from '@/features/decision'

export function CardHeader({ a }) {
  const s = useStore()
  const waits = waitsForMe(s, a)
  const badge = statusBadge(a)
  const canAsk = currentRole(s) === 'doctor' && waits && hasCoordinator(s, a.study) && (a.status === 'new' || a.status === 'anketa') &&
    !(a.question && a.question.status === 'open')
  return (
    <div className="m-crumb">
      <div className="m-crumb__left">
        <button className="m-back" data-back="1" onClick={backToList}>← {s.from === 'people' ? 'К участникам' : 'В проверку'}</button>
        <Paging />
      </div>
      <div className="m-crumb__left">
        <button className="m-back" data-keys="1" style={{ fontSize: 'var(--font-size-12)' }} onClick={() => update((d) => { d.modal = { type: 'keys' } })}>Клавиши · ?</button>
        {canAsk && <button className="m-btn m-btn--outline m-btn--sm" data-act="question" onClick={() => act('question')}>Вопрос координатору</button>}
        {waits
          ? <button className="m-btn m-btn--outline m-btn--sm" data-act="postpone" title={s.keysOn ? 'Клавиша O' : undefined} onClick={() => act('postpone')}>Отложить</button>
          : <span className={'m-badge ' + badge.cls}>{badge.label}</span>}
      </div>
    </div>
  )
}

function Paging() {
  const s = useStore()
  const mode = navList(s)
  const i = mode.list.indexOf(s.appId)
  const total = mode.list.length
  if (total < 2 || i < 0) return null
  return (
    <>
      <button className="m-btn m-btn--outline m-btn--sm" data-nav="prev" disabled={i <= 0} aria-label="Предыдущая" onClick={() => step('prev')}>←<span className="m-nav__txt"> Предыдущая</span></button>
      <span className="m-crumb__pos">{mode.what} {i + 1} из {total}</span>
      <button className="m-btn m-btn--outline m-btn--sm" data-nav="next" disabled={i >= total - 1} aria-label="Следующая" onClick={() => step('next')}><span className="m-nav__txt">Следующая </span>→</button>
    </>
  )
}
