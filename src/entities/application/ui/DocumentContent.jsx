import { hash } from '@/shared/lib/hash.js'
import { STUDY_TITLE, groupCaption } from '@/entities/study/@x/application.js'
import { CLINIC, DOC_TEXT } from '../model/clinic.js'
import { documentType } from '../lib/document-type.js'

function docDate(day, shift) {
  const d = new Date(2026, 8, day + (shift || 0))
  return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear()
}

function Signature({ org, role1, role2 }) {
  return (
    <div className="m-a4__sign">
      <div>{role1} ______________ <br />{role2} ______________</div>
      <div className="m-a4__stamp">{org}<br />для документов</div>
    </div>
  )
}

function LabTable({ rows }) {
  return (
    <table>
      <tbody>
        <tr><th>Показатель</th><th>Результат</th><th>Референсные значения</th></tr>
        {rows.map((r, i) => (
          <tr key={i}><td>{r[0]}</td><td><b>{r[1]}</b></td><td>{r[2]}</td></tr>
        ))}
      </tbody>
    </table>
  )
}

function pages(a, d) {
  const f = a.form
  const text = DOC_TEXT[a.study] || DOC_TEXT.dm1
  const female = /вна$/.test(f.participantFullName || '')
  const base = CLINIC[a.study] || CLINIC.dm1
  const history = base.history.replace(/больным\(ой\)/g, female ? 'больной' : 'больным')
    .replace(/([а-яё]+)\(а\)/gi, (m, w) => (female ? w + 'а' : w))
  const clinic = { ...base, history }
  const diagnosis = f.studyGroup === 'control' ? 'Z00.1 — рутинное обследование состояния здоровья. Хронических заболеваний не выявлено.'
    : f.studyGroup === 'relatives' ? 'Z84.8 — в семейном анамнезе: ' + text.diagnosis.replace(/^[A-Z]\d+\.\d — /, '').toLowerCase() + '.'
      : text.diagnosis + '.'
  const day = parseInt(d.when, 10) || new Date().getDate()
  const card = 1000 + hash(a.id + d.name) % 9000
  const head = <div className="m-a4__org">Департамент здравоохранения<br /><b>{text.organization}</b></div>
  const who = (
    <>
      <p><b>Пациент:</b> {f.participantFullName}</p>
      <p><b>Дата рождения:</b> {f.birth}</p>
    </>
  )
  const type = documentType(d)
  if (type === 'referral') {
    return [
      <div className="m-a4" key="1">
        {head}
        <h3>Направление</h3>
        <p>на консультацию и включение в клиническое исследование «{STUDY_TITLE[a.study]}»</p>
        {who}
        <p><b>Группа:</b> {groupCaption(f.studyGroup).toLowerCase()}</p>
        <p><b>Диагноз:</b> {diagnosis}</p>
        <p><b>Обоснование:</b> {f.studyGroup === 'control'
          ? 'ребёнок наблюдается на педиатрическом участке, хронических заболеваний нет, прививки по календарю. Родители согласны на участие в контрольной группе.'
          : 'наблюдается у эндокринолога, нуждается в динамическом наблюдении в рамках исследования.'}</p>
        <p><b>Результаты обследования:</b> общий анализ крови и мочи — без патологии ({docDate(day, -7)}).</p>
        <p>Дата выдачи: {docDate(day, -1)}</p>
        <Signature org={text.organization} role1="Участковый педиатр" role2="Заведующий отделением" />
      </div>,
    ]
  }
  if (type === 'lab') {
    return [
      <div className="m-a4" key="1">
        {head}
        <h3>Результаты лабораторных исследований</h3>
        {who}
        <p><b>Заказ №</b> {400000 + card} · <b>дата взятия биоматериала:</b> {docDate(day, -3)} · <b>биоматериал:</b> сыворотка крови</p>
        <LabTable rows={clinic.labs.slice(0, 5)} />
        <p style={{ marginTop: 'var(--spacing-16)' }}>Результаты, выходящие за пределы референсных значений, выделены врачом клинической лабораторной диагностики. Интерпретацию результатов проводит лечащий врач.</p>
        <Signature org={text.organization} role1="Врач КЛД" role2={'Дата выдачи ' + docDate(day, -1)} />
      </div>,
    ]
  }
  if (type === 'genetics') {
    return [
      <div className="m-a4" key="1">
        {head}
        <h3>Заключение молекулярно-генетического исследования</h3>
        {who}
        <p><b>Направивший диагноз:</b> {diagnosis}</p>
        <p><b>Метод:</b> высокопроизводительное секвенирование (NGS), таргетная панель «Наследственные болезни обмена», 312 генов; подтверждение методом Сэнгера.</p>
        <p><b>Результат:</b> в гене <i>ACADVL</i> выявлены два варианта в компаунд-гетерозиготном состоянии:</p>
        <table>
          <tbody>
            <tr><th>Ген</th><th>Вариант</th><th>Зиготность</th><th>Класс</th></tr>
            <tr><td>ACADVL</td><td>{'c.848T>C (p.Val283Ala)'}</td><td>гетерозигота</td><td>патогенный</td></tr>
            <tr><td>ACADVL</td><td>{'c.1332G>A (p.Trp444*)'}</td><td>гетерозигота</td><td>патогенный</td></tr>
          </tbody>
        </table>
        <p style={{ marginTop: 'var(--spacing-16)' }}><b>Заключение:</b> выявленные варианты подтверждают диагноз недостаточности ацил-КоА-дегидрогеназы жирных кислот с очень длинной цепью. Рекомендовано обследование родственников первой степени родства.</p>
        <Signature org={text.organization} role1="Врач-генетик" role2="Врач-лабораторный генетик" />
      </div>,
    ]
  }
  const page1 = (
    <div className="m-a4" key="1">
      {head}
      <h3>Выписной эпикриз</h3>
      <p style={{ textAlign: 'center', marginTop: '-8px' }}>из медицинской карты стационарного больного № {card}</p>
      {who}
      <p>{female ? 'Находилась' : 'Находился'} на лечении в {clinic.department} с {docDate(day, -12)} по {docDate(day, -3)}.</p>
      <p><b>Диагноз основной:</b> {diagnosis}</p>
      {f.studyGroup === 'main' && (
        <>
          <p><b>Осложнения:</b> {clinic.complications}</p>
          <p><b>Сопутствующие:</b> {clinic.comorbidities}</p>
        </>
      )}
      <p><b>Жалобы при поступлении</b> на {clinic.complaints}</p>
      <p><b>Анамнез заболевания.</b> {clinic.history}</p>
      <p><b>Объективно при поступлении.</b> {clinic.examination}</p>
      <div className="m-a4__page">Страница 1 из 2</div>
    </div>
  )
  const page2 = (
    <div className="m-a4" key="2">
      <p><b>Лабораторные исследования</b> ({docDate(day, -11)}):</p>
      <LabTable rows={clinic.labs} />
      <p style={{ marginTop: 'var(--spacing-16)' }}><b>Инструментальные исследования.</b> {clinic.instrumental}</p>
      <p><b>Проведённое лечение.</b> {clinic.treatment}</p>
      <p><b>Состояние при выписке</b> удовлетворительное, {female ? 'выписана' : 'выписан'} домой под наблюдение специалиста по месту жительства.</p>
      <p><b>Рекомендации:</b></p>
      <ol>{clinic.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ol>
      <Signature org={text.organization} role1="Лечащий врач" role2="Заведующий отделением" />
      <div className="m-a4__page">Страница 2 из 2</div>
    </div>
  )
  return [page1, page2]
}

export function DocumentContent({ app, doc, single }) {
  const list = pages(app, doc)
  if (doc.kind === 'JPG') {
    return <div className="m-photo" data-glare={/засвеч/i.test(doc.note || '') ? '1' : '0'}>{list[0]}</div>
  }
  return single ? list[0] : list
}
