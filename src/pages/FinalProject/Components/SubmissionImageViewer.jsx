import { FileImageOutlined } from '@ant-design/icons'
import { Card, Col, Image, Radio, Row, Space, Typography } from 'antd'
import React, { useState } from 'react'

const { Text } = Typography

function SubmissionImageViewer({ images, selectedImage, setSelectedImage }) {


  return (
    <Card title={<><FileImageOutlined /> Submitted Images</>} className="mb-4">
      <Row gutter={16}>
        <Col span={16}>
          <div className="text-center">
            {images?.length > 0 &&
              <Image
                src={images.find(img => img._id === selectedImage)?.fileUrl || images[0]?.fileUrl}
                alt="Selected submission"
                style={{ maxHeight: '200px' }}
              />
            }
          </div>
        </Col>
        <Col span={8}>
          <Text strong className="mb-2 block">Select Image:</Text>
          <Radio.Group
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {images.map((img, index) => (
                <Radio key={index} value={img._id} className="w-full">
                  <div className="flex items-center">
                    <Image
                      src={img.fileUrl}
                      alt={`Submission ${index + 1}`}
                      width={60}
                      height={45}
                      style={{ objectFit: 'cover', marginRight: '8px' }}
                    />
                    <Text>Image {index + 1}</Text>
                  </div>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Col>
      </Row>
    </Card>
  )
}

export default SubmissionImageViewer