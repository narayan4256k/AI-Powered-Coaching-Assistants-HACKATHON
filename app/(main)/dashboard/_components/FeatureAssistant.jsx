"use client"
import { Button } from '/components/ui/button';
import { List } from '/services/Options';
import Image from 'next/image';
import React from 'react'
import UserInputDialog from './UserInputDialog';
import { BlurFade } from '/components/ui/blur-fade';
import { useUser } from '@stackframe/stack';

function FeatureAssistant() {
  const user = useUser();
  return (
    <div>
        <BlurFade delay={1} inView>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-sm text-gray-500 lg:text-2xl'>My Workspace</h2>
              <h1 className='text-xl font-bold lg:text-4xl'>Welcome Back, <span className='text-blue-500'>{user.displayName}</span></h1>
            </div>      
              <Button>Profile</Button>
          </div>
        </BlurFade>
      <div className='grid grid-cols-2 lg:grid-cols-5  mt-5 gap-5 '>
        {List.map((option,index)=>(
          <BlurFade delay={1.5} inView>
          <div key={index} className='mt-5 p-2 bg-blue-200 rounded-2xl cursor-pointer hover:scale-105 flex flex-col justify-center items-center transition-all duration-300'>
          <UserInputDialog List={option}>
            <Image src={option.icon} alt={option.name} height={100} width={100} className='cursor-pointer flex justify-center items-center'/>
            <p className='mt-2 text-sm md:text-[17px] cursor-pointer'>{option.name}</p>
          </UserInputDialog>
          </div>
          </BlurFade>
        ))}
      </div>
    </div>
  )
}

export default FeatureAssistant