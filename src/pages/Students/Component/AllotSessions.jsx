import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import SessionStore from '@stores/SessionStore';
import { Button, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

function AllotSessions({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading, bookSession, bookAdditionalSession } = SessionStore()
  const sessionType = Form.useWatch("type", form)

  useEffect(() => {
    if (isModalOpen) {
      getAvailableSessions()
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
    values.booked_student_id = student._id
    values.course_id = student.details_id?.course_id?._id
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
    type: "regular"
  }

  const slotTypeOptions = [
    { label: "Regular", value: "regular" },
    { label: "Additional", value: "additional" },
  ]

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => availableSessions?.map(session => ({
    label: `${weekDays[session.weekDay]} - ${dayjs(session.start_time).format("h:mm A")}`,
    value: session._id
  })), [availableSessions])



  return (
    <>
      <Button onClick={showModal} variant='filled' color='green'>
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
          <CustomSelect name={"sessions"} label={"Select Slots"} options={slotOptions} mode={"tags"} maxCount={sessionType === "regular" ? 2 : 1} />
          <CustomSubmit className='bg-primary' label='Submit' loading={loading} />
        </CustomForm>
      </Modal>
    </>
  )
}

export default AllotSessions