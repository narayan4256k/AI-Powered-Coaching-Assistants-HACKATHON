const { defineSchema, defineTable } = require("convex/server")
const { v } = require("convex/values")

export default defineSchema({
    users:defineTable({
        name:v.string(),
        email:v.string(),
        credits:v.number(),
        subscrtiptionId:v.optional(v.string())
    })
})