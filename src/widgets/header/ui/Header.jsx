import { useStore, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { pressed, Chevron } from '@/shared/ui'
import { ROLES, changeRole, me, personRoles, rolesIn } from '@/entities/staff'
import { STUDIES, STUDY_SHORT, STUDY_TITLE } from '@/entities/study'
import { Logo } from './Logo.jsx'

const SECTIONS = [
  { k: 'queue', label: 'Проверка' },
  { k: 'people', label: 'Участники' },
  { k: 'summary', label: 'Сводка' },
  { k: 'studies', label: 'Исследования' },
]

function openSection(k) {
  update((d) => {
    d.query = ''
    d.page = 1
    d.cursor = 0
    d.appId = null
    if (k === 'summary' || k === 'studies') { d.screen = 'soon'; d.soon = k }
    else { d.screen = k; d.sort = k === 'queue' ? 'wait' : 'num'; d.asc = true; d.view = 'list' }
  })
}

function chooseStudy(value) {
  update((d) => {
    d.study = value
    d.page = 1
    d.cursor = 0
    const roles = value === 'all' ? personRoles(d) : rolesIn(d, value)
    if (roles.length && !roles.includes(d.role)) {
      changeRole(d, roles[0])
      d.study = value
      pushToast(d, 'Вы работаете как ' + ROLES[roles[0]].caption, 'В «' + STUDY_SHORT[value] + '» у вас только эта роль')
    }
  })
}

export function Header() {
  const s = useStore()
  const active = s.screen === 'card' ? s.from || 'queue' : s.screen === 'soon' ? s.soon : s.screen
  const person = me(s)
  const role = personRoles(s)[0] || 'doctor'
  return (
    <header className="m-header">
      <div className="m-brand"><Logo /></div>
      <nav className="m-tabs-main" id="topnav">
        {SECTIONS.map((r) => <button key={r.k} data-sect={r.k} {...pressed(active === r.k)} onClick={() => openSection(r.k)}>{r.label}</button>)}
      </nav>
      <div className="m-header__spacer" />
      <div className="m-studysel" id="studysel">
        <span className="m-studysel__label">Исследование</span>
        <span className="m-selectwrap">
          <select className="m-select" id="studysel-input" title={s.study === 'all' ? 'Все мои исследования' : STUDY_TITLE[s.study]} value={s.study} onChange={(e) => chooseStudy(e.target.value)}>
            <option value="all">Все мои исследования</option>
            {STUDIES.filter((x) => rolesIn(s, x.id).length).map((x) => <option key={x.id} value={x.id} title={x.title}>{x.short}</option>)}
          </select>
          <Chevron className="m-selectwrap__chev" />
        </span>
      </div>
      <div className="m-header__user" id="m-user">
        <span className="m-avatar m-avatar--teal">{person.avatar}</span><span>{person.name + ', ' + ROLES[role].caption}</span>
      </div>
    </header>
  )
}
