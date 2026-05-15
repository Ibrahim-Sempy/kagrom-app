"use server";

import { AssignmentStatus, CashType, InvoiceStatus, PaymentStatus, Role, matrialStatus, typeOfId, avisType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, hashPassword, requireRole, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";
import { nextCode } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getString(formData: FormData, key: string) {
  return (formData.get(key)?.toString() ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  return Number(getString(formData, key));
}

function getDate(formData: FormData, key: string) {
  return new Date(getString(formData, key));
}

function getOptionalDate(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? new Date(value) : null;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/connexion?error=Identifiants%20invalides");
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logoutAction(_formData: FormData) {
  await destroySession();
  redirect("/connexion");
}

export async function createUserAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  await prisma.user.create({
    data: {
      name: getString(formData, "name"),
      email: getString(formData, "email").toLowerCase(),
      phone: getString(formData, "phone") || null,
      role: getString(formData, "role") as Role,
      passwordHash: await hashPassword(getString(formData, "password")),
      mustChangePass: true,
    },
  });

  revalidatePath("/dashboard/securite");
}

export async function updatePasswordAction(formData: FormData) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT, Role.TRAINER, Role.HR]);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashPassword(getString(formData, "password")),
      mustChangePass: false,
    },
  });

  revalidatePath("/dashboard/securite");
}

// ─── Learners ────────────────────────────────────────────────────────────────

export async function createLearnerAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);
  const photoUrl = await saveUploadedImage(formData.get("photo") as File | null);

  await prisma.learner.create({
    data: {
      registrationNo: nextCode("KAG"),
      firstName: getString(formData, "firstName"),
      lastName: getString(formData, "lastName"),
      phone: getString(formData, "phone"),
      email: getString(formData, "email") || null,
      occupation: getString(formData, "occupation") || null,
      address: getString(formData, "address") || null,
      gender: getString(formData, "gender") || null,
      birthDate: getOptionalDate(formData, "birthDate"),
      birthPlace: getString(formData, "birthPlace") || null,
      emergencyContactFirstName: getString(formData, "emergencyContactFirstName") || null,
      emergencyContactLastName: getString(formData, "emergencyContactLastName") || null,
      emergencyPhone: getString(formData, "emergencyPhone") || null,
      photoUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apprenants");
}

export async function updateLearnerAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);
  const photoUrl = await saveUploadedImage(formData.get("photo") as File | null);

  const data: any = {
    firstName: getString(formData, "firstName"),
    lastName: getString(formData, "lastName"),
    phone: getString(formData, "phone"),
    email: getString(formData, "email") || null,
    occupation: getString(formData, "occupation") || null,
    address: getString(formData, "address") || null,
    gender: getString(formData, "gender") || null,
    birthDate: getOptionalDate(formData, "birthDate"),
    birthPlace: getString(formData, "birthPlace") || null,
    emergencyContactFirstName: getString(formData, "emergencyContactFirstName") || null,
    emergencyContactLastName: getString(formData, "emergencyContactLastName") || null,
    emergencyPhone: getString(formData, "emergencyPhone") || null,
  };
  if (photoUrl) data.photoUrl = photoUrl;

  await prisma.learner.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apprenants");
}

export async function deleteLearnerAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.learner.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/apprenants");
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function createTrainingSessionAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  await prisma.session.create({
    data: {
      label: getString(formData, "label"),
      startDate: getOptionalDate(formData, "startDate"),
      endDate: getOptionalDate(formData, "endDate"),
      trainerName: getString(formData, "trainerName") || null,
    },
  });

  revalidatePath("/dashboard/formations");
}

export async function updateTrainingSessionAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);

  await prisma.session.update({
    where: { id },
    data: {
      label: getString(formData, "name"),
      startDate: getOptionalDate(formData, "startDate"),
      endDate: getOptionalDate(formData, "endDate"),
      trainerName: getString(formData, "trainerName") || null,
    },
  });

  revalidatePath("/dashboard/formations");
}

