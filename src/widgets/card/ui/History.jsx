export function History({ a }) {
  return (
    <div className="m-card">
      <h2 className="m-card__title">История решений</h2>
      <div className="m-history">
        {a.history.map((h, i) => (
          <div key={i} className="m-history__item">
            <span className="m-history__dot" />
            <div>
              <div className="m-history__text">{h.text}</div>
              <div className="m-history__when">{h.when + (h.who ? ' · ' + h.who : '')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
