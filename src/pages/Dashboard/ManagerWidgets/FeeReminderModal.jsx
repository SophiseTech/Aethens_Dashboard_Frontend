import PropTypes from 'prop-types';
import { Modal, Button, Form, Input, Alert } from 'antd';
import dayjs from 'dayjs';
import useFeeReminder from '@hooks/useFeeReminder';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomDatePicker from '@components/form/CustomDatePicker';

const { TextArea } = Input;

// The Fee KPI dashboard's reminder dialog. Rendered ONCE for the whole card, and
// mounted only while open (rows render just a button) — so its form and template
// lookup aren't duplicated per table row. `row` is normalized by the caller to
// `{ studentId, studentName, amount, dueDate }`.
function FeeReminderModal({ row, onClose }) {
  const [form] = Form.useForm();

  const amount = Form.useWatch('amount', form);
  const dueDate = Form.useWatch('dueDate', form);
  const { previewText, canSend, missingCenterFields, sending, send } = useFeeReminder(row, amount, dueDate);

  const initialValues = {
    amount: row?.amount ? Math.round(row.amount) : 0,
    dueDate: row?.dueDate ? dayjs(row.dueDate) : undefined,
  };

  const onSubmit = async (values) => {
    const success = await send(values);
    if (success) onClose();
    return success;
  };

  return (
    <Modal
      title={`Fee Reminder — ${row?.studentName || ''}`}
      open
      onCancel={onClose}
      footer={null}
    >
      <CustomForm form={form} action={onSubmit} initialValues={initialValues} resetOnFinish={false}>
        <CustomInput name='amount' label='Amount' type='number' inputProps={{ min: 0 }} />
        <CustomDatePicker name='dueDate' label='Due Date' />
        {missingCenterFields.length > 0 && (
          <Alert
            className='mb-4'
            type='warning'
            showIcon
            message={`This student's center has no ${missingCenterFields.join(' or ')} set`}
            description='An admin can add them on the Centers page. The reminder can be sent after that.'
          />
        )}
        <Form.Item label='Draft Message'>
          <TextArea autoSize={{ minRows: 4, maxRows: 14 }} value={previewText} readOnly />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' loading={sending} disabled={!canSend} block>
            Send Reminder
          </Button>
        </Form.Item>
      </CustomForm>
    </Modal>
  );
}

FeeReminderModal.propTypes = {
  row: PropTypes.shape({
    studentId: PropTypes.string,
    studentName: PropTypes.string,
    amount: PropTypes.number,
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FeeReminderModal;
