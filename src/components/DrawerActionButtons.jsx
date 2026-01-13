import useModal from '@hooks/useModal'
import AddStudentRemarks from '@pages/Students/Component/AddStudentRemarks'
import AllotSessions from '@pages/Students/Component/AllotSessions'
import DeactivateStudent from '@pages/Students/Component/DeactivateStudent'
import MigrateCenter from '@pages/Students/Component/MigrateCenter'
import MigrateCourse from '@pages/Students/Component/MigrateCourse'
import ProjectDetailModal from '@pages/Students/Component/ProjectDetailModal'
import ViewStudentSessions from '@pages/Students/Component/SessionDetails'
import SessionStatus from '@pages/Students/Component/SessionStatus'
import ViewStudentRemarks from '@pages/Students/Component/ViewStudentRemarks'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import { isUserActive } from '@utils/helper'
import { Button, Flex } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import PropTypes from 'prop-types'

function DrawerActionButtons({ userDetails }) {
  const { user } = useStore(userStore)

  if (user.role === ROLES.MANAGER) {
    return <ManagerActionButtons userDetails={userDetails} />
  } else if (user.role === ROLES.FACULTY) {
    return <FacultyActionButton userDetails={userDetails} />
  }
  return null
}

const ManagerActionButtons = ({ userDetails }) => {
  const nav = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewBills = (student_id) => {
    nav(`/manager/bills?student_id=${student_id}`);
  };

  const handleViewMaterials = (student_id, course_id) => {
    nav(`/manager/materials?student_id=${student_id}&course_id=${course_id}`);
  };

  const handleViewAttendance = (student_id, course_id) => {
    nav(`/manager/attendance/${student_id}/c/${course_id}`);
  };

  const handleViewCourseHistory = (student_id) => {
    nav(`/manager/courseHistory/${student_id}`);
  };

  const handleViewRemarks = (student_id) => {
    nav(`/manager/remarks/s/${student_id}`);
  };

  const handleViewFinalProject = (student_id) => {
    nav(`/manager/final-project/student/${student_id}/details`);
  };

  const handleViewWallet = (student_id) => {
    nav(`/manager/wallets/s/${student_id}`)
  }

  const handleViewSession = () => {
    setIsModalOpen(true);
  };

  return (
    <Flex wrap gap={10}>
      <AllotSessions student={userDetails} />
      <Button onClick={() => handleViewBills(userDetails._id)} variant="filled" color="cyan">
        View Bills
      </Button>
      <Button onClick={() => handleViewWallet(userDetails._id)} variant="filled" color="cyan">
        View Wallet
      </Button>
      <Button onClick={() => handleViewMaterials(userDetails._id, userDetails?.details_id?.course_id?._id || userDetails?.details_id?.course_id)} variant="filled" color="blue">
        View Materials
      </Button>
      <Button onClick={() => handleViewAttendance(userDetails._id, userDetails?.details_id?.course_id?._id || userDetails?.details_id?.course_id)} variant="filled" color="orange">
        View Attendance
      </Button>
      <SessionStatus student={userDetails} />
      <Button onClick={handleViewSession} disabled={!isUserActive(userDetails)} variant='filled' color='magenta'>
        View Sessions
      </Button>
      <Button onClick={() => handleViewCourseHistory(userDetails?._id)} variant='filled' color='cyan'>
        View Course History
      </Button>
      <Button onClick={() => handleViewRemarks(userDetails?._id)} variant='filled' color='cyan'>
        View Remarks
      </Button>
      <MigrateCourse student={userDetails} />
      <AddStudentRemarks student={userDetails} />
      <ViewStudentRemarks student={userDetails} />

      <MigrateCenter student={userDetails} />

      <DeactivateStudent student={userDetails} />

      <ViewStudentSessions isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} student={userDetails} />

      <Button onClick={() => handleViewFinalProject(userDetails?._id, userDetails?.details_id?.course_id)} variant='filled' color='orange'>
        View Final Project
      </Button>
    </Flex>
  )
}

const FacultyActionButton = ({ userDetails }) => {
  const nav = useNavigate()
  const { handleCancel, isModalOpen, handleOk, showModal } = useModal()
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleViewAttendance = (student_id, course_id) => {
    nav(`/faculty/attendance/${student_id}/c/${course_id}`)
  }

  const handleViewMaterials = (student_id, course_id) => {
    nav(`/faculty/materials?student_id=${student_id}&course_id=${course_id}`)
  }

  const handleViewActivities = (student_id) => {
    nav(`/faculty/activities/student/${student_id}`)
  }

  const handleViewCourseHistory = (student_id) => {
    nav(`/faculty/courseHistory/${student_id}`);
  };

  const handleViewProject = (student_id) => {
    setSelectedStudent(student_id)
    showModal()
  }

  return (
    <>
      <Flex wrap gap={10}>
        <Button onClick={() => handleViewAttendance(userDetails._id, userDetails?.details_id?.course_id?._id || userDetails?.details_id?.course_id)} variant='filled' color='cyan'>
          View Attendance
        </Button>
        <Button onClick={() => { handleViewMaterials(userDetails._id, userDetails?.details_id?.course_id?._id || userDetails?.details_id?.course_id) }} variant='filled' color='blue'>
          View Materials
        </Button>
        <SessionStatus student={userDetails} />
        <Button onClick={() => { handleViewProject(userDetails._id) }} variant='filled' color='gold'>
          View Final Project
        </Button>
        <Button onClick={() => { handleViewActivities(userDetails._id) }} variant='filled' color='lime'>
          View Activities
        </Button>
        <Button onClick={() => handleViewCourseHistory(userDetails?._id)} variant='filled' color='cyan'>
          View Course History
        </Button>
      </Flex>
      <ProjectDetailModal handleCancel={handleCancel} handleOk={handleOk} isModalOpen={isModalOpen} student_id={selectedStudent} />
    </>
  )
}

DrawerActionButtons.propTypes = {
  userDetails: PropTypes.object,
}

DrawerActionButtons.defaultProps = {
  userDetails: {},
}

ManagerActionButtons.propTypes = {
  userDetails: PropTypes.object,
}

ManagerActionButtons.defaultProps = {
  userDetails: {},
}

FacultyActionButton.propTypes = {
  userDetails: PropTypes.object,
}

FacultyActionButton.defaultProps = {
  userDetails: {},
}

export default DrawerActionButtons