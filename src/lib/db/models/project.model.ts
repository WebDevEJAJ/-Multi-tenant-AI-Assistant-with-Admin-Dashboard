import mongoose, { Schema, Document, Types } from "mongoose";

// ─── TypeScript Interface ───
export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  ownerId: Types.ObjectId;
  settings: {
    aiModel: string;
    maxTokens: number;
    systemPrompt: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───
const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    settings: {
      aiModel: {
        type: String,
        default: "gemini-2.0-flash",
      },
      maxTokens: {
        type: Number,
        default: 2048,
      },
      systemPrompt: {
        type: String,
        default:
          "You are a helpful AI assistant. Answer questions clearly and concisely.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
