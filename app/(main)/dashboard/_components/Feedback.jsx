"use client"
import { UserContext } from '@/app/_context/UserContext';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { List } from '@/services/Options';
import { useConvex } from 'convex/react'
import moment from 'moment';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react'

function Feedback() {
 
   const Convex = useConvex();
   const {userData} = useContext(UserContext);
   const [list,setList]=useState([]);
 
   useEffect(()=>{
       userData&&getAllChatData()&&getImage();
   })
 
   const getAllChatData=async()=>{
       const result = await Convex.query(api.Chats.getAllChatData,{
         uid:userData?._id
       });
       console.log(result);
       setList(result);
   }
 
   const getImage = (option)=>{
       const coachingOption = List.find((item)=>item.name==option)
       return coachingOption?.icon;
   }
 
   const viewNotes = ()=>{
     
   }
 
   return (
     <div className='bg-gray-200 min-h-[150px] p-5 rounded-xl'>
         <h2 className='font-bold text-xl md:text-2xl mb-2 '>Your Previous Feedback</h2>
         {list?.length==0&&<h2 className='text-gray-500'>You don't have any Feedback </h2>}
         <div>
           {list.map((item,index)=>(item.coachingOption=='Ques Ans Prep'||item.coachingOption=='Mock Interview')&&
           (
               <div key={index} className='mt-2 border-2 border-neutral-400 rounded-2xl group p-2 px-4 hover:scale-105 transition-all duration-300 flex items-center justify-between'>
                 <div className='flex gap-7 items-center'>
                   <Image src={getImage(item.coachingOption)} height={60} width={60} alt='loading...' />                
                 <div>
                   <h2 className='font-bold text-xl'>{item.topic}</h2>
                   <h2 className='text-neutral-500'>{item.coachingOption}</h2>
                   <h2 className='text-neutral-500 text-sm'>{moment(item._creationTime).fromNow()}</h2>
                 </div>
                 </div>
                 <Button className={"hover:cursor-pointer invisible group-hover:visible"} variant="outline" onClick={viewNotes}>View Feedback</Button>
               </div>
           ))}     
           </div>   
         
     </div>
   )
}

export default Feedback