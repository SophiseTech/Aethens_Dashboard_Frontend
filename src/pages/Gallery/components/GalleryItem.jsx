import { Image, Skeleton } from 'antd'
import React, { useState } from 'react'

function GalleryItem({ img, ...props }) {

  return (
    <div {...props}>
      {/* <img src={img} alt='gallery_img' loading='lazy' /> */}
      <Image
        src={img}
        alt='gallery_img'
        loading='lazy'
        preview={false}
        placeholder={<Skeleton.Image active style={{ width: "200px", height: "200px" }} />}
      />
    </div>
  )
}

export default GalleryItem