import mongoose, { Schema, Document, Types } from "mongoose";

// ─── TypeScript Interface ───
export interface IConversation extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  title: string;
  isArchived: boolean;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───
const ConversationSchema = new Schema<IConversation>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productInstanceId: {
      type: Schema.Types.ObjectId,
      ref: "ProductInstance",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Conversation",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
ConversationSchema.index({ projectId: 1, userId: 1 });
ConversationSchema.index({ projectId: 1, lastMessageAt: -1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
