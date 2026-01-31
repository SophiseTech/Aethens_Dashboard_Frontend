import { PlusCircleFilled } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import SessionDateSelector from '@components/form/SessionDateSelector';
import ProfileImageUploader from '@components/ProfileImageUploader';
import centersStore from '@stores/CentersStore';
import courseStore from '@stores/CourseStore';
import SessionStore from '@stores/SessionStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { feeOptions, ROLES } from '@utils/constants';
import { Divider, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { calculateAge } from '@utils/helper';
import CustomCheckbox from '@components/form/CustomCheckBox';
import handleError from '@utils/handleError';

const { Text } = Typography;

function AddStudent() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = userStore()
  const { enroll, loading } = studentStore()
  const [form] = Form.useForm();
  const dobValue = Form.useWatch('DOB', form);
  const { getCourses, courses, total } = useStore(courseStore)
  const { getAvailableSessions, loading: sessionsLoading, availableSessions } = SessionStore()
  const { centers, getCenters } = useStore(centersStore);
  const isFeeEnabled = Form.useWatch("isFeeEnabled", form)
  const feeType = Form.useWatch("type", form)
  const selectedCourse = Form.useWatch("course_id", form)

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
    profile_img: "https://app.schoolofathens.art/images/default.jpg",
    sessionSchedule: [{ date: dayjs(), session_id: null }],
    total_course_fee: 0,
    type: "single",
    paidAmount: 0,
    numberOfInstallments: 6,
    isFeeEnabled: false
  }

  useEffect(() => {
    if (!courses || total === 0 || courses.length < total) {
      getCourses(0)
    }
    getCenters();
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      const courseDetails = courses.find(course => course._id === selectedCourse)
      if (!courseDetails) {
        handleError("No Course Found")
      }
      form.setFieldValue("total_course_fee", courseDetails?.rate || 0)
      if (feeType === 'partial') {
        form.setFieldValue("paidAmount", courseDetails?.rate || 0)
      }
    }
  }, [selectedCourse])


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
    if (user.role === ROLES.MANAGER) {
      values.center_id = user.center_id
    }
    if(values.type === "single"){
      values.paidAmount = values.total_course_fee
    }
    
    // Transform sessionSchedule array to sessions format for backend
    if (values.sessionSchedule && Array.isArray(values.sessionSchedule)) {
      values.sessions = values.sessionSchedule.map(item => ({
        date: dayjs(item.date).format('YYYY-MM-DD'),
        session_id: item.session_id
      }));
      delete values.sessionSchedule; // Remove the intermediate field
    }
    
    console.log(values);
    await enroll(values)
    handleOk()
  }

  const options = useMemo(() => courses?.map(course => ({ label: course.course_name, value: course._id })), [courses])
  const centerOptions = useMemo(() => centers?.map(center => ({ label: center.center_name, value: center._id })), [centers])

  const getFieldsByFeeType = (feeType) => {
    switch (feeType) {
      // case "partial":
      //   return (
      //     <>
      //       <CustomInput name={"paidAmount"} label={"Amount Paid"} />
      //     </>
      //   )
      case "monthly":
        return (
          <>
            <CustomInput name={"numberOfInstallments"} label={"Number of installments"} />
          </>
        )
      default:
        break;
    }
  }

  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Enroll Student"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={'50%'}
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
          <SessionDateSelector
            name="sessionSchedule"
            label="Session Schedule"
            getAvailableSessions={getAvailableSessions}
            availableSessions={availableSessions}
            loading={sessionsLoading}
            minItems={1}
            maxItems={10}
          />
          {user.role === ROLES.ADMIN && <CustomSelect name={"center_id"} options={centerOptions} label={"Select Center"} />}
          <CustomInput label={"Password"} name={"password"} placeholder={"Password"} type='password' />

          <Divider />

          <CustomCheckbox name={"isFeeEnabled"} label={"Add Fee Record"} />
          {isFeeEnabled && (
            <>
              <CustomInput name={"total_course_fee"} label={"Total Course Fee"} />
              <CustomSelect name={"type"} options={feeOptions} label={"Payment Method"} />
              {getFieldsByFeeType(feeType)}
            </>
          )}
          <CustomSubmit className='bg-primary' label='Enroll' loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddStudent