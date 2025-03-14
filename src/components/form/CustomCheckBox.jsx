import { Form, Checkbox } from 'antd';
import React from 'react';

function CustomCheckbox({ name, label, className = "", required = false }) {
  return (
    <Form.Item
      name={name}
      valuePropName="checked"
      className="w-full"
      rules={[{ required: required, message: `Please accept the ${label}!` }]}
    >
      <Checkbox className={className}>{label}</Checkbox>
    </Form.Item>
  );
}

export default CustomCheckbox;
