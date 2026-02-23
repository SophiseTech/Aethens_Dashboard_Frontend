import { ROLES } from "@utils/constants"

const permissions = {
  student: {
    add: [ROLES.MANAGER, ROLES.ADMIN],
    slot_requests: [ROLES.MANAGER],
    edit: [ROLES.MANAGER, ROLES.ADMIN]
  },
  payslips: {
    mark_paid: [ROLES.MANAGER],
    approve: [ROLES.MANAGER],
    delete: [ROLES.MANAGER]
  },
  activities: {
    delete: [ROLES.ADMIN],
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
    view: [ROLES.MANAGER, ROLES.ADMIN, ROLES.STUDENT, ROLES.OPERATIONS_MANAGER],
    add: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    edit: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    delete: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER]
  },
  targets: {
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    view: [ROLES.MANAGER, ROLES.ADMIN]
  },
  audits: {
    create: [ROLES.ADMIN],
    view: [ROLES.MANAGER, ROLES.ADMIN],
    update: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.ADMIN],
    view_discrepancy: [ROLES.ADMIN]
  },
  inventoryItems: {
    create: [ROLES.ADMIN],
    view: [ROLES.MANAGER, ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  inventory: {
    view: [ROLES.MANAGER, ROLES.ADMIN],
    addToCenter: [ROLES.MANAGER],
    request: [ROLES.MANAGER],
    approve: [ROLES.ADMIN]
  },
  // Admin-only content management (dashboard frontend)
  adminUsers: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminCenters: {
    view: [ROLES.ADMIN]
  },
  adminBlogPost: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminNewsletter: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminShopItem: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminArtWork: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminStudentOfTheWeek: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  adminLatestVideos: {
    view: [ROLES.ADMIN],
    add: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN]
  },
  session_status: {
    delete: [ROLES.ADMIN]
  },
  fee_tracker: {
    view: [ROLES.MANAGER, ROLES.ADMIN]
  },
  enquiries: {
    view: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    add: [ROLES.MANAGER, ROLES.ADMIN],
    edit: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.MANAGER, ROLES.ADMIN]
  },
  wallets: {
    view: [ROLES.MANAGER, ROLES.ADMIN],
    add: [ROLES.MANAGER, ROLES.ADMIN],
    edit: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.MANAGER, ROLES.ADMIN]
  },
  tasks: {
    view: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    add: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    edit: [ROLES.MANAGER, ROLES.ADMIN],
    delete: [ROLES.MANAGER, ROLES.ADMIN]
  },
  notifications: {
    view: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    toggle_read_status: [ROLES.MANAGER, ROLES.ADMIN],
  }
}

export default permissions