import CustomFileUpload from '@components/form/CustomFileUpload'
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomSubmit from '@components/form/CustomSubmit'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import facultyStore from '@stores/FacultyStore'
import userStore from '@stores/UserStore'
import { Form, Modal } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function AddTask({ isModalOpen, handleOk, handleCancel }) {
  const [form] = Form.useForm()
  const { getFacultiesByCenter, faculties, total } = useStore(facultyStore)
  const { createProgram, loading } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)

  const initialValues = {
    faculty_id: "",
    details: "",
    remarks: "",
    upload: [],
    attachments: []
  }

  useEffect(() => {
    if (!faculties || total === 0 || faculties.length < total) {
      getFacultiesByCenter(0)
    }
  }, [])

  const facultyOptions = faculties?.map(faculty => ({
    label: faculty.username,
    value: faculty._id,
  })) || []

  const onSubmit = async (values) => {

    values.attachments = values?.upload?.map(file => ({
      fileUrl: file.response,
      fileName: file.name,
      fileType: file.type?.split('/').pop() || "",
      fileSize: file.size
    }))
    values.center_id = user.center_id
    console.log(values);
    await createProgram(values)
    handleOk()

  }

  return (
    <Modal
      title={"Add Task"}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
        <CustomSelect label={"Select faculty"} name={"faculty_id"} options={facultyOptions} />
        <CustomInput label={"Describe the task"} placeholder={"Describe the task"} name={"details"} type='text' />
        <CustomFileUpload
          name="upload"
          label="Image"
          maxCount={3}
          multiple
          form={form}
          path={"uploads/fda"}
          required={false}
          beforeUpload={(file) => {
            // Add custom validation logic here
            // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            // if (!isJpgOrPng) {
            //   message.error('You can only upload JPG/PNG files!');
            // }
            return true;
          }}
        />
        <CustomSubmit label='Save' loading={loading} />
      </CustomForm>
    </Modal>
  )
}

export default AddTask