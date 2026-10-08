/**
 * @file    src/app/page.tsx
 * @brief   Entry route board publik yang merender BoardView
 * @author  ray
 * @created 2026-10-08
 * @todo    none
 */
// Tipis sesuai aturan MVC: seluruh logika board ada di views/BoardView.
import { BoardView } from "@/views/BoardView";

export default function Home() {
  return <BoardView />;
}
