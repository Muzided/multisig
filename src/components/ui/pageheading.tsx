import React from 'react'

const PageHeading = ({text}:{text:string}) => {
  return (
    <h1 className='text-3xl font-bold'>
      {text}
    </h1>
  )
}

export default PageHeading
