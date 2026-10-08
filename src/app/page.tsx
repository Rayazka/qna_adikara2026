/**
 * @file    src/app/page.tsx
 * @brief   Entry route board publik yang merender BoardView
 * @author  ray
 * @created 2026-10-08
 * @todo    - Tambah metadata Open Graph agar pratinjau WA menarik
 *          - Tambah JSON-LD FAQ agar arsip mudah dicari Google
 */
// Tipis sesuai aturan MVC: seluruh logika board ada di views/BoardView.
import { BoardView } from "@/views/BoardView";

// Tujuan: jadikan / sebagai pintu masuk publik yang langsung merender board.
export default function Home() {
  return <BoardView />;
}
