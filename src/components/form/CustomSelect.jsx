import { Form, Select } from 'antd'
import React from 'react'

function CustomSelect({ name, label, options = [], placeholder = "", mode, className = "", ...props }) {
  return (
    <Form.Item
      name={name}
      label={label}
      className='w-full'
      rules={[
        { required: true, message: `Please input the ${label}!` },
      ]}
    >
      <Select
        // style={{ width: 120 }}
        // onChange={handleChange}
        showSearch
        mode={mode}
        options={options}
        placeholder={placeholder}
        filterOption={(inputValue, option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        {...props}
      />
    </Form.Item>
  )
}

export default CustomSelect