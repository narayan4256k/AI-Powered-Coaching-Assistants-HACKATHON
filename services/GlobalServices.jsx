import axios from "axios";
import { CoachingExpert, List } from "./Options";
import OpenAI from "openai";

export const getToken = async () => {
  const result = await axios.get("/api/getToken");
  return result.data;
};

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/2343674",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

export const AIModelToGenerateFeedback = async (
  coachingOption,
  conversation
) => {
  try {
    const option = List.find((item) => item.name === coachingOption);
    const prompt =option?.summeryPrompt;
    const topic = option?.name;

    // 🔧 Convert conversation format
    const formattedConversation = conversation.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

    // 🧩 Add system and task prompt
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        ...formattedConversation,
      ],
    });

    const finalMsg = completion.choices?.[0]?.message?.content?.trim();
    console.log("✅ AI Feedback:", finalMsg);
    return { content: finalMsg || "No content returned from model." };
  } catch (error) {
    console.error("❌ AI Feedback Generation Error:", error);
    return { content: "Error generating AI feedback." };
  }
};
