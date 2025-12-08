import { Form, Row, Col, Button } from 'antd'
import PropTypes from 'prop-types'
import CustomInput from '@components/form/CustomInput'
import CustomSelect from '@components/form/CustomSelect'
import CustomDatePicker from '@components/form/CustomDatePicker'
import { age_categories, EnquiryModeOptions, foundUsOptions } from '@utils/constants'

/**
 * ViewWiseFilters
 * Props:
 * - selectedView: string (All, New, Demo, Enrolled, Closed)
 * - onApply: function(filters) called when user submits filters
 * - onClear: function() called when user resets filters
 */
function ViewWiseFilters({ selectedView = 'All', onApply = () => {}, onClear = () => {}, viewsConfig = null, normalize = null }) {
  const [form] = Form.useForm()

  // default closed reasons (can be extended or provided via viewsConfig)
  const defaultClosedReasons = [
    { label: 'Not interested', value: 'not_interested' },
    { label: 'Price', value: 'price' },
    { label: 'Already enrolled', value: 'already_enrolled' },
    { label: 'Invalid number', value: 'invalid_number' },
    { label: 'Other', value: 'other' },
  ]

  // Default view -> fields configuration. Each field: { name, label, type, required?, options? }
  const defaultViewsConfig = {
    All: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'course', label: 'Course', type: 'input' },
      { name: 'startDate', label: 'From', type: 'date' },
      { name: 'endDate', label: 'To', type: 'date' },
    ],
    New: [
      { name: 'ageCategory', label: 'Age Category', type: 'select', options: age_categories },
      { name: 'foundUsBy', label: 'Found Us By', type: 'select', options: foundUsOptions },
      { name: 'modeOfEnquiry', label: 'Mode of Enquiry', type: 'select', options: EnquiryModeOptions },
      { name: 'new_startDate', label: 'From', type: 'date' },
      { name: 'new_endDate', label: 'To', type: 'date' },
    ],
    Demo: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'course', label: 'Course', type: 'input' },
      { name: 'demoFrom', label: 'Demo From', type: 'date' },
      { name: 'demoTo', label: 'Demo To', type: 'date' },
    ],
    Enrolled: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'course', label: 'Course', type: 'input' },
      { name: 'enrolledFrom', label: 'Enrolled From', type: 'date' },
      { name: 'enrolledTo', label: 'Enrolled To', type: 'date' },
    ],
    Closed: [
      { name: 'phoneNumber', label: 'Phone', type: 'input' },
      { name: 'course', label: 'Course', type: 'input' },
      { name: 'closedReason', label: 'Closed Reason', type: 'select', options: defaultClosedReasons },
      { name: 'closedFrom', label: 'Closed From', type: 'date' },
      { name: 'closedTo', label: 'Closed To', type: 'date' },
    ],
  }

  const cfg = viewsConfig || defaultViewsConfig

  // default normalization: map any "from"-like field to startDate and "to"-like to endDate
  const defaultNormalize = (values) => {
    const filters = { ...values }
    // find a from-like key
    const fromKey = Object.keys(values).find(k => /from$|From$|^start|Start|FromDate|fromDate/i.test(k))
    const toKey = Object.keys(values).find(k => /to$|To$|^end|End|ToDate|toDate/i.test(k))
    if (fromKey && !filters.startDate) filters.startDate = values[fromKey]
    if (toKey && !filters.endDate) filters.endDate = values[toKey]
    return filters
  }

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
    const { name, label, type, required = false, options = [] } = field
    switch (type) {
      case 'select':
        return (
          <CustomSelect key={name} name={name} label={label} required={required} options={options} />
        )
      case 'date':
        return (
          <CustomDatePicker key={name} name={name} label={label} required={required} />
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
