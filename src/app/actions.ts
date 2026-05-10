"use server";

import { CashType, InvoiceStatus, MissionStatus, PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, hashPassword, requireRole, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";
import { nextCode, slugify } from "@/lib/utils";

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

function parseAverage(theory: number, practical: number) {
  return Number(((theory + practical) / 2).toFixed(2));
}

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

export async function createTrainingAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);
  const title = getString(formData, "title");

  await prisma.training.create({
    data: {
      title,
      code: slugify(title).toUpperCase(),
      category: getString(formData, "category"),
      description: getString(formData, "description") || null,
      durationDays: getNumber(formData, "durationDays"),
      fee: getNumber(formData, "fee"),
    },
  });

  revalidatePath("/dashboard/formations");
  revalidatePath("/dashboard");
}

export async function createTrainingSessionAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);

  await prisma.trainingSession.create({
    data: {
      name: getString(formData, "name"),
      sessionNumber: getNumber(formData, "sessionNumber"),
      location: getString(formData, "location") || null,
      startDate: getDate(formData, "startDate"),
      endDate: getDate(formData, "endDate"),
      trainerName: getString(formData, "trainerName") || null,
      trainingId: getString(formData, "trainingId"),
    },
  });

  revalidatePath("/dashboard/formations");
}

export async function createEnrollmentAction(formData: FormData) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);
  const photoUrl = await saveUploadedImage(formData.get("photo") as File | null);

  const registrationFee = getNumber(formData, "registrationFee");
  const trainingFee = getNumber(formData, "trainingFee");
  const totalFee = registrationFee + trainingFee;
  const amountPaid = getNumber(formData, "amountPaid");
  const amountDue = Math.max(totalFee - amountPaid, 0);
  const paymentStatus = amountDue <= 0 ? PaymentStatus.PAID : amountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

  const moduleIds = formData.getAll("trainingModuleIds").map(String).filter(Boolean);
  const matricule = getString(formData, "matricule") || nextCode("MAT");

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
        trainingSessionId: getString(formData, "trainingSessionId"),
        matricule,
        registrationDate: getDate(formData, "registrationDate"),
        operatorTypeId: getString(formData, "operatorTypeId") || null,
        trainingLocationId: getString(formData, "trainingLocationId") || null,
        durationOptionId: getString(formData, "durationOptionId") || null,
        paymentModeOptionId: getString(formData, "paymentModeOptionId") || null,
        registrationFee,
        trainingFee,
        totalFee,
        amountPaid,
        amountDue,
        paymentStatus,
        status: "IN_PROGRESS",
        enrollmentModules: {
          create: moduleIds.map((id) => ({
            trainingModuleId: id,
          })),
        },
      },
    });

    if (amountPaid > 0) {
      const payment = await tx.payment.create({
        data: {
          paymentNo: nextCode("PAY-KAG"),
          enrollmentId: enrollment.id,
          amount: amountPaid,
          paidAt: getDate(formData, "registrationDate") || new Date(),
          method: (getString(formData, "paymentMethod") as PaymentMethod) || PaymentMethod.CASH,
          recordedById: session.userId,
        },
      });

      await tx.receipt.create({
        data: {
          receiptNo: nextCode("REC-KAG"),
          paymentId: payment.id,
        },
      });

      const lastCashEntry = await tx.cashEntry.findFirst({ orderBy: { createdAt: "desc" } });
      const previousBalance = lastCashEntry ? Number(lastCashEntry.balanceAfter) : 0;

      await tx.cashEntry.create({
        data: {
          entryNo: nextCode("CAISSE"),
          date: getDate(formData, "registrationDate") || new Date(),
          label: `Paiement initial inscription ${matricule}`,
          type: CashType.INCOME,
          amount: amountPaid,
          balanceAfter: previousBalance + amountPaid,
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
      trainingSessionId: getString(formData, "trainingSessionId"),
      matricule: nextCode("MAT"),
      registrationDate: new Date(),
      status: "IN_PROGRESS",
      enrollmentModules: {
        create: moduleIds.map((id) => ({
          trainingModuleId: id,
        })),
      },
    },
  });

  revalidatePath("/dashboard/formations");
  revalidatePath("/dashboard/apprenants");
}

