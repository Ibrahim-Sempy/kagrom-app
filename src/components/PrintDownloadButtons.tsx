"use client";

import { useRouter } from "next/navigation";

export function PrintDownloadButtons({ filename }: { filename?: string }) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-download-buttons" className="fixed top-6 right-6 flex gap-3 z-50 print:hidden">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-md bg-white border border-[#e0e7ff] px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Retour
      </button>
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-md bg-[#385b2a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2c4721] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimer
      </button>
    </div>
  );
}
