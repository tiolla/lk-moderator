import { useState } from 'react'
import { getState, useStore } from '@/shared/model/store.js'
import { templateListId } from '@/entities/application'
import { openNote, setComment } from '@/features/review'

export function FieldRow({ label, value, fieldKey, comment, optional, can, compare, coordNote, extra }) {
  const note = useStore((s) => s.note)
  const renderTick = useStore((s) => s.renderTick)
  const [typed, setTyped] = useState({ tick: -1, text: '' })
  const typing = typed.tick === renderTick
  const empty = !value
  const caption = empty ? (optional ? 'участник не заполнял — поле необязательное' : 'не заполнено') : value
  const open = note === fieldKey || !!comment || typing
  const changed = !!compare && (compare.was || '') !== (value || '')

  let right
  if (can === false) {
    right = comment ? <div className="m-field__note">Замечание: {comment}</div> : null
  } else if (open) {
    right = (
      <input className={'m-input' + (comment ? ' m-input--filled' : '')} data-comment={fieldKey} list={templateListId(fieldKey)}
        value={typing ? typed.text : comment || ''} placeholder="Замечание участнику — ↓ частые формулировки" aria-label={'Замечание к полю «' + label + '»'}
        onChange={(e) => { setTyped({ tick: getState().renderTick, text: e.target.value }); setComment(fieldKey, e.target.value) }} />
    )
  } else {
    right = <button className="m-addnote" data-note={fieldKey} onClick={() => openNote(fieldKey)}>+ Замечание</button>
  }

  return (
    <div className="m-field" data-flag={comment ? '1' : '0'} data-changed={changed ? '1' : undefined}>
      <div className="m-field__label">{label}</div>
      <div className={'m-field__value' + (empty ? ' m-field__value--empty' : '')}>
        {caption}{extra}
        {changed && (
          <>
            <span className="m-tag m-tag--chg">изменилось</span>
            <span className="m-field__prev">{'Было на визите ' + compare.visit + ': ' + (compare.was || 'не заполнено')}</span>
          </>
        )}
        {coordNote && <span className="m-field__coord">Координатор: {coordNote.text}</span>}
      </div>
      {right}
    </div>
  )
}
