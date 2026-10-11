import { pressed } from '@/shared/ui'
import { markDoc } from '@/features/review'

export function DocMarks({ i, doc, top = 'var(--spacing-16)' }) {
  return (
    <div className="m-seg" style={{ marginTop: top }}>
      <button data-mark={i} data-val="ok" {...pressed(doc.mark === 'ok')} onClick={() => markDoc(i, 'ok')}>Проверен</button>
      <button data-mark={i} data-val="bad" data-tone="bad" {...pressed(doc.mark === 'bad')} onClick={() => markDoc(i, 'bad')}>Не читается</button>
      <button data-mark={i} data-val="need" data-tone="bad" {...pressed(doc.mark === 'need')} onClick={() => markDoc(i, 'need')}>Нужен другой</button>
    </div>
  )
}
