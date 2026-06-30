import { useEffect, useState } from "react";
import { Form } from "antd";
import diplomaPreRegService from "@/services/DiplomaPreReg";
import diplomaBatchService from "@/services/DiplomaBatch";
import handleSuccess from "@utils/handleSuccess";

export const DIPLOMA_DOCUMENTS = [
  { key: "marksheet", label: "12th Mark Sheet / Certificate", mandatory: true },
  { key: "id_proof", label: "ID Proof (Aadhaar / Passport)", mandatory: true },
  { key: "passport_photo", label: "Passport Size Photo", mandatory: true },
  { key: "other", label: "Other Certificates", mandatory: false },
];

function usePreRegistrationForm() {
  const [form] = Form.useForm();
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setBatchesLoading(true);
        const data = await diplomaBatchService.getActiveBatches();
        setBatches(data || []);
      } finally {
        setBatchesLoading(false);
      }
    };
    load();
  }, []);

  const batchOptions = batches.map((b) => ({
    value: b._id,
    label: `${b.name}${b.status === "full" ? " (Full)" : ""}`,
    disabled: b.status === "full",
  }));

  const handleSubmit = async (values) => {
    const documents = DIPLOMA_DOCUMENTS.flatMap((doc) => {
      const fileList = values[doc.key] || [];
      return fileList
        .filter((f) => f.status === "done" && f.response)
        .map((f) => ({
          fileUrl: f.response,
          fileName: f.name,
          documentType: doc.key,
          mandatory: doc.mandatory,
        }));
    });

    const payload = {
      name: values.name,
      phoneNumber: values.phoneNumber,
      address: values.address,
      location: values.location,
      preferredBatch: values.preferredBatch,
      documents,
    };

    try {
      setSubmitLoading(true);
      await diplomaPreRegService.submitApplication(payload);
      handleSuccess("Application submitted! We will get back to you soon.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    form,
    batchOptions,
    batchesLoading,
    submitLoading,
    handleSubmit,
  };
}

export default usePreRegistrationForm;
