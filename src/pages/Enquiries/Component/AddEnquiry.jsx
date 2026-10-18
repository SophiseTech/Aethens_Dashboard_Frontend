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
import { age_categories, classPreferenceOptions, EnquiryModeOptions, foundUsOptions, ROLES } from '@utils/constants';
import userStore from '@stores/UserStore';
import centersStore from '@stores/CentersStore';
import { formatCenterCounts } from '@utils/helper';

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
  const cleanPhoneNumber = (val) =>
    typeof val === "string" ? val.trim().replace(/[\s()-]/g, "") : val;

  const handleCancel = () => {
    setIsModalOpen(false);
    setExistence(null);
    checkedRef.current = false;
  };

  const handlePhoneChange = () => {
    if (checkedRef.current || existence !== null) {
      checkedRef.current = false;
      setExistence(null);
    }
  };

  const checkedRef = useRef(false);
  const [existence, setExistence] = useState(null); // { exists: bool, count: number }

  const onSubmit = async (values) => {
    const cleanedPhone = cleanPhoneNumber(values.phoneNumber);
    const submissionValues = {
      ...values,
      phoneNumber: cleanedPhone,
    };

    // If we've already checked existence, proceed to create enquiry
    if (checkedRef.current) {
      const created = await addEnquiry(submissionValues);
      await getEnquiries(10, 1);
      // reset check state
      setExistence(null);
      checkedRef.current = false;
      handleOk();
      return { reset: true, created };
    }

    // First click: check if enquiry exists for phoneNumber
    try {
      // Managers are scoped server-side; admins check against the center picked on the form
      const centerId = values.centerId;
      const res = await enquiryService.enquiryExists('phoneNumber', cleanedPhone, centerId);
      // normalize response: support { count } or { exists }
      const existsCount = (res && (res.count ?? (res.exists ? res.exists : 0))) || 0;
      const existsObj = {
        exists: Number(existsCount) > 0,
        count: Number(existsCount),
        sameCenterCount: Number(res?.sameCenterCount || 0),
        otherCenters: res?.otherCenters || [],
        // without a center (e.g. admin with none picked) every match is listed per center
        hasOwnCenter: user.role === ROLES.MANAGER || Boolean(centerId),
      };
      setExistence(existsObj);
      // mark as checked so next click will proceed
      checkedRef.current = true;
      return { reset: false, checked: true, ...existsObj };
    } catch {
      // service handles errors; still mark checked to allow proceeding
      const fallback = { exists: false, count: 0, sameCenterCount: 0, otherCenters: [], hasOwnCenter: true };
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
          <CustomInput
            label={"Mobile Number"}
            name={"phoneNumber"}
            placeholder={"+91 7845784785"}
            inputProps={{ onChange: handlePhoneChange }}
          />
          <CustomInput label={"Place"} name={"place"} placeholder={"Enter place"} required={false} />
          {existence !== null && (
            <div className="mb-3">
              {existence.exists ? (
                <>
                  {existence.sameCenterCount > 0 && (
                    <Alert
                      message={`${existence.sameCenterCount} enquiries exist in this center for this phone number`}
                      type="error"
                      showIcon
                    />
                  )}
                  {existence.otherCenters.length > 0 && (
                    <Alert
                      className="mt-2"
                      message={`${existence.hasOwnCenter ? "Also exists in other centers" : "Exists in"}: ${formatCenterCounts(existence.otherCenters)}`}
                      type="warning"
                      showIcon
                    />
                  )}
                </>
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
          <CustomSelect name={"classPreference"} options={classPreferenceOptions} label={"Class Preference"} required={false} />
          {/* <CustomSelect name={"selectedCourses"} options={options} label={"Select Course"} mode="multiple"/> */}
          <CustomSubmit className='bg-primary' label={existence ? 'Proceed' : 'Check'} loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddEnquiry