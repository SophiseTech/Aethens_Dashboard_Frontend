import Title from '@components/layouts/Title'
import GalleryList from '@pages/Gallery/components/GalleryList'
import GallerySearch from '@pages/Gallery/components/GallerySearch'
import React from 'react'

function Gallery() {
  return (
    <Title title={"Gallery"} button={<GallerySearch />}>
      <GalleryList />
    </Title>
  )
}

export default Gallery