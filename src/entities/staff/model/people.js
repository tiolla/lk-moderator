export const ROLES = {
  coord: { caption: 'координатор', short: 'Координатор', plural: 'Координаторы' },
  doctor: { caption: 'врач-модератор', short: 'Врач', plural: 'Врачи' },
}

export const PEOPLE = {
  sokolova: { name: 'Соколова К. В.', avatar: 'СК', role: 'doctor', leads: ['dm1', 'cel', 'ait'] },
  petrov: { name: 'Петров Д. А.', avatar: 'ПД', role: 'doctor', leads: ['obe', 'thy'] },
  ivanova: { name: 'Иванова Е. С.', avatar: 'ИЕ', role: 'doctor', leads: [] },
  orlova: { name: 'Орлова А. Н.', avatar: 'ОА', role: 'coord', leads: [] },
  kim: { name: 'Ким Е. А.', avatar: 'КЕ', role: 'coord', leads: [] },
}
