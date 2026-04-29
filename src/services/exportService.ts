import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { type ResumeData } from "./geminiService";
// @ts-ignore - html2pdf doesn't have official types easily accessible sometimes
import html2pdf from 'html2pdf.js';

export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found:", elementId);
    return;
  }

  // Create a clone to avoid any UI interference during capture
  const opt = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename: `${filename.replace(/\s+/g, "_")}_Resume.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      letterRendering: true,
      logging: false,
      scrollY: -window.scrollY,
      onclone: (clonedDoc: any) => {
        // Fix for modern color functions (oklch, oklab) which html2canvas cannot parse
        
        // 1. Sanitize all <style> tags text content and any style attributes
        const sanitizeString = (str: string) => {
          if (!str) return str;
          // Replace oklch/oklab with a safe fallback (dark gray or black)
          // We use a regex that handles nested parentheses roughly
          return str.replace(/okl(ch|ab)\([^)]+\)/g, (match) => {
            const lower = match.toLowerCase();
            if (lower.includes(' 0%') || lower.includes(' 0 ') || lower.includes('black')) return '#000000';
            if (lower.includes(' 100%') || lower.includes(' 1 ') || lower.includes('white')) return '#ffffff';
            if (lower.includes(' 90%') || lower.includes('0.9')) return '#f3f4f6'; 
            return '#4b5563'; // Default fallback gray
          });
        };

        // Sanitize head (style tags)
        clonedDoc.head.innerHTML = sanitizeString(clonedDoc.head.innerHTML);

        // Sanitize all elements
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach((el: any) => {
          try {
            // Check for oklch in inline styles
            if (el.style) {
              const inlineStyle = el.getAttribute('style');
              if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab'))) {
                el.setAttribute('style', sanitizeString(inlineStyle));
              }

              // Also check computed styles and override them if they contain problematic colors
              const style = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'columnRuleColor', 'boxShadow', 'textShadow', 'backgroundImage'];
              
              props.forEach(prop => {
                const val = (style as any)[prop];
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  el.style[prop] = sanitizeString(val);
                }
              });
            }

            // Also handle SVG fills/strokes
            if (el instanceof SVGElement) {
              const fill = el.getAttribute('fill');
              const stroke = el.getAttribute('stroke');
              if (fill && (fill.includes('oklch') || fill.includes('oklab'))) el.setAttribute('fill', sanitizeString(fill));
              if (stroke && (stroke.includes('oklch') || stroke.includes('oklab'))) el.setAttribute('stroke', sanitizeString(stroke));
            }
          } catch (e) {
            // ignore
          }
        });

        // Add a global override for Tailwind colors that might be lurking in variables
        const styleTag = clonedDoc.createElement('style');
        styleTag.innerHTML = `
          * { 
            --tw-ring-color: transparent !important;
            --tw-ring-shadow: none !important;
            --tw-shadow: none !important;
            --tw-shadow-colored: none !important;
          }
        `;
        clonedDoc.head.appendChild(styleTag);
      }
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' as const,
      compress: true
    }
  };

  try {
    const worker = html2pdf().set(opt).from(element);
    await worker.save();
  } catch (error) {
    console.error("PDF Export failed:", error);
    // Fallback to print if library fails
    window.print();
  }
};

export const exportToTxt = (data: ResumeData) => {
  const content = `
${data.name.toUpperCase()}
${data.targetRole}

CONTACT
Email: ${data.email}
Phone: ${data.phone}
Address: ${data.address}

SUMMARY
${data.summary}

EXPERIENCE
${data.experience}

PROJECTS
${data.projects}

SKILLS
${data.skills}

EDUCATION
${data.education}

ACHIEVEMENTS
${data.achievements}
${(data.customSections || []).map(s => `\n${s.title.toUpperCase()}\n${s.content}`).join('\n')}

REFERENCES
${data.references}
  `.trim();

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${data.name.replace(/\s+/g, "_")}_Resume.txt`);
};

export const exportToDocx = async (data: ResumeData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: data.name.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: data.targetRole,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          new Paragraph({ text: "CONTACT", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: `Email: ${data.email}` }),
          new Paragraph({ text: `Phone: ${data.phone}` }),
          new Paragraph({ text: `Address: ${data.address}`, spacing: { after: 200 } }),

          new Paragraph({ text: "SUMMARY", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: data.summary, spacing: { after: 200 } }),

          new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_3 }),
          ...data.experience.split("\n").map(line => new Paragraph({ text: line })),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({ text: "PROJECTS", heading: HeadingLevel.HEADING_3 }),
          ...data.projects.split("\n").map(line => new Paragraph({ text: line })),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: data.skills, spacing: { after: 200 } }),

          new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: data.education, spacing: { after: 200 } }),

          new Paragraph({ text: "ACHIEVEMENTS", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: data.achievements, spacing: { after: 200 } }),

          ...(data.customSections || []).flatMap(s => [
            new Paragraph({ text: s.title.toUpperCase(), heading: HeadingLevel.HEADING_3 }),
            ...s.content.split("\n").map(line => new Paragraph({ text: line })),
            new Paragraph({ text: "", spacing: { after: 200 } }),
          ]),

          new Paragraph({ text: "REFERENCES", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: data.references }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.name.replace(/\s+/g, "_")}_Resume.docx`);
};
