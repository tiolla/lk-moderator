import { useStore, update } from '@/shared/model/store.js'
import { asButton } from '@/shared/ui'
import { STUDY_SHORT } from '@/entities/study'
import { families, initials, openCard } from '@/entities/application'

function NoFamilies({ graph }) {
  const s = useStore()
  const where = s.study === 'all' ? 'В выбранных исследованиях' : 'У исследования «' + STUDY_SHORT[s.study] + '»'
  return (
    <div className="m-card m-empty">
      {where} родственных групп нет.<br />Они появляются там, где участники приходят семьёй — сейчас это моногенные заболевания и ВДКН.
      {graph && <><br />Граф строится по связям внутри группы.</>}
    </div>
  )
}

export function FamilyGroups() {
  const s = useStore()
  const list = families(s)
  if (!list.length) return <NoFamilies />
  return (
    <div>
      {list.map((g) => {
        const nav = g.people.map((a) => a.id)
        return (
          <div key={g.id} className="m-group-card">
            <div className="m-group-card__head" data-group={g.id} onClick={(e) => { if (!e.target.closest('[data-graph]')) update((d) => { d.group = d.group === g.id ? null : g.id }) }}>
              <span className="m-group-card__name">{g.title}</span>
              <span className="m-badge m-badge--info">{g.people.length} чел.</span>
              <span className="m-group-card__meta">{g.id} · {STUDY_SHORT[g.study]} · основной участник: {g.main.form.participantFullName}</span>
              <span className="m-header__spacer" />
              <button className="m-btn m-btn--outline m-btn--sm" data-graph={g.id} onClick={(e) => { e.stopPropagation(); update((d) => { d.view = 'graph'; d.group = g.id }) }}>Граф</button>
            </div>
            {s.group === g.id && (
              <div className="m-kin">
                {g.people.map((a) => (
                  <span key={a.id} className="m-kin__item" data-open={a.id} {...asButton(() => openCard(a.id, nav))}>
                    <span className="m-avatar" style={{ width: '24px', height: '24px', font: "var(--font-weight-700) var(--font-size-12)/16px 'Manrope',sans-serif" }}>{initials(a.form.participantFullName)}</span>
                    {a.form.participantFullName}
                    <span className="m-kin__role">{a.familyRole || 'связь не указана'}</span>
                    <span className="m-kin__role">{a.num ? '№ ' + a.num : 'заявка'}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function FamilyGraph() {
  const s = useStore()
  const list = families(s)
  if (!list.length) return <NoFamilies graph />
  const g = list.find((x) => x.id === s.group) || list[0]
  const around = g.people.filter((a) => a !== g.main)
  const W = 720
  const H = 400
  const cx = W / 2
  const cy = H / 2 - 10
  const R = 128
  const nodes = around.map((a, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(around.length, 1)
    return { a, x: cx + R * Math.cos(angle) * 1.5, y: cy + R * Math.sin(angle) }
  })
  const nav = [g.main].concat(around).map((a) => a.id)
  const node = (a, x, y, r, main) => {
    const accepted = !!a.num
    const fill = main ? 'var(--c-action-deep)' : accepted ? 'var(--c-step-on)' : 'var(--c-surface-3)'
    const color = main || accepted ? 'var(--c-white)' : 'var(--c-ink-3)'
    return (
      <g key={a.id} data-open={a.id} style={{ cursor: 'pointer' }} {...asButton(() => openCard(a.id, nav))}>
        <circle cx={x} cy={y} r={r} fill={fill} />
        <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{initials(a.form.participantFullName)}</text>
        <text x={x} y={y + r + 18} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--c-ink)">{a.form.participantFullName.split(' ').slice(0, 2).join(' ')}</text>
        <text x={x} y={y + r + 34} textAnchor="middle" fontSize="12" fill="var(--c-ink-3)">{(a.familyRole || 'связь не указана') + ' · ' + (a.num ? '№ ' + a.num : 'заявка')}</text>
      </g>
    )
  }
  return (
    <div className="m-card">
      <div className="m-toolbar" style={{ marginTop: 0 }}>
        <span className="m-label">Родственная группа</span>
        <select className="m-select" id="groupsel" style={{ maxWidth: '360px' }} value={g.id} onChange={(e) => { const v = e.target.value; update((d) => { d.group = v }) }}>
          {list.map((x) => <option key={x.id} value={x.id}>{x.title + ' · ' + x.id + ' · ' + x.people.length + ' чел.'}</option>)}
        </select>
        <span className="m-header__spacer" />
        <span className="m-oldest">Связи — из анкеты отбора: кем участник приходится основному</span>
      </div>
      <svg className="m-graph" viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Граф родственной группы">
        {nodes.map((n) => <line key={n.a.id} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="var(--c-border-control)" strokeWidth="1.5" />)}
        {node(g.main, cx, cy, 34, true)}
        {nodes.map((n) => node(n.a, n.x, n.y, 26, false))}
      </svg>
      <div className="m-pane__hint">Поколений граф не показывает: для «дед — отец — сын» в анкете нужен другой вопрос — кем и кому, а не только кем основному участнику. Решение ещё не принято.</div>
    </div>
  )
}
