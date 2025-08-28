import { Form, DatePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

function CustomDatePicker({ name, label, placeholder = "Select a date", className = "", time = false, required = true, disabled = false, inputProps = {} }) {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required: required, message: `Please select the ${label}!` },
      ]}
      className='w-full'
    >
      <DatePicker
        placeholder={placeholder}
        className={className}
        showTime={time}
        format={time ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY"}
        disabled={disabled}
        {...inputProps}
      />
    </Form.Item>
  );
}

export default CustomDatePicker;
