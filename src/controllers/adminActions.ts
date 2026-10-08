/**
 * @file    src/controllers/adminActions.ts
 * @brief   Server Actions admin untuk dipanggil langsung dari komponen server
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Bungkus tipis di atas adminController agar dashboard (/admin) bisa memicu aksi
// tanpa API route tambahan. "use server" menandai file ini hanya jalan di server.
"use server";

import { revalidatePath } from "next/cache";
import {
  deleteQuestion,
  deleteReply,
  markOfficial,
  moveCategory,
  toggleAnswered,
  togglePin,
} from "./adminController";

function forbiddenMessage(error: unknown): never {
  if (error instanceof Error && error.message === "FORBIDDEN") {
    throw new Error("Khusus admin. Silakan login dulu.");
  }
  throw error;
}

export async function actionMarkOfficial(questionId: string, replyId: string): Promise<void> {
  try {
    await markOfficial(questionId, replyId);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath("/");
  revalidatePath(`/q/${questionId}`);
}

export async function actionTogglePin(questionId: string, pinned: boolean): Promise<void> {
  try {
    await togglePin(questionId, pinned);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function actionToggleAnswered(questionId: string, answered: boolean): Promise<void> {
  try {
    await toggleAnswered(questionId, answered);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function actionMoveCategory(questionId: string, slug: string): Promise<void> {
  try {
    await moveCategory(questionId, slug);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function actionDeleteQuestion(questionId: string): Promise<void> {
  try {
    await deleteQuestion(questionId);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function actionDeleteReply(questionId: string, replyId: string): Promise<void> {
  try {
    await deleteReply(replyId);
  } catch (error) {
    forbiddenMessage(error);
  }
  revalidatePath(`/q/${questionId}`);
  revalidatePath("/admin");
}
