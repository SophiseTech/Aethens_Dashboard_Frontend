import { Modal, Form } from "antd";
import { useState } from "react";
import PropTypes from "prop-types";
import CustomForm from "@components/form/CustomForm";
import CustomSelect from "@components/form/CustomSelect";
import CustomSubmit from "@components/form/CustomSubmit";
import useDiplomaBatches from "@hooks/useDiplomaBatches";
import useDiplomaCourses from "@hooks/useDiplomaCourses";
import useDiplomaIntakes from "@hooks/useDiplomaIntakes";

function ApproveModal({ open, application, onConfirm, onCancel }) {
  const [form] = Form.useForm();
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const { batchOptions, loading: loadingBatches } = useDiplomaBatches({ enabled: open });
  const { courseOptions, loading: loadingCourses } = useDiplomaCourses({ enabled: open });
  const { intakeOptions, loading: loadingIntakes } = useDiplomaIntakes(selectedCourseId);

  const handleCourseChange = (courseId) => {
    form.setFieldValue("intakeId", undefined);
    setSelectedCourseId(courseId);
  };

  const handleSubmit = async (values) => {
    await onConfirm({ batchId: values.batchId, courseId: values.courseId, intakeId: values.intakeId });
    form.resetFields();
    return { reset: true };
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCourseId(null);
    onCancel();
  };

  return (
    <Modal
      title={`Approve Application — ${application?.name ?? ""}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <CustomForm form={form} action={handleSubmit}>
        <CustomSelect
          name="batchId"
          label="Assign Batch"
          placeholder="Select a batch"
          options={batchOptions}
          loading={loadingBatches}
          required
        />
        <CustomSelect
          name="courseId"
          label="Diploma Course"
          placeholder="Select a course"
          options={courseOptions}
          loading={loadingCourses}
          required
          onChange={handleCourseChange}
        />
        <CustomSelect
          name="intakeId"
          label="Intake Period"
          placeholder="Select an intake"
          options={intakeOptions}
          loading={loadingIntakes}
          required
          disabled={!selectedCourseId && !loadingIntakes}
        />
        <CustomSubmit label="Confirm Approval" className="mt-4" />
      </CustomForm>
    </Modal>
  );
}

ApproveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ApproveModal;
