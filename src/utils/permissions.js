import { ROLES } from "@utils/constants"

const permissions = {
  student: {
    add: [ROLES.MANAGER],
    slot_requests: [ROLES.MANAGER]
  },
  payslips: {
    mark_paid: [ROLES.MANAGER],
    approve: [ROLES.MANAGER],
    delete: [ROLES.MANAGER]
  },
  activities: {
    delete: [ROLES.FACULTY],
    add: [ROLES.FACULTY]
  },
  materials: {
    mark_collected: [ROLES.MANAGER],
    view_bill: [ROLES.MANAGER, ROLES.STUDENT]
  },
  bills: {
    add: [ROLES.MANAGER, ROLES.ADMIN],
    record_payment: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  fda: {
    mark_don: [ROLES.MANAGER]
  },
  holidays: {
    view: [ROLES.MANAGER, ROLES.ADMIN],
    add: [ROLES.MANAGER, ROLES.ADMIN],
    edit: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.MANAGER, ROLES.ADMIN]
  }
}

export default permissions