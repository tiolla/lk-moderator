import { Fragment } from 'react'
import { plural } from '@/shared/lib/plural.js'
import { useStore, update } from '@/shared/model/store.js'
import { pressed } from '@/shared/ui'
import { currentRole, studiesOfRole } from '@/entities/staff'
import { STUDIES, STUDY_SHORT } from '@/entities/study'
import {
  WAITING_TASKS, byStudy, emptyQueueHint, hasTaskChips, initials, myPostponed, openCard, queueBase, queueForTask, queueList,
  queueTabOf, queueTabs, reviewProgress, taskDetails, taskLine, taskName, taskVerb, unreadNote, waitLabel, whatWaits,
  withCoordinator,
} from '@/entities/application'

const setQueue = (recipe) => update((d) => { recipe(d); d.cursor = 0 })

function Progress() {
  const s = useStore()
  const p = reviewProgress(s)
  const pct = p.m ? Math.round(p.n / p.m * 100) : 0
  const label = 'Проверено ' + p.n + ' из ' + p.m + ' ' + (p.m % 10 === 1 && p.m % 100 !== 11 ? 'обращения' : 'обращений')
  return (
    <div className="m-progress" role="progressbar" aria-valuemin="0" aria-valuemax={p.m} aria-valuenow={p.n} aria-label={label}>
      <div className="m-progress__bar"><div className="m-progress__fill" data-full={p.m && p.n === p.m ? '1' : '0'} style={{ width: Math.max(pct, 3) + '%' }} /></div>
      <span className="m-progress__label">{label}</span>
    </div>
  )
}

function QueueRow({ a, i }) {
  const s = useStore()
  const coord = currentRole(s) === 'coord'
  const meta = (s.study === 'all' ? [STUDY_SHORT[a.study]] : []).concat(taskDetails(s, a))
  meta.push(a.num ? '№ ' + a.num : 'подана ' + a.submitted)
  if (a.family) meta.push(a.family)
  const open = () => openCard(a.id, queueList(s).map((x) => x.id))
  return (
    <div className="m-queue__item" data-row={a.id} data-cursor={i === s.cursor ? '1' : '0'} onClick={(e) => { if (!e.target.closest('button')) open() }}>
      <span className="m-avatar">{initials(a.form.participantFullName)}</span>
      <div>
        <div className="m-queue__name">
          {a.form.participantFullName}
          {a.repeat && <span className="m-tag m-tag--repeat">Повторная</span>}
          {a.question && a.question.status === 'open' && coord && <span className="m-tag m-tag--repeat">Вопрос врача</span>}
          {a.question && a.question.status === 'answered' && !coord && <span className="m-tag m-tag--repeat">Ответ координатора</span>}
          {!coord && unreadNote(a) && <span className="m-tag">Заметка координатора</span>}
          {a.returnedFromPostponed && <span className="m-tag">Вернулась из отложенных</span>}
          {a.postponed && <span className="m-tag">{a.postponed.reason + (a.postponed.who ? ' · ' + a.postponed.who : '')}</span>}
        </div>
        <div className="m-queue__meta"><b className="m-queue__what">{whatWaits(a)}</b> · {meta.join(' · ')}</div>
      </div>
      <span className="m-queue__wait">{a.postponed ? '' : 'ждёт ' + waitLabel(a)}</span>
      <button className="m-btn m-btn--secondary m-queue__go" data-open={a.id} aria-label={'Проверить: ' + a.form.participantFullName + ' — ' + taskLine(a)} onClick={open}>{taskVerb(a)}</button>
    </div>
  )
}

function Empty({ base }) {
  const s = useStore()
  if (s.query) {
    return (
      <>
        В проверке такого нет.
        <div style={{ marginTop: 'var(--spacing-16)' }}>
          <button className="m-btn m-btn--secondary" data-findall="1" onClick={() => update((d) => { d.screen = 'people'; d.view = 'list'; d.peopleState = 'all'; d.page = 1 })}>Найти среди всех участников →</button>
        </div>
      </>
    )
  }
  if (s.showPostponed) return 'Отложенных нет.'
  if (hasTaskChips(s) && s.queueStep !== 'all') return 'Действие «' + taskName(s.queueStep) + '» в этом визите никого не ждёт.'
  if (currentRole(s) === 'coord' && !studiesOfRole(s, 'coord').length) {
    return (
      <>
        Сейчас вы не назначены координатором ни в одном исследовании — проверять нечего.
        <div style={{ marginTop: 'var(--spacing-8)' }}>Назначает руководитель исследования в разделе «Исследования».</div>
      </>
    )
  }
  const hint = emptyQueueHint(s, base)
  if (!hint.others.length && !hint.postponed) return 'Всё проверено — на сегодня всё.'
  return (
    <>
      <b>На этом этапе всё проверено.</b>
      {hint.others.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-12)' }}>
          Ждут на других этапах: {hint.others.map((x, j) => (
            <Fragment key={x.tab.k}>{j > 0 && ' · '}<button className="m-linkbtn" data-qtab={x.tab.k} onClick={() => setQueue((d) => { d.queueTab = x.tab.k; d.showPostponed = false })}>{x.tab.label} — {x.n}</button></Fragment>
          ))}
        </div>
      )}
      {hint.postponed > 0 && (
        <div style={{ marginTop: 'var(--spacing-8)' }}>
          <button className="m-linkbtn" data-pmode="postponed" onClick={() => setQueue((d) => { d.showPostponed = true })}>Отложенные — {hint.postponed}</button>
          {hint.nearestUntil ? ', ближайшая вернётся ' + hint.nearestUntil : ''}
        </div>
      )}
    </>
  )
}

