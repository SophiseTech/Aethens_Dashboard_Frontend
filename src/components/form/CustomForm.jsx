import { Form, message } from 'antd';
import React, { useEffect } from 'react'

function CustomForm({ form, children, action, initialValues = {}, className = "" }) {

  if (!form) throw new Error("Invalid form element")

  // useEffect(() => {
  //   if (form && initialValues) {
  //     form.setFieldsValue(initialValues)
  //   };
  //   // eslint-disable-next-line
  // }, [initialValues]);

  // useEffect(() => form.resetFields(), [initialValues]);
  const onFinish = async (values) => {
    console.log(values);

    await action(values)
    form.resetFields()
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