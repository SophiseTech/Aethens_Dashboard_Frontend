import React from 'react'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

function MasonryLayout({ customBreakPoiints = {}, gutterBreakpoins = {}, children }) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, ...customBreakPoiints }}
      gutterBreakpoints={{ 350: "12px", 750: "16px", 900: "24px", ...gutterBreakpoins }}
    >
      <Masonry>
        {children}
      </Masonry>
    </ResponsiveMasonry>
  )
}

export default MasonryLayout