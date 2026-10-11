import { useState } from 'react'
import { useStore, update } from '@/shared/model/store.js'
import { Modal, ModalActions } from '@/shared/ui'
import { POSTPONE_REASONS, decide } from '../model/decisions.js'
import { ask } from '../model/ask.js'
import { buildAsk } from './ask-content.jsx'

const RADIO_LABEL = { display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', marginTop: 'var(--spacing-8)', font: 'var(--font-weight-500) var(--font-size-14)/20px Manrope,sans-serif' }
const FIELDSET = { margin: 'var(--spacing-16) 0 0', padding: 0, border: 'none' }
const TEXTAREA = { marginTop: 'var(--spacing-8)' }
const BLOCK = { marginTop: 'var(--spacing-16)' }

function handOverInstead(kind) {
  update((d) => { d.modal = null }, { render: false })
  ask(kind === 'reject' ? 'pass' : 'anketa-pass')
}

function goToAutoCheck() {
  update((d) => { d.modal = null; d.autoOpen = true })
  document.querySelector('.m-auto')?.scrollIntoView({ block: 'center' })
}

export function AskModal({ spec, onClose }) {
  const s = useStore()
  const m = buildAsk(s, spec.kind, goToAutoCheck)
  const [reason, setReason] = useState(spec.reason || '')
  const [coordReason, setCoordReason] = useState(null)
  const [postponeReason, setPostponeReason] = useState(POSTPONE_REASONS[0])
  const disabled = (m.needWhy && !reason.trim()) || (m.rejectReasons && !coordReason)

  function confirm() {
    let text = reason.trim()
    if (m.rejectReasons) {
      if (!coordReason) return
      text = coordReason + (text ? '. ' + text : '')
    }
    if (m.postpone && !text) text = postponeReason
    decide(spec.kind, text)
  }

  const textarea = (placeholder, extra) => (
    <textarea className="m-textarea" id="reason" style={TEXTAREA} placeholder={placeholder} {...extra}
      value={reason} onChange={(e) => setReason(e.target.value)} />
  )

  return (
    <Modal title={m.title} onClose={onClose}>
      <div className={'m-info ' + m.tone}>{m.body}</div>
      {m.needReason && (
        <div style={BLOCK}><div className="m-label">Причина для участника</div>{textarea('Что написать участнику')}</div>
      )}
      {m.rejectReasons && (
        <>
          <fieldset style={FIELDSET}>
            <legend className="m-label">Объективная причина — её увидит участник</legend>
            {m.rejectReasons.map((r) => (
              <label key={r} style={RADIO_LABEL}>
                <input type="radio" name="coord-reason" value={r} checked={coordReason === r} onChange={() => setCoordReason(r)} /> {r}
              </label>
            ))}
          </fieldset>
          <label className="m-label" htmlFor="reason" style={{ display: 'block', marginTop: 'var(--spacing-16)' }}>Пояснение — необязательно</label>
          {textarea('Например: участнику 17 лет, в протоколе с 18')}
          <div className="m-info m-info--neutral" style={BLOCK}>
            Сомневаетесь по медицинской части? Это решает врач. <button className="m-linkbtn" data-medpass="1" onClick={() => handOverInstead(spec.kind)}>Передать врачу</button>
          </div>
        </>
      )}
      {m.needWhy && (
        <div style={BLOCK}>
          <label className="m-label" htmlFor="reason">{m.whyLabel || 'Почему одобряете, несмотря на несоответствия — обязательно'}</label>
          {textarea(m.whyPlaceholder || 'Например: город уточнён по телефону, участник приедет в Москву')}
        </div>
      )}
      {m.noteToDoctor && (
        <div style={BLOCK}>
          <label className="m-label" htmlFor="reason">Комментарий врачу — необязательно, участник его не увидит</label>
          {textarea('Например: выписка старая, но диагноз сходится')}
        </div>
      )}
      {m.postpone && (
        <div>
          <fieldset style={FIELDSET}>
            <legend className="m-label">Причина — для вас и коллег</legend>
            {POSTPONE_REASONS.map((r) => (
              <label key={r} style={RADIO_LABEL}>
                <input type="radio" name="postpone-reason" value={r} checked={postponeReason === r} onChange={() => setPostponeReason(r)} /> {r}
              </label>
            ))}
          </fieldset>
          {textarea('Своими словами — если ни одна причина не подходит', { 'aria-label': 'Своя причина' })}
        </div>
      )}
      <ModalActions onClose={onClose}>
        <button className={'m-btn ' + m.confirmClass} data-confirm="1" disabled={disabled} onClick={confirm}>{m.confirmLabel}</button>
      </ModalActions>
    </Modal>
  )
}
