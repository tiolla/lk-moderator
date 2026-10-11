import { MARK_LABEL } from '@/entities/application'

export function Mismatches({ crit, docs, onGoto }) {
  return (
    <>
      <b className="m-text-danger">Не всё сходится</b>
      <ul className="m-list">
        {crit.map((c) => <li key={c.k}><button className="m-linkbtn" data-goto="auto" onClick={onGoto}>{c.title}</button> — {c.fact}</li>)}
        {docs.map((d, i) => <li key={'d' + i}>Документ «{d.name}» — отметка «{MARK_LABEL[d.mark]}»</li>)}
      </ul>
    </>
  )
}

export const FieldNotesLine = ({ n }) => (
  <><br /><br /><b>Замечаний в полях: {n}.</b> Участнику они не уйдут — их увидит врач. Чтобы отправить их участнику, нажмите «Вернуть участнику».</>
)