export async function deleteTrainingSessionAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.session.delete({ where: { id } });
  revalidatePath("/dashboard/formations");
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export async function createEnrollmentAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);
  const photoUrl = await saveUploadedImage(formData.get("photo") as File | null);

  const registrationFee = getNumber(formData, "registrationFee");
  const trainingFee = getNumber(formData, "trainingFee");
  const totalFee = registrationFee + trainingFee;
  const amountPaid = getNumber(formData, "amountPaid");
  const amountDue = Math.max(totalFee - amountPaid, 0);
  const paymentStatus =
    amountDue <= 0 ? PaymentStatus.PAID : amountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

  const moduleIds = formData.getAll("trainingModuleIds").map(String).filter(Boolean);
  const paymentModeId = getString(formData, "paymentModeId") || null;

  await prisma.$transaction(async (tx) => {
    const learner = await tx.learner.create({
      data: {
        registrationNo: nextCode("APP-KAG"),
        firstName: getString(formData, "firstName"),
        lastName: getString(formData, "lastName"),
        phone: getString(formData, "phone"),
        email: getString(formData, "email") || null,
        gender: getString(formData, "gender") || null,
        address: getString(formData, "address") || null,
        birthDate: getOptionalDate(formData, "birthDate"),
        birthPlace: getString(formData, "birthPlace") || null,
        occupation: getString(formData, "occupation") || null,
        emergencyContactFirstName: getString(formData, "emergencyContactFirstName") || null,
        emergencyContactLastName: getString(formData, "emergencyContactLastName") || null,
        emergencyPhone: getString(formData, "emergencyPhone") || null,
        photoUrl,
      },
    });

    const enrollment = await tx.enrollment.create({
      data: {
        learnerId: learner.id,
        // Champ renommé SessionId dans le schéma
        SessionId: getString(formData, "sessionId"),
        registrationDate: getDate(formData, "registrationDate"),
        trainingLocationId: getString(formData, "trainingLocationId") || null,
        durationOptionId: getString(formData, "durationOptionId") || null,
        paymentModeOptionId: paymentModeId,
        registrationFee,
        trainingFee,
        totalFee,
        amountPaid,
        amountDue,
        paymentStatus,
        status: "IN_PROGRESS",
        enrollmentModules: {
          create: moduleIds.map((id) => ({ trainingModuleId: id })),
        },
      },
    });

    if (amountPaid > 0) {
      const payment = await tx.payment.create({
        data: {
          paymentNo: nextCode("PAY-KAG"),
          enrollmentId: enrollment.id,
          amount: amountPaid,
          paidAt: getDate(formData, "registrationDate"),
          // paymentModeId remplace l'ancien champ "method"
          paymentModeId,
        },
      });

      await tx.receipt.create({
        data: {
          receiptNo: nextCode("REC-KAG"),
          paymentId: payment.id,
        },
      });

      await tx.cashEntry.create({
        data: {
          date: getDate(formData, "registrationDate"),
          label: `Paiement initial inscription`,
          type: CashType.INCOME,
          amount: amountPaid,
          justification: "Paiement lors de l'inscription",
          paymentId: payment.id,
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inscriptions");
  revalidatePath("/dashboard/apprenants");
  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/gestion-caisse");
}

export async function enrollLearnerAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);
  const moduleIds = formData.getAll("trainingModuleIds").map(String).filter(Boolean);

  await prisma.enrollment.create({
    data: {
      learnerId: getString(formData, "learnerId"),
      SessionId: getString(formData, "sessionId"),
      registrationDate: new Date(),
      status: "IN_PROGRESS",
      enrollmentModules: {
        create: moduleIds.map((id) => ({ trainingModuleId: id })),
      },
    },
  });

  revalidatePath("/dashboard/formations");
  revalidatePath("/dashboard/apprenants");
}

export async function updateEnrollmentAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  const registrationFee = getNumber(formData, "registrationFee");
  const trainingFee = getNumber(formData, "trainingFee");
  const totalFee = registrationFee + trainingFee;
  const moduleIds = formData.getAll("trainingModuleIds").map(String).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id },
      data: {
        SessionId: getString(formData, "sessionId"),
        registrationDate: getDate(formData, "registrationDate"),
        trainingLocationId: getString(formData, "trainingLocationId") || null,
        durationOptionId: getString(formData, "durationOptionId") || null,
        paymentModeOptionId: getString(formData, "paymentModeOptionId") || null,
        registrationFee,
        trainingFee,
        totalFee,
      },
    });

    await tx.enrollmentModule.deleteMany({
      where: {
        enrollmentId: id,
        trainingModuleId: { notIn: moduleIds },
      },
    });

    for (const modId of moduleIds) {
      const exists = await tx.enrollmentModule.findUnique({
        where: { enrollmentId_trainingModuleId: { enrollmentId: id, trainingModuleId: modId } },
      });
      if (!exists) {
        await tx.enrollmentModule.create({
          data: { enrollmentId: id, trainingModuleId: modId },
        });
      }
    }
  });

  revalidatePath("/dashboard/inscriptions");
}

