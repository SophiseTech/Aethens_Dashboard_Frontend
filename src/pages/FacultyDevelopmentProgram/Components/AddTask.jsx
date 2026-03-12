import CustomFileUpload from '@components/form/CustomFileUpload'
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomSubmit from '@components/form/CustomSubmit'
import centersStore from '@stores/CentersStore'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import facultyStore from '@stores/FacultyStore'
import userStore from '@stores/UserStore'
import { ROLES } from '@utils/constants'
import { Form, Modal } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function AddTask({ isModalOpen, handleOk, handleCancel }) {
  const [form] = Form.useForm()
  const { getFacultiesByCenter, faculties, total } = useStore(facultyStore)
  const { createProgram, loading } = useStore(facultyDevProgramStore)
  const { user } = useStore(userStore)
  const { selectedCenter } = useStore(centersStore);

  const initialValues = {
    faculty_ids: [],
    details: "",
    remarks: "",
    upload: [],
    attachments: []
  }

  useEffect(() => {
    getFacultiesByCenter(0)
  }, [selectedCenter])

  const facultyOptions = faculties?.map(faculty => ({
    label: faculty.username,
    value: faculty._id,
  })) || []

  const allFacultyIds = facultyOptions.map(opt => opt.value);

  const onSubmit = async (values) => {
    if ((user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER) && selectedCenter === "all") {
      alert("Change center from all to any specific center.")
      return;
    }

    if (!values.faculty_ids || values.faculty_ids.length === 0) {
      alert("Please select at least one faculty.")
      return;
    }

    values.attachments = values?.upload?.map(file => ({
      fileUrl: file.response,
      fileName: file.name,
      fileType: file.type?.split('/').pop() || "",
      fileSize: file.size
    }))

    if (user.role === ROLES.ADMIN || user.role === ROLES.ACADEMIC_MANAGER) {
      values.center_id = selectedCenter;
    } else {
      values.center_id = user.center_id
    }

    // Backend will handle the array faculty_ids or we can loop here if preferred. 
    // Plan: Handle array on backend for cleaner single request.
    await createProgram(values)
    handleOk()
  }

  return (
    <Modal
      title={"Add Task"}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={600}
    >
      <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
        <CustomSelect
          label={"Select faculty"}
          name={"faculty_ids"}
          mode="multiple"
          options={facultyOptions}
          placeholder="Select one or more faculties"
          maxTagCount="responsive"
          dropdownRender={(menu) => (
            <>
              <div
                style={{
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <a
                  style={{ fontSize: '12px' }}
                  onClick={() => form.setFieldsValue({ faculty_ids: allFacultyIds })}
                >
                  Select All
                </a>
                <a
                  style={{ fontSize: '12px' }}
                  onClick={() => form.setFieldsValue({ faculty_ids: [] })}
                >
                  Clear All
                </a>
              </div>
              {menu}
            </>
          )}
        />
        <CustomInput label={"Describe the task"} placeholder={"Describe the task"} name={"details"} type='text' />
        <CustomFileUpload
          name="upload"
          label="Image"
          maxCount={3}
          multiple
          form={form}
          path={"uploads/fdp"}
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