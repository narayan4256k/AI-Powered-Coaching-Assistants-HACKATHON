import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const createChat = mutation({
  args: {
    coachingOption: v.string(),
    CoachingExpert: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("chats", {
      coachingOption: args.coachingOption,
      topic: args.topic,
      CoachingExpert: args.CoachingExpert,
    });
    return result;
  },
});


export const getChat = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    return result;
  },
});


export const updateConversation = mutation({
  args: {
    id: v.id("chats"),
    conversation: v.array(
      v.object({
        role: v.string(),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, conversation } = args;
    await ctx.db.patch(id, {
      conversation: conversation,
    });
    console.log(`Updated conversation for chat ID: ${id}`);
  },
});