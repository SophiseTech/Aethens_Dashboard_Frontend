import { Form, Input } from 'antd'
const { TextArea } = Input
import PropTypes from 'prop-types'

function CustomTextArea({ name, label, placeholder, type = "text", selectAfter, className = "", required = true, inputProps = {} }) {
  return (
    <Form.Item
      name={name}
      label={label}
      className='w-full'
      rules={[
        { required: required, message: `Please input the ${label}!` },
        // { max: 200, message: `${label} cannot exceed 50 characters` }
      ]}
    >
      <TextArea placeholder={placeholder} type={type} className={className} addonAfter={selectAfter} {...inputProps} />
    </Form.Item>
  )
}

CustomTextArea.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  selectAfter: PropTypes.node,
  className: PropTypes.string,
  required: PropTypes.bool,
  inputProps: PropTypes.object,
}

export default CustomTextArea