import { Modal, Button, Form } from 'antd';
import React from 'react';
import useModal from '@hooks/useModal';
import CustomForm from '@components/form/CustomForm';
import CustomSelect from '@components/form/CustomSelect';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomSubmit from '@components/form/CustomSubmit';
import dayjs from 'dayjs';

function RecordPaymentModal({ handleRecordPayment, bill }) {
  const { showModal, handleOk, handleCancel, isModalOpen } = useModal(handleRecordPayment);
  const [form] = Form.useForm();

  const paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
  ];

  const initialValues = {
    payment_method: 'cash',
    payment_date: dayjs(),
  };

  const onSubmit = (values) => {
    handleOk(values);
  };

  return (
    <>
      <Button
        className='rounded-full'
        color='green'
        icon={<p>₹</p>}
        variant='outlined'
        onClick={showModal}
        disabled={bill?.status === "paid" || bill?.subject === "course"}
      >
        Record Payment
      </Button>
      <Modal
        title="Record Payment"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <CustomForm initialValues={initialValues} action={onSubmit} form={form}>
          <CustomSelect name="payment_method" label="Payment Method" options={paymentMethods} placeholder="Select payment method" />
          <CustomDatePicker name="payment_date" label="Payment Date" placeholder="Select payment date" time={false} className='w-full' />
          <CustomSubmit className='bg-primary' label='Submit' />
        </CustomForm>
      </Modal>
    </>
  );
}

export default RecordPaymentModal;