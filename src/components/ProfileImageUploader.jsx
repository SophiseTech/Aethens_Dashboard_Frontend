import { EditOutlined, LoadingOutlined } from '@ant-design/icons'
import CustomImageUploadWithCrop from '@components/form/CustomImageUploadWithCrop'
import { Avatar, Form } from 'antd'
import React, { useState } from 'react'

function ProfileImageUploader({ form, name, path, label = "" }) {
  const [profileImageLoading, setProfileImageLoading] = useState(false)
  const profileImageUrl = Form.useWatch(name, form)

  return (
    <div className='relative w-fit mb-3'>
      <Form.Item
        name={name}
        label={label}
        className='mb-0'
      >
        <CustomImageUploadWithCrop
          name={name}
          customUploadButton={<EditOutlined className='group-hover:text-white transition-all text-xl' />}
          showUploadList={false}
          listType='text'
          cropImage
          squareCrop
          className="absolute inset-0 z-10 flex items-center justify-center hover:bg-black/50 transition-colors rounded-full hover:text-white group cursor-pointer"
          path={path}
          form={form}
          loading={profileImageLoading}
          setLoading={setProfileImageLoading}
        />
        {profileImageLoading ?
          <Avatar icon={<LoadingOutlined />} size={110} className='profile-avatar' />
          :
          <Avatar src={profileImageUrl} className='profile-avatar' size={110} />
        }
      </Form.Item>

    </div >
  )
}

export default ProfileImageUploader