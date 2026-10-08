/**
 * @file    src/app/q/[id]/page.tsx
 * @brief   Entry route detail shareable yang merender DetailView per ID
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah generateMetadata dinamis berisi isi pertanyaan
 *          - Validasi format UUID sebelum render untuk 404 lebih cepat
 */
// Di Next 16 params bersifat async sehingga wajib di-await sebelum dipakai.
import { DetailView } from "@/views/DetailView";

// Tujuan: buka params async Next 16 lalu teruskan id ke DetailView.
export default async function QuestionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailView questionId={id} />;
}
