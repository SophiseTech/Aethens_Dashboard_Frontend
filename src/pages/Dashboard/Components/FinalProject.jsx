import { useFinalProject } from '@hooks/useFinalProject'
import useModal from '@hooks/useModal'
import ProjectRequestModal from '@pages/Dashboard/Components/ProjectRequestModal'
import finalProjectStore from '@stores/FinalProjectStore'
import userStore from '@stores/UserStore'
import { Button, Tag } from 'antd'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'

function FinalProject({ finalProjectInfo = {} }) {

  const { getProject, project, createProject } = useStore(finalProjectStore)
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



  const renderProjectStatus = (status) => {
    switch (status) {
      case "approved":
        return <Tag color='green'>Approved</Tag>
      case "under_review":
        return <Tag color='red'>Pending</Tag>
      case "rejected":
        return <Tag color='red'>Rejected</Tag>
      default:
        return <Tag color='blue'>Not Opened</Tag>
    }
  }

  const renderRequestButton = () => {
    const project = finalProjectInfo?.project
    const phase = finalProjectInfo?.phase

    if (!project || _.isEmpty(project)) { return }
    return <Link to={`/student/final-project/${project._id}/phase/${phase?._id}`}>
      <Button variant='filled' color='green' size='small'>View More</Button>
    </Link>
  }

  return (
    <div className='bg-black/30 text-white relative rounded-3xl p-4 pr-0 flex justify-between items-center | gap-5 2xl:gap-10'>
      <div className='space-y-5'>
        <p className='font-bold flex gap-3 items-center | text-xs 2xl:text-lg'>
          Final Project
          {renderProjectStatus(finalProjectInfo?.latestSubmission?.status)}
        </p>
        <div className='space-y-2'>
          <p className='font-bold'>{finalProjectInfo?.project?.title} - {finalProjectInfo?.phase?.title}</p>
          <p className="| text-xs 2xl:text-sm">
            {finalProjectInfo?.latestSubmission?.status === "approved" && "✅ Your last submission was approved. Great job!"}
            {finalProjectInfo?.latestSubmission?.status === "under_review" && "⏳ Your last submission is under review. Please wait for feedback."}
            {finalProjectInfo?.latestSubmission?.status === "rejected" && "❌ Your last submission was rejected. Please review the feedback and resubmit."}
          </p>
        </div>

      </div>
      {/* <img src="/icons/project.png" alt="" className="self-end opacity-50 | max-2xl:w-1/4" /> */}
      <div className='absolute right-5'>
        {renderRequestButton()}
      </div>

      <ProjectRequestModal handleCancel={handleCancel} handleOk={handleOk} isModalOpen={isModalOpen} />

    </div>
  )
}

export default FinalProject