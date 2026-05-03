import mongoose, { Schema, Document, Types } from "mongoose";

// ─── TypeScript Interface ───
export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  projectId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: {
    model?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    integrationDataUsed?: string[];
  };
  createdAt: Date;
}

// ─── Mongoose Schema ───
const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      model: String,
      tokensUsed: Number,
      processingTimeMs: Number,
      integrationDataUsed: [String],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ───
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
