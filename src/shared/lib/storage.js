export const APP_KEY = 'moderator-cabinet-v1'

export const safeStorage = {
  read(key) {
    try { return localStorage.getItem(key) } catch { return null }
  },
  readJSON(key) {
    try { return JSON.parse(this.read(key) || 'null') } catch { return null }
  },
  write(key, value) {
    try { localStorage.setItem(key, value) } catch {}
  },
  writeJSON(key, value) {
    this.write(key, JSON.stringify(value))
  },
  remove(key) {
    try { localStorage.removeItem(key) } catch {}
  },
}
