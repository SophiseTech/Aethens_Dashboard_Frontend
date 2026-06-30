import { Modal, Form, Button } from "antd";
import PropTypes from "prop-types";
import CustomForm from "@components/form/CustomForm";
import CustomTextArea from "@components/form/CustomTextArea";

function RejectModal({ open, application, onConfirm, onCancel }) {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    await onConfirm({ reason: values.reason || "" });
    form.resetFields();
    return { reset: true };
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Reject Application — ${application?.name ?? ""}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <CustomForm form={form} action={handleSubmit}>
        <CustomTextArea
          name="reason"
          label="Reason for Rejection"
          placeholder="Provide a reason (optional)"
          inputProps={{ rows: 4 }}
        />
        <Form.Item className="mt-4">
          <Button danger type="primary" htmlType="submit">
            Confirm Rejection
          </Button>
        </Form.Item>
      </CustomForm>
    </Modal>
  );
}

RejectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RejectModal;
