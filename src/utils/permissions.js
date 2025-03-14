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
    add: [ROLES.MANAGER],
    record_payment: [ROLES.MANAGER],
    delete: [ROLES.ADMIN]
  },
  fda: {
    mark_don: [ROLES.MANAGER]
  }
}

export default permissions