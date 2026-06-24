import { Modal, Form, notification } from 'antd';
import PropTypes from 'prop-types';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';
import { useStore } from 'zustand';
import enquiryStore from '@stores/EnquiryStore';
import enquiryService from '@/services/Enquiry';
import { useState } from 'react';

export default function ReopenEnquiryModal({ visible, onCancel, enquiry }) {
  const { getEnquiries, setRefresh } = useStore(enquiryStore);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const reason = values.reason.trim()
      if (reason === '') {
        message.error('Please provide a closing remark.');
        return;
      }
      await enquiryService.transitionEnquiry(enquiry._id, 'New', reason);
      // await getEnquiries(10, 1);
      setRefresh(true)
      onCancel();
      notification.success({
        message: "Success",
        description: "Enquiry re opened succesfully.",
        placement: "topRight",
      });
      return { reset: true };
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || error,
        placement: "topRight",
      });
    } finally {
      setLoading(false)
    }
  };

  return (
    <Modal
      title={`Reopen Enquiry - ${enquiry?.name || ''}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <CustomForm action={handleSubmit} initialValues={{ reason: '' }} form={form}>

        <CustomInput
          label="Specify Reason"
          name="reason"
          placeholder="Specify Reason"
          required={true}
        />

        <CustomSubmit className="mt-4" label="Reopen Enquiry" loading={loading} />
      </CustomForm>
    </Modal>
  );
}

ReopenEnquiryModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  enquiry: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
};
