import React from 'react'

const PageHeading = ({text}:{text:string}) => {
  return (
    <h1 className='text-3xl font-bold mb-6 '>
      {text}
    </h1>
  )
}

export default PageHeading
