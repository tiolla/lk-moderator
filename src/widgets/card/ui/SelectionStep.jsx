import { useStore } from '@/shared/model/store.js'
import { currentRole } from '@/entities/staff'
import { SELECTION_FIELDS, canDecide, valueOf } from '@/entities/application'
import { DocPane } from './DocPane.jsx'
import { AutoCheck } from './AutoCheck.jsx'
import { FieldRow } from './FieldRow.jsx'

export function SelectionStep({ a }) {
  const s = useStore()
  const can = canDecide(s, a, 'app')
  return (
    <>
      <AutoCheck a={a} />
      <div className="m-two">
        <DocPane a={a} can={can} />
        <div className="m-pane">
          <h2 className="m-pane__title">Данные заявки</h2>
          <div className="m-pane__hint">
            {can
              ? currentRole(s) === 'coord'
                ? 'Сверьте с документом. Замечание уйдёт участнику, если вернёте заявку, или врачу, если передадите её ему.'
                : 'Сверьте с документом. Замечание в строке уйдёт участнику вместе с решением.'
              : 'Отбор не на проверке — данные только для просмотра.'}
          </div>
          <div style={{ marginTop: 'var(--spacing-12)' }}>
            {SELECTION_FIELDS.map((f) => (
              <FieldRow key={f.k} label={f.label} value={valueOf(a, f.k)} fieldKey={f.k} comment={(a.comments || {})[f.k]}
                optional={f.optional} can={can && !f.fact} coordNote={(a.coordNotes || {})[f.k]} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
