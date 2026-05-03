import mongoose, { Schema, Document, Types } from "mongoose";

// ─── TypeScript Interface ───
export interface IProductInstance extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  integrations: {
    shopify: boolean;
    crm: boolean;
  };
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───
const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    integrations: {
      shopify: {
        type: Boolean,
        default: false,
      },
      crm: {
        type: Boolean,
        default: false,
      },
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───
ProductInstanceSchema.index({ projectId: 1 });

export const ProductInstance =
  mongoose.models.ProductInstance ||
  mongoose.model<IProductInstance>("ProductInstance", ProductInstanceSchema);
