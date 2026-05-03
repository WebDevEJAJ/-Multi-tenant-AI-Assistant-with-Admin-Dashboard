/**
 * INTEGRATION SERVICE
 *
 * Business logic for managing product instance integrations.
 */

import { connectDB } from "@/lib/db/connection";
import { ProductInstance } from "@/lib/db/models";
import { Types } from "mongoose";

export async function getProductInstance(projectId: string) {
  await connectDB();
  const instance = await ProductInstance.findOne({
    projectId: new Types.ObjectId(projectId),
  }).lean();

  if (!instance) {
    throw new Error("Product instance not found");
  }

  return instance;
}

export async function updateIntegrations(
  productInstanceId: string,
  integrations: { shopify: boolean; crm: boolean }
) {
  await connectDB();
  const instance = await ProductInstance.findByIdAndUpdate(
    productInstanceId,
    { integrations },
    { new: true }
  ).lean();

  if (!instance) {
    throw new Error("Product instance not found");
  }

  return instance;
}

export async function getProductInstanceByProject(projectId: string) {
  await connectDB();
  const instance = await ProductInstance.findOne({
    projectId: new Types.ObjectId(projectId),
  }).lean();

  return instance;
}
