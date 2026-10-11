import { useEffect } from 'react'
import { useStore } from '@/shared/model/store.js'
import { PEOPLE_VIEWS, byStudy, myPostponed, queueTabs, waitsForMe } from '@/entities/application'
import { DEMO_ACTIONS, DEMO_TONE, demoGroups, simulate } from '../model/actions.js'

function where(s) {
  if (s.screen === 'card') return 'Карточка · ' + (s.tab === 'anketa' ? 'анкета' : 'отбор')
  if (s.screen === 'people') return 'Участники · ' + (PEOPLE_VIEWS.find((v) => v.k === s.view) || PEOPLE_VIEWS[0]).label.toLowerCase()
  if (s.screen === 'queue') return 'Проверка · ' + (queueTabs(s).find((k) => k.k === s.queueTab) || { label: 'Отбор' }).label.toLowerCase()
  return 'Раздел в работе'
}

const toggle = () => document.documentElement.classList.toggle('m-demo-open')

export function DemoFab() {
  useEffect(() => {
    const close = (e) => { if (e.key === 'Escape') document.documentElement.classList.remove('m-demo-open') }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])
  return (
    <button id="m-fab" type="button" title="Демо: симуляция действий" aria-label="Демо: симуляция действий" onClick={toggle}>
      <svg className="m-fab__bug" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.5 7.5a3.5 3.5 0 0 1 7 0" />
        <rect x="7" y="7.5" width="10" height="12" rx="5" />
        <path d="M12 9.5v10M3.5 11.5H7M17 11.5h3.5M3.5 16.5H7M17 16.5h3.5M5.5 7l2 1.6M18.5 7l-2 1.6" />
      </svg>
      <svg className="m-fab__close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  )
}

export function DemoPanel() {
  const s = useStore()
  const mine = byStudy(s, s.apps)
  return (
    <div id="m-demo" role="dialog" aria-label="Демо: симуляция действий">
      <div className="m-demo__title">Демо: симуляция</div>
      <div className="m-demo__hint">Сервера нет — то, что в жизни приходит от участника и коллег, показывается отсюда. Экран: {where(s)}</div>
      {demoGroups(s).map((g) => {
        const keys = g.keys.filter((k) => DEMO_ACTIONS[k].can(s))
        if (!keys.length) return null
        return [
          <div key={g.title} className="m-demo__group">{g.title}</div>,
          ...keys.map((k) => (
            <button key={k} className="m-demo__btn" data-sim={k} data-tone={DEMO_TONE[k]} onClick={() => simulate(k)}>
              {DEMO_ACTIONS[k].label}{DEMO_ACTIONS[k].hint && <span>{DEMO_ACTIONS[k].hint}</span>}
            </button>
          )),
        ]
      })}
      <div className="m-demo__state">Ждут решения: {mine.filter((a) => waitsForMe(s, a)).length} · отложено: {myPostponed(s, mine).length} · всего: {mine.length}</div>
    </div>
  )
}
