const log = new Map()
let seq = 1

export function newUndo(a) {
  const entry = { key: seq++, id: a.id, before: a }
  log.set(entry.key, entry)
  return entry
}

export const undoEntry = (key) => log.get(key)
