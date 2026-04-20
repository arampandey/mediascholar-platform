import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, action } = body;
  if (secret !== "mediascholar-migrate-2026") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    if (action === "sync-keywords") {
      const updates = [
        { id: 'cmnoar4co000r7wb6cuot5fv1', keywords: ['Positive Deviance', 'Menstrual Health and Hygiene', 'Health Promotion', 'Behaviour Change Communication', 'Scoping Review', 'SBCC', 'India'] },
        { id: 'cmnoar4d7000z7wb6iakuvtv6', keywords: ['E-Governance', 'Digital Democracy', 'Citizen Empowerment', 'AI in Governance', 'Digital India', 'Public Administration', 'Smart Governance'] },
        { id: 'cmnoar4df00137wb65fpgqu5o', keywords: ['OTT Platforms', 'Digital Streaming', 'Indian Cinema', 'Movie Theatres', 'Media Consumption', 'Digital Disruption', 'Entertainment Industry'] },
        { id: 'cmnoar4dq001b7wb6ih0ef5a6', keywords: ['Documentary Films', 'Indian Cinema', 'Media Censorship', 'Digital Distribution', 'Filmmaking', 'Social Advocacy', 'Independent Cinema'] },
        { id: 'cmnoar4dy001h7wb676x15nlv', keywords: ['Political Communication', 'Social Media Campaigning', 'Indian Elections', 'Digital Politics', 'Election Campaign', 'Twitter', 'Voter Engagement'] },
        { id: 'cmnoar4e0001j7wb6rhwd4swp', keywords: ['Cross-cultural Music', 'Music Notation', 'Media and Music', 'Global Collaboration', 'Indian Music', 'Western Music', 'Digital Platforms'] },
        { id: 'cmnoar4ec001r7wb6ux3epqdu', keywords: ['सोशल मीडिया विनियमन', 'डिजिटल सामग्री', 'अभिव्यक्ति की स्वतंत्रता', 'सर्वेक्षण अध्ययन', 'सूचना प्रौद्योगिकी नियम', 'ऑनलाइन प्लेटफॉर्म', 'भारत'] },
        { id: 'cmnoar4ef001t7wb6p0fxyv32', keywords: ['Artificial Intelligence', 'Media Education', 'Academic Integrity', 'AI in Education', 'College Students', 'Plagiarism', 'Media Academicians'] },
        { id: 'cmnoar4ey00257wb6nlaydyue', keywords: ['हिंदी सिनेमा', 'भाषा प्रसार', 'बॉलीवुड', 'सांस्कृतिक संचार', 'भारतीय फिल्म', 'हिंदी भाषा', 'मीडिया और संस्कृति'] },
        { id: 'cmnoar4ek001x7wb6ldi4zg4x', keywords: ['Digital Service Providers', 'Customer Satisfaction', 'Digitech Startups', 'Cloud Computing', 'Digital Marketing', 'SaaS', 'Consumer Perception'] },
        { id: 'cmnoar4en001z7wb6jlhsmwoo', keywords: ['Broadcasting', 'Youth and Media', 'Digital Media', 'Media Effects', 'Social Media', 'Television', 'Youth Behaviour'] },
        { id: 'cmnoar4eq00217wb6w9hndtsk', keywords: ['महिला सशक्तिकरण', 'भारतीय सिनेमा', 'लैंगिक प्रतिनिधित्व', 'हिंदी फिल्म', 'नारी चित्रण', 'सांस्कृतिक मूल्य', 'मीडिया और समाज'] },
        { id: 'cmnoar4f7002b7wb6htjm138y', keywords: ['हिंदी सिनेमा', 'अश्लीलता', 'मीडिया नैतिकता', 'फिल्म विश्लेषण', 'सांस्कृतिक प्रभाव', 'मनोरंजन उद्योग', 'सेंसरशिप'] },
        { id: 'cmnoar4fb002d7wb67p91ex5m', keywords: ['Jatra', 'Folk Performance', 'Mass Media Impact', 'Marginalised Communities', 'New Media', 'Traditional Art', 'Bengal'] },
        { id: 'cmnoar4fg002h7wb62lspzrqn', keywords: ['Marginality', 'Religion and Media', 'Regional Identity', 'Digital Divide', 'Social Exclusion', 'Communication', 'Indian Society'] },
        { id: 'cmnoar4d2000x7wb6slr99km9', keywords: ['हिन्दी सिनेमा', 'नवउदारवाद', 'राजनीतिक सिनेमा', 'आर्थिक नीति', 'बॉलीवुड', 'सांस्कृतिक विमर्श', 'मीडिया राजनीति'] },
        { id: 'cmnoar4di00157wb62jomnmw6', keywords: ['Web Series', 'Streaming Platforms', 'Media Psychology', 'Digital Entertainment', 'OTT Content', 'Audience Behaviour', 'On-demand Viewing'] },
        { id: 'cmnoar4e5001n7wb63co94x27', keywords: ['Social Media', 'College Students', 'Academic Performance', 'Media Consumption', 'Digital Behaviour', 'Student Media Habits', 'Survey Study'] },
        { id: 'cmnoar4e3001l7wb6w531age1', keywords: ['Dalit Journalism', 'Alternative Media', 'Digital Entrepreneurship', 'Marginalized Communities', 'Indian Media', 'Social Emancipation', 'New Media'] },
        { id: 'cmnoar4fd002f7wb628j3cd6r', keywords: ['Social Media', 'Society', 'Social Networking', 'Digital Communication', 'Media Impact', 'Web 2.0', 'Online Behaviour'] },
        { id: 'cmnoar4db00117wb6owu4z0it', keywords: ['OTT and Cinema', 'Feminist Film Studies', 'Gender Representation', 'Storytelling', 'Hindi Cinema', 'Female Directors', 'Gender Dynamics'] },
        { id: 'cmnoar4dw001f7wb64gr6html', keywords: ['Munda Tribe', 'Folk Communication', 'Rural Culture', 'Indigenous Media', 'Jharkhand', 'Cultural Identity', 'Tribal Art'] },
        { id: 'cmnoar4e8001p7wb6e6cv85lk', keywords: ['Artificial Intelligence', 'Peer Review', 'Academic Research', 'Research Ethics', 'Plagiarism Detection', 'Mass Communication Research', 'AI Bias'] },
        { id: 'cmnoar4dn00197wb6g30fr11v', keywords: ['Digital India', 'Tribal Development', 'Rural Digital Access', 'E-governance', 'Digital Literacy', 'Marginalized Communities', 'Internet Connectivity'] },
        { id: 'cmnoar4ei001v7wb6a5os82g3', keywords: ['Social Media', 'School Students', 'Media Habits', 'Instagram', 'Adolescent Behaviour', 'Haryana', 'Digital Media Use'] },
        { id: 'cmnoar4dt001d7wb6j8jdeig9', keywords: ['Communication Psychology', 'Media Effects', 'Psychological Impact', 'Mass Communication', 'Audience Behaviour', 'Media Research', 'Digital Media'] },
      ];
      let updated = 0;
      for (const u of updates) {
        await prisma.submission.update({ where: { id: u.id }, data: { keywords: u.keywords } });
        updated++;
      }
      return NextResponse.json({ success: true, message: `Synced keywords for ${updated} papers` });
    }

    if (action === "fix-github-urls") {
      // Replace raw.githubusercontent.com PDF URLs with /uploads/ relative paths
      const papers = await prisma.submission.findMany({
        where: { fileUrl: { contains: "github" } },
        select: { id: true, fileUrl: true },
      });
      let fixed = 0;
      for (const p of papers) {
        // Extract filename from GitHub URL e.g. .../paper_abc.pdf → /uploads/paper_abc.pdf
        const match = p.fileUrl?.match(/([^/]+\.pdf)$/);
        if (match) {
          await prisma.submission.update({
            where: { id: p.id },
            data: { fileUrl: `/uploads/${match[1]}` },
          });
          fixed++;
        }
      }
      return NextResponse.json({ success: true, message: `Fixed ${fixed} GitHub PDF URLs`, total: papers.length });
    }

    if (action === "check-user") {
      const { email } = body;
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, name: true, email: true, role: true, emailVerified: true, verifyToken: true },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === "verify-user") {
      const { email } = body;
      const user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { emailVerified: true, verifyToken: null },
        select: { id: true, name: true, email: true, emailVerified: true },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === "list-fileurls") {
      const limit = body.limit || 100;
      const rows = await prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, title: true, fileUrl: true, status: true, createdAt: true },
      });
      return NextResponse.json({ success: true, rows });
    }

    if (action === "fix-emails") {
      await prisma.$executeRaw`UPDATE "User" SET email = 'mediascholarjournal@gmail.com' WHERE email = 'editor@mediascholar.in'`;
      await prisma.$executeRaw`UPDATE "User" SET email = 'apoorvaagnihotri8@gmail.com' WHERE email = 'subeditor@mediascholar.in' OR email = 'apoorva.smcs@galgotiasuniversity.edu.in'`;
      return NextResponse.json({ success: true, message: "Editor emails updated" });
    }

    // Default: schema migration
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT`;
    await prisma.$executeRaw`UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL`;
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