export function QueuePage() {
  const s = useStore()
  const base = queueBase(s)
  const postponed = myPostponed(s, byStudy(s, s.apps)).length
  const list = queueList(s)
  const tabs = queueTabs(s).map((k) => ({ k, n: base.filter((a) => k.k === 'all' || queueTabOf(a) === k.k).length }))
  const repeats = queueForTask(s, hasTaskChips(s) ? s.queueStep : 'all').filter((a) => a.repeat).length
  const queueName = s.showPostponed ? 'Отложенные' : (queueTabs(s).find((k) => k.k === s.queueTab) || { label: 'Все' }).label
  const withCoord = currentRole(s) === 'doctor' && !s.showPostponed && (s.queueTab === 'app' || s.queueTab === 'all')
    ? s.apps.filter((a) => a.kind === 'app' && withCoordinator(s, a) && studiesOfRole(s, 'doctor').includes(a.study) && (s.study === 'all' || a.study === s.study))
    : []

  const item = (key, k, label, n, on, attrs, onClick) => (
    <button key={key} className="m-qnav__item" {...attrs} aria-current={on ? 'page' : undefined} {...pressed(on)} data-empty={n ? undefined : '1'}
      title={k.title} onClick={onClick}>
      <span>{label}</span><span className="m-qnav__n">{n}</span>
    </button>
  )

  return (
    <>
      <div className="m-titlerow">
        <h1 className="m-h1">Проверка</h1>
        <input className="m-input m-titlerow__search" id="q" aria-label="Поиск по всей проверке" placeholder="Поиск по всей проверке: ФИО, номер"
          value={s.query} onChange={(e) => update((d) => { d.query = e.target.value })} />
      </div>
      <div className="m-qlayout">
        <nav className="m-qnav" aria-label="Очереди">
          <Progress />
          <div className="m-qnav__list">
            {tabs.map((x) => item(x.k.k, x.k, x.k.label, x.n, !s.showPostponed && s.queueTab === x.k.k, { 'data-qtab': x.k.k },
              () => setQueue((d) => { d.queueTab = x.k.k; d.showPostponed = false })))}
            <div className="m-qnav__sep" aria-hidden="true" />
            {item('postponed', {}, 'Отложенные', postponed, !!s.showPostponed, { 'data-pmode': 'postponed' }, () => setQueue((d) => { d.showPostponed = true }))}
          </div>
        </nav>
        <div className="m-qmain">
          <label className="m-qnav__select">
            <span className="m-label">Очередь</span>
            <select className="m-select" data-qselect="1" value={s.showPostponed ? 'postponed' : s.queueTab}
              onChange={(e) => { const v = e.target.value; setQueue((d) => { if (v === 'postponed') d.showPostponed = true; else { d.showPostponed = false; d.queueTab = v } }) }}>
              {tabs.map((x) => <option key={x.k.k} value={x.k.k}>{x.k.label + ' · ' + x.n}</option>)}
              <option value="postponed">{'Отложенные · ' + postponed}</option>
            </select>
          </label>
          <div className="m-qhead">
            <h2 className="m-card__title">{queueName}</h2>
            {!s.showPostponed && (
              <div className="m-toolbar">
                <div className="m-chips" role="group" aria-label="Фильтры очереди">
                  {hasTaskChips(s) && (
                    <>
                      {[{ k: 'all', title: 'Все действия' }].concat(WAITING_TASKS).map((e) => (
                        <button key={e.k} className="m-chip" data-qstep={e.k} {...pressed(s.queueStep === e.k)} onClick={() => setQueue((d) => { d.queueStep = e.k })}>
                          {e.title}<span className="m-chip__count">{queueForTask(s, e.k).length}</span>
                        </button>
                      ))}
                      <span className="m-chips__sep" aria-hidden="true" />
                    </>
                  )}
                  {(repeats > 0 || s.onlyRepeat) && (
                    <button className="m-chip" data-flag="repeat" {...pressed(s.onlyRepeat)} onClick={() => setQueue((d) => { d.onlyRepeat = !d.onlyRepeat })}>
                      Только повторные<span className="m-chip__count">{repeats}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {withCoord.length > 0 && (
            <div className="m-card__hint m-queue__coord">
              У координатора ещё {plural(withCoord.length, ['заявка', 'заявки', 'заявок'])} отбора — придут к вам после его проверки
              {s.study === 'all' ? ': ' + STUDIES.map((x) => { const n = withCoord.filter((a) => a.study === x.id).length; return n ? x.short + ' — ' + n : '' }).filter(Boolean).join(', ') : ''}.
            </div>
          )}
          <div className="m-queue">
            {list.length ? list.map((a, i) => <QueueRow key={a.id} a={a} i={i} />) : <div className="m-card m-empty"><Empty base={base} /></div>}
          </div>
        </div>
      </div>
    </>
  )
}
