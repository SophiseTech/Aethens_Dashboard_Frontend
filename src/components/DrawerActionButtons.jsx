import useModal from '@hooks/useModal'
import AllotSessions from '@pages/Students/Component/AllotSessions'
import DeactivateStudent from '@pages/Students/Component/DeactivateStudent'
import MigrateCenter from '@pages/Students/Component/MigrateCenter'
import MigrateCourse from '@pages/Students/Component/MigrateCourse'
import ProjectDetailModal from '@pages/Students/Component/ProjectDetailModal'
import ViewStudentSessions from '@pages/Students/Component/SessionDetails'
import SessionStatus from '@pages/Students/Component/SessionStatus'
import userStore from '@stores/UserStore'
import FeeTracker from '@pages/Students/Component/FeeTracker';
import { ROLES } from '@utils/constants'
import { isUserActive } from '@utils/helper'
import { Button, Flex, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import PropTypes from 'prop-types'
import { buildStudentDrawerState } from '@utils/studentDrawerContext'

const ActionSection = ({ title, children }) => {
  return (
    <div style={{ width: '100%', marginBottom: 16 }}>
      <Typography.Title level={5} style={{ marginBottom: 12, fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase' }}>
        {title}
      </Typography.Title>
      <Flex wrap gap={10}>
        {children}
      </Flex>
    </div>
  );
};

function DrawerActionButtons({ userDetails }) {
  const { user } = useStore(userStore);
  const nav = useNavigate();
  
  // Shared state and hooks
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const { handleCancel: handleProjectCancel, isModalOpen: isProjectModalOpen, handleOk: handleProjectOk, showModal: showProjectModal } = useModal();
  const { handleCancel: handleFeeCancel, isModalOpen: isFeeModalOpen, showModal: showFeeModal } = useModal();
  const [selectedProjectStudent, setSelectedProjectStudent] = useState(null);

  const studentId = userDetails?._id;
  const courseId = userDetails?.details_id?.course_id?._id || userDetails?.details_id?.course_id;

  const navigateWithStudentContext = (path) => {
    nav(path, { state: buildStudentDrawerState(studentId) });
  };

  // The comprehensive configuration array
  const ACTION_REGISTRY = [
    // --- Sessions & Attendance ---
    {
      key: 'allot_sessions',
      component: (props) => <AllotSessions {...props} />,
      section: 'Sessions & Attendance',
      roles: [ROLES.MANAGER, ROLES.ADMIN]
    },
    {
      key: 'view_attendance',
      label: 'View Attendance',
      color: 'orange',
      section: 'Sessions & Attendance',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER],
      action: () => navigateWithStudentContext(`/manager/attendance/${studentId}/c/${courseId}`)
    },
    {
      key: 'view_attendance_faculty',
      label: 'View Attendance',
      color: 'cyan',
      section: 'Sessions & Attendance',
      roles: [ROLES.FACULTY],
      action: () => navigateWithStudentContext(`/faculty/attendance/${studentId}/c/${courseId}`)
    },
    {
      key: 'session_status',
      component: (props) => <SessionStatus {...props} />,
      section: 'Sessions & Attendance',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.ACADEMIC_MANAGER, ROLES.FACULTY]
    },
    {
      key: 'view_sessions',
      label: 'View Sessions',
      color: 'magenta',
      section: 'Sessions & Attendance',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER],
      disabled: !isUserActive(userDetails),
      action: () => setIsSessionModalOpen(true)
    },
    
    // --- Academics ---
    {
      key: 'syllabus_academic',
      label: 'Syllabus',
      color: 'purple',
      section: 'Academics',
      roles: [ROLES.ACADEMIC_MANAGER, ROLES.FACULTY],
      action: () => navigateWithStudentContext(`/syllabus/${courseId}/${studentId}`)
    },
    {
      key: 'view_materials_manager',
      label: 'View Materials',
      color: 'blue',
      section: 'Academics',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
      action: () => navigateWithStudentContext(`/manager/materials?student_id=${studentId}&course_id=${courseId}`)
    },
    {
      key: 'view_materials_faculty',
      label: 'View Materials',
      color: 'blue',
      section: 'Academics',
      roles: [ROLES.FACULTY],
      action: () => navigateWithStudentContext(`/faculty/materials?student_id=${studentId}&course_id=${courseId}`)
    },
    {
      key: 'view_course_history',
      label: 'View Course History',
      color: 'cyan',
      section: 'Academics',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER],
      action: () => navigateWithStudentContext(`/manager/courseHistory/${studentId}`)
    },
    {
      key: 'view_course_history_faculty',
      label: 'View Course History',
      color: 'cyan',
      section: 'Academics',
      roles: [ROLES.FACULTY],
      action: () => navigateWithStudentContext(`/faculty/courseHistory/${studentId}`)
    },
    {
      key: 'view_remarks',
      label: 'View Remarks',
      color: 'cyan',
      section: 'Academics',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.ACADEMIC_MANAGER],
      action: () => navigateWithStudentContext(`/manager/remarks/s/${studentId}`)
    },
    {
      key: 'view_final_project',
      label: 'View Final Project',
      color: 'orange',
      section: 'Academics',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.ACADEMIC_MANAGER],
      action: () => navigateWithStudentContext(`/manager/final-project/student/${studentId}/details`)
    },
    {
      key: 'view_final_project_faculty',
      label: 'View Final Project',
      color: 'gold',
      section: 'Academics',
      roles: [ROLES.FACULTY],
      action: () => {
        setSelectedProjectStudent(studentId);
        showProjectModal();
      }
    },
    {
      key: 'view_activities_academic',
      label: 'View Activities',
      color: 'lime',
      section: 'Academics',
      roles: [ROLES.ACADEMIC_MANAGER],
      action: () => navigateWithStudentContext(`/academic-manager/activities/student/${studentId}`)
    },
    {
      key: 'view_activities_faculty',
      label: 'View Activities',
      color: 'lime',
      section: 'Academics',
      roles: [ROLES.FACULTY],
      action: () => navigateWithStudentContext(`/faculty/activities/student/${studentId}`)
    },

    // --- Financials ---
    {
      key: 'view_bills',
      label: 'View Bills',
      color: 'cyan',
      section: 'Financials',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
      action: () => navigateWithStudentContext(`/manager/bills?student_id=${studentId}`)
    },
    {
      key: 'view_wallet',
      label: 'View Wallet',
      color: 'cyan',
      section: 'Financials',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
      action: () => navigateWithStudentContext(`/manager/wallets/s/${studentId}`)
    },
    {
      key: 'fee_tracker',
      label: 'Fee Tracker',
      color: 'green',
      section: 'Financials',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
      action: () => showFeeModal()
    },

    // --- Administration ---
    {
      key: 'migrate_course',
      component: (props) => <MigrateCourse {...props} />,
      section: 'Administration',
      roles: [ROLES.MANAGER, ROLES.ADMIN]
    },
    {
      key: 'migrate_center',
      component: (props) => <MigrateCenter {...props} />,
      section: 'Administration',
      roles: [ROLES.MANAGER, ROLES.ADMIN]
    },
    {
      key: 'deactivate_student',
      component: (props) => <DeactivateStudent {...props} />,
      section: 'Administration',
      roles: [ROLES.MANAGER, ROLES.ADMIN]
    }
  ];

  // 1. Filter allowed actions
  const allowedActions = ACTION_REGISTRY.filter(a => a.roles.includes(user.role));

  // 2. Group these actions by 'section'
  const sections = ['Sessions & Attendance', 'Academics', 'Financials', 'Administration'];
  
  if (allowedActions.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {sections.map(sectionTitle => {
        const actionsInSection = allowedActions.filter(a => a.section === sectionTitle);
        if (actionsInSection.length === 0) return null;

        return (
          <ActionSection key={sectionTitle} title={sectionTitle}>
            {actionsInSection.map(action => {
              if (action.component) return <div key={action.key}>{action.component({ student: userDetails })}</div>;
              return (
                <Button 
                  key={action.key} 
                  onClick={action.action} 
                  disabled={action.disabled}
                  variant="filled" 
                  color={action.color}
                >
                  {action.label}
                </Button>
              );
            })}
          </ActionSection>
        );
      })}

      {/* Centralized Modals */}
      <ViewStudentSessions isModalOpen={isSessionModalOpen} setIsModalOpen={setIsSessionModalOpen} student={userDetails} />
      <FeeTracker student={userDetails} visible={isFeeModalOpen} onCancel={handleFeeCancel} />
      <ProjectDetailModal handleCancel={handleProjectCancel} handleOk={handleProjectOk} isModalOpen={isProjectModalOpen} student_id={selectedProjectStudent} />
    </div>
  );
}

DrawerActionButtons.propTypes = {
  userDetails: PropTypes.object,
};

DrawerActionButtons.defaultProps = {
  userDetails: {},
};

export default DrawerActionButtons;
