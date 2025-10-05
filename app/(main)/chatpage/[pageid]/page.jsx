"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { AIModelToGenerateFeedback } from "@/services/GlobalServices"; 
import { LoaderCircle, Loader2 } from "lucide-react";
import { getVapiConfig } from "@/services/Vapi"; // Assumed path
import { toast } from "sonner";

function ChatPage() {
  const { pageid } = useParams();
  const chatPageInfo = useQuery(api.Chats.getChat, { id: pageid });
  const updateConversation = useMutation(api.Chats.updateConversation);
  // 🌟 FIX 1: Import the save feedback mutation 🌟
  const saveFeedback = useMutation(api.Chats.updateFeedback); 

  const [expert, setExpert] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userLiveTranscript, setUserLiveTranscript] = useState("");
  const [assistantLiveTranscript, setAssistantLiveTranscript] = useState("");
  const vapiRef = useRef(null);
  const [fedbackNotes, setFedbackNotes] = useState(false);
  const router = useRouter();
  const [aiNotes, setAiNotes] = useState(null); 

  useEffect(() => {
    if (chatPageInfo) {
      const Expert = CoachingExpert.find(
        (item) => item.name === chatPageInfo.CoachingExpert
      );
      setExpert(Expert);
    }
  }, [chatPageInfo]);


  // generate notes function
  const generateFeedbackNotes = async () => {
    setNotesLoading(true);
    setAiNotes(null); 
    
    let generatedNotes = null; // 🌟 Local variable to capture the AI response 🌟

    try {
      if (!chatPageInfo || !chatPageInfo.conversation) {
          throw new Error("Chat session data or conversation history is missing.");
      }
      
      const result = await AIModelToGenerateFeedback(
        chatPageInfo.coachingOption,
        chatPageInfo.conversation
      );
      
      // Step 1: Process AI Response
      if (result && result.content) {
        generatedNotes = result.content;
        setAiNotes(generatedNotes);      // Update state for UI display
        console.log("Generated Notes:", generatedNotes);
      } else {
        const errorMsg = "Sorry, the AI model returned an empty response.";
        setAiNotes(errorMsg);
        generatedNotes = errorMsg; 
        console.error("AI Model Response Missing Content:", result);
      }
    } catch (error) {
      console.error("Error generating notes:", error);
      const errorMsg = "An error occurred while generating notes.";
      setAiNotes(errorMsg);
      generatedNotes = errorMsg;
    }
    
    // 🌟 Step 2: Save Notes to Convex 🌟
    // FIX 2: Use the local 'generatedNotes' variable to ensure correct data is saved
    if (generatedNotes) {
      try{
        await saveFeedback({
          id: pageid,
          feedback: generatedNotes, 
        });
        console.log("✅ Feedback successfully saved to Convex.");
        toast("Feedback/Notes Generated Successfully")
      } catch(e) {
        console.error("❌ Failed to save feedback to Convex:", e);
        toast("Internal Server Error")
      }
    }
    setNotesLoading(false);
    router.replace("/dashboard")
  };


  const startCall = () => {
    if (!chatPageInfo || !expert) {
        alert("Loading session details or expert info. Please try again in a moment.");
        return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      alert("ERROR: Vapi API Key missing. Check your .env.local file.");
      return;
    }

    // Use dynamic Vapi configuration
     const { systemPrompt, firstMessage } = getVapiConfig(
            chatPageInfo.coachingOption, 
            chatPageInfo.topic
        );
    
    
    setAiNotes(null); 
    setFedbackNotes(false);

    const assistantOptions = {
      name: "Ai Coach",
      firstMessage:firstMessage, // Dynamic first message
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "11labs",
        voiceId: expert.voiceId,
        speed: 0.8,
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:systemPrompt.trim(), // Dynamic system prompt
          },
        ],
      },
    };

    console.log("🚀 Starting Vapi with assistant config:", assistantOptions);

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;
    setLoading(true);

    vapi.start(assistantOptions);

    vapi.on("call-start", () => {
      console.log("✅ Vapi call started");
      setCallStarted(true);
      setLoading(false);
      setMessages([]);
      setUserLiveTranscript("");
      setAssistantLiveTranscript("");
      toast("Connected");
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
      // Stop the call and reset UI state on error
      if (vapiRef.current) vapiRef.current.stop(); 
      setLoading(false);
      setCallStarted(false);
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
    toast("Disconnected");
    setFedbackNotes(true);
  };

  useEffect(() => {
    return () => {
      if (vapiRef.current) vapiRef.current.stop();
    };
  }, []);

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
                <Button onClick={startCall} disabled={loading || !expert}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Start Conversation"
                  )}
                </Button>
              ) : (
                <Button variant="destructive" onClick={endCall}>
                  End Conversation
                </Button>
              )}
            </div>

            
            {/* {aiNotes && (
              <div className="mt-8 p-6 bg-white border border-gray-300 rounded-lg shadow-xl">
                <h3 className="text-xl font-bold mb-3 text-center text-blue-700">
                    {chatPageInfo?.coachingOption === 'Mock Interview' || chatPageInfo?.coachingOption === 'Ques Ans Prep' || chatPageInfo?.coachingOption === 'Language skill'
                        ? 'Feedback and Improvement Space' 
                        : 'Session Notes'} 
                </h3>
                
                <div className="text-gray-700 whitespace-pre-wrap">
                    {aiNotes}
                </div>
              </div>
            )} */}
            
          </div>

          {/* Right Side: Conversation Transcript */}
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
            <div className="flex justify-center items-center mt-5">
              {!fedbackNotes ? (
                <h2 className=" px-7 text-gray-500" disabled={notesLoading}>
                  Feedback/Notes will be generated at the end of the conversation.
                </h2>
              ) : (
                // Disabled button prevents multiple simultaneous generation requests
                <Button onClick={generateFeedbackNotes} disabled={notesLoading}> 
                  {notesLoading && <LoaderCircle className="animate-spin mr-2" />}
                  {notesLoading ? "Generating..." : "Generate Feedback/Notes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;