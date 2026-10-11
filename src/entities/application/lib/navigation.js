import { byId } from './core.js'

export function navList(s) {
  const base = s.nav.length ? s.nav : s.apps.map((a) => a.id)
  if (s.tab === 'anketa') {
    const withAnketa = base.filter((id) => {
      const a = byId(s, id)
      return a && ['anketa', 'anketaBack', 'done'].includes(a.status)
    })
    if (withAnketa.length > 1) return { list: withAnketa, what: 'анкета' }
  }
  return { list: base, what: s.tab === 'app' ? 'заявка' : 'в очереди' }
}

export function stepToReview(a) {
  if (a.status === 'rejected' && a.kind !== 'app') return 'anketa'
  return ['anketa', 'anketaBack', 'done'].includes(a.status) ? 'anketa' : 'app'
}
