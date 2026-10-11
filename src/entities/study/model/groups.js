export const GROUP_LABEL = { main: 'Основная', control: 'Контрольная', relatives: 'Родственники' }

const GROUP_FULL = { main: 'Основная группа', control: 'Контрольная группа', relatives: 'Группа родственников' }

export function groupCaption(v) {
  return GROUP_FULL[v] || 'Группа не указана'
}

export const CITIES = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород']
