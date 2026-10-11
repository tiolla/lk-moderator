import { useStore } from '@/shared/model/store.js'
import { PEOPLE, ROLES, coordSeesMedical, hasCoordinator, leads, me, studyLead } from '@/entities/staff'
import { STUDIES, STUDY_SHORT } from '@/entities/study'
import { withCoordinator } from '@/entities/application'
import { assign, setCoordMedical, unassign } from '@/features/assignments'

function RoleGroup({ study, role }) {
  const s = useStore()
  const assigned = s.assignments[study.id][role] || []
  const can = leads(s, study.id)
  const lastDoctor = role === 'doctor' && assigned.length < 2
  const free = Object.keys(PEOPLE).filter((k) => PEOPLE[k].role === role && !assigned.includes(k))
  return (
    <div className="m-study__group">
      <div className="m-study__role">{role === 'coord' ? 'Координаторы' : 'Врачи'}</div>
      <div className="m-assign">
        {assigned.length
          ? assigned.map((k) => (
            <span key={k} className="m-assign__who">
              {PEOPLE[k].name}
              {can && (
                <button className="m-assign__x" data-unassign={study.id + ':' + role + ':' + k} disabled={lastDoctor}
                  title={lastDoctor ? 'В исследовании должен остаться хотя бы один врач' : 'Снять с отбора'} aria-label={'Снять ' + PEOPLE[k].name}
                  onClick={() => unassign(study.id, role, k)}>✕</button>
              )}
            </span>
          ))
          : <span className="m-assign__none">{role === 'coord' ? 'нет' : 'не назначены'}</span>}
        {can && free.length > 0 && (
          <select className="m-assign__add" data-assign={study.id + ':' + role} aria-label={'Назначить: ' + ROLES[role].caption + ', ' + study.short}
            value="" onChange={(e) => { if (e.target.value) assign(study.id, role, e.target.value) }}>
            <option value="">+ {role === 'coord' ? 'Координатор' : 'Врач'}</option>
            {free.map((k) => <option key={k} value={k}>{PEOPLE[k].name}</option>)}
          </select>
        )}
      </div>
    </div>
  )
}

export function StudiesPage() {
  const s = useStore()
  const mine = me(s).leads
  return (
    <>
      <h1 className="m-h1">Исследования</h1>
      <div className="m-studies__lead">
        <h2 className="m-card__title">Кто проверяет отбор</h2>
        <p className="m-studies__hint">
          {mine.length
            ? 'Вы руководите: ' + mine.map((x) => STUDY_SHORT[x]).join(', ') + ' — здесь можно назначать и снимать людей. ' +
              'Назначили координатора — новые заявки сначала проверит он. Сняли последнего — его заявки перейдут к врачу.'
            : 'Назначения меняет руководитель исследования.'}
        </p>
      </div>
      <div className="m-studies">
        {STUDIES.map((study) => {
          const can = leads(s, study.id)
          const coord = hasCoordinator(s, study.id)
          const waiting = s.apps.filter((a) => a.study === study.id && withCoordinator(s, a)).length
          return (
            <section key={study.id} className="m-study" aria-label={study.short}>
              <div className="m-study__head">
                <div className="m-study__name">
                  <h2 className="m-study__short">{study.short}</h2>
                  <div className="m-study__title">{study.title}</div>
                </div>
                <span className={'m-badge ' + (coord ? 'm-badge--wait' : 'm-badge--muted')}>{coord ? 'Координатор, затем врач' : 'Врач проверяет сам'}</span>
              </div>
              <div className="m-study__meta">
                <span>Руководитель: <b>{studyLead(study.id) || 'не назначен'}</b></span>
                {waiting > 0 && <span>У координатора ждут: <b>{waiting}</b></span>}
              </div>
              <div className="m-study__people">
                <RoleGroup study={study} role="coord" />
                <RoleGroup study={study} role="doctor" />
              </div>
              {coord && (
                <div className="m-study__foot">
                  <label className="m-study__toggle">
                    <input type="checkbox" data-medk={study.id} checked={coordSeesMedical(s, study.id)} disabled={!can} onChange={(e) => setCoordMedical(study.id, e.target.checked)} />
                    {' '}Координатор видит медицинские разделы анкеты
                  </label>
                  {!can && <div className="m-study__note">Меняет руководитель: {studyLead(study.id) || 'не назначен'}</div>}
                </div>
              )}
            </section>
          )
        })}
      </div>
      <div className="m-info m-info--neutral m-studies__next">Дальше здесь будет устройство исследования: анкеты и вопросы, критерии включения, визиты, документы и согласия, шаблон отчёта.</div>
    </>
  )
}