export async function recordResultAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.TRAINER]);
  const enrollmentModuleId = getString(formData, "enrollmentModuleId");
  const theory = getNumber(formData, "scoreTheory");
  const practical = getNumber(formData, "scorePractical");
  const average = parseAverage(theory, practical);
  const passed = average >= 12;

  const em = await prisma.enrollmentModule.update({
    where: { id: enrollmentModuleId },
    data: {
      scoreTheory: theory,
      scorePractical: practical,
      averageScore: average,
      observation: getString(formData, "observation") || null,
      resultLabel: passed ? "Valide" : "Non valide",
      status: passed ? "PASSED" : "FAILED",
    },
    include: { enrollment: { include: { enrollmentModules: true, certificate: true } } },
  });

  const enrollment = em.enrollment;
  const allModulesPassed = enrollment.enrollmentModules.length > 0 && enrollment.enrollmentModules.every(m => m.status === "PASSED");

  if (allModulesPassed && !enrollment.certificate) {
    await prisma.certificate.create({
      data: {
        enrollmentId: enrollment.id,
        certificateNo: nextCode("CERT-KAG"),
        verificationCode: nextCode("VERIFY-KAG"),
      },
    });
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "PASSED" },
    });
  } else if (!allModulesPassed && enrollment.certificate) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "IN_PROGRESS" },
    });
  } else if (allModulesPassed) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "PASSED" },
    });
  }

  revalidatePath("/dashboard/formations");
  revalidatePath("/dashboard/certificats");
  revalidatePath("/dashboard");
}

export async function createServiceProviderAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.serviceProvider.create({
    data: {
      fullName: getString(formData, "fullName"),
      phone: getString(formData, "phone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      email: getString(formData, "email") || null,
      category: getString(formData, "category"),
      address: getString(formData, "address") || null,
      birthDate: getOptionalDate(formData, "birthDate"),
      birthPlace: getString(formData, "birthPlace") || null,
      nationality: getString(formData, "nationality") || null,
      maritalStatus: getString(formData, "maritalStatus") || null,
      idType: getString(formData, "idType") || null,
      idNumber: getString(formData, "idNumber") || null,
      idExpiryDate: getOptionalDate(formData, "idExpiryDate"),
      hasIdCopy: formData.get("hasIdCopy") === "true",
      availability: getString(formData, "availability") || null,
      workZone: getString(formData, "workZone") || null,
      hasExperience: formData.get("hasExperience") === "true",
      experienceEmployer: getString(formData, "experienceEmployer") || null,
      experiencePosition: getString(formData, "experiencePosition") || null,
      experienceDuration: getString(formData, "experienceDuration") || null,
      experienceContact: getString(formData, "experienceContact") || null,
      skills: formData.getAll("skills").map(String),
      guarantorName: getString(formData, "guarantorName") || null,
      guarantorRelation: getString(formData, "guarantorRelation") || null,
      guarantorPhone: getString(formData, "guarantorPhone") || null,
      guarantorAddress: getString(formData, "guarantorAddress") || null,
      guarantorHasIdCopy: formData.get("guarantorHasIdCopy") === "true",
      interviewFavorable: formData.get("interviewFavorable") ? formData.get("interviewFavorable") === "true" : null,
      fileComplete: formData.get("fileComplete") === "true",
      notes: getString(formData, "notes") || null,
    },
  });

  revalidatePath("/dashboard/prestations");
  revalidatePath("/dashboard");
}

export async function updateServiceProviderAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.serviceProvider.update({
    where: { id },
    data: {
      fullName: getString(formData, "fullName"),
      phone: getString(formData, "phone"),
      secondaryPhone: getString(formData, "secondaryPhone") || null,
      email: getString(formData, "email") || null,
      category: getString(formData, "category"),
      address: getString(formData, "address") || null,
      birthDate: getOptionalDate(formData, "birthDate"),
      birthPlace: getString(formData, "birthPlace") || null,
      nationality: getString(formData, "nationality") || null,
      maritalStatus: getString(formData, "maritalStatus") || null,
      idType: getString(formData, "idType") || null,
      idNumber: getString(formData, "idNumber") || null,
      idExpiryDate: getOptionalDate(formData, "idExpiryDate"),
      hasIdCopy: formData.get("hasIdCopy") === "true",
      availability: getString(formData, "availability") || null,
      workZone: getString(formData, "workZone") || null,
      hasExperience: formData.get("hasExperience") === "true",
      experienceEmployer: getString(formData, "experienceEmployer") || null,
      experiencePosition: getString(formData, "experiencePosition") || null,
      experienceDuration: getString(formData, "experienceDuration") || null,
      experienceContact: getString(formData, "experienceContact") || null,
      skills: formData.getAll("skills").map(String),
      guarantorName: getString(formData, "guarantorName") || null,
      guarantorRelation: getString(formData, "guarantorRelation") || null,
      guarantorPhone: getString(formData, "guarantorPhone") || null,
      guarantorAddress: getString(formData, "guarantorAddress") || null,
      guarantorHasIdCopy: formData.get("guarantorHasIdCopy") === "true",
      interviewFavorable: formData.get("interviewFavorable") ? formData.get("interviewFavorable") === "true" : null,
      fileComplete: formData.get("fileComplete") === "true",
      notes: getString(formData, "notes") || null,
    },
  });

  revalidatePath("/dashboard/prestations");
  revalidatePath("/dashboard");
}

