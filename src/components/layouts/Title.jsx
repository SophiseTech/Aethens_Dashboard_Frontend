import React from 'react'

function Title({ title, button, children }) {
  return (
    <div className='flex flex-col pb-5 h-full | pt-5 max-lg:px-5 lg:pr-5 gap-5 2xl:pt-10 2xl:gap-10'>
      <div className='flex justify-between items-center'>
        <h1 className='font-bold | text-xl 2xl:text-3xl'>{title}</h1>
        <div className='max-lg:pr-10 | lg:w-1/2 lg:flex lg:justify-end'>
          {button}
        </div>
      </div>
      {children}
    </div>
  )
}

export default Title