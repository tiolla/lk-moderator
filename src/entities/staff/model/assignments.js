import { APP_KEY, safeStorage } from '@/shared/lib/storage.js'

const DEFAULT_ASSIGNMENTS = {
  dm1: { coord: ['orlova'], doctor: ['sokolova', 'petrov'] },
  cel: { coord: ['orlova', 'kim'], doctor: ['sokolova'] },
  obe: { coord: ['kim'], doctor: ['petrov', 'sokolova'] },
  ait: { coord: [], doctor: ['sokolova', 'petrov'] },
  thy: { coord: [], doctor: ['ivanova', 'sokolova'] },
}

const KEY = APP_KEY + '-assignments'

export function loadAssignments() {
  const result = structuredClone(DEFAULT_ASSIGNMENTS)
  const saved = safeStorage.readJSON(KEY)
  if (saved) Object.keys(saved).forEach((k) => { if (result[k]) result[k] = saved[k] })
  return result
}

export function defaultAssignments() {
  return structuredClone(DEFAULT_ASSIGNMENTS)
}

export function saveAssignments(assignments) {
  safeStorage.writeJSON(KEY, assignments)
}
