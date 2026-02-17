import CustomFileUpload from '@components/form/CustomFileUpload';
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import activitiesStore from '@stores/ActivitiesStore';
import userStore from '@stores/UserStore';
import { Form } from 'antd';
import React from 'react'
import { useLocation, useParams } from 'react-router-dom';
import { useStore } from 'zustand';

function AddActivityForm({ handleOk, student, activityType }) {
  const [form] = Form.useForm();
  const selectedType = Form.useWatch("type", form)
  const { user } = useStore(userStore)
  const { id } = useParams()
  const { createLoading, loading } = useStore(activitiesStore)
  const { pathname } = useLocation()
  const fileName = (activityType === 'Individual' && student?.username) ? `${student.username}_${new Date().toISOString()}` : null

  const initialValues = {
    type: "post",
    title: "",
    remarks: "",
    upload: [],
  }

  const onSubmit = (values) => {
    values.faculty_id = user._id
    if (pathname.includes("/student/") && id) {
      values.student_id = id
    } else {
      values.course_id = id || user.course_id
    }
    if (selectedType === "attachment" && values?.upload) {
      values.upload.map(file => (values.resource = {
        url: file.response,
        fileName: fileName || file.name,
        fileType: file.type?.split('/').pop() || "",
        fileSize: file.size
      }))
    }
    console.log(values);
    handleOk(values)
  }

  const options = [
    { label: "post", value: "post" },
    { label: "attachment", value: "attachment" },
  ]

  return (
    <CustomForm form={form} action={onSubmit} initialValues={initialValues}>
      <CustomSelect name={"type"} options={options} label={"Select Type of Activity"} />

      {selectedType === "post" ?
        <>
          <CustomInput label={"Title"} name={"title"} placeholder={"Title of the activity..."} />
          <CustomInput label={"Description"} name={"remarks"} placeholder={"Describe the activity..."} />
        </>
        :
        <>
          <CustomFileUpload
            name="upload"
            label="Attachment"
            maxCount={1}
            form={form}
            path={`uploads/activities/${id}`}
            fileName={fileName}
            beforeUpload={(file) => {
              // Add custom validation logic here
              // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
              // if (!isJpgOrPng) {
              //   message.error('You can only upload JPG/PNG files!');
              // }
              return true;
            }}
          />
        </>
      }
      <CustomSubmit className='bg-primary' label='Save' loading={createLoading} disabled={loading} />

    </CustomForm>
  )
}

export default AddActivityForm