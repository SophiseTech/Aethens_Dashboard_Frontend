import { DownloadOutlined, FilePdfOutlined, LoadingOutlined, RestOutlined } from '@ant-design/icons'
import ActivityAvatar from '@pages/Activities/Components/ActivityAvatar'
import activitiesStore from '@stores/ActivitiesStore'
import userStore from '@stores/UserStore'
import permissions from '@utils/permissions'
import { Button, Popconfirm, Spin } from 'antd'
import React, { useState } from 'react'
import { useStore } from 'zustand'

function ActivityItem({ name, profile_img, time, isDocument, id, children }) {

  const { user } = useStore(userStore)
  const { deleteActivity, createLoading } = useStore(activitiesStore)

  const handleDelete = (id) => {
    if (id) {
      deleteActivity(id)
    }
  }
  return (
    <div className='flex gap-5 group'>
      <ActivityAvatar avatar={profile_img} />
      <div className='flex flex-col gap-3 flex-1'>
        <ItemHeader name={name} time={time} isDocument={isDocument} />
        {children}
        {permissions.activities.delete.includes(user.role) &&
          <Popconfirm title="Delete Activity" description="Are you sure to delete this activity?" onConfirm={() => handleDelete(id)}>
            <Button icon={<RestOutlined />} color='red' variant='filled' className='w-fit' size='small' loading={createLoading}>Delete</Button>
          </Popconfirm>
        }
      </div>
    </div>
  )
}

const ItemHeader = ({ name, isDocument, time }) => (
  <div className='flex flex-col gap-1 | text-sm 2xl:text-lg'>
    <p>
      <strong>{name}&nbsp;</strong>
      {isDocument ? "attached a document" : "posted"}
    </p>
    <p className='text-gray-500 | text-xs 2xl:text-sm'>{time}</p>
  </div>
)

const Document = ({ type, fileName, fileSize, url }) => {
  const [loading, setLoading] = useState(false);

  const DocIcon = ({ Icon, color, bg }) => (
    <div className='border aspect-square flex | p-2 rounded-lg 2xl:p-3 2xl:rounded-xl' style={{ borderColor: color, backgroundColor: bg }}>
      <Icon className="" style={{ color: color }} />
    </div>
  )

  const Icons = {
    PDF: <DocIcon Icon={FilePdfOutlined} color={"#FF0040"} bg={"rgba(255, 0, 64, 0.04)"} />,
    default: <DocIcon Icon={FilePdfOutlined} color={"#FF0040"} bg={"rgba(255, 0, 64, 0.04)"} />,
  }

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-between items-center p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-card/50 transition-colors gap-10 | w-full md:w-fit'>
      <div className='flex gap-3 items-center'>
        {Icons[type] || Icons.default}
        <div className='flex flex-col'>
          <h1 className='font-bold | text-xs 2xl:text-lg'>{fileName}</h1>
          <p className='text-gray-500 | text-[0.6rem] 2xl:text-sm'>{fileSize}</p>
        </div>
      </div>
      <div onClick={handleDownload} className="cursor-pointer">
        {loading ? <Spin indicator={<LoadingOutlined />} /> : <DownloadOutlined />}
      </div>
    </div>
  )
}

const Post = ({ title, content }) => {
  return (
    <div className='flex flex-col gap-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-card/50 transition-colors | w-full md:min-w-[25%] md:max-w-[75%] p-4 2xl:p-5'>
      <h1 className='font-bold text-gray-500 | text-sm 2xl:text-lg'>{title}</h1>
      <p className='tracking-wide text-gray-500/90 | max-2xl:text-xs'>{content}</p>
    </div>
  )
}

ActivityItem.Document = Document
ActivityItem.Post = Post

export default ActivityItem