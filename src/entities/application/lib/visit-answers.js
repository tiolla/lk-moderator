import { hash } from '@/shared/lib/hash.js'
import { anketaValue } from './core.js'

const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? null : n
}

const CHANGEABLE = {
  weight: (was, h) => { const n = num(was); return n === null ? was : String(Math.max(20, n + [-2, -1, 1, 2, 1, -1][h % 6])) },
  height: (was, h) => { const n = num(was); return n === null ? was : String(n + (h % 3 === 0 ? 1 : 0)) },
  bpSys: (was, h) => String(112 + h % 17),
  bpDia: (was, h) => String(70 + h % 13),
  hr: (was, h) => String(64 + h % 21),
  medsDose: (was, h) => (h % 3 ? was : ['75 мкг / болюс по схеме / 14 ед на ночь', '75 мкг / болюс по схеме / 16 ед на ночь',
    '88 мкг / болюс по схеме / 16 ед на ночь', '88 мкг / болюс по схеме / 18 ед на ночь'][h % 4]),
  instrList: (was, h, v) => (h % 2 ? was : 'ОАК и HbA1c — к визиту ' + v + '; ' + was),
  activity: (was, h) => (h % 4 ? was : ['Низкий', 'Средний', 'Высокий'][h % 3]),
  water: (was, h) => (h % 5 ? was : ['1-1.5 л', '1.5-2 л', 'Более 2 л'][h % 3]),
}

export function visitAnswer(a, k, v) {
  if (!v || v < 2 || !CHANGEABLE[k]) return anketaValue(k, a)
  return CHANGEABLE[k](visitAnswer(a, k, v - 1), hash(a.id + ':' + v + ':' + k), v)
}
