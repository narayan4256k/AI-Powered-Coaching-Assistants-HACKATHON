"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

function ChatPage() {
  const { pageid } = useParams();
  const chatPageInfo = useQuery(api.Chats.getChat, { id: pageid });
  const updateConversation = useMutation(api.Chats.updateConversation);

  const [expert, setExpert] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userLiveTranscript, setUserLiveTranscript] = useState("");
  const [assistantLiveTranscript, setAssistantLiveTranscript] = useState("");
  const vapiRef = useRef(null);

  useEffect(() => {
    if (chatPageInfo) {
      const Expert = CoachingExpert.find(
        (item) => item.name === chatPageInfo.CoachingExpert
      );
      setExpert(Expert);
    }
  }, [chatPageInfo]);

  // 🚀 Start Call with dynamic assistant
  const startCall = () => {
    if (!chatPageInfo) {
      alert("Still loading session details. Please try again in a moment.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      alert("ERROR: Vapi API Key missing. Check your .env.local file.");
      return;
    }

    // ✅ Replace placeholders dynamically
    const assistantOptions = {
      name: "Ai Coach",
      firstMessage:
        `Hi! 👋 Ready to start your session on ` + chatPageInfo?.topic,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: CoachingExpert === "mathhew" ? "michael" : "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              `
          You are a supportive and patient Teacher to conduct` +
              chatPageInfo?.coachingOption +
              `.
          Your role is to help the student understand concepts clearly and confidently.

          [Style]
          - Use a warm, encouraging tone to create a safe learning space.
          - Adapt explanations to the student’s level of knowledge.
          - Be concise, clear, and use simple language.
          - Use real-life examples or analogies for better understanding.

          [Guidelines]
          1. Start with a friendly greeting: 
            Example: "Hi student  Excited to dive into ` +
              chatPageInfo?.topic +
              ` with you today."
          2. Give a short, clear explanation of the topic.
          3. Ask simple questions to check understanding.
          4. If the student seems confused, re-explain in a different way.
          5. Encourage curiosity and invite questions.
          6. Wrap up with a positive summary and next-step suggestion.

          [Error Handling]
          - If the student’s input is unclear, kindly ask them to clarify.
          - If they make a mistake, gently correct and explain why.

          Goal: 
          ✅ Make the student feel supported and motivated.
          ✅ Ensure the session on ` +
              chatPageInfo?.topic +
              ` is interactive and engaging.
          `.trim(),
          },
        ],
      },
    };

    console.log("🚀 Starting Vapi with assistant config:", assistantOptions);

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;
    setLoading(true);

    // 👇 Pass config object, not just assistantId
    vapi.start(assistantOptions);

    vapi.on("call-start", () => {
      console.log("✅ Vapi call started");
      setCallStarted(true);
      setLoading(false);
      setMessages([]);
      setUserLiveTranscript("");
      setAssistantLiveTranscript("");
    });

    vapi.on("call-end", () => {
      console.log("📞 Vapi call ended");
      setCallStarted(false);
      setLoading(false);
    });

    vapi.on("message", (message) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "partial"
      ) {
        if (message.role === "user") {
          setUserLiveTranscript(message.transcript);
        } else if (message.role === "assistant") {
          setAssistantLiveTranscript(message.transcript);
        }
      } else if (
        message.type === "transcript" &&
        message.transcriptType === "final"
      ) {
        setUserLiveTranscript("");
        setAssistantLiveTranscript("");
        setMessages((prev) => [
          ...prev,
          { role: message.role, text: message.transcript },
        ]);
      }
    });

    vapi.on("error", (e) => {
      console.error("❌ Vapi error:", JSON.stringify(e, null, 2));
    });
  };

  const endCall = async () => {
    if (vapiRef.current) {
      console.log("💾 Ending call and saving conversation...");
      try {
        await updateConversation({
          id: pageid,
          conversation: messages,
        });
        console.log("✅ Conversation saved to Convex.");
      } catch (error) {
        console.error("❌ Failed to save conversation:", error);
      } finally {
        vapiRef.current.stop();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (vapiRef.current) vapiRef.current.stop();
    };
  }, []);

  // ✅ Your JSX stays unchanged
  return (
    <div>
      <h2 className="text-lg font-bold">{chatPageInfo?.coachingOption}</h2>
      {expert && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-secondary border-2 rounded-3xl items-center justify-center flex h-[60vh] border-gray-300 flex-col relative">
              <Image
                src={expert.avatar}
                alt={expert.name}
                height={100}
                width={100}
                className={`h-[100px] w-[100px] rounded-full border-4 object-cover ${
                  callStarted
                    ? "border-green-500 animate-pulse"
                    : "border-blue-400"
                }`}
              />
              <h2 className="mt-2">{expert.name}</h2>
              <div className="p-5 bg-gray-200 px-10 rounded-lg bottom-10 right-10 absolute">
                <UserButton />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center cursor-pointer gap-4">
              {!callStarted ? (
                <Button onClick={startCall} disabled={loading}>
                  {loading ? "Connecting..." : "Start Conversation"}
                </Button>
              ) : (
                <Button variant="destructive" onClick={endCall}>
                  End Conversation
                </Button>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div>
            <div className="bg-secondary border-2 rounded-3xl flex h-[60vh] border-gray-300 flex-col p-4">
              <h2 className="text-lg font-semibold mb-2 text-center">
                📝 Conversation
              </h2>
              <div className="bg-white p-3 rounded shadow-sm flex-1 overflow-y-auto space-y-2">
                {messages.length > 0 ||
                userLiveTranscript ||
                assistantLiveTranscript ? (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <p
                          className={`p-2 rounded-lg max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <strong>
                            {msg.role === "user" ? "You: " : "AI: "}
                          </strong>
                          {msg.text}
                        </p>
                      </div>
                    ))}
                    {userLiveTranscript && (
                      <div className="flex justify-end">
                        <p className="p-2 rounded-lg max-w-[80%] bg-blue-200 text-gray-600">
                          <strong>You: </strong>
                          {userLiveTranscript}
                        </p>
                      </div>
                    )}
                    {assistantLiveTranscript && (
                      <div className="flex justify-start">
                        <p className="p-2 rounded-lg max-w-[80%] bg-gray-100 text-gray-600">
                          <strong>AI: </strong>
                          {assistantLiveTranscript}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-center my-auto">
                    Start the conversation to see the transcript....
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="p-5 px-7 text-gray-500">
                Feedback/Notes will be generated at the end of the conversation.
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
