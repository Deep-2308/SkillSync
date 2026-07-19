import type { Types } from "mongoose";

import { Notification } from "@/models/Notification";

/**
 * Fire-and-forget notification fan-out used by API mutations (contract status
 * changes, review prompts, etc.). Failures are logged, never thrown — a broken
 * notification must not fail the business operation that triggered it.
 */
export async function notify(
  userIds: Array<string | Types.ObjectId>,
  payload: {
    type:
      | "contract_update"
      | "review_prompt"
      | "review_received"
      | "proposal_received"
      | "proposal_update"
      | "new_message"
      | "system";
    title: string;
    body?: string;
    link?: string;
  }
): Promise<void> {
  try {
    await Notification.insertMany(
      userIds.map((userId) => ({ userId, ...payload })),
      { ordered: false }
    );
  } catch (error) {
    console.error("[notify] Failed to create notifications:", error);
  }
}
