import CustomFileUpload from '@components/form/CustomFileUpload'
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomSubmit from '@components/form/CustomSubmit'
import facultyDevProgramStore from '@stores/FacultyDevelopmentProgramStore'
import { Flex, Form, Image, Modal } from 'antd'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
]

function EditTask({ record, isModalOpen, handleOk, handleCancel }) {
  const [form] = Form.useForm()
  const { editProgram, createLoading } = useStore(facultyDevProgramStore)

  const initialValues = { details: "", remarks: "", status: "pending", upload: [] }

  useEffect(() => {
    if (isModalOpen && record) {
      form.setFieldsValue({
        details: record.details || "",
        remarks: record.remarks || "",
        status: record.status || "pending",
        upload: [],
      })
    }
  }, [record, isModalOpen])

  const onSubmit = async (values) => {
    if (!record?._id) return;

    const newAttachments = (values?.upload || []).map(file => ({
      fileUrl: file.response,
      fileName: file.name,
      fileType: file.type?.split('/').pop() || "",
      fileSize: file.size
    }))

    await editProgram(record._id, {
      details: values.details,
      remarks: values.remarks,
      status: values.status,
      attachments: [...(record.attachments || []), ...newAttachments],
    })
    handleOk()
  }

  return (
    <Modal title={"Edit Task"} open={isModalOpen} footer={null} onCancel={handleCancel} width={600} destroyOnClose>
      <Flex vertical gap={4} className='mb-3'>
        <span className='font-bold'>Faculty</span>
        <span>{record?.faculty_id?.username}</span>
      </Flex>

      {record?.attachments?.length > 0 &&
        <Flex vertical gap={4} className='mb-3'>
          <span className='font-bold'>Existing Attachments</span>
          <Image.PreviewGroup>
            <Flex gap={4} wrap="wrap">
              {record.attachments.map((file, index) => (
                <Image
                  key={index}
                  width={40}
                  height={40}
                  src={file.fileUrl}
                  fallback="/images/placeholder-image.png"
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                />
              ))}
            </Flex>
          </Image.PreviewGroup>
        </Flex>
      }

      <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
        <CustomInput label={"Describe the task"} placeholder={"Describe the task"} name={"details"} type='text' />
        <CustomInput label={"Remarks"} placeholder={"Remarks"} name={"remarks"} type='text' required={false} />
        <CustomSelect label={"Status"} name={"status"} options={STATUS_OPTIONS} />
        <CustomFileUpload
          name="upload"
          label="Add more attachments"
          maxCount={3}
          multiple
          form={form}
          path={"uploads/fdp"}
          required={false}
          beforeUpload={() => true}
        />
        <CustomSubmit label='Save' loading={createLoading} />
      </CustomForm>
    </Modal>
  )
}

export default EditTask
