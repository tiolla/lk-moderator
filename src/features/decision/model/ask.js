import { getState, update } from '@/shared/model/store.js'
import { anketaClean, applicationClean, commentCount, docComments, openApp } from '@/entities/application'
import { decide, questionOpen } from './decisions.js'

function docRequestText(a, i) {
  const d = i >= 0 ? a.docs[i] : null
  const comments = d ? docComments(a, i).map((c) => c.text).join(' ') : ''
  if (comments) return comments
  return d
    ? 'Файл «' + d.name + '» не подходит' + (d.mark === 'bad' ? ': текст не читается' : '') + '. Пришлите другой документ.'
    : 'Нужна выписка, подтверждающая диагноз.'
}

export function ask(kind, docIndex) {
  const a = openApp(getState())
  const spec = { type: 'ask', kind }
  if (kind === 'doc') spec.reason = docRequestText(a, docIndex)
  update((d) => { d.modal = spec })
}

export function act(kind) {
  const s = getState()
  const a = openApp(s)
  if (kind === 'unpostpone') return decide('unpostpone')
  if (kind === 'approve' && applicationClean(s, a)) return decide('approve')
  if (kind === 'pass' && applicationClean(s, a) && !questionOpen(a)) return decide('pass')
  if (kind === 'anketa-pass' && commentCount(a, 'anketa') === 0 && !questionOpen(a)) return decide('anketa-pass')
  if (kind === 'anketa-approve' && anketaClean(s, a)) return decide('anketa-approve')
  ask(kind)
}

export function closeModal() {
  update((d) => { d.modal = null })
}
