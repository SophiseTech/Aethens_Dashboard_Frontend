import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import ItemsInputTable from '@pages/Bills/Components/ItemsInputTable';
import { sumFromObjects } from '@utils/helper';
import { Form, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';


function GenerateBill({
  items = [], customers = [], itemsOptions = [], customersOptions = [], invoiceNo, loadInitData = () => { }, onSave = async () => { }, handleCancel, isModalOpen, handleOk
}) {


  const [selectedItem, setSelectedItem] = useState({});
  const [totals, setTotals] = useState({});
  const [form] = Form.useForm();


  const initialValues = {
    invoiceNo: invoiceNo || 0,
    items: [],
    generated_for: "",
    subject: "",
    generated_on: dayjs(),
    discountType: "percentage"
  }
  const loading = false



  // Loading Initial dropdown data. Function should be passed from parent 
  useEffect(() => {
    loadInitData()
  }, [])

  // Submit function
  const onSubmit = async (values) => {
    values?.items?.forEach((item, index) => item.item = selectedItem[index]?._id)
    console.log(values);
    await onSave({ ...values, ...totals })
    handleOk()
  }


  const columns2 = [
    {
      dataIndex: "name",
      className: "font-bold text-start"
    },
    {
      dataIndex: "value",
      className: "text-end",
      render: (value, _, index) => (index === 2 ? <p className='font-bold text-lg text-primary'>₹{value}</p> : `₹${value}`)
    },
  ]

  return (
    <>

      <Modal
        title={"Generate Bill"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"70%"}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <div className='flex gap-5'>
            <CustomInput label={"Invoice Number"} name={"invoiceNo"} placeholder={"1"} />
            <CustomDatePicker label={"Invoice Date"} name={"generated_on"} className='w-full' />
          </div>
          <div className='flex gap-5'>
            <CustomInput label={"Subject"} name={"subject"} placeholder={"Materials"} />
            <CustomSelect name={"generated_for"} options={customersOptions} label={"Select Customer"} placeholder='Customer' />
          </div>
          <ItemsInputTable form={form} items={items} itemsOptions={itemsOptions} name={"items"} selectedItem={selectedItem} setSelectedItem={setSelectedItem} setTotals={setTotals} />
          <Table
            className='w-fit ml-auto'
            showHeader={false}
            columns={columns2}
            pagination={false}
            dataSource={[
              { name: "Subtotal", value: totals?.subtotal },
              { name: "Total Tax", value: totals?.total_tax },
              { name: "Grand Total", value: totals?.total },
            ]} />

          <CustomSubmit className='bg-primary' label='Save' loading={loading} />
        </CustomForm>
      </Modal>
    </>
  )
}

export default GenerateBill