/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      enrollment: {
        include: {
          learner: true,
          trainingSession: {
            include: { training: true },
          },
          operatorType: true,
          durationOption: true,
          trainingLocation: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrCode = await QRCode.toDataURL(`${baseUrl}/verification/${certificate.verificationCode}`);
  
  const learner = certificate.enrollment.learner;
  const session = certificate.enrollment.trainingSession;
  const training = session.training;
  const duration = certificate.enrollment.durationOption?.label || `${training.durationDays} Jours`;
  const location = certificate.enrollment.trainingLocation?.name || session.location || "Conakry/Boké";
  
  const formattedScore = decimalToNumber(certificate.enrollment.averageScore);
  let mention = "PASSABLE";
  if (formattedScore >= 16) mention = "TRÈS BIEN";
  else if (formattedScore >= 14) mention = "BIEN";
  else if (formattedScore >= 12) mention = "ASSEZ BIEN";

  const dob = learner.birthDate ? formatDate(learner.birthDate).split(' ')[0] : "............";
  const pob = learner.birthPlace ? learner.birthPlace : "............";

  return (
    <main className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0 flex items-center justify-center">
      {/* Certificate Container: Standard A4 Landscape */}
      <div className="relative mx-auto w-[297mm] h-[210mm] bg-[#FCFAF5] overflow-hidden shadow-2xl print:shadow-none bg-white font-display text-[#112240]">
        
        {/* Background decorative corners - Top Left */}
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none opacity-90">
          <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
            <path d="M0 0 L100 0 C100 0 70 30 0 80 Z" fill="#0b3f27" />
            <path d="M0 0 L80 0 C80 0 50 20 0 60 Z" fill="#c49b38" />
            <path d="M0 0 L60 0 C60 0 30 10 0 40 Z" fill="#0b3f27" />
          </svg>
        </div>
        {/* Background decorative corners - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none opacity-90 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
            <path d="M0 0 L100 0 C100 0 70 30 0 80 Z" fill="#0b3f27" />
            <path d="M0 0 L80 0 C80 0 50 20 0 60 Z" fill="#c49b38" />
            <path d="M0 0 L60 0 C60 0 30 10 0 40 Z" fill="#0b3f27" />
          </svg>
        </div>
        
        {/* Border graphic representations */}
        <div className="absolute left-[30px] bottom-[30px] h-[70vh] w-[40px] border-l-4 border-[#c49b38] opacity-50"></div>
        <div className="absolute right-[30px] bottom-[30px] h-[70vh] w-[40px] border-r-4 border-[#c49b38] opacity-50"></div>

        <div className="relative z-10 w-full h-full px-16 py-12 flex flex-col items-center">
          
          {/* Main header text */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold uppercase tracking-wide">REPUBLIQUE DE GUINEE</h1>
            <p className="text-sm font-bold">
              <span className="text-[#a41034]">Travail</span>-
              <span className="text-[#fcd116]">Justice</span>-
              <span className="text-[#009460]">Solidarité</span>
            </p>
            <p className="font-semibold text-[16px] text-[#112240] pt-2">
              Ministère de l'Enseignement Technique De la Formation Professionnelle et de l'Emploi
            </p>
            <p className="font-semibold text-[15px] text-[#112240]">
              Centre de Formation en Conduite d'Engins Lourds
            </p>
          </div>

          {/* Sub Header row: Logo, Title, Ribbon, Photo */}
          <div className="w-full relative mt-6 flex flex-col items-center">
            
            {/* Absolute positioning for corners elements */}
            <div className="absolute left-0 top-0 flex items-center gap-3">
              <Image src="/kagrom-mark.svg" alt="KAGROM" width={50} height={50} />
              <span className="text-[#c49b38] font-bold text-lg font-serif">KAGROM SARLU</span>
            </div>
            
            {/* Seal image pseudo */}
            <div className="absolute right-36 top-[-10px] w-14 h-14 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-full shadow-lg flex items-center justify-center border-2 border-[#d4af37]">
               <div className="w-10 h-10 border border-[#b8860b] rounded-full"></div>
            </div>

            {/* Learner photo */}
            {learner.photoUrl ? (
              <div className="absolute right-0 top-[-20px] w-[110px] h-[130px] overflow-hidden border-2 border-gray-300 shadow-md">
                <img src={learner.photoUrl} alt="Learner" className="w-full h-full object-cover" />
              </div>
            ) : (
               <div className="absolute right-0 top-[-20px] w-[110px] h-[130px] border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  Photo
               </div>
            )}

            <h2 className="text-[#202b5d] text-4xl font-bold uppercase pt-6">CERTIFICAT</h2>
            
            {/* Gold Ribbon wrapping text */}
            <div className="mt-4 relative bg-[#c49b38] px-10 py-2 inline-block">
               {/* left chevron cut */}
               <div className="absolute left-[-20px] top-0 w-0 h-0 border-t-[23px] border-t-transparent border-b-[23px] border-b-transparent border-r-[20px] border-r-[#c49b38]"></div>
               {/* right chevron cut */}
               <div className="absolute right-[-20px] top-0 w-0 h-0 border-t-[23px] border-t-transparent border-b-[23px] border-b-transparent border-l-[20px] border-l-[#c49b38]"></div>
               <p className="text-[#112240] text-[15px] font-bold text-center leading-snug">
                 D'APTITUDE PROFESSIONNELLE <br/>
                 EN CONDUITE D'ENGINS DE CHANTIER OU MINIER
               </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="w-full mt-8 max-w-[90%] space-y-4">
            <p className="text-[17px] text-[#202b5d] font-bold text-center">
              Nous soussignés, direction de KAGROM SARLU, certifions que:
            </p>
            
            <h3 className="text-center text-3xl font-bold text-[#202b5d] uppercase tracking-wide my-4">
              {learner.firstName} {learner.lastName}
            </h3>

            <div className="flex justify-between items-center text-[16px] font-bold text-[#202b5d] px-8">
              <div>
                <span className="underline decoration-[#202b5d]">Date et lieu de naissance :</span>
                <span className="ml-2 font-normal text-black">{dob} à {pob}</span>
              </div>
              <div>
                <span className="underline decoration-[#202b5d]">NATIONALITE :</span>
                <span className="ml-2 font-normal text-black uppercase">GUINEENNE</span>
              </div>
            </div>

            <div className="text-[16px] font-bold text-[#202b5d] px-8 mt-2">
              <span className="underline decoration-[#202b5d] uppercase">MATRICULE:</span>
              <span className="ml-2 font-normal text-black">{certificate.enrollment.matricule}</span>
            </div>

            <div className="text-[16px] font-bold text-[#202b5d] text-center mt-6">
              A SUIVI AVEC SUCCÈS LA FORMATION PROFESSIONNELLE EN <span className="text-[#c49b38]">{training.title.toUpperCase()}</span>,
              <br/>
              <span className="underline decoration-[#202b5d]">OPTION:</span> {certificate.enrollment.operatorType?.name?.toUpperCase() || "CONDUCTEUR"}
            </div>

            {/* Divider */}
            <div className="relative mt-8 mb-4 flex items-center">
               <span className="text-[#202b5d] font-bold text-lg underline uppercase pr-4 whitespace-nowrap">DETAIL DE LA FORMATION</span>
               <div className="w-full border-t-2 border-[#202b5d]"></div>
            </div>

            {/* details & footer area */}
            <div className="w-full flex justify-between relative mt-4">
              <div className="space-y-1 text-[15px] font-bold text-[#202b5d]">
                <div><span className="underline">Lieu de formation</span> : <span className="font-normal text-black">{location}</span></div>
                <div><span className="underline">Durée:</span> <span className="font-normal text-black">{duration}</span></div>
                <div><span className="underline">Type:</span> <span className="font-normal text-black">{certificate.enrollment.operatorType?.name || "Opérateur"} en {training.title}</span></div>
                <div><span className="underline">Mention:</span> <span className="font-normal text-black">{mention}</span></div>
              </div>

              <div className="absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center p-1 bg-white border border-gray-300">
                <img src={qrCode} alt="QR Code" width={80} height={80} />
              </div>

              <div className="text-right text-[#202b5d] font-bold text-[16px] pt-2">
                <p>LE DIRECTEUR GENERAL</p>
                <div className="h-16"></div> {/* signature space */}
                <p>ADRIEN KINOMY</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 w-full text-center text-xs font-bold text-[#202b5d]">
            <p>KAGROM-SARLU RCCM:GN.TCC.2025.18254 Adresse : T6,Conakry,Guinée</p>
            <p>Tel:+224 612 50 36 48 / 663 22 31 31</p>
          </div>
        </div>
      </div>
    </main>
  );
}
