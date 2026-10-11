import { plural } from '@/shared/lib/plural.js'
import { useStore } from '@/shared/model/store.js'
import { pressed } from '@/shared/ui'
import { groupCaption } from '@/entities/study'
import { DocumentContent, MARK_LABEL, docComments, documentPageCount } from '@/entities/application'
import { openViewer, selectDoc } from '@/features/review'
import { ask } from '@/features/decision'
import { DocMarks } from './DocMarks.jsx'

export function DocPane({ a, can }) {
  const docIndex = useStore((s) => s.doc)
  if (!a.docs.length) {
    if (a.form.studyGroup !== 'main') {
      return (
        <div className="m-pane m-pane--sticky">
          <h2 className="m-pane__title">Документов нет</h2>
          <div className="m-info m-info--neutral" style={{ marginTop: 'var(--spacing-12)' }}>{groupCaption(a.form.studyGroup)}: документы по протоколу не требуются.</div>
        </div>
      )
    }
    return (
      <div className="m-pane m-pane--sticky">
        <h2 className="m-pane__title">Документов нет</h2>
        <div className="m-info m-info--warn" style={{ marginTop: 'var(--spacing-12)' }}>
          Для основной группы нужна выписка, подтверждающая диагноз.
          {can && (
            <div className="m-doc__actions" style={{ marginTop: 'var(--spacing-12)' }}>
              <button className="m-btn m-btn--sm m-btn--warning" data-docreq="-1" onClick={() => ask('doc', -1)}>Запросить документ</button>
            </div>
          )}
        </div>
      </div>
    )
  }
  const i = Math.min(docIndex || 0, a.docs.length - 1)
  const d = a.docs[i]
  const comments = docComments(a, i)
  const fromCoord = Object.keys(a.coordNotes || {}).filter((k) => k === 'doc:' + i || k.indexOf('doc:' + i + ':') === 0)
  return (
    <div className="m-pane m-pane--sticky">
      <h2 className="m-pane__title">{d.note || d.name}</h2>
      <div className="m-pane__hint">{d.name} · {d.kind === 'JPG' ? 'фото' : plural(documentPageCount(d), ['страница', 'страницы', 'страниц'])} · {d.size} · загружен {d.when}</div>
      {a.docs.length > 1 && (
        <div className="m-chips" style={{ marginTop: 'var(--spacing-12)' }}>
          {a.docs.map((x, j) => {
            const twins = a.docs.filter((y) => y.kind === x.kind).length > 1
            const n = docComments(a, j).length
            return (
              <button key={j} className="m-chip" data-docsel={j} {...pressed(j === i)} title={x.name} onClick={() => selectDoc(j)}>
                {x.kind + (twins ? ' ' + (j + 1) : '')}{n > 0 && <span className="m-chip__count">{n}</span>}
              </button>
            )
          })}
        </div>
      )}
      <button className="m-docthumb" data-doc={i} aria-label={'Открыть документ «' + d.name + '» для чтения'} onClick={() => openViewer(i, false)}>
        <span className="m-docthumb__page" aria-hidden="true"><span className="m-docthumb__zoom"><DocumentContent app={a} doc={d} single /></span></span>
        <span className="m-docthumb__open">Открыть для чтения и комментариев</span>
      </button>
      {can ? <DocMarks i={i} doc={d} /> : d.mark ? <div className="m-pane__hint" style={{ marginTop: 'var(--spacing-12)' }}>Отметка: {MARK_LABEL[d.mark]}</div> : null}
      {fromCoord.length > 0 && (
        <div className="m-doccom">
          <div className="m-label">От координатора</div>
          <ul className="m-doccom__list">{fromCoord.map((k) => <li key={k} className="m-field__coord" style={{ display: 'list-item' }}>{a.coordNotes[k].text}</li>)}</ul>
        </div>
      )}
      {comments.length > 0 && (
        <div className="m-doccom">
          <div className="m-label">Комментарии к документу · {comments.length}</div>
          <ul className="m-doccom__list">{comments.map((c) => <li key={c.k}>{c.text}</li>)}</ul>
        </div>
      )}
      {can && (
        <div className="m-doc__actions" style={{ marginTop: 'var(--spacing-12)' }}>
          <button className="m-btn m-btn--sm m-btn--outline" data-doc={i} data-docfocus="1" onClick={() => openViewer(i, true)}>+ Комментарий к документу</button>
          <button className="m-btn m-btn--sm m-btn--warning" data-docreq={i} onClick={() => ask('doc', i)}>Запросить другой</button>
        </div>
      )}
    </div>
  )
}
