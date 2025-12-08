import { Modal, Form, message } from 'antd';
import PropTypes from 'prop-types';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';
import { useStore } from 'zustand';
import enquiryStore from '@stores/EnquiryStore';
import enquiryService from '@/services/Enquiry';
import CustomSelect from '@components/form/CustomSelect';
import { closing_remarks } from '@utils/constants';

export default function CloseEnquiryModal({ visible, onCancel, enquiry }) {
  const { getEnquiries } = useStore(enquiryStore);
  const [form] = Form.useForm();

  const reason = Form.useWatch("reason", form); // 🔥 Watch the select value

  const handleSubmit = async (values) => {
    if (values.reason.trim() === '') {
      message.error('Please provide a closing remark.');
      return;
    }

    const finalReason =
      values.reason === "other" ? values.other_reason : values.reason;

    await enquiryService.transitionEnquiry(enquiry._id, 'Closed', finalReason);
    await getEnquiries(10, 1);
    onCancel();
    return { reset: true };
  };

  return (
    <Modal
      title={`Close Enquiry - ${enquiry?.name || ''}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <CustomForm action={handleSubmit} initialValues={{ reason: '' }} form={form}>
        
        <CustomSelect
          label="Closing Remark"
          name="reason"
          options={closing_remarks}
        />

        {reason === "other" && (
          <CustomInput
            label="Specify Reason"
            name="other_reason"
            placeholder="Specify Reason"
            required={true}
          />
        )}

        <CustomSubmit className="mt-4" label="Close Enquiry" />
      </CustomForm>
    </Modal>
  );
}

CloseEnquiryModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  enquiry: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
};
