import { useEffect, useRef } from 'react'
import { useStore } from '@/shared/model/store.js'
import { closeToast } from '@/shared/model/toasts.js'
import { undoByKey } from '@/features/decision'

function Toast({ t }) {
  const timer = useRef(null)
  const start = (ms) => { clearTimeout(timer.current); timer.current = setTimeout(() => closeToast(t.id), ms) }
  const pause = () => clearTimeout(timer.current)
  useEffect(() => {
    timer.current = setTimeout(() => closeToast(t.id), t.undoKey ? 10000 : 6000)
    return () => clearTimeout(timer.current)
  }, [t.id, t.undoKey])
  return (
    <div className="m-toast" data-tone={t.tone} onMouseEnter={pause} onFocus={pause} onMouseLeave={() => start(4000)} onBlur={() => start(4000)}>
      <b>{t.text}</b>
      {t.sub && <span>{t.sub}</span>}
      {t.undoKey && <button className="m-toast__undo" data-undo="1" onClick={() => undoByKey(t.undoKey)}>Отменить</button>}
    </div>
  )
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="m-toasts" id="toasts" role="status" aria-live="polite">
      {toasts.map((t) => <Toast key={t.id} t={t} />)}
    </div>
  )
}
