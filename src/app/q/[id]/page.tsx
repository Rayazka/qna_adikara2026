/**
 * @file    src/app/q/[id]/page.tsx
 * @brief   Entry route detail shareable yang merender DetailView per ID
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Di Next 16 params bersifat async sehingga wajib di-await sebelum dipakai.
import { DetailView } from "@/views/DetailView";

export default async function QuestionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailView questionId={id} />;
}
