import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ verificationCode: string }> },
) {
  const { verificationCode } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      enrollment: {
        include: {
          learner: true,
          trainingSession: {
            include: { training: true },
          },
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      {
        valid: false,
        message: "Certificat introuvable",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    valid: true,
    certificateNo: certificate.certificateNo,
    issuedAt: formatDate(certificate.issuedAt),
    learner: `${certificate.enrollment.learner.firstName} ${certificate.enrollment.learner.lastName}`,
    training: certificate.enrollment.trainingSession.training.title,
    session: certificate.enrollment.trainingSession.name,
    matricule: certificate.enrollment.matricule,
  });
}
