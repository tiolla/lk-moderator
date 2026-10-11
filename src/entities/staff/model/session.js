import { APP_KEY, safeStorage } from '@/shared/lib/storage.js'
import { me, rolesIn } from '../lib/access.js'
import { PEOPLE } from './people.js'

const USER_KEY = APP_KEY + '-user'

export function signedInUser(search) {
  let user = 'sokolova'
  const saved = safeStorage.read(USER_KEY)
  if (PEOPLE[saved]) user = saved
  const role = (search.match(/[?&]role=(coord|doctor)/i) || [])[1]
  const named = (search.match(/[?&]user=(sokolova|orlova|petrov)/i) || [])[1]
  if (role && !named) user = role.toLowerCase() === 'coord' ? 'orlova' : 'sokolova'
  if (named) user = named.toLowerCase()
  return user
}

export function alignRole(d) {
  d.role = me(d).role
  if (d.study !== 'all' && !rolesIn(d, d.study).includes(d.role)) d.study = 'all'
}

export function changeRole(d, role) {
  d.role = role
  if (d.study !== 'all' && !rolesIn(d, d.study).includes(role)) d.study = 'all'
  d.screen = 'queue'
  d.appId = null
  d.queueTab = 'all'
  d.queueStep = 'all'
  d.showPostponed = false
  d.cursor = 0
}

export function switchUser(d, user) {
  d.user = user
  d.study = 'all'
  alignRole(d)
  changeRole(d, d.role)
  safeStorage.write(USER_KEY, user)
}
