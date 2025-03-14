import { Form, Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import s3Service from '@/services/S3Service';
import handleInternalError from '@utils/handleInternalError';

function CustomFileUpload({ form, name, label, path, className = "", maxCount = 1, beforeUpload, multiple = false, required = true, ...props }) {

  const [loading, setLoading] = useState(false)

  const handleChange = info => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true); // Start loading when upload starts

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const fileUrls = await s3Service.uploadFiles({
            files: [{
              data: reader.result,
              fileName: file.name,
              fileType: file.type,
              path
            }]
          });

          if (!fileUrls || fileUrls.length === 0) throw new Error("File upload failed");

          setLoading(false); // Stop loading after successful upload
          onSuccess(fileUrls[0]); // Pass file URL to AntD Upload component
        } catch (error) {
          handleInternalError(error);
          onError(error);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file); // Convert file to Base64
    } catch (error) {
      handleInternalError(error);
      onError(error);
      setLoading(false);
    }
  };



  return (
    <Form.Item
      name={name}
      label={label}
      className='w-full'
      rules={[{ required: required, message: `Please upload the ${label}!` }]}
      valuePropName="fileList"
      getValueFromEvent={(e) => e?.fileList || []}
      {...props}
    >
      <Upload
        name="file"
        listType="picture"
        className={className}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        maxCount={maxCount}
        showUploadList={{ showRemoveIcon: true }}
        customRequest={customRequest}
        multiple={multiple}
      >
        <Button icon={<UploadOutlined />}>Upload {label}</Button>
      </Upload>
    </Form.Item>
  )
}

export default CustomFileUpload;
