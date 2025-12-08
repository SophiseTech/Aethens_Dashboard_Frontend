import { Form, message } from 'antd';
import PropTypes from 'prop-types';

function CustomForm({ form, children, action, initialValues = {}, className = "", resetOnFinish = true }) {

  if (!form) throw new Error("Invalid form element")

  // useEffect(() => {
  //   if (form && initialValues) {
  //     form.setFieldsValue(initialValues)
  //   };
  //   // eslint-disable-next-line
  // }, [initialValues]);

  // useEffect(() => form.resetFields(), [initialValues]);
  const onFinish = async (values) => {
    // call the provided action and allow it to return a value
    // which can be used to decide whether to reset the form
    const result = await action(values);

    let shouldReset = true;
    if (typeof resetOnFinish === 'function') {
      try {
        shouldReset = Boolean(resetOnFinish(result));
      } catch {
        shouldReset = true;
      }
    } else {
      shouldReset = Boolean(resetOnFinish);
    }

    if (shouldReset) form.resetFields();
    return result;
  }

  // Function to handle form submission errors
  const onFinishFailed = (errorInfo) => {
    message.error('Please correct the form errors before submitting.');
    console.error('Failed:', errorInfo);
  };

  return (
    <Form
      className={className}
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={initialValues}
    >
      {children}
    </Form>
  )
}

export default CustomForm

CustomForm.propTypes = {
  form: PropTypes.object.isRequired,
  children: PropTypes.node,
  action: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  className: PropTypes.string,
  resetOnFinish: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
}