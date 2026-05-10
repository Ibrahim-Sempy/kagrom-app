/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintDownloadButtons } from "@/components/PrintDownloadButtons";

export default async function BadgePrintPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      learner: true,
      trainingSession: {
        include: { training: true },
      },
      operatorType: true,
    },
  });

  if (!enrollment) {
    notFound();
  }

  const fullName = `${enrollment.learner.firstName} ${enrollment.learner.lastName}`;

  return (
    <main className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0 flex flex-col items-center justify-center">
      <PrintDownloadButtons filename={`Badge_KAGROM_${enrollment.matricule}.pdf`} />
      
      {/* Badge Container: vertical ID card format (approx. CR80 size scaled up slightly for readability) */}
      <div className="relative mx-auto w-[380px] h-[600px] overflow-hidden bg-[#f5f3ec] print:shadow-none shadow-[0_20px_60px_rgba(34,48,38,0.18)] font-sans">
        
        {/* Top Header */}
        <div className="pt-8 px-6 text-center relative z-20">
          <div className="flex items-center justify-center gap-3">
            <div className="w-[60px] h-[60px] flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100 p-1">
              <Image src="/kagrom-mark.svg" alt="Logo" width={50} height={50} />
            </div>
            <h1 className="text-[32px] font-bold text-[#4f7f3d] tracking-tight">KAGROM SARLU</h1>
          </div>
          <p className="mt-4 text-[15px] font-bold text-[#4f7f3d] uppercase leading-[1.3] px-2 shadow-white drop-shadow-md">
            FORMATION PROFESSIONNELLE EN <br/> CONDUITE D'ENGINS LOURD
          </p>
        </div>

        {/* Background Waves */}
        {/* Orange top wave */}
        <div className="absolute top-[140px] right-[-60px] w-[500px] h-[200px] bg-[#c8872a] rounded-[40%] transform -rotate-[15deg] z-0"></div>
        
        {/* Main Green background block */}
        <div className="absolute top-[190px] left-[-50px] w-[500px] h-[300px] bg-[#4f7f3d] rounded-[30%] transform -rotate-3 z-0"></div>
        <div className="absolute top-[280px] left-0 w-full h-[180px] bg-[#4f7f3d] z-0"></div>
        
        {/* White thin separator lines to emulate image design */}
        <div className="absolute top-[215px] left-[-50px] w-[500px] h-[8px] bg-white opacity-80 transform -rotate-3 z-0 rounded-[50%]"></div>
        <div className="absolute top-[320px] left-[-50px] w-[500px] h-[6px] bg-white opacity-80 transform -rotate-1 z-0 rounded-[50%]"></div>

        {/* Bottom Cream section overlaps green smoothly */}
        <div className="absolute bottom-0 left-0 w-full h-[160px] bg-[#f5f3ec] z-0"></div>
        
        {/* Content Overlays */}
        
        {/* Photo inside circle */}
        <div className="absolute top-[160px] left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-200 z-10">
          {enrollment.learner.photoUrl ? (
            <img src={enrollment.learner.photoUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-gray-400 font-bold bg-[#eee7d8] uppercase">
              {enrollment.learner.firstName[0]}{enrollment.learner.lastName[0]}
            </div>
          )}
        </div>

        {/* Name block on green */}
        <div className="absolute top-[355px] w-full text-center z-10 px-4">
          <h2 className="text-[34px] font-bold text-[#fcefb4] leading-tight drop-shadow-md">
            {enrollment.learner.firstName} <span className="uppercase text-[#c8872a]">{enrollment.learner.lastName}</span>
          </h2>
          <p className="text-[24px] font-medium text-white/90 mt-1 drop-shadow-sm">
            {enrollment.operatorType?.name || "Opérateur"}
          </p>
        </div>

        {/* Info list on cream */}
        <div className="absolute bottom-[20px] w-full px-8 z-10 font-bold">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[14px] uppercase tracking-widest text-[#4f7f3d]/80 mb-0.5">Formation</p>
              <p className="text-[20px] text-[#c8872a] leading-tight">{enrollment.trainingSession.training.title}</p>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[14px] uppercase tracking-widest text-[#4f7f3d]/80 mb-0.5">Matricule</p>
                <p className="text-[19px] text-[#c8872a] leading-none">{enrollment.matricule}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] uppercase tracking-widest text-[#4f7f3d]/80 mb-0.5">Session</p>
                <p className="text-[22px] text-[#c8872a] leading-none">{enrollment.trainingSession.sessionNumber}</p>
              </div>
            </div>
          </div>
          
          {/* Dashed divider */}
          <div className="w-full border-t-2 border-dashed border-[#4f7f3d] mt-5 mb-3 opacity-50"></div>
          
          <div className="flex justify-center items-center gap-2">
            <span className="text-[14px] uppercase tracking-widest text-[#4f7f3d]/80">Contact :</span>
            <span className="text-[18px] text-[#c8872a]">{enrollment.learner.phone}</span>
          </div>
        </div>

      </div>
    </main>
  );
}