export async function deleteEnrollmentAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/dashboard/inscriptions");
}

// ─── Results / Notes ─────────────────────────────────────────────────────────

export async function recordResultAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  const enrollmentId = getString(formData, "enrollmentId");
  const moduleId = getString(formData, "moduleId");
  const submittedLearnerId = getString(formData, "learnerId");
  const theory = getNumber(formData, "scoreTheory");
  const practical = getNumber(formData, "scorePractical");
  const enrollment = enrollmentId
    ? await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { certificate: true },
      })
    : null;
  const learnerId = submittedLearnerId || enrollment?.learnerId || "";

  if (!learnerId || !moduleId) {
    throw new Error("Les informations de note apprenant sont incompletes.");
  }

  // Upsert la note pour cet apprenant + module
  await prisma.note.upsert({
    where: {
      // Vous pouvez ajouter une contrainte @@unique([learnerId, moduleId]) dans le schéma si souhaité
      // En attendant, on cherche manuellement
      id: (
        await prisma.note.findFirst({ where: { learnerId, moduleId } })
      )?.id ?? "new",
    },
    update: {
      scoreTheory: theory,
      scorePractical: practical,
      observation: getString(formData, "observation") || null,
    },
    create: {
      learnerId,
      moduleId,
      enrollmentId,
      scoreTheory: theory,
      scorePractical: practical,
      observation: getString(formData, "observation") || null,
    },
  });

  // Calcul de la moyenne pour déterminer si l'inscription est PASSED
  const average = (theory + practical) / 2;
  const passed = average >= 12;

  if (enrollment && passed && !enrollment.certificate) {
    await prisma.certificate.create({
      data: {
        enrollmentId,
        certificateNo: nextCode("CERT-KAG"),
        verificationCode: nextCode("VERIFY-KAG"),
      },
    });
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "PASSED" },
    });
  }

  revalidatePath("/dashboard/formations");
  revalidatePath("/dashboard/certificats");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes-evaluations");
}

// ─── Payments ────────────────────────────────────────────────────────────────

// Employee results / notes
export async function recordEmployeeResultAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER, Role.HR]);

  const personalTrainingId = getString(formData, "personalTrainingId");
  const theory = getNumber(formData, "scoreTheory");
  const practical = getNumber(formData, "scorePractical");

  if (!personalTrainingId) {
    throw new Error("La formation employee est requise.");
  }

  await prisma.noteEmployee.upsert({
    where: { personalTrainingId },
    update: {
      scoreTheory: theory,
      scorePractical: practical,
      observation: getString(formData, "observation") || null,
    },
    create: {
      personalTrainingId,
      scoreTheory: theory,
      scorePractical: practical,
      observation: getString(formData, "observation") || null,
    },
  });

  revalidatePath("/dashboard/notes-evaluations");
  revalidatePath("/dashboard");
}

// Payments
export async function createEnrollmentPaymentAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  const enrollmentId = getString(formData, "enrollmentId");
  const amount = getNumber(formData, "amount");
  const paymentModeId = getString(formData, "paymentModeId") || null;

  const payment = await prisma.payment.create({
    data: {
      paymentNo: nextCode("PAY-KAG"),
      enrollmentId,
      installmentId: getString(formData, "installmentId") || null,
      amount,
      paidAt: getDate(formData, "paidAt"),
      paymentModeId,
    },
  });

  await prisma.receipt.create({
    data: {
      receiptNo: nextCode("REC-KAG"),
      paymentId: payment.id,
    },
  });

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { payments: true },
  });

  if (enrollment) {
    const paid = enrollment.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const due = Math.max(Number(enrollment.totalFee) - paid, 0);

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        amountPaid: paid,
        amountDue: due,
        paymentStatus:
          due <= 0 ? PaymentStatus.PAID : paid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID,
      },
    });

    await prisma.cashEntry.create({
      data: {
        date: getDate(formData, "paidAt"),
        label: `Paiement inscription - ${enrollmentId}`,
        type: CashType.INCOME,
        amount,
        justification: getString(formData, "comment") || "Paiement apprenant",
        paymentId: payment.id,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/apprenants");
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function createInvoiceAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  await prisma.invoice.create({
    data: {
      invoiceNo: nextCode("FAC-KAG"),
      type: "client",
      description: getString(formData, "description") || null,
      ammount: getNumber(formData, "amount"),
      dueDate: getDate(formData, "dueDate"),
      status: InvoiceStatus.ISSUED,
      enrollmentId: getString(formData, "enrollmentId") || null,
      assignmentId: getString(formData, "assignmentId") || null,
    },
  });

  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function createEnrollmentInvoiceAction(enrollmentId: string) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      learner: true,
      enrollmentModules: { include: { trainingModule: true } },
    },
  });

  if (!enrollment) throw new Error("Inscription introuvable");

  const existing = await prisma.invoice.findFirst({
    where: { enrollmentId },
  });
  if (existing) return existing.id;

  const stamp = Date.now().toString().slice(-6);

  const newInvoice = await prisma.invoice.create({
    data: {
      invoiceNo: `FAC-${stamp}`,
      type: "learner",
      ammount: enrollment.totalFee,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: `Frais de formation - ${enrollment.enrollmentModules[0]?.trainingModule?.name ?? "Général"}`,
      enrollmentId,
      status: InvoiceStatus.ISSUED,
    },
  });

  await prisma.document.create({
    data: {
      documentNo: `DOC-FAC-${stamp}`,
      type: "INVOICE",
      enrollmentId,
      invoiceId: newInvoice.id,
    },
  });

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/finances");

  return newInvoice.id;
}

