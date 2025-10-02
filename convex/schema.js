const { defineSchema, defineTable } = require("convex/server");
const { v } = require("convex/values");

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    subscrtiptionId: v.optional(v.string()),
  }),
  chats: defineTable({
    coachingOption: v.string(),
    CoachingExpert: v.string(),
    topic: v.string(),
    conversation: v.optional(v.any()),
  }),
});
