import { Form, Input } from 'antd'

function CustomInput({ name, label, placeholder, type = "text", selectAfter, className = "", required = true, rules = [], inputProps = {} }) {
  return (
    <Form.Item
      name={name}
      label={label}
      className='w-full'
      rules={[
        { required: required, message: `Please input the ${label}!` },
        ...rules
        // { max: 200, message: `${label} cannot exceed 50 characters` }
      ]}
    >
      <Input placeholder={placeholder} type={type} className={className} addonAfter={selectAfter} {...inputProps} />
    </Form.Item>
  )
}

export default CustomInput