import { EditOutlined, LoadingOutlined, PlusCircleFilled } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomImageUploadWithCrop from '@components/form/CustomImageUploadWithCrop';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import ProfileImageUploader from '@components/ProfileImageUploader';
import courseStore from '@stores/CourseStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { Avatar, Form, Modal, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { calculateAge } from '@utils/helper';

const { Text } = Typography;

function AddStudent() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = userStore()
  const { enroll, loading } = studentStore()
  const [form] = Form.useForm();
  const dobValue = Form.useWatch('DOB', form);
  const { getCourses, courses, total, loading: courseLoading } = useStore(courseStore)


  const initialValues = {
    username: "",
    email: "",
    password: "",
    address: "",
    course_id: "",
    DOB: null,
    phone: "",
    phone_alt: "",
    school_uni_work: "",
    profile_img: "https://app.schoolofathens.art/images/default.jpg"
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
    values.role = ROLES.STUDENT
    values.center_id = user.center_id
    console.log(values);
    await enroll(values)
    handleOk()
  }

  const options = useMemo(() => courses?.map(course => ({ label: course.course_name, value: course._id })), [courses])

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Enroll Student"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <ProfileImageUploader
            name={"profile_img"}
            form={form}
            path={`uploads/profile_img/${user?._id}`}
          />
          <CustomInput label={"Full Name"} name={"username"} placeholder={"John Doe"} />
          <CustomDatePicker name={"DOB"} label={"Date of Birth"} placeholder='13-02-2025' className='w-full' />
          {dobValue && (
            <div className='-mt-4 mb-4 p-2 bg-stone-100 rounded-lg'>
              <Text type="secondary">Calculated Age: <strong>{calculateAge(dobValue.toDate())} years</strong></Text>
            </div>
          )}
          <CustomInput label={"Address"} name={"address"} placeholder={"Building No, Street Address"} />
          <CustomInput label={"Mobile Number"} name={"phone"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Alternative Mobile Number"} name={"phone_alt"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Email"} name={"email"} type='email' placeholder={"john@doe.com"} />
          <CustomInput label={"School / University / Company Name"} name={"school_uni_work"} placeholder={"Name of your School / University / Company"} />
          <CustomSelect name={"course_id"} options={options} label={"Select Course"} />
          <CustomInput label={"Password"} name={"password"} placeholder={"Password"} type='password' />
          <CustomSubmit className='bg-primary' label='Enroll' loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddStudent