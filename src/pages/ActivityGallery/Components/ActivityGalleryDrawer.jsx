import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { formatDate, formatTime } from '@utils/helper'
import { Avatar, Button, Drawer, Image, Spin, Typography } from 'antd'
import React, { useState } from 'react'

const { Title, Text } = Typography

function ActivityGalleryDrawer({ activity, open, onClose }) {
  const [downloading, setDownloading] = useState(false)
  const displayUrl = activity?.resource?.images?.[0] || activity?.resource?.url
  const studentName = activity?.student_id?.username
  const courseName = activity?.course_id?.course_name

  const handleDownload = async () => {
    if (!displayUrl) return
    try {
      setDownloading(true)
      const response = await fetch(displayUrl)
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = activity?.resource?.fileName || "activity_image"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Drawer
      title="Activity Details"
      placement="right"
      open={open}
      onClose={onClose}
      width={480}
    >
      {activity &&
        <div className='flex flex-col gap-4'>
          <Image src={displayUrl} alt={activity?.resource?.fileName} className='w-full rounded-lg' />

          <div className='flex justify-between items-center'>
            <Text type="secondary" className='text-xs'>
              {formatDate(activity?.createdAt)} | {formatTime(activity?.createdAt)}
            </Text>
            <Button
              icon={downloading ? <Spin indicator={<LoadingOutlined />} /> : <DownloadOutlined />}
              onClick={handleDownload}
              size="small"
            >
              Download
            </Button>
          </div>

          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
              <Avatar src={activity?.faculty_id?.profile_img} />
              <div>
                <Text strong>{activity?.faculty_id?.username}</Text>
                <br />
                <Text type="secondary" className='text-xs'>Faculty</Text>
              </div>
            </div>

            {studentName ?
              <div className='flex items-center gap-3'>
                <Avatar src={activity?.student_id?.profile_img} />
                <div>
                  <Text strong>{studentName}</Text>
                  <br />
                  <Text type="secondary" className='text-xs'>Student</Text>
                </div>
              </div>
              :
              courseName &&
              <div>
                <Text strong>{courseName}</Text>
                <br />
                <Text type="secondary" className='text-xs'>Course</Text>
              </div>
            }
          </div>

          {activity?.resource?.fileName &&
            <Text type="secondary" className='text-xs break-all'>{activity.resource.fileName}</Text>
          }
        </div>
      }
    </Drawer>
  )
}

export default ActivityGalleryDrawer
