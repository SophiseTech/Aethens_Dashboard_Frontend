import { Empty, Form } from 'antd'
import React from 'react'

function CustomSlotPicker({ name, label, options = [], multiple = false, max = 5, className = "" }) {

  const form = Form.useFormInstance()

  const handleChange = (prevValue = [], newVal) => {
    const selectedDate = form.getFieldValue("date")
    if (checkIsActive(newVal)) {
      if (multiple) {
        form.setFieldValue(name, prevValue.filter(val => val.session !== newVal))
      } else {
        form.setFieldValue(name, null)
      }
    } else {
      if (multiple) {
        if ((prevValue.length + 1) <= max) {
          form.setFieldValue(name, [...prevValue, { date: selectedDate, session: newVal }])
        } else {
          form.setFields([{ name, errors: [`Cannot select more than ${max} options`] }])
        }
      } else {
        form.setFieldValue(name, { date: selectedDate, session: newVal })
      }
    }
  }

  const selectedSlot = Form.useWatch(name, form)

  const checkIsActive = (value) => {
    if (multiple) {
      if (selectedSlot && selectedSlot.find(item => item.session === value)) return true
    } else {
      return selectedSlot?.session === value
    }
    return false
  }

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required: true, message: `Please input the ${label}!` },
      ]}
      className=''
    >
      {options.length <= 0 ?
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No Slots available on the selected date"} />
        :
        <div className='flex gap-2 flex-wrap flex-row w-full'>
          {options.map((option, index) => (
            <div
              onClick={() => { handleChange(selectedSlot, (option.value || option)) }}
              key={index}
              className={`px-3 py-1.5 text-sm border border-secondary rounded-lg transition-colors cursor-pointer ${checkIsActive(option.value || option) ? "bg-secondary text-white" : "bg-white text-sebg-secondary"}`}
            >
              {option.label || option}
            </div>
          ))}
        </div>
      }
    </Form.Item>
  )
}

export default CustomSlotPicker