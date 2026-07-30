import { useEffect } from "react";
import { Modal, Form, Typography, Divider } from "antd";
import PropTypes from "prop-types";
import { useStore } from "zustand";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomSubmit from "@components/form/CustomSubmit";
import ProfileImageUploader from "@components/ProfileImageUploader";
import centersStore from "@stores/CentersStore";
import studentStore from "@stores/StudentStore";
import userStore from "@stores/UserStore";
import { feeOptions, ROLES } from "@utils/constants";
import dayjs from "dayjs";

const { Text } = Typography;

function EnrollModal({ open, application, onConfirm, onCancel }) {
  const [form] = Form.useForm();
  const { user } = userStore();
  const { centers, getCenters } = useStore(centersStore);
  const { reusableIdCards, getReusableCards } = studentStore();
  const selectedCenter = Form.useWatch("center_id", form);
  const feeType = Form.useWatch("type", form);

  const initialValues = {
    total_course_fee: 0,
    type: "single",
    paidAmount: 0,
    numberOfInstallments: 6,
    reg_fee: 3500,
    start_date: null,
  };

  useEffect(() => {
    if (open) getCenters(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const centerToFetch = user.role === ROLES.MANAGER ? user.center_id : selectedCenter;
    if (centerToFetch && open) {
      getReusableCards(centerToFetch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter, user.center_id, open]);

  const handleSubmit = async (values) => {
    if (user.role === ROLES.MANAGER) {
      values.center_id = user.center_id;
    }
    if (values.type === "single") {
      values.paidAmount = values.total_course_fee;
    }
    if (values.type === "monthly" && values.start_date) {
      values.start_date = dayjs(values.start_date).toDate();
    }
    await onConfirm(values);
    form.resetFields();
    return { reset: true };
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const centerOptions = centers?.map((c) => ({ label: c.center_name, value: c._id }));

  const getFieldsByFeeType = (type) => {
    switch (type) {
      case "monthly":
        return (
          <>
            <CustomDatePicker name={"start_date"} label={"Installment Start Date"} className="w-full" />
            <CustomInput name={"numberOfInstallments"} label={"Number of installments"} />
          </>
        );
      case "single":
        return (
          <CustomInput name={"discountAmount"} label={"Discount Amount"} />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={`Enroll Student — ${application?.name ?? ""}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div className="mb-4">
        <Text type="secondary">Name: <Text strong>{application?.name}</Text></Text><br />
        <Text type="secondary">Phone: <Text strong>{application?.phoneNumber}</Text></Text><br />
        <Text type="secondary">Address: <Text strong>{application?.address}</Text></Text>
      </div>

      <Divider />

      <CustomForm form={form} initialValues={initialValues} action={handleSubmit} resetOnFinish={false}>
        <ProfileImageUploader
          name={"profile_img"}
          form={form}
          path={`uploads/profile_img/${user?._id}`}
        />
        <CustomDatePicker name={"DOB"} label={"Date of Birth"} className="w-full" />
        <CustomInput label={"Email"} name={"email"} type="email" placeholder={"john@doe.com"} />
        <CustomInput label={"Alternative Mobile Number"} name={"phone_alt"} required={false} placeholder={"+91 7845784785"} />
        <CustomInput label={"School / University / Company Name"} name={"school_uni_work"} placeholder={"Name of your School / University / Company"} />
        {user.role !== ROLES.MANAGER && (
          <CustomSelect name={"center_id"} options={centerOptions} label={"Select Center"} />
        )}
        <CustomSelect
          name={"idCardNumber"}
          options={reusableIdCards?.map((c) => ({ label: `Reusable: ${c.code}`, value: c.code })) || []}
          label={"Assign ID Card (Select from Pool or Type New)"}
          placeholder="Select a returned card or type a new one"
          showSearch
          allowClear
          required={false}
          mode="tags"
          maxCount={1}
        />
        <CustomInput label={"Password"} name={"password"} placeholder={"Password"} type="password" />

        <Divider />

        <CustomInput name={"total_course_fee"} label={"Total Course Fee"} />
        <CustomSelect name={"type"} options={feeOptions} label={"Payment Method"} />
        {getFieldsByFeeType(feeType)}
        <CustomInput name={"reg_fee"} label={"Total Registration Fee (Exc. Tax)"} type="number" placeholder={"3500"} />

        <CustomSubmit label="Enroll Student" className="mt-4" />
      </CustomForm>
    </Modal>
  );
}

EnrollModal.propTypes = {
  open: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    phoneNumber: PropTypes.string,
    address: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EnrollModal;
