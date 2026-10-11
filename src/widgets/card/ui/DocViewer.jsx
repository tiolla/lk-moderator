import { useLayoutEffect, useRef, useState } from 'react'
import { plural } from '@/shared/lib/plural.js'
import { getState, useStore, update } from '@/shared/model/store.js'
import { currentRole } from '@/entities/staff'
import { STUDY_SHORT, groupCaption } from '@/entities/study'
import { DocumentContent, MARK_LABEL, canDecide, docComments, documentPageCount, openApp } from '@/entities/application'
import { pressed } from '@/shared/ui'
import { addDocComment, deleteDocComment, rotateDoc, setComment, viewerSelect, zoomDoc } from '@/features/review'
import { ask } from '@/features/decision'
import { DocMarks } from './DocMarks.jsx'

const commentOrder = (x, y) => (+x.split(':')[2] || 0) - (+y.split(':')[2] || 0)

export function DocViewer({ i, focusInput, onClose }) {
  const s = useStore()
  const a = openApp(s)
  const d = a.docs[i]
  const can = canDecide(s, a, 'app')
  const z = s.docZoom || 1
  const r = s.docRot || 0
  const coord = currentRole(s) === 'coord'
  const [typed, setTyped] = useState({ tick: -1, text: '' })
  const draft = typed.tick === s.renderTick ? typed.text : ''
  const input = useRef(null)
  const [editing, setEditing] = useState({ tick: -1, texts: {} })
  const live = editing.tick === s.renderTick ? editing.texts : {}
  const comments = docComments(a, i)
  const shown = comments.map((c) => c.k)
  Object.keys(live).forEach((k) => { if (!shown.includes(k) && (k === 'doc:' + i || k.indexOf('doc:' + i + ':') === 0)) shown.push(k) })
  shown.sort(commentOrder)

  useLayoutEffect(() => {
    if (!focusInput || !input.current) return
    input.current.focus()
    update((x) => { if (x.modal) x.modal.focusInput = false }, { render: false })
  }, [focusInput, s.renderTick])

  function add() {
    if (!addDocComment(draft)) input.current?.focus()
  }
  function edit(k, value) {
    const tick = getState().renderTick
    setEditing((e) => ({ tick, texts: { ...(e.tick === tick ? e.texts : {}), [k]: value } }))
    setComment(k, value)
  }

  return (
    <div className="m-overlay m-overlay--viewer" data-overlay="1" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="m-viewer" role="dialog" aria-modal="true" aria-labelledby="m-modal-title">
        <div className="m-viewer__main">
          <div className="m-viewer__bar">
            {a.docs.length > 1 && (
              <>
                <div className="m-chips" role="group" aria-label="Документы заявки">
                  {a.docs.map((x, j) => {
                    const n = docComments(a, j).length
                    return (
                      <button key={j} className="m-chip" data-docview={j} {...pressed(j === i)} title={x.name} onClick={() => viewerSelect(j)}>
                        {x.note || x.name}{n > 0 && <span className="m-chip__count">{n}</span>}
                      </button>
                    )
                  })}
                </div>
                <span className="m-viewer__sep" aria-hidden="true" />
              </>
            )}
            <div className="m-doc__tools" style={{ margin: 0 }} aria-label="Просмотр документа">
              <button className="m-btn m-btn--sm m-btn--outline" data-zoom="-1" aria-label="Уменьшить" disabled={z <= 0.5} onClick={() => zoomDoc(-1)}>−</button>
              <span className="m-doc__zoom">{Math.round(z * 100)}%</span>
              <button className="m-btn m-btn--sm m-btn--outline" data-zoom="1" aria-label="Увеличить" disabled={z >= 2} onClick={() => zoomDoc(1)}>+</button>
              <button className="m-btn m-btn--sm m-btn--outline" data-rot="1" onClick={rotateDoc}>Повернуть</button>
            </div>
            <span className="m-pane__hint" style={{ margin: 0 }}>{d.kind === 'JPG' ? 'Фото документа' : plural(documentPageCount(d), ['страница', 'страницы', 'страниц'])}</span>
          </div>
          <div className="m-viewer__scroll" data-rot={r}>
            <div className="m-viewer__pages" style={{ zoom: z, transform: 'rotate(' + r + 'deg)' }}><DocumentContent app={a} doc={d} /></div>
          </div>
        </div>
        <aside className="m-viewer__side">
          <div className="m-modal__head" style={{ margin: 0 }}>
            <div>
              <h2 className="m-card__title" id="m-modal-title" tabIndex={-1}>{d.note || d.name}</h2>
              <div className="m-card__hint">{d.name + ' · ' + d.kind + ' · ' + d.size + ' · загружен ' + d.when}</div>
            </div>
            <button className="m-close" data-close="1" aria-label="Закрыть" onClick={onClose}>✕</button>
          </div>
          <div className="m-viewer__form">
            <div className="m-label">Из заявки</div>
            <dl>
              <dt>Участник</dt><dd>{a.form.participantFullName}</dd>
              <dt>Дата рождения</dt><dd>{a.form.birth}</dd>
              <dt>Группа</dt><dd>{groupCaption(a.form.studyGroup)}</dd>
              <dt>Исследование</dt><dd>{STUDY_SHORT[a.study]}</dd>
            </dl>
          </div>
          {can
            ? <div><div className="m-label">Документ</div><DocMarks i={i} doc={d} top="var(--spacing-8)" /></div>
            : d.mark ? <div className="m-pane__hint">Отметка: {MARK_LABEL[d.mark]}</div> : null}
          <div>
            <div className="m-label">{coord ? 'Замечания к документу' : 'Комментарии участнику'}{comments.length ? ' · ' + comments.length : ''}</div>
            {shown.length
              ? (
                <div className="m-doccom__rows">
                  {shown.map((k) => (
                    <div key={k} className="m-doccom__row">
                      {can
                        ? (
                          <>
                            <input className="m-input m-input--filled" data-comment={k} list="tpl-document" value={k in live ? live[k] : (a.comments || {})[k] || ''} aria-label="Комментарий к документу" onChange={(e) => edit(k, e.target.value)} />
                            <button className="m-close" data-docdel={k} aria-label="Удалить комментарий" title="Удалить" onClick={() => deleteDocComment(k)}>✕</button>
                          </>
                        )
                        : <div className="m-field__note" style={{ maxWidth: 'none' }}>{a.comments[k]}</div>}
                    </div>
                  ))}
                </div>
              )
              : can ? null : <div className="m-pane__hint">Комментариев нет.</div>}
            {can && (
              <>
                <div className="m-doccom__add">
                  <input ref={input} className="m-input" id="doc-new-comment" list="tpl-document" placeholder="Что не так — ↓ частые формулировки" aria-label="Новый комментарий к документу"
                    value={draft} onChange={(e) => setTyped({ tick: getState().renderTick, text: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
                  <button className="m-btn m-btn--sm m-btn--secondary" data-docadd={i} onClick={add}>Добавить</button>
                </div>
                <div className="m-pane__hint" style={{ marginTop: 'var(--spacing-8)' }}>
                  {coord ? 'Уйдут участнику, если вернёте заявку, или врачу, если передадите её ему.' : 'Уйдут участнику, когда вы вернёте заявку с замечаниями.'}
                </div>
              </>
            )}
          </div>
          <div className="m-viewer__foot">
            {can && <button className="m-btn m-btn--sm m-btn--warning" data-docreq={i} onClick={() => ask('doc', i)}>Запросить другой документ</button>}
            <button className="m-btn m-btn--outline" data-close="1" onClick={onClose}>Закрыть</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