export async function recordPaymentAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  const invoiceId = getString(formData, "invoiceId");
  const amount = getNumber(formData, "amount");
  const paymentModeId = getString(formData, "paymentModeId") || null;
  const installmentId = getString(formData, "installmentId") || null;
  const paidAt = getDate(formData, "paidAt");
  const comment = getString(formData, "comment") || null;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      enrollment: { include: { learner: true } },
      assignment: { include: { household: true, employee: true } },
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  const payment = await prisma.payment.create({
    data: {
      paymentNo: nextCode("PAY-KAG"),
      invoiceId,
      enrollmentId: invoice.enrollmentId,
      installmentId,
      amount,
      paidAt,
      paymentModeId,
    },
  });

  await prisma.receipt.create({
    data: {
      receiptNo: nextCode("REC-KAG"),
      paymentId: payment.id,
    },
  });

  const paid = [...invoice.payments, payment].reduce((sum, item) => sum + Number(item.amount), 0);
  const invoiceStatus =
    paid >= Number(invoice.ammount)
      ? InvoiceStatus.PAID
      : paid > 0
        ? InvoiceStatus.PARTIALLY_PAID
        : InvoiceStatus.ISSUED;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: invoiceStatus,
    },
  });

  const cashLabel = invoice.enrollment
    ? `Paiement facture ${invoice.invoiceNo} - ${invoice.enrollment.learner.firstName} ${invoice.enrollment.learner.lastName}`
    : invoice.assignment
      ? `Paiement facture ${invoice.invoiceNo} - ${invoice.assignment.household.firstName} ${invoice.assignment.household.lastName}`
      : `Paiement facture ${invoice.invoiceNo}`;

  await prisma.cashEntry.create({
    data: {
      date: paidAt,
      label: cashLabel,
      type: CashType.INCOME,
      amount,
      justification: comment || `Reference auto ${payment.paymentNo}`,
      paymentId: payment.id,
    },
  });

  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard/gestion-caisse");
  revalidatePath("/dashboard");
}

// ─── Cash Entries ─────────────────────────────────────────────────────────────

