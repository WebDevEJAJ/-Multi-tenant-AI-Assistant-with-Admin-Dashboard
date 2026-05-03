import mongoose, { Schema, Document, Types } from "mongoose";

// ─── TypeScript Interface ───
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  avatarUrl?: string;
  projectRoles: {
    projectId: Types.ObjectId;
    role: "admin" | "member" | "viewer";
  }[];
  isGlobalAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    projectRoles: [
      {
        projectId: {
          type: Schema.Types.ObjectId,
          ref: "Project",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member", "viewer"],
          default: "member",
        },
      },
    ],
    isGlobalAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
UserSchema.index({ "projectRoles.projectId": 1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
