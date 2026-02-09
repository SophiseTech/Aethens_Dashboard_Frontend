import CustomFileUpload from '@components/form/CustomFileUpload'
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomSubmit from '@components/form/CustomSubmit'
import inventoryStore from '@stores/InventoryStore'
import { imageCategories, imageTags } from '@utils/constants'
import handleError from '@utils/handleError'
import { Form } from 'antd'
import React, { useEffect } from 'react'

function InventoryItemForm({ onSubmit, defaultItem }) {

  const [form] = Form.useForm();
  const { createLoading, loading } = inventoryStore()
  const selectedType = Form.useWatch("type", form)

  const initialValues = {
    name: defaultItem?.name || "",
    type: defaultItem?.type || "",
    default_rate: defaultItem?.default_rate ?? "",
    default_discount: defaultItem?.default_discount ?? "",
    default_tax: defaultItem?.default_tax ?? "",
    tags: defaultItem?.tags || [],
    category: defaultItem?.category || [],
    image: defaultItem?.image || "",
    upload: []
  };

  useEffect(() => {
    if (defaultItem?.image) {
      const fileList = defaultItem.image.map((img, index) => ({
        uid: index, // Unique identifier for the file
        name: img.split('/').pop(), // Extract file name
        status: 'done', // Status as 'done' since it's already uploaded
        url: img,
        thumbUrl: img,
        response: img
      }))
      initialValues.upload = fileList
    }

    form.setFieldsValue(initialValues);
  }, [defaultItem, form]);

  const options = [
    { label: "gallery", value: "gallery" },
    { label: "materials", value: "materials" },
    { label: "assets", value: "assets" },
  ]

  const handleSubmit = async (values) => {
    console.log(values);

    if (values?.type === "gallery") {
      if (values?.upload) {
        values.image = values.upload.map(file => file.response)
      } else {
        handleError("Upload atleast one image")
        return;
      }
    }

    // V2: Items are global - no inventory_id needed
    await onSubmit(values)
  }

  return (
    <CustomForm form={form} initialValues={initialValues} action={handleSubmit}>
      <CustomInput label={"Name"} name={"name"} placeholder={"John Doe"} />
      <CustomSelect name={"type"} options={options} label={"Select Type of Item"} />
      <CustomInput label={"Default Rate (₹)"} name={"default_rate"} type='number' placeholder={"1000"} />
      <CustomInput label={"Default Discount (₹)"} name={"default_discount"} type='number' placeholder={"100"} />
      <CustomInput label={"Default Tax (%)"} name={"default_tax"} type='number' placeholder={"18"} />
      {selectedType === "gallery" &&
        <>
          <CustomFileUpload
            name="upload"
            label="Image"
            maxCount={1}
            form={form}
            path={"uploads/images"}
            beforeUpload={(file) => {
              // Add custom validation logic here
              const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
              if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG files!');
              }
              return isJpgOrPng;
            }}
          />
          <CustomSelect name={"category"} options={imageCategories} label={"Select Category"} mode={"tags"} />
          <CustomSelect name={"tags"} options={imageTags} label={"Select Tags"} mode={"tags"} />
        </>
      }
      <CustomSubmit className='bg-primary' label='Save' loading={createLoading} disabled={loading} />
    </CustomForm>
  )
}

export default InventoryItemForm