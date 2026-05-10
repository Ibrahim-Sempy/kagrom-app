"use client";

export function PrintDownloadButtons({ filename }: { filename: string }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Pour générer le fichier PDF, l'assistant d'impression va s'ouvrir.\n\nVeuillez simplement choisir 'Enregistrer au format PDF' (ou 'Microsoft Print to PDF') comme destination.");
    window.print();
  };

  return (
    <div id="print-download-buttons" className="fixed top-6 right-6 flex gap-3 z-50 print:hidden">
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-md bg-[#eef2ff] border border-[#e0e7ff] px-4 py-2 text-sm font-semibold text-[#3730a3] shadow-sm hover:bg-[#e0e7ff] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimer
      </button>
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-md bg-[#385b2a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2c4721] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Télécharger (PDF)
      </button>
    </div>
  );
}
