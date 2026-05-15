import pkg from "@prisma/client";
import bcrypt from "bcryptjs";

const {
  PrismaClient,
  AssignmentStatus,
  CashType,
  DocumentType,
  EmployeeStatus,
  EnrollmentStatus,
  InvoiceStatus,
  MissionStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} = pkg;

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Kagrom2026!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kagrom.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@kagrom.com",
      passwordHash,
      role: Role.ADMIN,
      phone: "628483054",
    },
  });

  const training = await prisma.training.upsert({
    where: { code: "PELLE-HYD" },
    update: {},
    create: {
      title: "Conduite d'engins lourds",
      code: "PELLE-HYD",
      category: "Formation professionnelle",
      description: "Formation pratique et theorique pour operateurs d'engins lourds.",
      durationDays: 30,
      fee: 4000000,
    },
  });

  const session = await prisma.trainingSession.upsert({
    where: { id: "seed-session-kagrom" },
    update: {},
    create: {
      id: "seed-session-kagrom",
      name: "session 1",
      sessionNumber: 1,
      location: "Conakry",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-05-15"),
      trainerName: "Equipe KAGROM",
      trainingId: training.id,
    },
  });

  const operatorType = await prisma.operatorType.upsert({
    where: { name: "Operateur" },
    update: {},
    create: { name: "Operateur" },
  });

  const modulePelle = await prisma.trainingModule.upsert({
    where: { name: "PELLE HYDRAULIQUE" },
    update: {},
    create: { name: "PELLE HYDRAULIQUE" },
  });

  await prisma.trainingModule.upsert({
    where: { name: "CHARIOT ELEVATEUR" },
    update: {},
    create: { name: "CHARIOT ELEVATEUR" },
  });

  const location = await prisma.trainingLocation.upsert({
    where: { name: "CONAKRY" },
    update: {},
    create: { name: "CONAKRY" },
  });

  const duration = await prisma.durationOption.upsert({
    where: { label: "3 mois" },
    update: {},
    create: { label: "3 mois", months: 3 },
  });

  const paymentMode = await prisma.paymentModeOption.upsert({
    where: { label: "Paiement echelonne" },
    update: {},
    create: { label: "Paiement echelonne" },
  });

  const tranche1 = await prisma.paymentInstallment.upsert({
    where: { label: "Tranche 1" },
    update: {},
    create: { label: "Tranche 1", sortOrder: 1 },
  });

  await prisma.paymentInstallment.upsert({
    where: { label: "Tranche 2" },
    update: {},
    create: { label: "Tranche 2", sortOrder: 2 },
  });

  const learner = await prisma.learner.upsert({
    where: { registrationNo: "KAG-2026-001" },
    update: {},
    create: {
      registrationNo: "KAG-2026-001",
      firstName: "Ibrahima Djago",
      lastName: "DIALLO",
      phone: "622016063",
      occupation: "Operateur",
      birthPlace: "Conakry",
      emergencyContactFirstName: "Mamadou",
      emergencyContactLastName: "Diallo",
      emergencyPhone: "620111222",
    },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { matricule: "MAT-2026-001" },
    update: {},
    create: {
      learnerId: learner.id,
      trainingSessionId: session.id,
      matricule: "MAT-2026-001",
      registrationDate: new Date("2026-04-16"),
      operatorTypeId: operatorType.id,
      trainingModuleId: modulePelle.id,
      trainingLocationId: location.id,
      durationOptionId: duration.id,
      paymentModeOptionId: paymentMode.id,
      registrationFee: 1000000,
      trainingFee: 3000000,
      totalFee: 4000000,
      amountPaid: 1400000,
      amountDue: 2600000,
      paymentStatus: PaymentStatus.PARTIAL,
      scoreTheory: 14,
      scorePractical: 14,
      averageScore: 14,
      resultLabel: "Bien",
      status: EnrollmentStatus.PASSED,
    },
  });

  const certificate = await prisma.certificate.upsert({
    where: { enrollmentId: enrollment.id },
    update: {},
    create: {
      enrollmentId: enrollment.id,
      certificateNo: "CERT-KAG-2026-0001",
      verificationCode: "VERIFY-KAG-2026-0001",
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { invoiceNo: "FAC-KAG-2026-001" },
    update: {},
    create: {
      invoiceNo: "FAC-KAG-2026-001",
      clientName: `${learner.firstName} ${learner.lastName}`,
      description: "Frais de formation - Pelle hydraulique",
      amount: 4000000,
      dueDate: new Date("2026-05-15"),
      status: InvoiceStatus.PARTIALLY_PAID,
      enrollmentId: enrollment.id,
      issuedById: admin.id,
    },
  });

  const payment = await prisma.payment.upsert({
    where: { paymentNo: "PAY-KAG-2026-001" },
    update: {},
    create: {
      paymentNo: "PAY-KAG-2026-001",
      invoiceId: invoice.id,
      enrollmentId: enrollment.id,
      installmentId: tranche1.id,
      amount: 1400000,
      paidAt: new Date("2026-04-23"),
      method: PaymentMethod.MOBILE_MONEY,
      reference: "OM-2026-9001",
      comment: "Versement initial",
      recordedById: admin.id,
    },
  });

  await prisma.receipt.upsert({
    where: { paymentId: payment.id },
    update: {},
    create: {
      paymentId: payment.id,
      receiptNo: "REC-KAG-2026-001",
    },
  });

  await prisma.cashEntry.upsert({
    where: { entryNo: "CAISSE-2026-0001" },
    update: {},
    create: {
      entryNo: "CAISSE-2026-0001",
      date: new Date("2026-04-23"),
      label: "Paiement inscription MAT-2026-001",
      type: CashType.INCOME,
      amount: 1400000,
      balanceAfter: 1400000,
      justification: "Versement Tranche 1",
      paymentId: payment.id,
    },
  });

  await prisma.document.upsert({
    where: { documentNo: "DOC-KAG-2026-001" },
    update: {},
    create: {
      documentNo: "DOC-KAG-2026-001",
      type: DocumentType.CERTIFICATE,
      status: "Genere",
      enrollmentId: enrollment.id,
      invoiceId: invoice.id,
    },
  });

  const provider = await prisma.serviceProvider.upsert({
    where: { phone: "620111222" },
    update: {},
    create: {
      fullName: "Aissatou Mansare",
      phone: "620111222",
      category: "Nounou",
      availability: "Temps plein",
      address: "Conakry",
    },
  });

  await prisma.serviceMission.upsert({
    where: { missionNo: "MIS-KAG-2026-001" },
    update: {},
    create: {
      missionNo: "MIS-KAG-2026-001",
      clientName: "Residence Camara",
      clientPhone: "621000111",
      location: "Lambanyi",
      serviceType: "Nounou",
      startDate: new Date("2026-04-20"),
      schedule: "Jour - Temps plein",
      details: "Prise en charge d'un enfant et assistance domestique legere.",
      amount: 1800000,
      status: MissionStatus.IN_PROGRESS,
      providerId: provider.id,
    },
  });

  const employee = await prisma.employee.upsert({
    where: { employeeNo: "EMP-2026-0001" },
    update: {},
    create: {
      employeeNo: "EMP-2026-0001",
      fullName: "Sia Madeleine Leno",
      phone: "610447039",
      address: "T6",
      competency: "Femme de menage",
      availability: "temps plein",
      status: EmployeeStatus.AVAILABLE,
    },
  });

  const household = await prisma.household.upsert({
    where: { code: "FOY-2026-0001" },
    update: {},
    create: {
      code: "FOY-2026-0001",
      name: "Famille Keita",
      managerName: "Camara Doussou",
      phone: "625424272",
      address: "Lambangni",
      requestedService: "Femme de menage",
    },
  });

  await prisma.assignment.upsert({
    where: { id: "assignment-seed-001" },
    update: {},
    create: {
      id: "assignment-seed-001",
      employeeId: employee.id,
      householdId: household.id,
      monthlyAmount: 1500000,
      startDate: new Date("2026-04-25"),
      status: AssignmentStatus.ACTIVE,
    },
  });

  console.log(`Seed termine: ${admin.email}`);
  console.log(`Certificat: ${certificate.certificateNo}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
