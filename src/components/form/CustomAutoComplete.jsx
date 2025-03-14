import { Form, Select } from 'antd';
import React from 'react';

function CustomAutoComplete({ name, label, options = [], placeholder = "", className = "", required = true, mode = false, ...props }) {
  return (
    <Form.Item
      name={name}
      label={label}
      className='w-full'
      rules={[
        { required: required, message: `Please input the ${label}!` },
      ]}
    >
      <Select
        showSearch
        options={options}
        placeholder={placeholder}
        className={className}
        maxCount={2}
        multiple
        filterOption={(inputValue, option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        {...props}
      />
    </Form.Item>
  )
}

export default CustomAutoComplete;