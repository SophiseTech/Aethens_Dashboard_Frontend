import React from 'react';
import { Modal, Button, Form } from 'antd';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomDatePicker from '@components/form/CustomDatePicker';
import dayjs from 'dayjs';
import ProfileImageUploader from '@components/ProfileImageUploader';
import { useStore } from 'zustand';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';

const EditUserModal = ({ user, visible, onCancel, onSave, isStudentDetail = false }) => {
  const [form] = Form.useForm(); // Initialize form
  // Prefill form with user data when modal opens
  const { user: loggedinUser } = useStore(userStore)

  const initialValues = {
    username: user?.username,
    DOB: dayjs(user?.DOB),
    phone: user?.phone,
    address: user?.address,
    school_uni_work: user?.school_uni_work,
    profile_img: user?.profile_img || "https://app.schoolofathens.art/images/default.jpg"
  }

  React.useEffect(() => {
    if (visible && user) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, user, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    // values.DOB = values.DOB ? values.DOB.toISOString() : null; // Convert date to ISO string
    const formattedDate = values.DOB?.format('YYYY-MM-DD');
    const formattedDOJ = values.DOJ?.format('YYYY-MM-DD');
    values.DOB = formattedDate ? new Date(formattedDate) : null; // Convert date to Date object
    values.DOJ = formattedDOJ ? new Date(formattedDOJ) : null; // Convert date to Date object
    await onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Edit User Details"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <CustomForm form={form} action={handleSubmit} initialValues={initialValues}>
        <ProfileImageUploader
          form={form}
          name={"profile_img"}
          path={`uploads/profile_img/${user?._id}`}
        />
        <CustomInput
          name="username"
          label="Full Name"
          placeholder="Enter username"
        />
        <CustomDatePicker
          name={"DOB"}
          label={"Date Of Birth"}
          placeholder='DOB'
          className='w-full'
        />
        <CustomDatePicker
          name={"DOJ"}
          label={"Date Of Joining"}
          placeholder='DOJ'
          className='w-full'
        />
        <CustomInput
          name="phone"
          label="Mobile Number"
          placeholder="+91 7884574875"
        />
        <CustomInput
          name="address"
          label="Address"
          placeholder="Enter your address"
        />
        {(isStudentDetail || loggedinUser.role === ROLES.STUDENT) &&
          <CustomInput
            name="school_uni_work"
            label="Scool / University / Company Name"
            placeholder="Scool / University / Company Name"
          />
        }
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </CustomForm>
    </Modal>
  );
};

export default EditUserModal;