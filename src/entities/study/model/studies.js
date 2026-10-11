export const STUDIES = [
  { id: 'dm1', short: 'СД1', visits: 5, families: false, title: 'Динамическое наблюдение сахарного диабета 1 типа' },
  { id: 'ait', short: 'Моногенные', visits: 1, families: true, title: 'Моногенные заболевания' },
  { id: 'cel', short: 'ВДКН', visits: 3, families: true, title: 'Врождённая дисфункция коры надпочечников (ВДКН)' },
  { id: 'obe', short: 'Ожирение', visits: 2, families: false, title: 'Ожирение и метаболический синдром у детей' },
  { id: 'thy', short: 'Щитовидная', visits: 2, families: false, title: 'Аутоиммунные заболевания щитовидной железы' },
]

export const STUDY_BY = Object.fromEntries(STUDIES.map((s) => [s.id, s]))
export const STUDY_TITLE = Object.fromEntries(STUDIES.map((s) => [s.id, s.title]))
export const STUDY_SHORT = Object.fromEntries(STUDIES.map((s) => [s.id, s.short]))
