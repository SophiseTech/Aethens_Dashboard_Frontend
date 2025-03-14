import ImgCrop from 'antd-img-crop'
import React from 'react'

function ImageCropWrapper({cropImage, children, squareCrop}) {
  if(cropImage) return <ImgCrop showGrid aspectSlider={!squareCrop} showReset>{children}</ImgCrop>
  return children
}

export default ImageCropWrapper