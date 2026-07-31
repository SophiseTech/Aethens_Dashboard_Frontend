import Title from '@components/layouts/Title'
import ActivityGalleryList from '@pages/ActivityGallery/Components/ActivityGalleryList'
import React from 'react'

function ActivityGallery() {
  return (
    <Title title={"Activity Gallery"}>
      <ActivityGalleryList />
    </Title>
  )
}

export default ActivityGallery
