import { useStore } from '@/shared/model/store.js'
import { STUDY_SHORT, STUDY_TITLE, groupCaption } from '@/entities/study'
import { NOTE_TEMPLATES, openApp, stageCaption } from '@/entities/application'
import { AnketaStep, Banners, CardHeader, DecisionPanel, History, SelectionStep, Stepper } from '@/widgets/card'

function Templates() {
  return Object.keys(NOTE_TEMPLATES).map((k) => (
    <datalist key={k} id={'tpl-' + k}>{NOTE_TEMPLATES[k].map((t) => <option key={t} value={t} />)}</datalist>
  ))
}

export function CardPage() {
  const s = useStore()
  const a = openApp(s)
  if (!a) return null
  const meta = [STUDY_SHORT[a.study], stageCaption(a), a.num ? '№ ' + a.num : 'заявка от ' + a.submitted, groupCaption(a.form.studyGroup), a.form.city]
  if (a.family) meta.push(a.family + (a.familyRole ? ', ' + a.familyRole.toLowerCase() : ''))
  return (
    <>
      <CardHeader a={a} />
      <Templates />
      <h1 className="m-h1" style={{ marginTop: 'var(--spacing-12)' }}>{a.form.participantFullName}</h1>
      <p className="m-sub" title={STUDY_TITLE[a.study]}>{meta.join(' · ')}</p>
      <Banners a={a} />
      <Stepper a={a} />
      {s.tab === 'app' ? <SelectionStep a={a} /> : <AnketaStep a={a} />}
      <DecisionPanel a={a} />
      <History a={a} />
    </>
  )
}
