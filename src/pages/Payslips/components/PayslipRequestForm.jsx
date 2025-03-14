import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomSubmit from '@components/form/CustomSubmit'
import payslipRequestStore from '@stores/PayslipRequest'
import { months } from '@utils/constants'
import { Form } from 'antd'
import React from 'react'
import { useStore } from 'zustand'

function PayslipRequestForm({ handleOk }) {
  const [form] = Form.useForm()
  const { createPayslipRequest, createLoading } = useStore(payslipRequestStore)
  const initialValues = {
    items: []
  }

  const onSubmit = async (values) => {
    await createPayslipRequest(values)
    console.log(values);
    handleOk()
  }

  return (
    <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
      <CustomSelect name={"month"} label={"Select Month"} options={months.map((month, index) => ({ label: month, value: index }))} />
      <CustomInput label={"Remarks"} name={"request_details"} placeholder={"Something about the request"} />
      <CustomSubmit className='bg-primary' label='Save' loading={createLoading} />
    </CustomForm>
  )
}

export default PayslipRequestForm