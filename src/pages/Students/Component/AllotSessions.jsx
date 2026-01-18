import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import SessionStore from '@stores/SessionStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import handleError from '@utils/handleError';
import { isUserActive } from '@utils/helper';
import { Button, Flex, Form, Modal, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

function AllotSessions({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading, bookSession, bookAdditionalSession } = SessionStore()
  const sessionType = Form.useWatch("type", form)
  const getActiveSessions = studentStore((state) => state.getActiveSessions)
  const activeStudentSessions = studentStore((state) => state.activeStudentSessions)
  const studentActiveSession = activeStudentSessions[student._id]
  const date = Form.useWatch("customStartDate", form)

  useEffect(() => {
    if (isModalOpen) {
      getActiveSessions(student._id)
    }
  }, [isModalOpen])

  useEffect(() => {
    getAvailableSessions(date)
  }, [date])


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
    console.log(values);
    if (sessionType === "regular") {
      await bookSession(values)
    } else {
      await bookAdditionalSession(values)
    }
    handleOk()
  }

  const initialValues = {
    sessions: [],
    type: (!studentActiveSession || studentActiveSession?.slotCount > 0) ? "additional" : "regular",
    customStartDate: dayjs(),
    customSessionCount: 0
  }

  const slotTypeOptions = [
    { label: "Additional", value: "additional" },
    { label: "Regular", value: "regular", disabled: studentActiveSession?.slotCount > 0 },
  ]

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => availableSessions?.map(session => ({
    label: `${weekDays[session.weekDay]} - ${dayjs(session.start_time).format("h:mm A")}`,
    value: session._id,
    data: session,
  })), [availableSessions])

  const today = dayjs();
  const disabledDate = (value) => {
    // ⛔ Disable past dates
    if(sessionType === "regular") return false
    if (value.isBefore(today, "day")) return true;

  };


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
          <CustomDatePicker name={"customStartDate"} label={"Start Date"} time={false} required={false} className='w-full' inputProps={{ disabledDate: disabledDate }} />
          <CustomSelect name={"sessions"} label={"Select Slots"} options={slotOptions} mode={"multiple"} maxCount={sessionType === "regular" ? 2 : 1} optionRender={sessionSlotOptionRenderer} />
          <CustomInput type='number' name={"customSessionCount"} label={"Number of sessions to allot"} placeholder={10} className='w-full' required={false} />
          <CustomSubmit className='bg-primary' label='Submit' loading={loading} />
        </CustomForm>
      </Modal>
    </>
  )
}

export const sessionSlotOptionRenderer = (option, user) => {
  // Assuming your option data has these properties:
  // - session: contains start_time and weekDay
  // - remainingSlots: number of available slots


  const { data: session } = option.data;
  if (!session) return null;
  const { remainingSlots, additional } = session

  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekDay];
  const time = dayjs(session.start_time).format('h:mm A');

  // Determine color based on remaining slots
  let slotColor;
  if (remainingSlots > 5) {
    slotColor = 'green';
  } else if (remainingSlots > 2) {
    slotColor = 'orange';
  } else {
    slotColor = 'red';
  }

  return (
    <Flex direction="vertical" justify='space-between' align='center' size={2} style={{ width: '100%' }}>
      <div>
        <p strong style={{ fontSize: '1.05em' }}>{weekday}</p>
        <p type="secondary" style={{ fontWeight: "bold" }}>
          {time}
        </p>
      </div>
      <div className='flex gap-2'>
        <Tag
          color={slotColor}
          style={{
            fontWeight: 600,
            borderRadius: 4,
            marginRight: 0
          }}
        >
          {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} left
        </Tag>
        <Tag
          color='gold'
          style={{
            fontWeight: 600,
            borderRadius: 4,
            marginRight: 0
          }}
        >
          + {additional}
        </Tag>
      </div>
    </Flex>
  );
};

export default AllotSessions