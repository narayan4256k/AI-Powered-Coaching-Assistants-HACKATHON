"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { CoachingExpert } from "@/services/Options";
import { UserButton } from "@stackframe/stack";
import { useQuery } from "convex/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

function ChatPage() {
  const { pageid } = useParams();
  const chatPageInfo = useQuery(api.Chats.getChat, { id: pageid });
  const [expert, setExpert] = useState();
  const [enabledMic, setEnabledMic] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);

  // Load expert details
  useEffect(() => {
    if (chatPageInfo) {
      const Expert = CoachingExpert.find(
        (item) => item.name === chatPageInfo.CoachingExpert
      );
      setExpert(Expert);
    }
  }, [chatPageInfo]);

  // Setup SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn(" Speech Recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; 

      recognition.onstart = () => {
        console.log("🎤 Recognition started");
      };

      recognition.onresult = (event) => {
        let liveTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(liveTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onaudioend = () => {
        console.log(" Audio capturing ended");
      };

      recognition.onspeechend = () => {
        console.log("Speech ended");
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        if (enabledMic) {
          console.log("Restarting recognition...");
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [enabledMic]);

  // Setup mic visualizer
  useEffect(() => {
    let rafId;
    if (enabledMic) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          console.log("🎤 Raw mic access OK:", stream);
          micStreamRef.current = stream;

          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
          const source = audioContextRef.current.createMediaStreamSource(stream);

          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            let values = 0;
            for (let i = 0; i < bufferLength; i++) {
              values += dataArray[i];
            }
            let avg = values / bufferLength;
            setVolume(avg);
            rafId = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        })
        .catch((err) => {
          console.error(" Mic access error:", err);
        });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabledMic]);

  const connectToServer = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setEnabledMic(true);
        console.log(" Mic connected & SpeechRecognition started");
      } catch (err) {
        console.error(" Failed to start recognition:", err);
      }
    }
  };

  const disconnect = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setEnabledMic(false);
    console.log(" Mic disconnected & SpeechRecognition stopped");
  };

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
                alt="loading..."
                height={100}
                width={100}
                className="h-[100px] w-[100px] rounded-full border-4 border-blue-400 object-cover animate-pulse"
              />
              <h2 className="mt-2">{expert.name}</h2>
              <div className="p-5 bg-gray-200 px-10 rounded-lg bottom-10 right-10 absolute">
                <UserButton />
              </div>
            </div>

            {/* Mic Controls */}
            <div className="mt-5 flex items-center justify-center cursor-pointer gap-4">
              {!enabledMic ? (
                <Button onClick={connectToServer}>Start Recording</Button>
              ) : (
                <Button variant="destructive" onClick={disconnect}>
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div>
            <div className="bg-secondary border-2 rounded-3xl flex h-[60vh] border-gray-300 flex-col p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">📝 Chat Section</h2>
              <div className="bg-white p-3 rounded shadow-sm flex-1 overflow-y-auto">
                {transcript ? (
                  <p className="text-gray-800">{transcript}</p>
                ) : (
                  <p className="text-gray-400">
                    Start speaking to see transcription...
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="p-5 px-7 text-gray-500">
                Feedback/Notes will be generated at the end of the conversation
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
 