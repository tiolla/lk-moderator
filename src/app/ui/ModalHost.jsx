import { useStore } from '@/shared/model/store.js'
import { AskModal, closeModal } from '@/features/decision'
import { ExportModal } from '@/features/export-csv'
import { KeysModal } from '@/features/keyboard'
import { DocViewer } from '@/widgets/card'

export function ModalHost() {
  const modal = useStore((s) => s.modal)
  return (
    <div id="overlay">
      {modal && (
        modal.type === 'doc' ? <DocViewer i={modal.i} focusInput={modal.focusInput} onClose={closeModal} />
          : modal.type === 'keys' ? <KeysModal onClose={closeModal} />
            : modal.type === 'csv' ? <ExportModal onClose={closeModal} />
              : <AskModal key={modal.kind} spec={modal} onClose={closeModal} />
      )}
    </div>
  )
}
