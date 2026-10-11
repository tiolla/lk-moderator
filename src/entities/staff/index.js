export { ROLES, PEOPLE } from './model/people.js'
export { loadAssignments, defaultAssignments, saveAssignments } from './model/assignments.js'
export {
  me, myCode, myName, rolesIn, studiesOfRole, personRoles, currentRole, leads, studyLead,
  hasCoordinator, coordSeesMedical, describePerson,
} from './lib/access.js'
export { signedInUser, alignRole, changeRole, switchUser } from './model/session.js'
