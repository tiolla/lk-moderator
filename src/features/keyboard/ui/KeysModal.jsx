import { useStore, update } from '@/shared/model/store.js'
import { toast } from '@/shared/model/toasts.js'
import { Modal, ModalActions } from '@/shared/ui'
import { KEYS, saveKeysSetting } from '../model/keys.js'

function setKeys(on) {
  update((d) => { d.keysOn = on }, { render: false })
  saveKeysSetting(on)
  toast(on ? 'Однобуквенные клавиши включены' : 'Однобуквенные клавиши выключены', 'Стрелки, Enter, Esc и «?» работают всегда')
}

export function KeysModal({ onClose }) {
  const keysOn = useStore((s) => s.keysOn)
  return (
    <Modal title="Клавиши" onClose={onClose}>
      <table className="m-table" style={{ marginTop: 'var(--spacing-8)' }}>
        <tbody>
          {KEYS.map((k) => (
            <tr key={k[0]}><td className="m-table__strong m-table__nw" style={{ width: '96px' }}>{k[0]}</td><td>{k[1]}</td></tr>
          ))}
        </tbody>
      </table>
      <label style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', marginTop: 'var(--spacing-16)', font: 'var(--font-weight-600) var(--font-size-14)/20px Manrope,sans-serif' }}>
        <input type="checkbox" data-keystoggle="1" checked={keysOn} onChange={(e) => setKeys(e.target.checked)} /> Однобуквенные клавиши A, R, O, Z включены
      </label>
      <div className="m-card__hint">Выключите, если пользуетесь программой чтения экрана или голосовым вводом: одиночная буква может сработать случайно. Русская раскладка работает так же (Ф, К, Щ, Я).</div>
      <ModalActions onClose={onClose} closeLabel="Закрыть" />
    </Modal>
  )
}
