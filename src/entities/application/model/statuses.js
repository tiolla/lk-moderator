export const STATUS = {
  new: { label: 'Ждёт проверки', cls: 'm-badge--wait' },
  returned: { label: 'Возвращена', cls: 'm-badge--danger' },
  docRequest: { label: 'Запрошен документ', cls: 'm-badge--warn' },
  approved: { label: 'Одобрена, ждём анкету', cls: 'm-badge--ok' },
  anketa: { label: 'Анкета на проверке', cls: 'm-badge--wait' },
  anketaBack: { label: 'Анкета возвращена', cls: 'm-badge--danger' },
  done: { label: 'Анкета проверена', cls: 'm-badge--ok' },
  rejected: { label: 'Отклонена', cls: 'm-badge--muted' },
  postponed: { label: 'Отложена', cls: 'm-badge--muted' },
  dropped: { label: 'Выбыл', cls: 'm-badge--muted' },
}

export function statusBadge(a) {
  if (a.postponed) return STATUS.postponed
  if (a.kind === 'app' && a.status === 'new') {
    return a.withDoctor ? { label: 'Ждёт врача', cls: 'm-badge--wait' } : { label: 'У координатора', cls: 'm-badge--wait' }
  }
  if (a.status === 'done' && a.kind !== 'app') {
    if (a.stage === 'blood') return { label: 'Ждём визита', cls: 'm-badge--ok' }
    return { label: 'Записывается на визит', cls: 'm-badge--muted' }
  }
  return STATUS[a.status]
}
