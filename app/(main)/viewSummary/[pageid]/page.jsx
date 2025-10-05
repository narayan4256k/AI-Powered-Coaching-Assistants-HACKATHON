"use client";
import { api } from "@/convex/_generated/api";
import { List } from "@/services/Options";
import { useQuery } from "convex/react";
import moment from "moment";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import SummaryBox from "./SummaryBox";
import ChatBox from "./ChatBox";

function viewSummary() {
  const { pageid } = useParams();
  const chatPageInfo = useQuery(api.Chats.getChat, { id: pageid });
  console.log(chatPageInfo);
  const getImage = (option) => {
    const coachingOption = List.find((item) => item.name == option);
    return coachingOption?.icon;
  };
  return (
    <div className="-mt-7">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-7">
          <Image
            src={getImage(chatPageInfo?.coachingOption)}
            height={100}
            width={100}
            alt="loading..."
            className="rounded-full"
          />
          <div>
            <h2 className="font-bold text-xl">{chatPageInfo?.topic}</h2>
            <h2 className="text-neutral-500">{chatPageInfo?.coachingOption}</h2>
          </div>
        </div>
        <h2 className="text-neutral-500 text-xl">
          {moment(chatPageInfo?._creationTime).fromNow()}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mt-5">
        <div className="col-span-3">
          <SummaryBox summary={chatPageInfo?.feedback} />
        </div>
        <div className="col-span-2">
          <ChatBox Chats={chatPageInfo?.conversation} />
        </div>
      </div>
    </div>
  );
}

export default viewSummary;
