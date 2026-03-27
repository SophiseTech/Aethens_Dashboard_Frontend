const STUDENT_CONTEXT_ROUTE_PATTERNS = [
  /^\/manager\/bills$/,
  /^\/manager\/wallets\/s\/[^/]+$/,
  /^\/manager\/materials$/,
  /^\/manager\/attendance\/[^/]+\/c\/[^/]+$/,
  /^\/manager\/courseHistory\/[^/]+$/,
  /^\/manager\/remarks\/s\/[^/]+$/,
  /^\/manager\/final-project\/student\/[^/]+\/details$/,
  /^\/manager\/session-status\/[^/]+$/,
  /^\/acmanager\/session-status\/[^/]+$/,
  /^\/academic-manager\/activities\/student\/[^/]+$/,
  /^\/faculty\/attendance\/[^/]+\/c\/[^/]+$/,
  /^\/faculty\/materials$/,
  /^\/faculty\/activities\/student\/[^/]+$/,
  /^\/faculty\/courseHistory\/[^/]+$/,
  /^\/faculty\/session-status\/[^/]+$/,
  /^\/syllabus\/[^/]+(?:\/[^/]+)?$/,
];

export const isStudentDrawerContextRoute = (pathname = "") =>
  STUDENT_CONTEXT_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));

