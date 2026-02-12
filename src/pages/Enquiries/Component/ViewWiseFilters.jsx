import { Form, Row, Col, Button } from 'antd'
import PropTypes from 'prop-types'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomDatePicker from '@components/form/CustomDatePicker'
import { age_categories, closing_remarks, demoStatuses, EnquiryModeOptions, foundUsOptions } from '@utils/constants'
import CustomCheckbox from '@components/form/CustomCheckBox'
import { useEffect } from 'react'

/**
 * ViewWiseFilters
 * Props:
 * - selectedView: string (All, New, Demo, Enrolled, Closed)
 * - onApply: function(filters) called when user submits filters
 * - onClear: function() called when user resets filters
 */
function ViewWiseFilters({ selectedView = 'All', onApply = () => { }, onClear = () => { }, viewsConfig = null }) {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  }, [selectedView])
  // Default view -> fields configuration. Each field: { name, label, type, required?, options? }
  const defaultViewsConfig = {
    All: [
      { name: 'phoneNumber', label: 'Name or Phone', type: 'input' },
      { name: 'course', label: 'Course', type: 'input' },
      { name: 'startDate', label: 'From', type: 'date' },
      { name: 'endDate', label: 'To', type: 'date' },
    ],
    New: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'ageCategory', label: 'Age Category', type: 'select', options: age_categories },
      { name: 'foundUsBy', label: 'Found Us By', type: 'select', options: foundUsOptions },
      { name: 'modeOfEnquiry', label: 'Mode of Enquiry', type: 'select', options: EnquiryModeOptions },
      { name: 'new_startDate', label: 'Created From', type: 'date', disabledMode: 'after', targetDate: new Date() },
      { name: 'new_endDate', label: 'Created To', type: 'date', disabledMode: 'after', targetDate: new Date() },
      { name: 'follow_startDate', label: 'Follow Up From', type: 'date' },
      { name: 'follow_endDate', label: 'Follow Up To', type: 'date' },
      { name: 'showStaleNew', label: 'Show Only Stale Enquiries', type: 'checkbox' },
    ],
    Demo: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'demo_startDate', label: 'Demo From', type: 'date' },
      { name: 'demo_endDate', label: 'Demo To', type: 'date' },
      { name: 'demoSlot.status', label: 'Status', type: 'select', options: demoStatuses },
      { name: 'showStaleDemo', label: 'Show Only Stale Enquiries', type: 'checkbox' },
    ],
    Enrolled: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'enrolled_startDate', label: 'Enrolled From', type: 'date' },
      { name: 'enrolled_endDate', label: 'Enrolled To', type: 'date' },
    ],
    Closed: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'closedReason', label: 'Closed Reason', type: 'select', options: closing_remarks },
      { name: 'closed_startDate', label: 'Closed From', type: 'date' },
      { name: 'closed_endDate', label: 'Closed To', type: 'date' },
    ],
  }

  const cfg = viewsConfig || defaultViewsConfig

  const handleFinish = (values) => {
    // const normalizer = normalize || defaultNormalize
    // const normalized = normalizer(values)
    // include stage when a specific view is selected
    if (selectedView && selectedView !== 'All') values.stage = selectedView
    onApply(values)
  }

  const handleReset = () => {
    form.resetFields()
    onClear()
  }

  // render a single field based on descriptor
  const renderField = (field) => {
    const { name, label, type, required = false, options = [], disabledMode = null, targetDate = null, range = null } = field
    switch (type) {
      case 'select':
        return (
          <CustomSelect key={name} name={name} label={label} required={required} options={options} />
        )
      case 'date':
        return (
          <CustomDatePicker key={name} name={name} label={label} required={required} disabledMode={disabledMode} targetDate={targetDate} range={range} className='w-full' />
        )
      case 'checkbox':
        return (
          <CustomCheckbox key={name} name={name} label={label} required={required} />
        )
      case 'input':
      default:
        return (
          <CustomInput key={name} name={name} label={label} required={required} placeholder={label} />
        )
    }
  }

  const fieldsToRender = cfg[selectedView] || cfg['All'] || []

  return (
    <div className="my-4">
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={12}>
          {fieldsToRender.map((field) => (
            <Col key={field.name} xs={24} sm={12} md={6} lg={6}>
              {renderField(field)}
            </Col>
          ))}
        </Row>

        <Row className="mt-2" justify="end">
          <Col>
            <Button onClick={handleReset} style={{ marginRight: 8 }}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit">
              Apply
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

ViewWiseFilters.propTypes = {
  selectedView: PropTypes.string,
  onApply: PropTypes.func,
  onClear: PropTypes.func,
  viewsConfig: PropTypes.object,
  normalize: PropTypes.func,
}

export default ViewWiseFilters
