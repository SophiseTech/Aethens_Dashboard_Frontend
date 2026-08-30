import { Modal, Button, Form, Input } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useModal from '@hooks/useModal';
import useFeeReminder from '@hooks/useFeeReminder';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomDatePicker from '@components/form/CustomDatePicker';

const { TextArea } = Input;

// Row-level "Reminder" button + dialog for the Fee KPI dashboard's Top
// Defaulters / Due This Month tables. `row` is normalized by the caller to
// `{ studentId, studentName, amount, dueDate }`.
function FeeReminderModal({ row, disabled = false, disabledReason }) {
  const [form] = Form.useForm();
  const { showModal, handleCancel, isModalOpen } = useModal();

  const amount = Form.useWatch('amount', form);
  const dueDate = Form.useWatch('dueDate', form);
  const { previewText, templateReady, sending, send } = useFeeReminder(row, amount, dueDate);

  const initialValues = {
    amount: row?.amount ? Math.round(row.amount) : 0,
    dueDate: row?.dueDate ? dayjs(row.dueDate) : undefined,
  };

  const onSubmit = async (values) => {
    const success = await send(values);
    if (success) handleCancel();
    return success;
  };

  return (
    <>
      <Button
        size='small'
        icon={<MessageOutlined />}
        onClick={showModal}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
      >
        Reminder
      </Button>
      <Modal
        title={`Fee Reminder — ${row?.studentName || ''}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <CustomForm form={form} action={onSubmit} initialValues={initialValues} resetOnFinish={false}>
          <CustomInput name='amount' label='Amount' type='number' inputProps={{ min: 0 }} />
          <CustomDatePicker name='dueDate' label='Due Date' />
          <Form.Item label='Draft Message'>
            <TextArea rows={4} value={previewText} readOnly />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={sending} disabled={!templateReady} block>
              Send Reminder
            </Button>
          </Form.Item>
        </CustomForm>
      </Modal>
    </>
  );
}

export default FeeReminderModal;
