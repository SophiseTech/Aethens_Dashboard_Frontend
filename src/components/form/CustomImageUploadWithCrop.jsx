
import s3Service from '@/services/S3Service';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImageCropWrapper from '@components/ImageCropWrapper';
import handleInternalError from '@utils/handleInternalError';
import { message, Upload } from 'antd';

function CustomImageUploadWithCrop({ action,
  multiple = false, customUploadButton, showUploadList = true, listType = 'picture-circle',
  cropImage = false, squareCrop = false, name, path = "/upload/", form, loading, setLoading, className
}) {

  const beforeUpload = (file) => {
    const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < 5;

    if (!isValidType || !isValidSize) {
      message.error(isValidType ? 'Image must be smaller than 2MB!' : 'You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleChange = info => {
    if (info.file.status === 'done') {
      if (info.file?.response) {
        form.setFieldValue(name, info.file?.response)
      }
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


  const uploadButton = (
    <button
      style={{
        border: 0,
        background: 'none',
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <div className={className}>
      <ImageCropWrapper cropImage={cropImage} squareCrop={squareCrop} >
        <Upload
          name={"upload"}

          listType={listType}
          showUploadList={showUploadList}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={customRequest}
          maxCount={!multiple && 1}
          multiple={multiple}
          accept="image/*;capture=camera"
        >
          {customUploadButton || uploadButton}
        </Upload>
      </ImageCropWrapper>
    </div>
  )
}

export default CustomImageUploadWithCrop