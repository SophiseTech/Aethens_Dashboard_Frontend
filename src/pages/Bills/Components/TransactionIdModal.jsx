import { Button, Form, Modal } from 'antd';
import { NumberOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import useModal from '@hooks/useModal';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';

// Set / correct a paid bill's payment transaction id (used by statement reconciliation).
function TransactionIdModal({ bill, onSave }) {
  const { showModal, handleOk, handleCancel, isModalOpen } = useModal(({ transaction_id }) => onSave(transaction_id?.trim() || ''));
  const [form] = Form.useForm();

  return (
    <>
      <Button className='rounded-full' color='default' icon={<NumberOutlined />} variant='outlined' onClick={showModal}>
        {bill?.transaction_id ? 'Edit Transaction ID' : 'Add Transaction ID'}
      </Button>
      <Modal title="Transaction ID" open={isModalOpen} onCancel={handleCancel} footer={null} destroyOnClose>
        <p className='mb-4 text-sm text-gray-500'>
          UPI reference, card RRN or payment transaction ID. Leave empty to clear it. Re-run the statement reconciliation afterwards.
        </p>
        <CustomForm form={form} action={handleOk} initialValues={{ transaction_id: bill?.transaction_id || '' }}>
          <CustomInput name="transaction_id" label="Transaction ID" placeholder="e.g. 130504022289" required={false} />
          <CustomSubmit className='bg-primary' label='Save' />
        </CustomForm>
      </Modal>
    </>
  );
}

TransactionIdModal.propTypes = {
  bill: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default TransactionIdModal;
