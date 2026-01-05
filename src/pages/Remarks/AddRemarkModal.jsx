import PropTypes from "prop-types";
import { Modal, Form, Input, Radio } from "antd";

export default function AddRemarkModal({ visible, onCancel, onAdd, adding }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onAdd(values);
      form.resetFields();
    } catch (err) {
      // validation failed
      console.log(err);
      
    }
  };

  return (
    <Modal
      title="Add Remark"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={adding}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="text" label="Remark" rules={[{ required: true }]}> 
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

AddRemarkModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onAdd: PropTypes.func,
  adding: PropTypes.bool,
};
