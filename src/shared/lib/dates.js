export const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const pad = (n) => ('0' + n).slice(-2)

export function dateIn(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.getDate() + ' ' + MONTHS[d.getMonth()]
}

export function stamp() {
  const d = new Date()
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

export function momentOf(when) {
  const m = String(when || '').match(/(\d+)\s+(\S+?),?\s+(\d+):(\d+)/)
  if (!m) return 0
  return ((MONTHS.indexOf(m[2]) * 32 + +m[1]) * 24 + +m[3]) * 60 + +m[4]
}
