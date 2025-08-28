import { Form, Select } from 'antd';
import React from 'react';

function CustomSelect({ 
  name, 
  label, 
  options = [], 
  placeholder = "", 
  mode, 
  className = "", 
  optionRender, // New prop for custom option rendering
  required=true,
  ...props 
}) {
  return (
    <Form.Item
      name={name}
      label={label}
      className={`w-full ${className}`}
      rules={[
        { required: required, message: `Please input the ${label}!` },
      ]}
    >
      <Select
        showSearch
        mode={mode}
        options={options}
        placeholder={placeholder}
        filterOption={(inputValue, option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        optionRender={optionRender || undefined} // Only pass if provided
        {...props}
      >
        {/* Fallback to default rendering if optionRender not provided */}
        {!optionRender && options.map(option => (
          <Select.Option 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}

export default CustomSelect;