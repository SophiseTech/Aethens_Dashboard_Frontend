import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import CustomTextArea from '@components/form/CustomTextArea';
import { sessionSlotOptionRenderer } from '@components/form/SessionDateSelector';
import enquiryStore from '@stores/EnquiryStore';
import SessionStore from '@stores/SessionStore';
import { Form, Modal } from 'antd'
import dayjs from 'dayjs';
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';

// const { TextArea } = Input

function EnquiryDemoRescheduleModal({ isRescheduleSlotModalVisible, setIsRescheduleSlotModalVisible, enquiry }) {

  const [form] = Form.useForm();
  const {
    getEnquiries,
    rescheduleSlot,
    loading
  } = useStore(enquiryStore);
  const { getAvailableSessions, availableSessions } = SessionStore()
  const date = Form.useWatch("date", form)

  useEffect(() => {
    getAvailableSessions(date)
  }, [date])

  const handleRescheduleSlot = async (values) => {
    await rescheduleSlot(enquiry._id, values);
    setIsRescheduleSlotModalVisible(false);
    await getEnquiries(10, 1);
  }

  const initialValues = {
    date: dayjs(),
    sessions: [],
    reason: '',
    remarks: ""
  };

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => availableSessions?.map(session => ({
    label: `${weekDays[session.weekDay]} - ${dayjs(session.start_time).format("h:mm A")}`,
    value: session._id,
    data: session,
  })), [availableSessions])

  const today = dayjs();
  const disabledDate = (value) => {
    // ⛔ Disable past dates
    if (value.isBefore(today, "day")) return true;
  };

  return (
    <Modal
      title="Book Demo Slot"
      open={isRescheduleSlotModalVisible}
      onCancel={() => setIsRescheduleSlotModalVisible(false)}
      // onOk={()}
      footer={null}
    >
      <CustomForm form={form} action={handleRescheduleSlot} initialValues={initialValues}>
        <CustomDatePicker name={"date"} label={"Select Rescheduling Date"} time={false} required={false} className='w-full' inputProps={{ disabledDate: disabledDate }} />
        <CustomSelect name={"sessions"} label={"Select Rescheduling Slots"} options={slotOptions} optionRender={sessionSlotOptionRenderer} />
        <CustomTextArea name={"reason"} label={"Reason"} type='textarea' />
        <CustomTextArea name={"remarks"} label={"Remarks"} type='textarea' />
        <CustomSubmit className='bg-primary' label='Book Slot' loading={loading} />

      </CustomForm>
    </Modal>
  )
}

EnquiryDemoRescheduleModal.propTypes = {
  isRescheduleSlotModalVisible: PropTypes.bool.isRequired,
  setIsRescheduleSlotModalVisible: PropTypes.func.isRequired,
  enquiry: PropTypes.object.isRequired,
}

export default EnquiryDemoRescheduleModal