import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate } from "@/lib/utils";

export default async function RelevePrintPage({
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
      trainingModule: true,
    },
  });

  if (!enrollment) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // The QR code can link to the verification page using the enrollment ID or a custom route
  const qrCode = await QRCode.toDataURL(`${baseUrl}/verification/releve/${enrollment.id}`);
  
  const learner = enrollment.learner;
  const session = enrollment.trainingSession;
  const training = session.training;
  
  const scoreTheory = decimalToNumber(enrollment.scoreTheory);
  const scorePractical = decimalToNumber(enrollment.scorePractical);
  const averageScore = decimalToNumber(enrollment.averageScore);
  
  let mention = "NON VALIDÉ";
  if (averageScore >= 16) mention = "TRÈS BIEN";
  else if (averageScore >= 14) mention = "BIEN";
  else if (averageScore >= 12) mention = "ASSEZ BIEN";
  else if (averageScore >= 10) mention = "PASSABLE";

  const dob = learner.birthDate ? formatDate(learner.birthDate).split(' ')[0] : "............";
  const pob = learner.birthPlace ? learner.birthPlace : "............";
  const sessionDates = `${formatDate(session.startDate)} au ${formatDate(session.endDate)}`;

  return (
    <main className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0 flex items-center justify-center">
      {/* Relevé Container: Standard A4 Portrait */}
      <div className="relative mx-auto w-[210mm] h-[297mm] bg-white overflow-hidden shadow-2xl print:shadow-none font-display text-[#112240]">
        
        {/* Border Graphic */}
        <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-r from-[#0b3f27] via-[#c49b38] to-[#0b3f27]"></div>
        <div className="absolute bottom-0 left-0 w-full h-[15px] bg-gradient-to-r from-[#0b3f27] via-[#c49b38] to-[#0b3f27]"></div>

        <div className="relative w-full h-full px-12 py-10 flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#c49b38] pb-6">
            <div className="flex flex-col items-center">
              <Image src="/kagrom-mark.svg" alt="KAGROM" width={80} height={80} />
              <span className="text-[#c49b38] font-bold text-xl mt-2 font-serif">KAGROM SARLU</span>
            </div>
            
            <div className="text-right space-y-1">
              <h1 className="text-xl font-bold uppercase tracking-wide">REPUBLIQUE DE GUINEE</h1>
              <p className="text-xs font-bold">
                <span className="text-[#a41034]">Travail</span> - <span className="text-[#fcd116]">Justice</span> - <span className="text-[#009460]">Solidarité</span>
              </p>
              <p className="font-semibold text-sm text-[#112240] pt-2 w-64 ml-auto">
                Ministère de l'Enseignement Technique, de la Formation Professionnelle et de l'Emploi
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold uppercase text-[#202b5d] underline decoration-[#c49b38] underline-offset-8">
              RELEVÉ DE NOTES
            </h2>
          </div>

          {/* Student Info */}
          <div className="mt-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-[#c49b38] mb-4 uppercase">Informations de l'Apprenant</h3>
            <div className="grid grid-cols-2 gap-y-4 text-[15px]">
              <div><span className="font-semibold text-gray-600">Matricule :</span> <span className="font-bold">{enrollment.matricule}</span></div>
              <div><span className="font-semibold text-gray-600">Période :</span> <span className="font-bold">{sessionDates}</span></div>
              <div><span className="font-semibold text-gray-600">Nom :</span> <span className="font-bold uppercase">{learner.lastName}</span></div>
              <div><span className="font-semibold text-gray-600">Prénoms :</span> <span className="font-bold">{learner.firstName}</span></div>
              <div><span className="font-semibold text-gray-600">Né(e) le :</span> <span className="font-bold">{dob}</span></div>
              <div><span className="font-semibold text-gray-600">Lieu :</span> <span className="font-bold">{pob}</span></div>
            </div>
          </div>

          {/* Training Info */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#c49b38] mb-2 uppercase">Programme de Formation</h3>
            <p className="text-[16px]"><span className="font-semibold">Domaine :</span> Conduite d'engins lourds</p>
            <p className="text-[16px]"><span className="font-semibold">Spécialité :</span> {training.title}</p>
            {enrollment.operatorType && (
              <p className="text-[16px]"><span className="font-semibold">Option :</span> {enrollment.operatorType.name}</p>
            )}
          </div>

          {/* Grades Table */}
          <div className="mt-10">
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead>
                <tr className="bg-[#202b5d] text-white">
                  <th className="border border-gray-300 px-4 py-3 font-semibold">Matières / Évaluations</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold w-32 text-center">Note sur 20</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold w-40 text-center">Observation</th>
                </tr>
              </thead>
              <tbody className="text-[15px]">
                <tr>
                  <td className="border border-gray-300 px-4 py-4 font-medium">Évaluation Théorique (Règles de sécurité, Mécanique de base, etc.)</td>
                  <td className="border border-gray-300 px-4 py-4 text-center font-bold">{scoreTheory > 0 ? scoreTheory.toFixed(2) : "-"}</td>
                  <td className="border border-gray-300 px-4 py-4 text-center text-sm">{scoreTheory >= 10 ? "Validé" : "À repasser"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-4 font-medium">Évaluation Pratique (Maniement, Opérations sur terrain, Précision)</td>
                  <td className="border border-gray-300 px-4 py-4 text-center font-bold">{scorePractical > 0 ? scorePractical.toFixed(2) : "-"}</td>
                  <td className="border border-gray-300 px-4 py-4 text-center text-sm">{scorePractical >= 10 ? "Validé" : "À repasser"}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-4 py-4 font-bold text-right uppercase">Moyenne Générale</td>
                  <td className="border border-gray-300 px-4 py-4 text-center font-bold text-lg text-[#a41034]">{averageScore > 0 ? averageScore.toFixed(2) : "-"}</td>
                  <td className="border border-gray-300 px-4 py-4 text-center font-bold uppercase">{averageScore >= 10 ? "Admis" : "Ajourné"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusion */}
          <div className="mt-6 flex justify-end">
            <p className="text-[16px] font-bold">Mention : <span className="text-[#c49b38] ml-2">{mention}</span></p>
          </div>

          {/* Footer & Signatures */}
          <div className="mt-auto flex justify-between items-end pt-10">
            <div className="text-center">
              <p className="text-sm font-semibold mb-20">Le Formateur Principal</p>
              <p className="font-bold text-[#202b5d]">{session.trainerName || "L'Équipe Pédagogique"}</p>
            </div>
            
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code" width={90} height={90} className="mb-2" />
              <span className="text-[10px] text-gray-500">Document certifié</span>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold mb-20">Le Directeur Général</p>
              <p className="font-bold text-[#202b5d]">ADRIEN KINOMY</p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-[10px] text-gray-500 border-t pt-4">
            Centre de Formation KAGROM-SARLU • RCCM:GN.TCC.2025.18254 • T6, Conakry, Guinée • Tel: +224 612 50 36 48
          </div>

        </div>
      </div>
    </main>
  );
}
