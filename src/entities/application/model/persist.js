import { APP_KEY, safeStorage } from '@/shared/lib/storage.js'

export function savedApps(count) {
  const saved = safeStorage.readJSON(APP_KEY)
  return saved && saved.apps && saved.apps.length === count ? saved.apps : null
}

export const saveApps = (apps) => safeStorage.writeJSON(APP_KEY, { apps })
export const clearSavedApps = () => safeStorage.remove(APP_KEY)
