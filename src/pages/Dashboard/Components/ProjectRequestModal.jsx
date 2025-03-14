import CustomFileUpload from '@components/form/CustomFileUpload';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSubmit from '@components/form/CustomSubmit';
import userStore from '@stores/UserStore';
import { Form, Modal } from 'antd'
import React from 'react'
import { useStore } from 'zustand';

function ProjectRequestModal({ isModalOpen, handleOk, handleCancel }) {
  const [form] = Form.useForm();
  const { user } = useStore(userStore)

  const initialValues = {
    project_details: "",
    upload: [],
    image: ""
  }

  return (
    <Modal
      title={"Request Final Project"}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <CustomForm form={form} initialValues={initialValues} action={handleOk}>
        <CustomInput label={"Project Details"} name={"project_details"} placeholder={"Describe your project..."} />
        <CustomFileUpload
          name="upload"
          label="Image"
          maxCount={1}
          form={form}
          path={`uploads/project/${user._id}`}
          beforeUpload={(file) => {
            // Add custom validation logic here
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
              message.error('You can only upload JPG/PNG files!');
            }
            return isJpgOrPng;
          }}
        />
        <CustomSubmit className='bg-primary' label='Submit' loading={false} />
      </CustomForm>
    </Modal>
  )
}

export default ProjectRequestModal