export async function createMissionAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.serviceMission.create({
    data: {
      missionNo: nextCode("MIS-KAG"),
      clientName: getString(formData, "clientName"),
      clientPhone: getString(formData, "clientPhone") || null,
      clientSecondaryPhone: getString(formData, "clientSecondaryPhone") || null,
      clientEmail: getString(formData, "clientEmail") || null,
      clientProfession: getString(formData, "clientProfession") || null,
      clientDistrict: getString(formData, "clientDistrict") || null,
      numberOfPeople: getString(formData, "numberOfPeople") || null,
      location: getString(formData, "location"),
      serviceType: getString(formData, "serviceType"),
      startDate: getDate(formData, "startDate"),
      endDate: getString(formData, "endDate") ? getDate(formData, "endDate") : null,
      schedule: getString(formData, "schedule") || null,
      details: getString(formData, "details") || null,
      amount: getNumber(formData, "amount"),
      status: (getString(formData, "status") as MissionStatus) || "ASSIGNED",
      providerId: getString(formData, "providerId") || null,
      learnerId: getString(formData, "learnerId") || null,
    },
  });

  revalidatePath("/dashboard/prestations");
  revalidatePath("/dashboard");
}

export async function updateMissionAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.serviceMission.update({
    where: { id },
    data: {
      clientName: getString(formData, "clientName"),
      clientPhone: getString(formData, "clientPhone") || null,
      clientSecondaryPhone: getString(formData, "clientSecondaryPhone") || null,
      clientEmail: getString(formData, "clientEmail") || null,
      clientProfession: getString(formData, "clientProfession") || null,
      clientDistrict: getString(formData, "clientDistrict") || null,
      numberOfPeople: getString(formData, "numberOfPeople") || null,
      location: getString(formData, "location"),
      serviceType: getString(formData, "serviceType"),
      startDate: getDate(formData, "startDate"),
      endDate: getString(formData, "endDate") ? getDate(formData, "endDate") : null,
      schedule: getString(formData, "schedule") || null,
      details: getString(formData, "details") || null,
      amount: getNumber(formData, "amount"),
      status: (getString(formData, "status") as MissionStatus) || "ASSIGNED",
      providerId: getString(formData, "providerId") || null,
      learnerId: getString(formData, "learnerId") || null,
    },
  });

  revalidatePath("/dashboard/prestations");
  revalidatePath("/dashboard");
}

export async function createInvoiceAction(formData: FormData) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);

  await prisma.invoice.create({
    data: {
      invoiceNo: nextCode("FAC-KAG"),
      clientName: getString(formData, "clientName"),
      description: getString(formData, "description"),
      amount: getNumber(formData, "amount"),
      dueDate: getDate(formData, "dueDate"),
      status: InvoiceStatus.ISSUED,
      missionId: getString(formData, "missionId") || null,
      enrollmentId: getString(formData, "enrollmentId") || null,
      issuedById: session.userId,
    },
  });

  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function recordPaymentAction(formData: FormData) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  const invoiceId = getString(formData, "invoiceId");
  const amount = getNumber(formData, "amount");

  const payment = await prisma.payment.create({
    data: {
      paymentNo: nextCode("PAY-KAG"),
      invoiceId,
      amount,
      paidAt: getDate(formData, "paidAt"),
      method: getString(formData, "method") as PaymentMethod,
      reference: getString(formData, "reference") || null,
      recordedById: session.userId,
    },
  });

  await prisma.receipt.create({
    data: {
      receiptNo: nextCode("REC-KAG"),
      paymentId: payment.id,
    },
  });

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (invoice) {
    const paid = invoice.payments.reduce((sum, item) => sum + Number(item.amount), 0);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: paid >= Number(invoice.amount) ? "PAID" : "PARTIALLY_PAID",
      },
    });
  }

  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard");
}

