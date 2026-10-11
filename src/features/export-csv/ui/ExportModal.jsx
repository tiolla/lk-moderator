import { plural } from '@/shared/lib/plural.js'
import { useStore } from '@/shared/model/store.js'
import { Modal, ModalActions } from '@/shared/ui'
import { tableRows } from '@/entities/application'
import { exportCsv } from '../model/export.js'

export function ExportModal({ onClose }) {
  const s = useStore()
  return (
    <Modal title="Выгрузить список участников?" onClose={onClose}>
      <div className="m-info m-info--warn">
        В файле — персональные данные: ФИО, группа, город, статус — {plural(tableRows(s).length, ['строка', 'строки', 'строк'])}. Выгрузка запишется в журнал: кто и когда. Храните файл в защищённом месте и не пересылайте его по почте.
        {s.exports.length > 0 && <><br /><br /><b>Последняя выгрузка:</b> {s.exports[0]}</>}
      </div>
      <ModalActions onClose={onClose}>
        <button className="m-btn m-btn--primary" data-confirm="1" onClick={exportCsv}>Выгрузить</button>
      </ModalActions>
    </Modal>
  )
}
