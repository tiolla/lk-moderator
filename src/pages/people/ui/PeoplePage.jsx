import { useStore, update } from '@/shared/model/store.js'
import { pressed } from '@/shared/ui'
import { PEOPLE_STATES, PEOPLE_VIEWS, STAGES, peopleBase, peopleStateCount, stageMatches, studyHasFamilies, tableRows } from '@/entities/application'
import { askExport } from '@/features/export-csv'
import { PeopleTable } from './PeopleTable.jsx'
import { FamilyGraph, FamilyGroups } from './Families.jsx'

export function PeoplePage() {
  const s = useStore()
  const families = studyHasFamilies(s)
  const base = peopleBase(s)
  return (
    <>
      <h1 className="m-h1">Участники</h1>
      <p className="m-sub">Все, кто пришёл в исследование. Пока человек не принят — это заявка, после приёма у него появляется номер. Строка — участие в одном исследовании.</p>
      <div className="m-card">
        <div className="m-toolbar" style={{ marginTop: 0 }}>
          {families && (
            <div className="m-views">
              {PEOPLE_VIEWS.map((v) => (
                <button key={v.k} className="m-chip" data-view={v.k} {...pressed(s.view === v.k)} onClick={() => update((d) => { d.view = v.k; d.page = 1; d.query = '' })}>{v.label}</button>
              ))}
            </div>
          )}
          <span className="m-header__spacer" />
          <div className="m-seg">
            {PEOPLE_STATES.map((c) => (
              <button key={c.k} data-state={c.k} {...pressed(s.peopleState === c.k)} onClick={() => update((d) => { d.peopleState = c.k; d.page = 1 })}>
                {c.label + ' ' + peopleStateCount(s, c.k)}
              </button>
            ))}
          </div>
        </div>
        {s.view === 'list' && (
          <>
            <div className="m-toolbar">
              <div className="m-chips" role="group" aria-label="Этап визита">
                {[{ k: 'all', title: 'Все этапы' }].concat(STAGES).map((e) => (
                  <button key={e.k} className="m-chip" data-stepf={e.k} {...pressed(s.stageFilter === e.k)} onClick={() => update((d) => { d.stageFilter = e.k; d.page = 1 })}>
                    {e.title}<span className="m-chip__count">{base.filter((a) => stageMatches(a, e.k)).length}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="m-toolbar">
              <input className="m-input" id="q" style={{ maxWidth: '320px' }} placeholder="Поиск по ФИО, номеру, группе" value={s.query} onChange={(e) => update((d) => { d.query = e.target.value })} />
              <span className="m-oldest">Найдено: {tableRows(s).length}</span>
              <span className="m-header__spacer" />
              <button className="m-btn m-btn--outline m-btn--sm" data-csv="1" onClick={askExport}>Выгрузить CSV</button>
            </div>
          </>
        )}
      </div>
      {s.view === 'groups' ? <FamilyGroups /> : s.view === 'graph' ? <FamilyGraph /> : <PeopleTable />}
    </>
  )
}
