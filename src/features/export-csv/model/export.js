import { stamp } from '@/shared/lib/dates.js'
import { plural } from '@/shared/lib/plural.js'
import { getState, update } from '@/shared/model/store.js'
import { pushToast } from '@/shared/model/toasts.js'
import { myName } from '@/entities/staff'
import { peopleColumns, tableRows } from '@/entities/application'

export function askExport() {
  update((d) => { d.modal = { type: 'csv' } })
}

export function exportCsv() {
  const s = getState()
  const cols = peopleColumns(s)
  const rows = tableRows(s)
  const entry = myName(s) + ', ' + stamp() + ', ' + plural(rows.length, ['строка', 'строки', 'строк'])
  update((d) => { d.exports.unshift(entry); d.modal = null })
  const csv = [cols.map((c) => c.label).join(';')]
    .concat(rows.map((a) => cols.map((c) => String(c.val(a)).replace(/;/g, ',')).join(';')))
    .join('\n')
  const link = document.createElement('a')
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('﻿' + csv)
  link.download = 'участники.csv'
  link.click()
  update((d) => {
    pushToast(d, 'Выгружено строк: ' + rows.length, 'Файл сохранён как ' + link.download)
    pushToast(d, 'Выгрузка записана в журнал', entry)
  }, { render: false })
}
