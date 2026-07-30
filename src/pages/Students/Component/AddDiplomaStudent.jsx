import { PlusCircleFilled } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import ProfileImageUploader from '@components/ProfileImageUploader';
import centersStore from '@stores/CentersStore';
import studentStore from '@stores/StudentStore';
import userStore from '@stores/UserStore';
import { feeOptions, ROLES } from '@utils/constants';
import { Divider, Form, message, Modal, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { calculateAge } from '@utils/helper';
import useDiplomaCourses from '@hooks/useDiplomaCourses';
import useDiplomaIntakes from '@hooks/useDiplomaIntakes';
import useDiplomaIntakeBatches from '@hooks/useDiplomaIntakeBatches';

const { Text } = Typography;

function AddDiplomaStudent() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = userStore()
  const { enroll, loading } = studentStore()
  const [form] = Form.useForm();
  const dobValue = Form.useWatch('DOB', form);
  const { centers, getCenters } = useStore(centersStore);
  const { reusableIdCards, getReusableCards } = studentStore()
  const selectedCenter = Form.useWatch("center_id", form)
  const selectedCourseId = Form.useWatch("diplomaCourse_id", form)
  const selectedIntakeId = Form.useWatch("diplomaIntake_id", form)
  const feeType = Form.useWatch("type", form)

  const { courses, courseOptions, loading: loadingCourses } = useDiplomaCourses({ enabled: isModalOpen });
  const { intakeOptions, loading: loadingIntakes } = useDiplomaIntakes(selectedCourseId);
  const { batchOptions, loading: loadingBatches } = useDiplomaIntakeBatches(selectedIntakeId);

  const initialValues = {
    username: "",
    email: "",
    password: "",
    address: "",
    DOB: null,
    phone: "",
    phone_alt: "",
    school_uni_work: "",
    profile_img: "https://app.schoolofathens.art/images/default.jpg",
    total_course_fee: 0,
    type: "monthly",
    paidAmount: 0,
    numberOfInstallments: 3,
    reg_fee: 10000,
    start_date: null,
  }

  useEffect(() => {
    getCenters();
  }, [])

  useEffect(() => {
    const centerToFetch = user.role === 'manager' ? user.center_id : selectedCenter;
    if (centerToFetch && isModalOpen) {
      getReusableCards(centerToFetch);
    }
  }, [selectedCenter, user.center_id, isModalOpen]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCourseChange = (courseId) => {
    form.setFieldValue("diplomaIntake_id", undefined);
    form.setFieldValue("diplomaBatch_id", undefined);
    const selectedCourse = courses.find((c) => c._id === courseId);
    if (selectedCourse?.fee != null) {
      form.setFieldValue("total_course_fee", selectedCourse.fee);
    }
  };

  const handleIntakeChange = () => {
    form.setFieldValue("diplomaBatch_id", undefined);
  };

  const onSubmit = async (values) => {
    values.role = ROLES.STUDENT
    values.courseType = "diploma"
    if (user.role === ROLES.MANAGER) {
      values.center_id = user.center_id
    }
    if (values.type === "single") {
      values.paidAmount = values.total_course_fee
    }
    if (values.type === "monthly" && values.start_date) {
      values.start_date = dayjs(values.start_date).toDate();
    }

    try {
      await enroll(values)
      message.success("Student Enrolled Successfully")
    } catch (error) {
      return;
    }
    handleOk()
    form.resetFields()
  }

  const centerOptions = useMemo(() => centers?.map(center => ({ label: center.center_name, value: center._id })), [centers])

  const getFieldsByFeeType = (feeType) => {
    switch (feeType) {
      case "monthly":
        return (
          <>
            <CustomDatePicker name={"start_date"} label={"Installment Start Date"} className='w-full' />
            <CustomInput name={"numberOfInstallments"} label={"Number of installments"} />
          </>
        )
      case "single":
        return (
          <>
            <CustomInput name={"discountAmount"} label={"Discount Amount"} />
          </>
        )
      default:
        break;
    }
  }

  return (
    <>
      <Tooltip title="Enroll Diploma Student">
        <PlusCircleFilled className='text-3xl text-primary' onClick={showModal} />
      </Tooltip>
      <Modal
        title={"Enroll Diploma Student"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={'50%'}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit} resetOnFinish={false}>
          <ProfileImageUploader
            name={"profile_img"}
            form={form}
            path={`uploads/profile_img/${user?._id}`}
          />
          <CustomInput label={"Full Name"} name={"username"} placeholder={"John Doe"} />
          <CustomDatePicker name={"DOB"} label={"Date of Birth"} placeholder='13-02-2025' className='w-full' />
          {dobValue && (
            <div className='p-2 -mt-4 mb-4 rounded-lg bg-stone-100'>
              <Text type="secondary">Calculated Age: <strong>{calculateAge(dobValue.toDate())} years</strong></Text>
            </div>
          )}
          <CustomInput label={"Address"} name={"address"} placeholder={"Building No, Street Address"} />
          <CustomInput label={"Mobile Number"} name={"phone"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Alternative Mobile Number"} name={"phone_alt"} placeholder={"+91 7845784785"} />
          <CustomInput label={"Email"} name={"email"} type='email' placeholder={"john@doe.com"} />
          <CustomInput label={"School / University / Company Name"} name={"school_uni_work"} placeholder={"Name of your School / University / Company"} />

          <Divider />

          <CustomSelect
            name={"diplomaCourse_id"}
            options={courseOptions}
            loading={loadingCourses}
            label={"Diploma Course"}
            onChange={handleCourseChange}
          />
          <CustomSelect
            name={"diplomaIntake_id"}
            options={intakeOptions}
            loading={loadingIntakes}
            label={"Intake"}
            disabled={!selectedCourseId}
            onChange={handleIntakeChange}
          />
          <CustomSelect
            name={"diplomaBatch_id"}
            options={batchOptions}
            loading={loadingBatches}
            label={"Batch"}
            disabled={!selectedIntakeId}
          />

          <Divider />

          {user.role === ROLES.ADMIN && <CustomSelect name={"center_id"} options={centerOptions} label={"Select Center"} />}
          <CustomSelect
            name={"idCardNumber"}
            options={reusableIdCards?.map(c => ({ label: `Reusable: ${c.code}`, value: c.code })) || []}
            label={"Assign ID Card (Select from Pool or Type New)"}
            placeholder="Select a returned card or type a new one"
            showSearch
            allowClear
            required={false}
            mode="tags"
            maxCount={1}
          />
          <CustomInput label={"Password"} name={"password"} placeholder={"Password"} type='password' />

          <Divider />

          <CustomInput name={"total_course_fee"} label={"Total Course Fee"} />
          <CustomSelect name={"type"} options={feeOptions} label={"Payment Method"} />
          {getFieldsByFeeType(feeType)}
          <CustomInput name={"reg_fee"} label={"Total Registration Fee (Exc. Tax)"} type='number' placeholder={'3500'} />

          <CustomSubmit className='bg-primary' label='Enroll' loading={loading} />
        </CustomForm>
      </Modal>
    </>

  )
}

export default AddDiplomaStudent
