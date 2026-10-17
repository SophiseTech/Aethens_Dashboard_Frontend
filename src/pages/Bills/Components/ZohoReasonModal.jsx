import { Form, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import CustomForm from '@components/form/CustomForm';
import CustomTextArea from '@components/form/CustomTextArea';
import CustomSubmit from '@components/form/CustomSubmit';

// Collects the reason Zoho Books requires before an already-sent invoice can be changed.
function ZohoReasonModal({ open, title, description, submitLabel = 'Save', onSubmit, onCancel }) {
  const [form] = Form.useForm();

  const handleSubmit = async ({ reason }) => {
    const trimmed = reason?.trim();
    if (!trimmed) {
      message.error('Please enter a reason');
      throw new Error('Empty reason'); // keeps the form filled (CustomForm skips the reset)
    }
    await onSubmit(trimmed);
  };

  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={null} destroyOnClose>
      {description && <p className='mb-4 text-sm text-gray-500'>{description}</p>}
      <CustomForm form={form} action={handleSubmit}>
        <CustomTextArea
          name='reason'
          label='Reason'
          placeholder='e.g. Corrected item quantity'
          inputProps={{ maxLength: 250, showCount: true, autoSize: { minRows: 2, maxRows: 4 } }}
        />
        <CustomSubmit className='bg-primary' label={submitLabel} />
      </CustomForm>
    </Modal>
  );
}

ZohoReasonModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  submitLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ZohoReasonModal;
