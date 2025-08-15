import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import ItemsInputTable from '@pages/Bills/Components/ItemsInputTable';
import { sumFromObjects } from '@utils/helper';
import { Form, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';


function GenerateBill({
  items = [], courses = [], customers = [], customersOptions = [], invoiceNo, loadInitData = () => { }, onSave = async () => { }, handleCancel, isModalOpen, handleOk, onSearch
}) {


  const [selectedItem, setSelectedItem] = useState({});
  const [totals, setTotals] = useState({});
  const [form] = Form.useForm();
  const selectedSubject = Form.useWatch("subject", form)


  const initialValues = {
    invoiceNo: invoiceNo || 0,
    items: [],
    generated_for: "",
    subject: "",
    generated_on: dayjs(),
    discountType: "percentage"
  }
  const loading = false

  const subjectOptions = [
    {
      label: "Materials",
      value: "materials"
    },
    {
      label: "Gallery",
      value: "gallery"
    },
    {
      label: "Courses",
      value: "course"
    },
  ]

  const getItemType = (selectedSubject) => {
    switch (selectedSubject) {
      case "materials":
        return "InventoryItem"
      case "gallery":
        return "InventoryItem"
      case "course":
        return "Course"
      default:
        break;
    }
  }

  // Loading Initial dropdown data. Function should be passed from parent 
  useEffect(() => {
    loadInitData({ itemType: selectedSubject })
  }, [selectedSubject])

  // Submit function
  const onSubmit = async (values) => {
    values?.items?.forEach((item, index) => {
      item.item = selectedItem[index]?._id
      item.name = selectedItem[index]?.name
      item.item_type = getItemType(selectedSubject)
    })
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
  // console.log(items);

  const itemsOptionsBySubject = useMemo(() => {
    if (!selectedSubject) {
      return items?.map(item => ({ label: item.name, value: item._id }))
    }
    return items?.filter(item => item.type === selectedSubject)?.map(item => ({ label: item.name, value: item._id }))
  }, [items, selectedSubject])

  return (
    <>

      <Modal
        title={"Generate Bill"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"90%"}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <div className='flex gap-5'>
            <CustomInput label={"Invoice Number"} name={"invoiceNo"} placeholder={"1"} />
            <CustomDatePicker label={"Invoice Date"} name={"generated_on"} className='w-full' />
          </div>
          <div className='flex gap-5'>
            {/* <CustomInput label={"Subject"} name={"subject"} placeholder={"Materials"} /> */}
            <CustomSelect name={"generated_for"} options={customersOptions} label={"Select Customer"} placeholder='Customer' />
            <CustomSelect name={"subject"} options={subjectOptions} label={"Subject"} placeholder='Subject' />
          </div>
          <ItemsInputTable form={form} items={items} itemsOptions={itemsOptionsBySubject} name={"items"} selectedItem={selectedItem} setSelectedItem={setSelectedItem} setTotals={setTotals} itemType={selectedSubject} onSearch={onSearch} />
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