export async function createEnrollmentPaymentAction(formData: FormData) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  const enrollmentId = getString(formData, "enrollmentId");
  const amount = getNumber(formData, "amount");

  const payment = await prisma.payment.create({
    data: {
      paymentNo: nextCode("PAY-KAG"),
      enrollmentId,
      installmentId: getString(formData, "installmentId") || null,
      amount,
      paidAt: getDate(formData, "paidAt"),
      method: getString(formData, "method") as PaymentMethod,
      reference: getString(formData, "reference") || null,
      comment: getString(formData, "comment") || null,
      recordedById: session.userId,
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
    const paid = enrollment.payments.reduce((sum, item) => sum + Number(item.amount), 0);
    const due = Math.max(Number(enrollment.totalFee) - paid, 0);
    const lastCashEntry = await prisma.cashEntry.findFirst({ orderBy: { createdAt: "desc" } });
    const previousBalance = lastCashEntry ? Number(lastCashEntry.balanceAfter) : 0;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        amountPaid: paid,
        amountDue: due,
        paymentStatus: due <= 0 ? PaymentStatus.PAID : paid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID,
      },
    });

    await prisma.cashEntry.create({
      data: {
        entryNo: nextCode("CAISSE"),
        date: getDate(formData, "paidAt"),
        label: `Paiement inscription ${enrollment.matricule}`,
        type: CashType.INCOME,
        amount,
        balanceAfter: previousBalance + amount,
        justification: getString(formData, "comment") || "Paiement apprenant",
        paymentId: payment.id,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/paiements");
  revalidatePath("/dashboard/apprenants");
}

export async function createCashEntryAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  const amount = getNumber(formData, "amount");
  const type = getString(formData, "type") as CashType;

  const lastEntry = await prisma.cashEntry.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const previousBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
  const balanceAfter = type === CashType.INCOME ? previousBalance + amount : previousBalance - amount;

  await prisma.cashEntry.create({
    data: {
      entryNo: nextCode("CAISSE"),
      date: getDate(formData, "date"),
      label: getString(formData, "label"),
      type,
      amount,
      balanceAfter,
      justification: getString(formData, "justification") || null,
    },
  });

  revalidatePath("/dashboard/gestion-caisse");
  revalidatePath("/dashboard");
}

export async function createEmployeeAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.employee.create({
    data: {
      employeeNo: nextCode("EMP"),
      fullName: getString(formData, "fullName"),
      phone: getString(formData, "phone"),
      address: getString(formData, "address") || null,
      competency: getString(formData, "competency"),
      availabilityId: getString(formData, "availabilityId") || null,
    },
  });

  revalidatePath("/dashboard/employes");
}

export async function createHouseholdAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.household.create({
    data: {
      code: nextCode("FOY"),
      name: getString(formData, "name"),
      managerName: getString(formData, "managerName"),
      phone: getString(formData, "phone"),
      address: getString(formData, "address") || null,
      requestedService: getString(formData, "requestedService") || null,
    },
  });

  revalidatePath("/dashboard/foyers");
}

export async function createAssignmentAction(formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);

  await prisma.assignment.create({
    data: {
      employeeId: getString(formData, "employeeId"),
      householdId: getString(formData, "householdId"),
      serviceLabel: getString(formData, "serviceLabel"),
      startDate: getDate(formData, "startDate"),
      endDate: getOptionalDate(formData, "endDate"),
      notes: getString(formData, "notes") || null,
    },
  });

  revalidatePath("/dashboard/affectations");
}

export async function createOperatorTypeAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.operatorType.create({ data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}

export async function createTrainingModuleAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingModule.create({ data: { name: getString(formData, "name") } });
  revalidatePath("/dashboard/parametres");
}

export async function createTrainingLocationAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.trainingLocation.create({ data: { name: getString(formData, "name") } });
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

export async function createPaymentModeOptionAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  await prisma.paymentModeOption.create({ data: { label: getString(formData, "label") } });
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

// === NEW ACTIONS FOR UPDATE AND DELETE ===

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

export async function updateTrainingAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  const title = getString(formData, "title");
  await prisma.training.update({
    where: { id },
    data: {
      title,
      code: slugify(title).toUpperCase(),
      category: getString(formData, "category"),
      description: getString(formData, "description") || null,
      durationDays: getNumber(formData, "durationDays"),
      fee: getNumber(formData, "fee"),
    },
  });
  revalidatePath("/dashboard/formations");
}

export async function deleteTrainingAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.training.delete({ where: { id } });
  revalidatePath("/dashboard/formations");
}

export async function updateTrainingSessionAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.trainingSession.update({
    where: { id },
    data: {
      name: getString(formData, "name"),
      sessionNumber: getNumber(formData, "sessionNumber"),
      location: getString(formData, "location") || null,
      startDate: getDate(formData, "startDate"),
      endDate: getDate(formData, "endDate"),
      trainerName: getString(formData, "trainerName") || null,
      trainingId: getString(formData, "trainingId"),
    },
  });
  revalidatePath("/dashboard/formations");
}

