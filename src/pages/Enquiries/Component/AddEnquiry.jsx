import { EditOutlined, LoadingOutlined, PlusCircleFilled } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomImageUploadWithCrop from '@components/form/CustomImageUploadWithCrop';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import ProfileImageUploader from '@components/ProfileImageUploader';
import courseStore from '@stores/CourseStore';
import enquiryStore from '@stores/EnquiryStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Avatar, Form, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';

function AddEnquiry() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, addEnquiry, getEnquiries } = enquiryStore()
  const [form] = Form.useForm();
  const { getCourses, courses, total, loading: courseLoading } = useStore(courseStore)

  const initialValues = {
    name: "",
    foundUsBy: "",
    modeOfEnquiry: "",
    ageCategory: "",
    selectedCourses: [],
    phoneNumber: "",
  }

  useEffect(() => {
    if (!courses || total === 0 || courses.length < total) {
      getCourses(0)
    }
  }, [])


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (values) => {
    await addEnquiry(values);
    await getEnquiries(10,1);
    handleOk()
  }

  const options = useMemo(() => courses?.map(course => ({ label: course.course_name, value: course._id })), [courses])
  const foundUsOptions = [{label:"Instagram",value:"instagram"},{label:"Facebook",value:"facebook"}];
  const EnquiryModeOptions = [{label:"Walk-in",value:"Walk-in"},{label:"Call",value:"Call"},{label:"Online",value:"Online"}];

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Create an Enquiry"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <CustomInput label={"Full Name"} name={"name"} placeholder={"John Doe"} />
          <CustomInput label={"Mobile Number"} name={"phoneNumber"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Age Category"} name={"ageCategory"} placeholder={"Age Category"} />
          <CustomSelect label={"How they found us"} name={"foundUsBy"} options={foundUsOptions}/>
          <CustomSelect name={"modeOfEnquiry"} options={EnquiryModeOptions} label={"Mode of Enquiry"} />
          <CustomSelect name={"selectedCourses"} options={options} label={"Select Course"} mode="multiple"/>
          <CustomSubmit className='bg-primary' label='Add Enquiry' loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddEnquiry