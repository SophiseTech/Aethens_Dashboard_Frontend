import { useEffect,useMemo } from "react";
import { Modal, Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { useStore } from 'zustand';
import courseStore from '@stores/CourseStore';
import CustomSelect from "@components/form/CustomSelect";
import { age_categories } from "@utils/constants";

const { TextArea } = Input;

const STAGES = ["New", "Demo", "Enrolled", "Closed"];
const DEMO_STATUSES = ["Scheduled", "Completed", "Cancelled"];

const EditEnquiryModal = ({ enquiry, visible, onCancel, onSave }) => {
  const { getCourses, courses, total, loading: courseLoading } = useStore(courseStore)
  const options = useMemo(() => courses?.map(course => ({ label: course.course_name, value: course._id })), [courses])
  const [form] = Form.useForm();
  console.log(enquiry);
  

  useEffect(() => {
    if (enquiry) {
      form.setFieldsValue({
        name: enquiry?.name,
        phoneNumber: enquiry?.phoneNumber,
        ageCategory: enquiry?.ageCategory,
        foundUsBy: enquiry?.foundUsBy,
        modeOfEnquiry: enquiry?.modeOfEnquiry,
        stage: enquiry?.stage,
        selectedCourses: enquiry?.selectedCourses?.map(c => c._id),
        remarks: enquiry?.remarks || "",
        demoSlotStatus: enquiry?.demoSlot?.status,
        demoSlotScheduledAt: enquiry?.demoSlot?.scheduledAt
          ? dayjs(enquiry.demoSlot.scheduledAt)
          : null,
        demoNotes: enquiry?.demoSlot?.notes || "",
      });
    }
  }, [enquiry]);

  useEffect(() => {
    if (!courses || total === 0 || courses.length < total) {
      getCourses(0)
    }
  }, [])

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <Modal
      title="Edit Enquiry"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Save"
      cancelText="Cancel"
      centered
    >
      <Form form={form} layout="vertical">
        
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item label="Phone Number" name="phoneNumber">
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <CustomSelect 
        label={'Age Category'}
        name={'ageCategory'}
        options={age_categories}
        />

        <Form.Item label="How they found us" name="foundUsBy">
          <Input placeholder="eg: Instagram, Google Search" />
        </Form.Item>

        <Form.Item label="Mode of Enquiry" name="modeOfEnquiry">
          <Select placeholder="Select mode">
            <Select.Option value="Walk-in">Walk-in</Select.Option>
            <Select.Option value="Call">Call</Select.Option>
            <Select.Option value="Online">Online</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Courses Interested" name="selectedCourses">
          <Select
            mode="multiple"
            placeholder="Select courses"
            options={options}
          />
        </Form.Item>

        <Form.Item label="Stage" name="stage">
          <Select placeholder="Select stage">
            {STAGES.map((s) => (
              <Select.Option key={s} value={s}>
                {s}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Demo Slot Fields */}
        <Form.Item label="Demo Status" name="demoSlotStatus">
          <Select placeholder="Select demo status">
            {DEMO_STATUSES.map((s) => (
              <Select.Option key={s} value={s}>
                {s}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Demo Scheduled At" name="demoSlotScheduledAt">
          <DatePicker showTime className="w-full" />
        </Form.Item>

        <Form.Item label="Demo Notes" name="demoNotes">
          <TextArea rows={3} placeholder="Demo slot notes" />
        </Form.Item>

        {/* General Remarks */}
        <Form.Item label="Remarks" name="remarks">
          <TextArea rows={3} placeholder="Additional remarks" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditEnquiryModal;
