import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Password hashes
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Departments
  const departmentsData = [
    { name: 'Admissions', code: 'ADM', description: 'Handles application, eligibility, document verification, and intake.', email: 'admissions@university.edu' },
    { name: 'Accounts and Fees', code: 'FIN', description: 'Manages tuition fees, online payments, receipts, and refund policies.', email: 'accounts@university.edu' },
    { name: 'Examination Cell', code: 'EXM', description: 'Coordinates exam schedules, admit cards, re-evaluations, and transcripts.', email: 'exams@university.edu' },
    { name: 'Academic Department', code: 'ACA', description: 'Curriculum, course registration, syllabus, and academic calendars.', email: 'academics@university.edu' },
    { name: 'Student Affairs', code: 'SA', description: 'Student activities, ID cards, disciplinary matters, and welfare.', email: 'studentaffairs@university.edu' },
    { name: 'Hostel Administration', code: 'HST', description: 'Hostel allotment, mess facilities, room change requests, and rules.', email: 'hostel@university.edu' },
    { name: 'IT Helpdesk', code: 'IT', description: 'Student portal access, Wi-Fi configuration, email issues, and LMS support.', email: 'ithelpdesk@university.edu' },
    { name: 'General Support', code: 'GEN', description: 'General campus inquiries, transport, library access, and visitor info.', email: 'support@university.edu' },
  ];

  const createdDepts: Record<string, string> = {};
  for (const d of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    });
    createdDepts[d.code] = dept.id;
  }
  console.log('✅ Departments seeded');

  // 2. Seed Users & Support Agents
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      name: 'Dr. Sarah Jenkins (Admin)',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+15550001111',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      name: 'Alex Rivera (Student)',
      password: passwordHash,
      role: 'STUDENT',
      studentId: 'STU20268841',
      phone: '+15552223333',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Agent Users
  const agent1User = await prisma.user.upsert({
    where: { email: 'admissions.agent@university.edu' },
    update: {},
    create: {
      email: 'admissions.agent@university.edu',
      name: 'Mark Davis (Admissions Officer)',
      password: passwordHash,
      role: 'AGENT',
      phone: '+15554445555',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const agent1 = await prisma.supportAgent.upsert({
    where: { userId: agent1User.id },
    update: {},
    create: {
      userId: agent1User.id,
      departmentId: createdDepts['ADM'],
      isAvailable: true,
      maxTickets: 15,
    },
  });

  const agent2User = await prisma.user.upsert({
    where: { email: 'fees.agent@university.edu' },
    update: {},
    create: {
      email: 'fees.agent@university.edu',
      name: 'Elena Rostova (Accounts Specialist)',
      password: passwordHash,
      role: 'AGENT',
      phone: '+15556667777',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const agent2 = await prisma.supportAgent.upsert({
    where: { userId: agent2User.id },
    update: {},
    create: {
      userId: agent2User.id,
      departmentId: createdDepts['FIN'],
      isAvailable: true,
      maxTickets: 12,
    },
  });

  const agent3User = await prisma.user.upsert({
    where: { email: 'it.agent@university.edu' },
    update: {},
    create: {
      email: 'it.agent@university.edu',
      name: 'Kevin Chen (IT Lead)',
      password: passwordHash,
      role: 'AGENT',
      phone: '+15558889999',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const agent3 = await prisma.supportAgent.upsert({
    where: { userId: agent3User.id },
    update: {},
    create: {
      userId: agent3User.id,
      departmentId: createdDepts['IT'],
      isAvailable: true,
      maxTickets: 20,
    },
  });

  console.log('✅ Users and Support Agents seeded');

  // 3. Seed FAQs across 12 Categories
  const faqsData = [
    {
      question: 'What is the undergraduate admission process?',
      answer: 'The undergraduate admission process involves submitting an online application via the Student Portal, providing official high school transcripts, standardized test scores (if applicable), 2 letters of recommendation, and a personal statement. Applications open every September 15 for the upcoming academic year.',
      category: 'Admissions',
      keywords: 'admission, process, application, apply, undergraduate, requirement, transcript',
      priority: 10,
      helpfulCount: 45,
      unhelpfulCount: 2,
    },
    {
      question: 'Which documents are required for admission verification?',
      answer: 'Required verification documents include: 1) Certified High School / Secondary Marksheets, 2) National Identity Card / Passport copy, 3) Transfer / Migration Certificate, 4) 4 Passport size photographs, and 5) Proof of fee payment.',
      category: 'Admissions',
      keywords: 'documents, verification, certificates, marksheet, passport, identity, photo',
      priority: 9,
      helpfulCount: 38,
      unhelpfulCount: 1,
    },
    {
      question: 'What are the annual tuition fees for different degree programs?',
      answer: 'Tuition fees vary by program: Engineering & Computer Science: $8,500/year; Business & Economics: $7,200/year; Liberal Arts & Humanities: $6,500/year; Health Sciences: $9,000/year. Installment options are available through the accounts portal.',
      category: 'Fees and Payments',
      keywords: 'tuition, fees, cost, annual fee, payment, installment, prices',
      priority: 10,
      helpfulCount: 88,
      unhelpfulCount: 4,
    },
    {
      question: 'How can I pay my tuition fees online?',
      answer: 'You can pay tuition fees online by logging into the Student Portal -> Finance -> Pay Online. We accept Visa, MasterCard, Net Banking, and Bank Wire Transfer. Receipts are generated automatically upon successful transaction.',
      category: 'Fees and Payments',
      keywords: 'pay, online payment, credit card, net banking, receipt, finance, payment gateway',
      priority: 9,
      helpfulCount: 65,
      unhelpfulCount: 3,
    },
    {
      question: 'How can I download my fee receipt?',
      answer: 'To download your fee receipt, navigate to Student Portal -> Finance -> Payment History. Click on the Download PDF icon next to the relevant transaction ID.',
      category: 'Fees and Payments',
      keywords: 'fee receipt, receipt, invoice, download receipt, payment proof',
      priority: 7,
      helpfulCount: 29,
      unhelpfulCount: 0,
    },
    {
      question: 'What is the minimum attendance requirement to sit for end-semester exams?',
      answer: 'Students must maintain a minimum of 75% attendance in each course to be eligible to sit for final end-semester examinations. Students with 65-74% attendance due to medical reasons may submit a medical certificate for condonation to the Academic Dean.',
      category: 'Attendance',
      keywords: 'attendance, minimum attendance, 75%, exam eligibility, condonation, medical certificate',
      priority: 10,
      helpfulCount: 112,
      unhelpfulCount: 6,
    },
    {
      question: 'How can I check my examination results?',
      answer: 'Examination results are published on the Examination Portal (exams.university.edu) 3 weeks after final exams conclude. Log in with your Student ID and Date of Birth to view and download your Grade Sheet.',
      category: 'Examinations and Results',
      keywords: 'results, grades, exam results, grade sheet, GPA, transcript, pass marks',
      priority: 10,
      helpfulCount: 94,
      unhelpfulCount: 2,
    },
    {
      question: 'Where can I find the end-semester examination timetable?',
      answer: 'The official exam timetable is published 4 weeks prior to exam dates under Student Portal -> Examinations -> Exam Schedule. It is also displayed on department notice boards.',
      category: 'Timetable and Academic Calendar',
      keywords: 'timetable, exam schedule, date sheet, mid-term, end-term calendar',
      priority: 8,
      helpfulCount: 52,
      unhelpfulCount: 1,
    },
    {
      question: 'How can I apply for merit-based or financial need scholarships?',
      answer: 'Scholarship applications open at the start of each academic year (August 1 to September 30). Eligible students (GPA 3.5+ or household income < $30,000) can apply online via Student Portal -> Financial Aid -> Apply for Scholarship.',
      category: 'Scholarships and Financial Aid',
      keywords: 'scholarship, financial aid, grant, fee waiver, merit scholarship, financial assistance',
      priority: 9,
      helpfulCount: 76,
      unhelpfulCount: 3,
    },
    {
      question: 'How do I apply for hostel accommodation?',
      answer: 'Hostel application forms are available on the Hostel Portal (hostels.university.edu). Rooms are allotted on a first-come, first-served basis upon receipt of the hostel fee deposit.',
      category: 'Hostel and Accommodation',
      keywords: 'hostel, accommodation, dorm, room allotment, mess, hostel fee, residential',
      priority: 8,
      helpfulCount: 41,
      unhelpfulCount: 2,
    },
    {
      question: 'How do I obtain or replace my Student ID card?',
      answer: 'New students receive their ID card during orientation. For lost or damaged ID cards, visit the Student Affairs office (Building B, Room 102) with a $15 replacement fee receipt paid online.',
      category: 'Technical Support',
      keywords: 'student id, id card, lost id, smart card, campus pass',
      priority: 6,
      helpfulCount: 23,
      unhelpfulCount: 1,
    },
    {
      question: 'How can I access campus Wi-Fi and university library online resources?',
      answer: 'Connect to "Uni-Student-WiFi" using your student email ID and portal password. For off-campus access to online library journals and databases, log in through the Library EZProxy portal (library.university.edu/ezproxy).',
      category: 'Library',
      keywords: 'wifi, library, ezproxy, e-books, journals, internet, password, access',
      priority: 9,
      helpfulCount: 89,
      unhelpfulCount: 4,
    },
    {
      question: 'What are the campus shuttle transport routes and timings?',
      answer: 'The university operates free shuttle buses connecting major subway stations to campus every 15 minutes between 7:00 AM and 9:30 PM Monday through Saturday. Route maps are available on the Transport portal.',
      category: 'Transport',
      keywords: 'transport, shuttle bus, bus route, campus bus, commute, timing',
      priority: 6,
      helpfulCount: 34,
      unhelpfulCount: 0,
    },
    {
      question: 'Whom should I contact for technical issues with the Student Portal or LMS?',
      answer: 'For IT support, contact the IT Helpdesk via email at ithelpdesk@university.edu, call +1-555-0199, or submit an IT ticket through this UniAssist portal.',
      category: 'Contact University Departments',
      keywords: 'it helpdesk, portal error, lms, canvas, blackboard, password reset, login failed',
      priority: 9,
      helpfulCount: 67,
      unhelpfulCount: 2,
    }
  ];

  for (const f of faqsData) {
    await prisma.fAQ.create({
      data: f,
    });
  }
  console.log('✅ FAQs seeded');

  // 4. Seed KB Documents
  await prisma.kBDocument.createMany({
    data: [
      {
        title: 'University Student Handbook & Honor Code 2026',
        content: 'This document contains institutional policies regarding academic integrity, attendance standards, grading systems, code of conduct, anti-harassment regulations, and campus facilities usage.',
        category: 'Academic Policies',
        tags: 'handbook, policies, code of conduct, honor code, rules',
        sourceUrl: 'https://university.edu/docs/handbook-2026.pdf',
      },
      {
        title: 'Fee Payment and Refund Policy',
        content: 'Tuition fees must be paid prior to the commencement of each semester. Full refunds are provided for course withdrawal within 7 days of semester start. 50% refund is issued for withdrawal between 8-14 days. No refunds after 14 days.',
        category: 'Financial Policies',
        tags: 'fees, refund, withdrawal, payment deadline',
        sourceUrl: 'https://university.edu/docs/refund-policy.pdf',
      },
    ]
  });
  console.log('✅ Knowledge Base Documents seeded');

  // 5. Seed Conversations & Tickets
  const sampleConv = await prisma.conversation.create({
    data: {
      studentId: studentUser.id,
      channel: 'WEBSITE',
      isEscalated: true,
      isResolved: false,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: sampleConv.id,
        senderType: 'STUDENT',
        senderId: studentUser.id,
        content: 'Hi, I paid my tuition fees yesterday via wire transfer but my portal still shows unpaid.',
      },
      {
        conversationId: sampleConv.id,
        senderType: 'BOT',
        content: 'Online bank wire transfers usually take 24-48 hours to reflect in the financial ledger. If it has been longer, I can create a support ticket for our Accounts department to verify your payment proof.',
        confidenceScore: 0.88,
      },
      {
        conversationId: sampleConv.id,
        senderType: 'STUDENT',
        senderId: studentUser.id,
        content: 'Yes, please escalate this to accounts.',
      },
    ],
  });

  const sampleTicket = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TICK-1001',
      title: 'Tuition Fee Wire Transfer Verification Pending',
      description: 'Student paid $4,250 via Bank Wire Transfer on Sep 28. Receipt reference #WT99281. Portal payment status still showing Unpaid.',
      category: 'Fees and Payments',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      departmentId: createdDepts['FIN'],
      studentId: studentUser.id,
      assignedAgentId: agent2.id,
      conversationId: sampleConv.id,
      responseTimeMinutes: 18,
    },
  });

  await prisma.ticketAssignment.create({
    data: {
      ticketId: sampleTicket.id,
      agentId: agent2.id,
      assignedBy: adminUser.id,
    }
  });

  await prisma.ticketStatusHistory.createMany({
    data: [
      {
        ticketId: sampleTicket.id,
        previousStatus: 'OPEN',
        newStatus: 'ASSIGNED',
        changedById: adminUser.id,
        note: 'Assigned to Elena Rostova (Accounts Specialist)',
      },
      {
        ticketId: sampleTicket.id,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        changedById: agent2User.id,
        note: 'Verification requested from university treasury bank account.',
      }
    ]
  });

  await prisma.feedback.create({
    data: {
      ticketId: sampleTicket.id,
      conversationId: sampleConv.id,
      studentId: studentUser.id,
      rating: 5,
      comment: 'Very fast escalation and polite support officer!',
    }
  });

  console.log('✅ Sample Tickets & Feedback seeded');

  // 6. Seed WhatsApp & System Configurations
  await prisma.integrationConfig.createMany({
    data: [
      { key: 'WHATSAPP_ENABLED', value: 'true', description: 'Enable WhatsApp Cloud API Integration' },
      { key: 'WHATSAPP_PHONE_ID', value: '109827364529101', description: 'WhatsApp Business Phone Number ID' },
      { key: 'WHATSAPP_VERIFY_TOKEN', value: 'uniassist_whatsapp_verify_token_2026', description: 'Webhook Verification Token' },
      { key: 'AI_CONFIDENCE_THRESHOLD', value: '0.65', description: 'Minimum confidence score required for AI bot response' },
      { key: 'UNIVERSITY_NAME', value: 'Global University of Technology', description: 'Official University Name for AI Context' },
    ]
  });

  console.log('🌱 Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
