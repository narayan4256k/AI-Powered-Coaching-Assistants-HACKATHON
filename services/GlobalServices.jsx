import axios from "axios";
import { CoachingExpert, List } from "./Options";
import OpenAI from "openai";

export const getToken = async () => {
  const result = await axios.get("/api/getToken");
  return result.data;
};

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
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
        {
          role: "system",
          content: `
            You are an expert coach and you conducted a ${topic} session. Based on the full conversation between student and AI, 
            write detailed, insightful feedback summarizing what was discussed and 
            suggest how the student can improve next time.
            Focus on clarity, engagement, and personalized learning tips.
          `.trim(),
        },
        ...formattedConversation,
        {
          role: "user",
          content: `Now, please generate feedback/notes based on the above conversation using this guide:\n${prompt}`,
        },
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
