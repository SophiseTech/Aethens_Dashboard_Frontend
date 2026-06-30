import { CheckCircleFilled } from "@ant-design/icons";
import CustomFileUpload from "@components/form/CustomFileUpload";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomSubmit from "@components/form/CustomSubmit";
import CustomTextArea from "@components/form/CustomTextArea";
import { Checkbox, Form, Tag } from "antd";
import { useState } from "react";
import usePreRegistrationForm, { DIPLOMA_DOCUMENTS } from "./hooks/usePreRegistrationForm";

function DocumentRow({ doc }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0">
      <div className="flex gap-2 items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{doc.label}</span>
        {doc.mandatory ? (
          <Tag color="red" className="text-xs">Required</Tag>
        ) : (
          <Tag color="default" className="text-xs">Optional</Tag>
        )}
      </div>
      <CustomFileUpload
        name={doc.key}
        label=""
        path="diploma-documents"
        accept="application/pdf,image/*"
        maxCount={1}
        required={doc.mandatory}
        rules={doc.mandatory ? [] : []}
      />
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center py-10 text-center">
      <CheckCircleFilled style={{ fontSize: 56, color: "#4F651E" }} />
      <h2 className="text-2xl font-bold text-gray-800">Application Submitted!</h2>
      <p className="max-w-sm text-gray-500">
        Thank you for your interest. We have received your application and
        will reach out to you shortly.
      </p>
    </div>
  );
}

function DiplomaPreRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const { form, batchOptions, batchesLoading, submitLoading, handleSubmit } =
    usePreRegistrationForm();

  const onSubmit = async ({ agreeToTerms: _, ...values }) => {
    await handleSubmit(values);
    setSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center p-4 w-full h-screen bg-center bg-cover bg-login lg:p-10">
      <div className="flex overflow-hidden justify-center items-stretch w-full max-w-5xl h-full bg-white rounded-3xl shadow-paper">

        {/* Form side */}
        <div className="flex flex-col gap-6 p-8 w-full h-full lg:px-12 max-lg:overflow-auto">
          <img src="/images/logo.png" alt="School of Athens" className="w-60" />

          {submitted ? (
            <SuccessScreen />
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Diploma Pre-Registration</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in your details and upload your documents to apply.
                </p>
              </div>

              <CustomForm form={form} action={onSubmit} resetOnFinish={false} className="flex overflow-auto flex-col gap-5 h-full">

                {/* Personal details */}
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="w-full lg:w-1/2">
                    <CustomInput name="name" label="Full Name" placeholder="John Doe" />
                    <CustomInput name="phoneNumber" label="Phone Number" placeholder="+91 98765 43210" />
                    <CustomTextArea
                      name="address"
                      label="Address"
                      placeholder="Your full address"
                      inputProps={{ rows: 3 }}
                    />
                    <CustomInput name="location" label="City / Location" placeholder="Chennai" />
                    <CustomSelect
                      name="preferredBatch"
                      label="Preferred Batch"
                      placeholder="Select a batch"
                      options={batchOptions}
                      loading={batchesLoading}
                    />
                  </div>

                  {/* Document uploads */}
                  <div className="mt-2 w-full lg:w-1/2">
                    <p className="mb-1 text-sm font-semibold text-gray-700">Documents</p>
                    <p className="mb-3 text-xs text-gray-400">
                      Upload PDF or image files. Maximum 1 file per document.
                    </p>
                    <div className="px-4 rounded-lg border border-border">
                      {DIPLOMA_DOCUMENTS.map((doc) => (
                        <DocumentRow key={doc.key} doc={doc} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Form.Item
                    name="agreeToTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error("You must agree to the terms and conditions")),
                      },
                    ]}
                  >
                    <Checkbox>
                      I agree to the{" "}
                      <a href="/terms-conditions" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                        terms and conditions
                      </a>
                    </Checkbox>
                  </Form.Item>
                  <CustomSubmit label="Submit Application" loading={submitLoading} fullWidth />
                </div>
              </CustomForm>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiplomaPreRegistration;
