const mongoose = require("mongoose");

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "usersSocial",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "usersSocial",
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "usersSocial",
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true,
    collection: "postschemas",
  }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
