import { UserButton } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'

function AppHeader() {
  return (
    <div className='m-3  md:mx-10 lg:mx-20 xl:25 border-3 bg-gray-100 border-gray-300 rounded-4xl flex justify-between pr-10'>
        <Image src={"/lightlogo.png"} alt='loading...' height={70} width={120} className='ml-5 md:ml-10 h-[70px] w-[80px]'/>
        <UserButton/>
    </div>
  )
}

export default AppHeader