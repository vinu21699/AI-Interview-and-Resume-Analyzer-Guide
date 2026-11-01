import { jsPDF } from 'jspdf';

/**
 * Strips markdown emphasis markers for clean ATS vector text rendering
 */
function cleanMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/```[a-z]*/gi, '')
    .replace(/`/g, '')
    .replace(/^>\s*/g, '')
    .trim();
}

/**
 * Generates and downloads a 100% ATS-Compliant Vector-Text PDF from Markdown
 * Uses native vector font glyphs (Helvetica) ensuring 100% readability by ATS parsers (pypdf, Workday, Greenhouse).
 */
export function downloadAtsPdfFromMarkdown(markdown, filename = '100%_ATS_Optimized_Resume.pdf') {
  if (!markdown || !markdown.trim()) {
    throw new Error('No resume content to export');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 38;
  const marginTop = 38;
  const marginBottom = 38;
  const contentWidth = pageWidth - (marginX * 2);

  let cursorY = marginTop;

  const checkPageBreak = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
      return true;
    }
    return false;
  };

  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      cursorY += 4;
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      checkPageBreak(10);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.75);
      doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
      cursorY += 8;
      continue;
    }

    // H1 - Candidate Name
    if (line.startsWith('# ')) {
      const name = cleanMarkdown(line.substring(2));
      checkPageBreak(28);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(name, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 20;
      continue;
    }

    // H2 - Section Headings (e.g. PROFESSIONAL SUMMARY, TECHNICAL SKILLS, EXPERIENCE)
    if (line.startsWith('## ')) {
      const heading = cleanMarkdown(line.substring(3)).toUpperCase();
      checkPageBreak(26);
      cursorY += 6;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(heading, marginX, cursorY);
      cursorY += 4;
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.setLineWidth(1);
      doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
      cursorY += 11;
      continue;
    }

    // H3 - Subheading (e.g. Senior Software Engineer | TechCorp)
    if (line.startsWith('### ')) {
      const subHeading = cleanMarkdown(line.substring(4));
      checkPageBreak(18);
      cursorY += 4;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(subHeading, marginX, cursorY);
      cursorY += 13;
      continue;
    }

    // Bullet Points (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletContent = cleanMarkdown(line.substring(2));
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const wrappedLines = doc.splitTextToSize(bulletContent, contentWidth - 14);
      const totalHeight = wrappedLines.length * 13;
      checkPageBreak(totalHeight + 3);

      doc.setFont('Helvetica', 'bold');
      doc.text('•', marginX, cursorY);
      doc.setFont('Helvetica', 'normal');
      doc.text(wrappedLines, marginX + 11, cursorY);
      cursorY += totalHeight + 3;
      continue;
    }

    // Regular text (Summary paragraphs, subtitle, contact details)
    const cleaned = cleanMarkdown(line);
    const isTopHeaderMeta = cursorY < 120 && (
      cleaned.includes('@') || 
      cleaned.includes('|') || 
      cleaned.toLowerCase().includes('phone') || 
      cleaned.toLowerCase().includes('linkedin') || 
      cleaned.toLowerCase().includes('github') ||
      cleaned.toLowerCase().includes('location')
    );

    if (isTopHeaderMeta) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      const wrapped = doc.splitTextToSize(cleaned, contentWidth);
      checkPageBreak(wrapped.length * 12 + 4);
      doc.text(wrapped, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += (wrapped.length * 12) + 4;
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      const wrapped = doc.splitTextToSize(cleaned, contentWidth);
      checkPageBreak(wrapped.length * 13 + 3);
      doc.text(wrapped, marginX, cursorY);
      cursorY += (wrapped.length * 13) + 3;
    }
  }

  doc.save(filename);
  return doc;
}

/**
 * Builds ATS Markdown from Resume Builder form data and triggers vector PDF download
 */
export function downloadAtsPdfFromBuilderData(formData, filename) {
  const {
    name = 'CANDIDATE NAME',
    targetRole = 'Software Engineer',
    email = '',
    phone = '',
    location = '',
    linkedin = '',
    github = '',
    portfolio = '',
    summary = '',
    skills = '',
    experience = [],
    projects = [],
    education = [],
    certifications = ''
  } = formData;

  const contactParts = [];
  if (email) contactParts.push(`Email: ${email}`);
  if (phone) contactParts.push(`Phone: ${phone}`);
  if (location) contactParts.push(`Location: ${location}`);
  if (linkedin) contactParts.push(`LinkedIn: ${linkedin}`);
  if (github) contactParts.push(`GitHub: ${github}`);
  if (portfolio) contactParts.push(`Portfolio: ${portfolio}`);

  let md = `# ${name.toUpperCase()}\n`;
  if (targetRole) md += `**${targetRole}**\n`;
  if (contactParts.length > 0) md += `${contactParts.join(' | ')}\n`;
  md += `\n---\n\n`;

  if (summary && summary.trim()) {
    md += `## PROFESSIONAL SUMMARY\n${summary.trim()}\n\n---\n\n`;
  }

  if (skills && skills.trim()) {
    md += `## TECHNICAL SKILLS\n`;
    const skillLines = skills.split('\n').filter(s => s.trim());
    if (skillLines.length > 0) {
      skillLines.forEach(sl => {
        md += `- ${sl.trim().startsWith('-') ? sl.trim().substring(1).trim() : sl.trim()}\n`;
      });
    }
    md += `\n---\n\n`;
  }

  if (experience && experience.length > 0) {
    md += `## PROFESSIONAL EXPERIENCE\n\n`;
    experience.forEach(exp => {
      md += `### **${exp.title}** | ${exp.company}\n`;
      const meta = [exp.dates, exp.location].filter(Boolean).join(' | ');
      if (meta) md += `*${meta}*\n`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach(b => {
          if (b && b.trim()) md += `- ${b.trim()}\n`;
        });
      }
      md += `\n`;
    });
    md += `---\n\n`;
  }

  if (projects && projects.length > 0) {
    md += `## KEY PORTFOLIO PROJECTS\n\n`;
    projects.forEach(proj => {
      md += `### **${proj.name}**\n`;
      if (proj.tech) md += `- *Tech Stack:* ${proj.tech}\n`;
      if (proj.link) md += `- *Link:* ${proj.link}\n`;
      if (proj.desc) md += `- ${proj.desc}\n`;
      md += `\n`;
    });
    md += `---\n\n`;
  }

  if (education && education.length > 0) {
    md += `## EDUCATION\n\n`;
    education.forEach(edu => {
      const details = [edu.school, edu.year, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' | ');
      md += `- **${edu.degree}** | ${details}\n`;
    });
    md += `\n`;
  }

  if (certifications && certifications.trim()) {
    md += `## CERTIFICATIONS\n\n`;
    const certLines = certifications.split('\n').filter(c => c.trim());
    certLines.forEach(c => {
      md += `- ${c.trim().startsWith('-') ? c.trim().substring(1).trim() : c.trim()}\n`;
    });
    md += `\n`;
  }

  const safeFilename = filename || `${name.replace(/\s+/g, '_')}_100%_ATS_Resume.pdf`;
  return downloadAtsPdfFromMarkdown(md, safeFilename);
}
