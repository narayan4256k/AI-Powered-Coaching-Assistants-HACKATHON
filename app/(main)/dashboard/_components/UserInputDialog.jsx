"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "/components/ui/dialog";
import { CoachingExpert } from "/services/Options";
import Image from "next/image";
import { Button } from "/components/ui/button";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

function UserInputDialog({ children, List }) {
  const [selectedExpert, setSelectedExpert] = useState();
  const [topic,setTopic] = useState();
  const createChat = useMutation(api.Chats.createChat);
  const [loading,setLoading]= useState(false);
  const [openDialog,setOpenDialog]= useState(false);
  const router = useRouter();

  const onClickNext=async()=>{
    setLoading(true);
    const result = await createChat({
      topic:topic,
      coachingOption:List?.name,
      CoachingExpert:selectedExpert,
    })
    console.log(result);
    setLoading(false);
    setOpenDialog(false);
    router.push("chatpage/"+result);
  }
  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{List.name}</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-3">
                <h2 className="text-black">
                  Enter a topic to master your skills in {List.name}
                </h2>
                <Textarea
                  placeholder="Enter your topic here..."
                  className="mt-2" onChange={(event)=>setTopic(event.target.value)}
                />
                <h2 className="text-black mt-5">
                  Selct your Coaching Expert
                </h2>
                <div className="flex justify-evenly items-center ">
                  {CoachingExpert.map((expert, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center mt-2 cursor-pointer"
                      onClick={() => setSelectedExpert(expert.name)}
                    >
                      <div
                        className={`w-[120px] h-[120px] overflow-hidden rounded-full hover:scale-105 transition-all duration-300 mt-2
                        ${selectedExpert === expert.name ? "border-4 border-blue-400" : "border-4 border-gray-300"}`}
                      >
                        <Image
                          src={expert.avatar}
                          alt="loading..."
                          width={120}
                          height={120}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p>{expert.name}</p>
                    </div>
                  ))}
                </div>
                <div className="justify-between mt-5  flex">
                    <DialogClose asChild>
                    <Button variant={'destructive'} className="cursor-pointer hover:scale-105 transition-all">Cancel</Button>
                    </DialogClose>
                    <Button className="cursor-pointer hover:scale-105 transition-all" disabled={(!topic||!selectedExpert||loading)} onClick={()=>onClickNext()}>
                      {loading&&<Loader2 className="animate-spin"/>}
                      Submit
                      </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserInputDialog;
