import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import { sessionSlotOptionRenderer } from '@components/form/SessionDateSelector';
import SessionStore from '@stores/SessionStore';
import slotStore from '@stores/SlotStore';
import userStore from '@stores/UserStore';
import { getHolidayInfo } from '@utils/helper';
import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';

function AdditionalSessionRequestModal({ isOpen, onCancel, holidays = [] }) {
  const [form] = Form.useForm();
  const { getAvailableSessions, availableSessions, loading: sessionLoading } = useStore(SessionStore);
  const { requestAdditionalSession, createLoading } = useStore(slotStore);
  const { user } = useStore(userStore);
  const date = Form.useWatch("date", form);

  useEffect(() => {
    getAvailableSessions(date, null, null);
  }, [date]);

  const today = dayjs().startOf("day");

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slotOptions = useMemo(() => {
    const now = dayjs();
    const selectedDate = dayjs(date).startOf("day");

    return availableSessions?.map((session) => {
      const time = dayjs(session.start_time);
      const sessionStart = selectedDate
        .hour(time.hour())
        .minute(time.minute())
        .second(0);

      const isPast =
        selectedDate.isSame(now, "day") && sessionStart.isBefore(now);

      const isFull = Number(session.effectiveRemainingSlots || 0) <= 0;

      return {
        label: `${weekDays[session.weekDay]} - ${sessionStart.format("h:mm A")}`,
        value: session._id,
        data: session,
        disabled: isPast || isFull
      };
    });
  }, [availableSessions, date]);

  const disabledDate = (value) => {
    if (value.isBefore(today, "day")) return true;
    const key = value.format("YYYY-MM-DD");
    const holidayInfo = getHolidayInfo(key, holidays, value.year());
    return Boolean(holidayInfo);
  };

  const handleSubmit = async (values) => {
    const selectedSession = availableSessions.find((session) => session._id === values.session);
    if (!selectedSession) return;

    const requestedDate = values.date.toDate();
    requestedDate.setHours(dayjs(selectedSession.start_time).hour());
    requestedDate.setMinutes(dayjs(selectedSession.start_time).minute());

    const result = await requestAdditionalSession({
      date: requestedDate,
      session: selectedSession._id
    });

    if (result) {
      form.resetFields();
      onCancel();
    }
  };

  return (
    <Modal title="Request Additional Session" open={isOpen} footer={null} onCancel={onCancel}>
      <CustomForm
        form={form}
        action={handleSubmit}
        initialValues={{ date: dayjs(), session: undefined }}
      >
        <CustomDatePicker
          name="date"
          label="Select Date"
          className='w-full'
          inputProps={{ disabledDate }}
        />
        <div className='text-xs text-gray-500 -mt-2 mb-2'>
          Holiday dates cannot be selected.
        </div>
        <CustomSelect
          name="session"
          label="Select Session"
          showSearch
          placeholder="Select a session"
          loading={sessionLoading}
          options={slotOptions}
          className='w-full'
          optionFilterProp="label"
          optionRender={(options) => sessionSlotOptionRenderer(options, user, false)}
        />
        <CustomSubmit className='bg-primary' label='Request' loading={createLoading} disabled={createLoading} />
      </CustomForm>
    </Modal>
  );
}

export default AdditionalSessionRequestModal;
