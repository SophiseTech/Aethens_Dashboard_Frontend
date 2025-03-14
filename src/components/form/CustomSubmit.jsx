import { Button, Form } from 'antd'
import React from 'react'

function CustomSubmit({ label = "Submit", loading = false, fullWidth = false, disabled = false, className = "" }) {
  return (
    <Form.Item>
      <Button className={className} type="primary" htmlType="submit" loading={loading} style={{ width: fullWidth && '100%' }} disabled={disabled}>
        {label}
      </Button>
    </Form.Item>
  )
}

export default CustomSubmit