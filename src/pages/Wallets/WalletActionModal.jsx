import { Modal, Form, InputNumber, Input, Radio } from 'antd'

import PropTypes from 'prop-types'

function WalletActionModal({ open, onCancel, onSubmit, mode = 'topup', loading }) {
  const [form] = Form.useForm()

  const title = mode === 'topup' ? 'Top-up Wallet' : 'Deduct from Wallet'

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit(values)
    form.resetFields()
  }

  return (
    <Modal open={open} title={title} onCancel={() => { form.resetFields(); onCancel(); }} onOk={handleOk} confirmLoading={loading}>
      <Form form={form} layout="vertical" initialValues={{ type: mode }}>
        <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount is required' }] }>
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input placeholder="Optional notes" />
        </Form.Item>

        {/* For future: source selection */}
        <Form.Item name="source" label="Source">
          <Radio.Group>
            <Radio value="manual_topup">Manual</Radio>
            <Radio value="adjustment">Adjustment</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}

WalletActionModal.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  mode: PropTypes.oneOf(['topup', 'deduct']),
  loading: PropTypes.bool,
}

export default WalletActionModal