export async function createCashEntryAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  await prisma.cashEntry.create({
    data: {
      date: getDate(formData, "date"),
      label: getString(formData, "label"),
      type: getString(formData, "type") as CashType,
      amount: getNumber(formData, "amount"),
      justification: getString(formData, "justification") || null,
    },
  });

  revalidatePath("/dashboard/gestion-caisse");
  revalidatePath("/dashboard");
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function createEmployeeAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const availabilityIds = formData.getAll("availabilityIds").map(String).filter(Boolean);
  const posteIds = formData.getAll("posteIds").map(String).filter(Boolean);
  const competencyIds = formData.getAll("competencyIds").map(String).filter(Boolean);

  await prisma.employee.create({
    data: {
      firstName: getString(formData, "firstName"),
      lastName: getString(formData, "lastName"),
      birthDate: getOptionalDate(formData, "birthDate"),
      birthPlace: getString(formData, "birthPlace") || null,
      nationality: getString(formData, "nationality") || null,
      matrialStatus: getString(formData, "matrialStatus") as matrialStatus,
      address: getString(formData, "address"),
      primaryPhone: getString(formData, "primaryPhone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      typeOfId: getString(formData, "typeOfId") as typeOfId,
      idNumber: getString(formData, "idNumber") || null,
      idExpiryDate: getOptionalDate(formData, "idExpiryDate"),
      hasIdCopy: formData.get("hasIdCopy") === "true",
      guarantorfirstName: getString(formData, "guarantorfirstName") || null,
      guarantorLastName: getString(formData, "guarantorLastName") || null,
      guarantorRelation: getString(formData, "guarantorRelation") || null,
      guarantorAddress: getString(formData, "guarantorAddress") || null,
      guarantorPhone: getString(formData, "guarantorPhone") || null,
      completeFolder: formData.get("completeFolder") === "true",
      interviewDone: formData.get("interviewDone") ? formData.get("interviewDone") === "true" : null,
      avis: (getString(formData, "avis") as avisType) || null,
      observations: getString(formData, "observations") || null,
      availability: availabilityIds.length
        ? { connect: availabilityIds.map((id) => ({ id })) }
        : undefined,
      posteDemanded: posteIds.length
        ? { connect: posteIds.map((id) => ({ id })) }
        : undefined,
      competencies: competencyIds.length
        ? { connect: competencyIds.map((id) => ({ id })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard/employes");
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const availabilityIds = formData.getAll("availabilityIds").map(String).filter(Boolean);
  const posteIds = formData.getAll("posteIds").map(String).filter(Boolean);
  const competencyIds = formData.getAll("competencyIds").map(String).filter(Boolean);

  await prisma.employee.update({
    where: { id },
    data: {
      firstName: getString(formData, "firstName"),
      lastName: getString(formData, "lastName"),
      birthDate: getOptionalDate(formData, "birthDate"),
      birthPlace: getString(formData, "birthPlace") || null,
      nationality: getString(formData, "nationality") || null,
      matrialStatus: getString(formData, "matrialStatus") as matrialStatus,
      address: getString(formData, "address"),
      primaryPhone: getString(formData, "primaryPhone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      typeOfId: getString(formData, "typeOfId") as typeOfId,
      idNumber: getString(formData, "idNumber") || null,
      idExpiryDate: getOptionalDate(formData, "idExpiryDate"),
      hasIdCopy: formData.get("hasIdCopy") === "true",
      guarantorfirstName: getString(formData, "guarantorfirstName") || null,
      guarantorLastName: getString(formData, "guarantorLastName") || null,
      guarantorRelation: getString(formData, "guarantorRelation") || null,
      guarantorAddress: getString(formData, "guarantorAddress") || null,
      guarantorPhone: getString(formData, "guarantorPhone") || null,
      completeFolder: formData.get("completeFolder") === "true",
      interviewDone: formData.get("interviewDone") ? formData.get("interviewDone") === "true" : null,
      avis: (getString(formData, "avis") as avisType) || null,
      observations: getString(formData, "observations") || null,
      availability: { set: availabilityIds.map((id) => ({ id })) },
      posteDemanded: { set: posteIds.map((id) => ({ id })) },
      competencies: { set: competencyIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/dashboard/employes");
}

export async function deleteEmployeeAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/dashboard/employes");
}

// ─── Households ───────────────────────────────────────────────────────────────

export async function createHouseholdAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.household.create({
    data: {
      firstName: getString(formData, "firstName"),
      lastName: getString(formData, "lastName"),
      address: getString(formData, "address") || null,
      quartier: getString(formData, "quartier") || null,
      primaryPhone: getString(formData, "primaryPhone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      email: getString(formData, "email") || null,
      profession: getString(formData, "profession") || null,
    },
  });

  revalidatePath("/dashboard/foyers");
}

export async function updateHouseholdAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.household.update({
    where: { id },
    data: {
      firstName: getString(formData, "firstName"),
      lastName: getString(formData, "lastName"),
      address: getString(formData, "address") || null,
      quartier: getString(formData, "quartier") || null,
      primaryPhone: getString(formData, "primaryPhone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      email: getString(formData, "email") || null,
      profession: getString(formData, "profession") || null,
    },
  });

  revalidatePath("/dashboard/foyers");
}

export async function deleteHouseholdAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.household.delete({ where: { id } });
  revalidatePath("/dashboard/foyers");
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function createAssignmentAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const horaireIds = formData.getAll("horaireIds").map(String).filter(Boolean);
  const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);

  await prisma.assignment.create({
    data: {
      employeeId: getString(formData, "employeeId"),
      householdId: getString(formData, "householdId"),
      monthlyAmount: getString(formData, "monthlyAmount").replace(/\s+/g, "").replace(",", "."),
      startDate: getDate(formData, "startDate"),
      numberPerson: getNumber(formData, "numberPerson"),
      notes: getString(formData, "notes") || null,
      status: (getString(formData, "status") as AssignmentStatus) || AssignmentStatus.ACTIVE,
      horaire: horaireIds.length
        ? { connect: horaireIds.map((id) => ({ id })) }
        : undefined,
      services: serviceIds.length
        ? { connect: serviceIds.map((id) => ({ id })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard/affectations");
}

export async function updateAssignmentAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  const horaireIds = formData.getAll("horaireIds").map(String).filter(Boolean);
  const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);

  await prisma.assignment.update({
    where: { id },
    data: {
      employeeId: getString(formData, "employeeId"),
      householdId: getString(formData, "householdId"),
      monthlyAmount: getString(formData, "monthlyAmount").replace(/\s+/g, "").replace(",", "."),
      startDate: getDate(formData, "startDate"),
      numberPerson: getNumber(formData, "numberPerson"),
      notes: getString(formData, "notes") || null,
      status: (getString(formData, "status") as AssignmentStatus) || AssignmentStatus.ACTIVE,
      horaire: { set: horaireIds.map((id) => ({ id })) },
      services: { set: serviceIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/dashboard/affectations");
}

export async function deleteAssignmentAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.assignment.delete({ where: { id } });
  revalidatePath("/dashboard/affectations");
}

// ─── Reference Data (Paramètres) ─────────────────────────────────────────────

export async function createOperatorTypeAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.operatorType.create({ data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}
export async function updateOperatorTypeAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.operatorType.update({ where: { id }, data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}
export async function deleteOperatorTypeAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.operatorType.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createTrainingModuleAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingModule.create({
    data: {
      name: getString(formData, "name"),
      OperatorTypeId: getString(formData, "operatorTypeId") || null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function updateTrainingModuleAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingModule.update({
    where: { id },
    data: {
      name: getString(formData, "name"),
      OperatorTypeId: getString(formData, "operatorTypeId") || null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function deleteTrainingModuleAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingModule.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createTrainingLocationAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingLocation.create({ data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}
export async function updateTrainingLocationAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingLocation.update({ where: { id }, data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}
export async function deleteTrainingLocationAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingLocation.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createDurationOptionAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.durationOption.create({
    data: {
      label: getString(formData, "label"),
      months: getString(formData, "months") ? getNumber(formData, "months") : null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function updateDurationOptionAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.durationOption.update({
    where: { id },
    data: {
      label: getString(formData, "label"),
      months: getString(formData, "months") ? getNumber(formData, "months") : null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function deleteDurationOptionAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.durationOption.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createPaymentModeOptionAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentModeOption.create({ data: { label: getString(formData, "label") } });
  revalidatePath("/dashboard/parametres");
}
export async function updatePaymentModeOptionAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentModeOption.update({ where: { id }, data: { label: getString(formData, "label") } });
  revalidatePath("/dashboard/parametres");
}
export async function deletePaymentModeOptionAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentModeOption.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createPaymentInstallmentAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentInstallment.create({
    data: {
      label: getString(formData, "label"),
      sortOrder: getNumber(formData, "sortOrder") || 0,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function updatePaymentInstallmentAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentInstallment.update({
    where: { id },
    data: {
      label: getString(formData, "label"),
      sortOrder: getNumber(formData, "sortOrder") || 0,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function deletePaymentInstallmentAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentInstallment.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

export async function createAvailabilityAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.availability.create({ data: { label: getString(formData, "label") } });
  revalidatePath("/dashboard/parametres");
}
export async function updateAvailabilityAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.availability.update({ where: { id }, data: { label: getString(formData, "label") } });
  revalidatePath("/dashboard/parametres");
}
export async function deleteAvailabilityAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.availability.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function createServiceAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.service.create({
    data: {
      label: getString(formData, "label"),
      description: getString(formData, "description") || null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function updateServiceAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.service.update({
    where: { id },
    data: {
      label: getString(formData, "label"),
      description: getString(formData, "description") || null,
    },
  });
  revalidatePath("/dashboard/parametres");
}
export async function deleteServiceAction(id: string) {
  await requireRole([Role.ADMIN]);
  await prisma.service.delete({ where: { id } });
  revalidatePath("/dashboard/parametres");
}


