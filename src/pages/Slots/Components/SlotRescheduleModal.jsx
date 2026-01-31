import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import { sessionSlotOptionRenderer } from '@components/form/SessionDateSelector';
import SessionStore from '@stores/SessionStore';
import slotStore from '@stores/SlotStore';
import userStore from '@stores/UserStore';
import { getNextAvailableWeekdayDate } from '@utils/helper';
// import { getNextWeekdayDate } from '@utils/helper';
import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';

function SlotRescheduleModal({ isModalOpen, handleOk, handleCancel, studentsSlots = [] }) {
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading } = useStore(SessionStore)
  const { reschedulingSlot } = slotStore()
  const date = Form.useWatch("date", form)
  const { user } = useStore(userStore)

  const today = dayjs().startOf("day");

  useEffect(() => {
    getAvailableSessions(date)
  }, [date])

  const initialValues = {
    session: {},
    date: dayjs(),
  }

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => {
    const now = dayjs();
    const selectedDate = dayjs(date).startOf("day");

    return availableSessions?.map(session => {
      const time = dayjs(session.start_time);

      // Merge selected date + session time
      const sessionStart = selectedDate
        .hour(time.hour())
        .minute(time.minute())
        .second(0);

      const isPast =
        selectedDate.isSame(now, "day") && sessionStart.isBefore(now);

      return {
        label: `${weekDays[session.weekDay]} - ${sessionStart.format("h:mm A")}`,
        value: session._id,
        data: session,
        disabled: isPast // ⛔ disable only if today & time passed
      };
    });
  }, [availableSessions, date]);


  const handleSubmit = async (values) => {
    const session = availableSessions.find(session => session._id === values.session)
    // const nextDate = getNextAvailableWeekdayDate(session.weekDay, studentsSlots, reschedulingSlot, session)
    const nextDate = values.date.toDate();
    nextDate.setHours(dayjs(session.start_time).hour())
    nextDate.setMinutes(dayjs(session.start_time).minute())
    values.requested_slot = {
      date: nextDate,
      session: session._id
    }
    await handleOk(values)
  }

  const disabledDate = (value) => {
    const key = value.format("YYYY-MM-DD");

    // ⛔ Disable past dates
    if (value.isBefore(today, "day")) return true;

  };

  return (
    <Modal title={"Reschedule Slot"} open={isModalOpen} footer={null} onCancel={handleCancel}>
      <CustomForm form={form} initialValues={initialValues} action={handleSubmit}>
        {/* <CustomSelect name={"session"} label={"Select New Slot"} options={slotOptions} /> */}
        {/* <SlotAvailabilityCalendar /> */}
        <CustomDatePicker
          name="date"
          label="Select Date"
          className='w-full'
          inputProps={{ disabledDate: disabledDate }}
        />
        <CustomSelect
          name={"session"}
          label={"Select New Slot"}
          showSearch
          placeholder="Select a session"
          loading={loading}
          // style={{ width: 300 }}
          options={slotOptions}
          className='w-full'
          // onChange={(value) => {
          //   setSelectedSessionId(value);
          //   // setStudents([]);
          // }}
          optionFilterProp="label"
          optionRender={(options) => sessionSlotOptionRenderer(options, user, false)}
        />
        <CustomSubmit className='bg-primary' label='Submit' loading={loading} />
      </CustomForm>
    </Modal>
  )
}

export default SlotRescheduleModal