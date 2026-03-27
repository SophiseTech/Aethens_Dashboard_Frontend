export const STUDENT_DRAWER_CONTEXT_KEY = "studentDrawerContext";

export const buildStudentDrawerState = (studentId, extraState = {}) => ({
  ...extraState,
  [STUDENT_DRAWER_CONTEXT_KEY]: {
    enabled: true,
    studentId,
    source: "student-drawer",
  },
});

export const getStudentDrawerContext = (locationState) =>
  locationState?.[STUDENT_DRAWER_CONTEXT_KEY] || null;

