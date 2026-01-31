import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import SessionDateSelector from '@components/form/SessionDateSelector';
import SessionStore from '@stores/SessionStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import handleError from '@utils/handleError';
import { isUserActive } from '@utils/helper';
import { Button, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

function AllotSessions({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading, bookSession, bookAdditionalSession } = SessionStore()
  const sessionType = Form.useWatch("type", form)
  const getActiveSessions = studentStore((state) => state.getActiveSessions)
  const activeStudentSessions = studentStore((state) => state.activeStudentSessions)
  const studentActiveSession = activeStudentSessions[student._id]

  useEffect(() => {
    if (isModalOpen) {
      getActiveSessions(student._id)
    }
  }, [isModalOpen])

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (values) => {
    if (values.type === "regular" && studentActiveSession?.length > 0) return handleError("Student already has an active session")
    values.booked_student_id = student._id
    values.course_id = student.details_id?.course_id?._id || student?.details_id?.course_id
    
    // Transform sessionSchedule array to sessions format
    if (values.sessionSchedule && Array.isArray(values.sessionSchedule)) {
      values.sessions = values.sessionSchedule.map(item => ({
        date: dayjs(item.date).format('YYYY-MM-DD'),
        session_id: item.session_id
      }));
      delete values.sessionSchedule; // Remove intermediate field
    }
    
    console.log(values);
    if (sessionType === "regular") {
      await bookSession(values)
    } else {
      await bookAdditionalSession(values)
    }
    handleOk()
  }

  const initialValues = {
    sessionSchedule: [{ date: dayjs(), session_id: null }],
    type: (!studentActiveSession || studentActiveSession?.slotCount > 0) ? "additional" : "regular",
    customSessionCount: 0
  }

  const slotTypeOptions = [
    { label: "Additional", value: "additional" },
    { label: "Regular", value: "regular", disabled: studentActiveSession?.slotCount > 0 },
  ]

  return (
    <>
      <Button onClick={showModal} variant='filled' color='green' disabled={!isUserActive(student)}>
        Allot Sessions
      </Button>
      <Modal
        title={"Allot Sessions"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <CustomSelect name="type" label="Select Slot Type" options={slotTypeOptions} />
          <SessionDateSelector
            name="sessionSchedule"
            label="Session Schedule"
            getAvailableSessions={getAvailableSessions}
            availableSessions={availableSessions}
            loading={loading}
            minItems={1}
            maxItems={sessionType === "regular" ? 2 : 1}
          />
          <CustomInput type='number' name={"customSessionCount"} label={"Number of sessions to allot"} placeholder={10} className='w-full' required={false} />
          <CustomSubmit className='bg-primary' label='Submit' loading={loading} />
        </CustomForm>
      </Modal>
    </>
  )
}

export default AllotSessions