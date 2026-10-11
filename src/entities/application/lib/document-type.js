export function documentType(d) {
  const t = (d.note || '') + ' ' + d.name
  if (/направлен/i.test(t)) return 'referral'
  if (/генетич|genetika/i.test(t)) return 'genetics'
  if (/анализ|антител|analiz/i.test(t)) return 'lab'
  return 'summary'
}

export const documentPageCount = (d) => (d.kind === 'JPG' ? 1 : documentType(d) === 'summary' ? 2 : 1)
