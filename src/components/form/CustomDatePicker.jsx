import { Form, DatePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

function CustomDatePicker({ name, label, placeholder = "Select a date", className = "", time = false }) {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required: true, message: `Please select the ${label}!` },
      ]}
      className='w-full'
    >
      <DatePicker 
        placeholder={placeholder} 
        className={className} 
        showTime={time} 
        format={time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"} 
        
      />
    </Form.Item>
  );
}

export default CustomDatePicker;