export async function deleteTrainingSessionAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.trainingSession.delete({ where: { id } });
  revalidatePath("/dashboard/formations");
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
        trainingSessionId: getString(formData, "trainingSessionId"),
        matricule: getString(formData, "matricule") || undefined,
        registrationDate: getDate(formData, "registrationDate"),
        operatorTypeId: getString(formData, "operatorTypeId") || null,
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

export async function deleteServiceProviderAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.serviceProvider.delete({ where: { id } });
  revalidatePath("/dashboard/prestations");
}

export async function deleteMissionAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.serviceMission.delete({ where: { id } });
  revalidatePath("/dashboard/prestations");
}

export async function deleteEmployeeAction(id: string) {
  await requireRole([Role.ADMIN, Role.MANAGER]);
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/dashboard/employes");
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN, Role.MANAGER, Role.HR]);
  await prisma.employee.update({
    where: { id },
    data: {
      fullName: getString(formData, "fullName"),
      phone: getString(formData, "phone"),
      address: getString(formData, "address") || null,
      competency: getString(formData, "competency"),
      availabilityId: getString(formData, "availabilityId") || null,
    },
  });
  revalidatePath("/dashboard/employes");
}

export async function deleteTrainingLocationAction(id: string) { await requireRole([Role.ADMIN]); await prisma.trainingLocation.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updateTrainingLocationAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.trainingLocation.update({ where: { id }, data: { name: getString(formData, "name") } }); revalidatePath("/dashboard/parametres"); }

export async function deleteDurationOptionAction(id: string) { await requireRole([Role.ADMIN]); await prisma.durationOption.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updateDurationOptionAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.durationOption.update({ where: { id }, data: { label: getString(formData, "label"), months: getString(formData, "months") ? getNumber(formData, "months") : null } }); revalidatePath("/dashboard/parametres"); }

export async function deleteOperatorTypeAction(id: string) { await requireRole([Role.ADMIN]); await prisma.operatorType.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updateOperatorTypeAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.operatorType.update({ where: { id }, data: { name: getString(formData, "name") } }); revalidatePath("/dashboard/parametres"); }

export async function deleteTrainingModuleAction(id: string) { await requireRole([Role.ADMIN]); await prisma.trainingModule.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updateTrainingModuleAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.trainingModule.update({ where: { id }, data: { name: getString(formData, "name") } }); revalidatePath("/dashboard/parametres"); }

export async function deletePaymentModeOptionAction(id: string) { await requireRole([Role.ADMIN]); await prisma.paymentModeOption.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updatePaymentModeOptionAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.paymentModeOption.update({ where: { id }, data: { label: getString(formData, "label") } }); revalidatePath("/dashboard/parametres"); }

export async function deletePaymentInstallmentAction(id: string) { await requireRole([Role.ADMIN]); await prisma.paymentInstallment.delete({ where: { id } }); revalidatePath("/dashboard/parametres"); }
export async function updatePaymentInstallmentAction(id: string, formData: FormData) { await requireRole([Role.ADMIN]); await prisma.paymentInstallment.update({ where: { id }, data: { label: getString(formData, "label"), sortOrder: getNumber(formData, "sortOrder") || 0 } }); revalidatePath("/dashboard/parametres"); }


export async function createEnrollmentInvoiceAction(enrollmentId: string) {
  const session = await requireRole([Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT]);
  
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { learner: true, enrollmentModules: { include: { trainingModule: true } } }
  });

  if (!enrollment) throw new Error("Inscription introuvable");

  const existingInvoice = await prisma.invoice.findFirst({
    where: { enrollmentId }
  });

  if (existingInvoice) return existingInvoice.id;

  const stamp = Date.now().toString().slice(-6);
  const invoiceNo = `FAC-${stamp}`;
  
  const clientName = `${enrollment.learner.firstName} ${enrollment.learner.lastName}`;
  const description = `Frais de formation - ${enrollment.enrollmentModules[0]?.trainingModule?.name || "Général"}`;
  
  const newInvoice = await prisma.invoice.create({
    data: {
      invoiceNo,
      clientName,
      amount: enrollment.totalFee,
      dueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description,
      enrollmentId,
      issuedById: session.userId,
      status: "ISSUED"
    }
  });
  
  // Create a document record
  await prisma.document.create({
    data: {
      documentNo: `DOC-FAC-${stamp}`,
      type: "INVOICE",
      enrollmentId,
      invoiceId: newInvoice.id,
    }
  });
  
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/finances");
  
  return newInvoice.id;
}
