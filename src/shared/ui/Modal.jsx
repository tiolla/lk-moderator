export function Modal({ title, onClose, children }) {
  return (
    <div className="m-overlay" data-overlay="1" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="m-modal" role="dialog" aria-modal="true" aria-labelledby="m-modal-title">
        <div className="m-modal__head">
          <h2 className="m-card__title" id="m-modal-title" tabIndex={-1}>{title}</h2>
          <button className="m-close" data-close="1" aria-label="Закрыть" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ModalActions({ onClose, closeLabel = 'Отмена', children }) {
  return (
    <div className="m-doc__actions" style={{ marginTop: 'var(--spacing-20)', justifyContent: 'flex-end' }}>
      <button className="m-btn m-btn--outline" data-close="1" onClick={onClose}>{closeLabel}</button>
      {children}
    </div>
  )
}
