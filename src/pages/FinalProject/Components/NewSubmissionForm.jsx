import { UploadOutlined } from '@ant-design/icons';
import CustomFileUpload from '@components/form/CustomFileUpload';
import CustomInput from '@components/form/CustomInput';
import useUser from '@hooks/useUser';
import { Button, Card, Form, message, Upload } from 'antd';
import React, { useState } from 'react'

function NewSubmissionForm({ phase, onSubmit }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser()

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (values.upload?.length < 3) {
        throw new Error("You should upload atleast 3 files.");
      }
      await onSubmit(values);
      message.success('Submission sent successfully!');
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="New Submission" headStyle={{ backgroundColor: '#fafafa' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {phase.requiresSubject && (
          <CustomInput
            name="subject"
            label="Submission Subject"
            placeholder="Enter a clear title for your submission"
            required={true}
          />
        )}

        <CustomFileUpload
          type={'drag'}
          name="upload"
          label="Image"
          maxCount={3}
          form={form}
          path={`uploads/final_project/${user.username}/${user?.details_id?.course?.course_name}/${phase.title}`}
          multiple={true}
          beforeUpload={(file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
              message.error('You can only upload JPG/PNG files!');
              return Upload.LIST_IGNORE; // Prevent upload and remove file from the list
            }
            return true; // Allow upload
          }}

        >
          <div className="hover:border-blue-400">
            <p className="ant-upload-drag-icon">
              <UploadOutlined className="text-blue-500 text-3xl" />
            </p>
            <p className="ant-upload-text">Click or drag files to upload</p>
            <p className="ant-upload-hint">
              Support for images, PDF, Word documents
            </p>
          </div>
        </CustomFileUpload>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Submitting...' : 'Submit Phase'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default NewSubmissionForm