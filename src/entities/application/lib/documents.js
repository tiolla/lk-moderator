export const MARK_LABEL = { ok: 'Проверен', bad: 'Не читается', need: 'Нужен другой' }

const docKey = (i, n) => 'doc:' + i + (n ? ':' + n : '')

export function docComments(a, i) {
  const c = a.comments || {}
  const pref = 'doc:' + i
  return Object.keys(c)
    .filter((k) => (k === pref || k.indexOf(pref + ':') === 0) && String(c[k]).trim())
    .sort((x, y) => (+x.split(':')[2] || 0) - (+y.split(':')[2] || 0))
    .map((k) => ({ k, text: c[k] }))
}

export function newDocKey(a, i) {
  let n = 0
  Object.keys(a.comments || {}).forEach((k) => {
    const p = k.split(':')
    if (p[0] === 'doc' && +p[1] === i) n = Math.max(n, +p[2] || 1)
  })
  return docKey(i, n + 1)
}
