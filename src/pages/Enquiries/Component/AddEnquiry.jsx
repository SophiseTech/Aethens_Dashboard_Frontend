import { PlusCircleFilled } from '@ant-design/icons';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import DynamicMultiInputArray from '@components/form/DynamicMultiInputArray';
import courseStore from '@stores/CourseStore';
import enquiryStore from '@stores/EnquiryStore';
import enquiryService from '@/services/Enquiry';
import { Alert, Form, Modal } from 'antd';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useStore } from 'zustand';
import { age_categories, EnquiryModeOptions, foundUsOptions, ROLES } from '@utils/constants';
import userStore from '@stores/UserStore';
import centersStore from '@stores/CentersStore';

function AddEnquiry() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, addEnquiry, getEnquiries } = enquiryStore()
  const [form] = Form.useForm();
  const { getCourses, courses, total } = useStore(courseStore)
  const { user } = useStore(userStore);
  const { centers,getCenters } = useStore(centersStore);

  const initialValues = {
    name: "",
    foundUsBy: "",
    modeOfEnquiry: "",
    ageCategory: "",
    selectedCourses: [],
    phoneNumber: "",
    place: "",
  }

  useEffect(() => {
    if (!courses || total === 0 || courses.length < total) {
      getCourses(0)
    }
    getCenters();
  }, [courses, total, getCourses])


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const checkedRef = useRef(false);
  const [existence, setExistence] = useState(null); // { exists: bool, count: number }

  const onSubmit = async (values) => {
    // If we've already checked existence, proceed to create enquiry
    if (checkedRef.current) {
      const created = await addEnquiry(values);
      await getEnquiries(10, 1);
      // reset check state
      setExistence(null);
      checkedRef.current = false;
      handleOk();
      return { reset: true, created };
    }

    // First click: check if enquiry exists for phoneNumber
    try {
      const phone = values.phoneNumber;
      const res = await enquiryService.enquiryExists('phoneNumber', phone);
      // normalize response: support { count } or { exists }
      const existsCount = (res && (res.count ?? (res.exists ? res.exists : 0))) || 0;
      const existsObj = { exists: Number(existsCount) > 0, count: Number(existsCount) };
      setExistence(existsObj);
      // mark as checked so next click will proceed
      checkedRef.current = true;
      return { reset: false, checked: true, ...existsObj };
    } catch {
      // service handles errors; still mark checked to allow proceeding
      const fallback = { exists: false, count: 0 };
      setExistence(fallback);
      checkedRef.current = true;
      return { reset: false, checked: true, ...fallback };
    }
  }

  const options = useMemo(() => courses?.map(course => ({ label: course.course_name, value: course._id })), [courses])
  const centerOptions = useMemo(() => centers?.map(center => ({ label: center.center_name, value: center._id })), [centers])


  return (
    <>
      <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      <Modal
        title={"Create an Enquiry"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <CustomForm
          form={form}
          initialValues={initialValues}
          action={onSubmit}
          resetOnFinish={(result) => Boolean(result && result.reset === true)}
        >
          <CustomInput label={"Full Name"} name={"name"} placeholder={"John Doe"} />
          <CustomInput label={"Mobile Number"} name={"phoneNumber"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Place"} name={"place"} placeholder={"Enter place"} required={false} />
          {existence !== null && (
            <div className="mb-3">
              {existence.exists ? (
                <Alert
                  message={`${existence.count} enquiries exist for this phone number`}
                  type="error"
                  showIcon
                />
              ) : (
                <Alert message={"No existing enquiries found"} type="success" showIcon />
              )}
            </div>
          )}
          <DynamicMultiInputArray 
            name={'enquiry_items'}
            minItems={1}
            fields={[
              {key: 'ageCategory', label: 'Age Category', component: CustomSelect, colSpan: 12, wrapWithFormItem: false, props: {
                options: age_categories
              }},
              {key: 'selectedCourses', label: 'Select Course', component: CustomSelect, colSpan: 12, wrapWithFormItem: false, props: {
                options: options, mode: 'multiple', required: false
              }}
            ]}
          />
          {/* <CustomInput label={"Age Category"} name={"ageCategory"} placeholder={"Age Category"} /> */}
          <CustomSelect label={"How they found us"} name={"foundUsBy"} options={foundUsOptions}/>
          {user.role === ROLES.ADMIN && (
            <CustomSelect label={"Center"} name={"centerId"} options={centerOptions}/>
          )}
          <CustomSelect name={"modeOfEnquiry"} options={EnquiryModeOptions} label={"Mode of Enquiry"} />
          {/* <CustomSelect name={"selectedCourses"} options={options} label={"Select Course"} mode="multiple"/> */}
          <CustomSubmit className='bg-primary' label={existence ? 'Proceed' : 'Check'} loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddEnquiry