import { useStore, update } from '@/shared/model/store.js'
import { asButton } from '@/shared/ui'
import { PAGE_SIZE, openCard, pageCount, peopleColumns, statusBadge, tableRows } from '@/entities/application'

function sortBy(k) {
  update((d) => {
    if (d.sort === k) d.asc = !d.asc
    else { d.sort = k; d.asc = true }
  })
}

export function PeopleTable() {
  const s = useStore()
  const all = tableRows(s)
  const pages = pageCount(s)
  const rows = all.slice((s.page - 1) * PAGE_SIZE, s.page * PAGE_SIZE)
  const cols = peopleColumns(s)
  const nav = rows.map((a) => a.id)
  return (
    <>
      <div className="m-table-wrap">
        <table className="m-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.k} data-sort={c.k} data-on={s.sort === c.k ? '1' : '0'} tabIndex={0} role="button"
                  aria-sort={s.sort === c.k ? (s.asc ? 'ascending' : 'descending') : 'none'}
                  onClick={() => sortBy(c.k)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortBy(c.k) } }}>
                  {c.label + (s.sort === c.k ? (s.asc ? ' ↑' : ' ↓') : '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length
              ? rows.map((a) => (
                <tr key={a.id} data-open={a.id} {...asButton(() => openCard(a.id, nav))}>
                  {cols.map((c) => {
                    const cls = ((c.strong ? 'm-table__strong ' : '') + (c.nw ? 'm-table__nw' : '')).trim()
                    const badge = c.badge && statusBadge(a)
                    return <td key={c.k} className={cls || undefined}>{badge ? <span className={'m-badge ' + badge.cls}>{badge.label}</span> : c.val(a)}</td>
                  })}
                </tr>
              ))
              : <tr><td colSpan={cols.length} className="m-empty">Ничего не найдено</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="m-pager">
        <button className="m-btn m-btn--outline m-btn--sm" data-page="prev" disabled={s.page <= 1} onClick={() => update((d) => { d.page -= 1 })}>← Назад</button>
        <span>Страница {s.page} из {pages}</span>
        <button className="m-btn m-btn--outline m-btn--sm" data-page="next" disabled={s.page >= pages} onClick={() => update((d) => { d.page += 1 })}>Вперёд →</button>
      </div>
    </>
  )
}
