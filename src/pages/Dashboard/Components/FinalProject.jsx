import useModal from '@hooks/useModal'
import ProjectRequestModal from '@pages/Dashboard/Components/ProjectRequestModal'
import finalProjectStore from '@stores/FinalProjectStore'
import userStore from '@stores/UserStore'
import { Button, Tag } from 'antd'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { useStore } from 'zustand'

function FinalProject({ isActive }) {

  const { getProject, project, loading, createProject } = useStore(finalProjectStore)
  const { user } = useStore(userStore)

  const handleSubmit = async (values) => {
    if (values?.upload && values.upload.length > 0) {
      values.upload.map(file => {
        values.image = file.response
      })
      if (!values.image) return handleError("Please upload a valid image")
      values.student_id = user._id
      values.course_id = user.details_id?.course_id
      await createProject(values)
      console.log(values);

    } else {
      handleError("An error occured. Please refresh")
    }
  }
  const { handleCancel, isModalOpen, handleOk, showModal } = useModal(handleSubmit)

  useEffect(() => {
    getProject({
      query: {
        course_id: user.details_id?.course_id,
        $or: [{ status: "approved" }, { status: "pending" }]
      }
    })
  }, [])

  const renderProjectStatus = (status) => {
    if (!isActive) return <Tag>Not Opened</Tag>
    switch (status) {
      case "approved":
        return <Tag color='green'>Approved</Tag>
      case "pending":
        return <Tag color='red'>Pending</Tag>
      case "rejected":
        return <Tag color='red'>Rejected</Tag>
      default:
        return <Tag color='blue'>Not Requested</Tag>
    }
  }

  const renderRequestButton = (project) => {
    if (!isActive) return
    if (_.isEmpty(project)) {
      return <Button size='small' color='green' variant='filled' onClick={showModal}>Request</Button>
    }
    return <Button size='small' color='green' variant='filled' type='link' href={project.image} target='_blank'>View Image</Button>
  }


  return (
    <div className='bg-black/30 text-white relative rounded-3xl p-4 pr-0 flex justify-between items-center | gap-5 2xl:gap-10'>
      <div className='space-y-5'>
        <p className='font-bold flex gap-3 items-center | text-xs 2xl:text-lg'>
          Final Project
          {renderProjectStatus(project?.status)}
        </p>
        <p className='| text-xs 2xl:text-sm'>
          {!isActive ? "Project is not yet opened" : project?.project_details ? project?.project_details : "No Projects approved"}
        </p>
      </div>
      {/* <img src="/icons/project.png" alt="" className="self-end opacity-50 | max-2xl:w-1/4" /> */}
      <div className='absolute right-5'>
        {renderRequestButton(project)}
      </div>

      <ProjectRequestModal handleCancel={handleCancel} handleOk={handleOk} isModalOpen={isModalOpen} />

    </div>
  )
}

export default FinalProject