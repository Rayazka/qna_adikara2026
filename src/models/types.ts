/**
 * @file    src/models/types.ts
 * @brief   Definisikan tipe baris DB untuk seluruh layer MVC QnA ADIKARA
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah tipe PaginatedResult saat list melebihi 100 baris
 *          - Sinkronkan tipe dengan generate supabase-types bila skema berubah
 */
// Tipe tunggal kebenaran: Model mengembalikan tipe ini, Controller/View mengonsumsinya.
// created_at memakai string ISO agar aman lewat batas server/client Next.js.
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Question {
  id: string;
  nama_penanya: string;
  isi: string;
  category_id: string;
  is_pinned: boolean;
  is_answered: boolean;
  vote_count: number;
  created_at: string;
  categories?: Pick<Category, "name" | "slug"> | null;
  replies?: Reply[] | null;
}

export interface Reply {
  id: string;
  question_id: string;
  nama: string;
  isi: string;
  is_admin: boolean;
  is_official: boolean;
  created_at: string;
}
