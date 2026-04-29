import React from "react";
import { type ResumeData } from "../services/geminiService";
import { Mail, Phone, MapPin, User, Bold, Italic } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResumePreviewProps {
  data: ResumeData;
  template: 'modern' | 'classic' | 'minimal' | 'sidebar' | 'traditional';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template }) => {
  const sections = [
    { title: "Summary", content: data.summary },
    { title: "Experience", content: data.experience },
    { title: "Projects", content: data.projects },
    { title: "Skills", content: data.skills },
    { title: "Education", content: data.education },
    { title: "Achievements", content: data.achievements },
    ...(data.customSections || []).map(s => ({ title: s.title, content: s.content })),
    { title: "References", content: data.references },
  ];

  const formatContent = (content: string) => {
    if (!content) return null;
    const baseSpacing = data.spacing || 1;
    return (
      <div className="markdown-content">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-1 last:mb-0" style={{ lineHeight: baseSpacing + 0.2 }}>{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-outside space-y-1 mb-2 last:mb-0">{children}</ul>,
            li: ({ children }) => <li className="ml-4 mb-0.5 last:mb-0" style={{ lineHeight: baseSpacing + 0.2 }}>{children}</li>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => <del className="line-through text-gray-400">{children}</del>,
            code: ({ children }) => <code className="bg-gray-100 px-1 rounded font-mono text-[0.9em]">{children}</code>,
          }}
        >
          {content}
        </Markdown>
      </div>
    );
  };

  const primary = data.primaryColor || "#2D2E32";
  const secondary = data.secondaryColor || "#E8E2DD";

  const renderModern = () => (
    <div className="space-y-6 bg-white p-6 md:p-10">
      <header 
        className="border-b-2 pb-4 mb-6 text-center text-gray-900 flex flex-col items-center"
        style={{ borderColor: primary }}
      >
        {data.image && (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-100 shadow-sm">
            <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {data.name || "Your Name"}
        </h1>
        <p className="text-lg font-medium tracking-wide" style={{ color: primary }}>
          {data.targetRole || "Target Job Title"}
        </p>
      </header>
      {/* Rest of items (excluding References which usually go last or are separate) */}
      <div className="space-y-6">
        {sections.filter(s => s.title !== "References").map((section, idx) => (
          section.content && (
            <section key={idx} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-widest border-b mb-2 pb-1" style={{ color: primary, borderColor: secondary }}>
                {section.title}
              </h2>
              <div style={{ fontSize: (data.fontSize || 14) * 0.9 }}>
                {formatContent(section.content)}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );

  const renderClassic = () => (
    <div className="space-y-4 bg-white p-6 md:p-10">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold border-b-2 border-double pb-2 mb-1" style={{ color: primary, borderColor: primary }}>
          {data.name || "Your Name"}
        </h1>
        <p className="italic text-gray-700 text-sm">{data.targetRole || "Target Job Title"}</p>
      </header>
      <div className="space-y-4">
        {sections.map((section, idx) => (
          section.content && (
            <section key={idx} className="grid grid-cols-4 gap-4 break-inside-avoid">
              <h2 className="col-span-1 text-[10px] font-bold uppercase tracking-tight text-right pt-1" style={{ color: primary }}>
                {section.title}
              </h2>
              <div className="col-span-3 border-l pl-4" style={{ borderColor: secondary, fontSize: (data.fontSize || 14) * 0.9 }}>
                 {formatContent(section.content)}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="px-4 py-8 bg-white p-6 md:p-10">
      <header className="mb-8 text-gray-900 flex items-start justify-between house-of-colors">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2" style={{ color: primary }}>
            {data.name || "Your Name"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-10" style={{ backgroundColor: primary }}></span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              {data.targetRole || "Target Job Title"}
            </p>
          </div>
        </div>
        {data.image && (
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg transform rotate-3" style={{ backgroundColor: secondary }}>
            <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          </div>
        )}
      </header>
      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, idx) => (
          section.content && (
            <section key={idx} className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase mb-2 tracking-tighter flex items-center gap-2" style={{ color: primary }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></span>
                {section.title}
              </h2>
              <div className="text-[13px] leading-snug max-w-2xl text-gray-700">
                {formatContent(section.content)}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="flex flex-col min-h-screen">
      {/* Header with Background */}
      <div 
        className="p-8 flex justify-between items-center text-white min-h-[160px] relative overflow-hidden shrink-0"
        style={{ backgroundColor: primary }}
      >
        {/* Profile Picture */}
        <div className="flex items-center gap-8 z-10 w-full px-4">
           <div 
            className="w-32 h-32 rounded-full border-4 overflow-hidden bg-gray-400 shrink-0 shadow-xl flex items-center justify-center"
            style={{ borderColor: secondary }}
           >
              {data.image ? (
                <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16" style={{ color: primary }} />
              )}
           </div>
           <div className="flex-1">
             <h1 className="text-4xl font-bold tracking-tight mb-1 break-words">
                {data.name || "Your Name"}
             </h1>
             <p className="text-lg opacity-90">{data.targetRole}</p>
           </div>
        </div>
        {/* Slanted background effect like in the image */}
        <div 
          className="absolute top-0 right-0 w-1/3 h-full transform skew-x-[-20deg] translate-x-12 opacity-10 pointer-events-none"
          style={{ backgroundColor: secondary }}
        ></div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - Personal Info, Education, Skills */}
        <aside className="w-[260px] p-6 space-y-8 shrink-0 overflow-hidden" style={{ backgroundColor: secondary }}>
          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2" style={{ borderColor: primary }}>Personal Info</h2>
            <div className="space-y-2 text-gray-700">
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primary }}>
                    <Mail className="w-2.5 h-2.5 text-white" />
                 </div>
                 <span className="text-xs underline break-all">{data.email || "email@example.com"}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primary }}>
                    <Phone className="w-2.5 h-2.5 text-white" />
                 </div>
                 <span className="text-xs">{data.phone || "+947... "}</span>
               </div>
               <div className="flex items-start gap-2">
                 <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: primary }}>
                    <MapPin className="w-2.5 h-2.5 text-white" />
                 </div>
                 <span className="text-xs whitespace-pre-wrap">{data.address || "Your Address"}</span>
               </div>
            </div>
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2" style={{ borderColor: primary }}>Education</h2>
            <div className="space-y-3 text-xs italic">
              {formatContent(data.education)}
            </div>
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-2" style={{ borderColor: primary }}>Skills</h2>
            <div className="space-y-2">
              {(data.skills || '').split(',').map((skill, i) => (
                <div key={i} className="text-xs text-gray-700 flex flex-col gap-1">
                   <span className="font-medium text-gray-900">{skill.trim()}</span>
                   <div className="h-1 bg-gray-300 w-full rounded-full overflow-hidden">
                      <div className="h-full w-4/5" style={{ backgroundColor: primary }}></div>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-8 space-y-8 overflow-hidden">
          <section className="break-inside-avoid">
            <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 pb-1 inline-block min-w-[120px]" style={{ borderColor: primary }}>Summary</h2>
            <div className="text-xs leading-relaxed text-gray-700">
              {formatContent(data.summary)}
            </div>
          </section>

          <section className="break-inside-avoid">
            <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 pb-1 inline-block min-w-[180px]" style={{ borderColor: primary }}>Work Experience</h2>
            <div className="space-y-4">
              {(data.experience || '').split('\n\n\n').map((block, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs text-gray-700">
                     {formatContent(block)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(data.customSections || []).map((section, idx) => (
            section.content && (
              <section key={idx} className="break-inside-avoid">
                <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 pb-1 inline-block min-w-[120px]" style={{ borderColor: primary }}>
                  {section.title}
                </h2>
                <div className="text-xs leading-relaxed text-gray-700">
                  {formatContent(section.content)}
                </div>
              </section>
            )
          ))}

          {data.references && (
            <section className="break-inside-avoid">
              <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 pb-1 inline-block min-w-[120px]" style={{ borderColor: primary }}>References</h2>
              <div className="text-xs text-gray-700 whitespace-pre-wrap">
                {formatContent(data.references)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );

  const renderTraditional = () => {
    const navyBlue = "#1e293b"; // Slate-800 for navy blue

    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Blue Header - Compacted */}
        <header className="flex items-center px-8 py-6 text-white relative shrink-0" style={{ backgroundColor: navyBlue }}>
          <div className="flex items-center gap-6 z-10 w-full">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shrink-0 shadow-md">
              {data.image ? (
                <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 text-right">
              <h1 className="text-4xl font-bold tracking-tight uppercase leading-none font-serif">
                {data.name || "YOUR NAME"}
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 p-6 space-y-4 overflow-hidden">
            <section className="break-inside-avoid">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-center py-1 mb-2 bg-[#D6E4F0] text-black border-b border-gray-300">
                PROFILE
              </h2>
              <div className="text-[10px] text-justify leading-relaxed text-gray-800">
                {formatContent(data.summary)}
              </div>
            </section>

            {data.achievements && (
              <section className="break-inside-avoid">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-center py-1 mb-2 bg-[#D6E4F0] text-black border-b border-gray-300">
                   PROFESSIONAL QUALIFICATIONS
                </h2>
                <div className="text-[10px] text-gray-800">
                  {formatContent(data.achievements)}
                </div>
              </section>
            )}

            <section className="break-inside-avoid">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-center py-1 mb-2 bg-[#D6E4F0] text-black border-b border-gray-300">
                EDUCATIONAL QUALIFICATIONS
              </h2>
              <div className="text-[10px] italic text-gray-800">
                {formatContent(data.education)}
              </div>
            </section>

            <section className="break-inside-avoid">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-center py-1 mb-2 bg-[#D6E4F0] text-black border-b border-gray-300">
                WORK EXPERIENCE
              </h2>
              <div className="space-y-2 text-[10px] text-gray-800">
                {(data.experience || '').split('\n\n\n').map((block, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    {formatContent(block)}
                  </div>
                ))}
              </div>
            </section>

            {data.references && (
              <section className="break-inside-avoid">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-center py-1 mb-2 bg-[#D6E4F0] text-black border-b border-gray-300">
                  REFERENCES
                </h2>
                <div className="text-[10px] grid grid-cols-2 gap-4 text-gray-800">
                  {formatContent(data.references)}
                </div>
              </section>
            )}

            <div className="pt-6 mt-auto">
              <p className="text-[9px] text-gray-600 italic mb-6 text-center">
                I hereby certify that all above particulars furnished by me are true and accurate to the best of my knowledge.
              </p>
              <div className="flex justify-between items-end px-8">
                <div className="text-center w-28">
                   <div className="border-t border-gray-400 pt-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider">DATE</p>
                   </div>
                </div>
                <div className="text-center w-40">
                   <div className="border-t border-gray-400 pt-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider">SIGNATURE</p>
                   </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="w-[240px] space-y-4 shrink-0 bg-[#f9fafb] border-l border-gray-200">
            <section className="break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-center py-2 text-white" style={{ backgroundColor: navyBlue }}>
                CONTACT INFO
              </h2>
              <div className="p-4 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-900">Address:</p>
                  <p className="text-[10px] text-gray-600 leading-snug whitespace-pre-wrap">{data.address || "Your Address"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-900">Phone:</p>
                  <p className="text-[10px] text-gray-600">{data.phone || "(+94) ..."}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">E-mail:</p>
                   <p className="text-[10px] text-blue-600 underline break-all italic">{data.email || "email@example.com"}</p>
                </div>
              </div>
            </section>

            <section className="break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-center py-2 text-white" style={{ backgroundColor: navyBlue }}>
                PERSONAL INFO
              </h2>
              <div className="p-4 space-y-3">
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Full Name :</p>
                   <p className="text-[10px] text-gray-600 uppercase leading-tight">{data.fullName || data.name || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Name with initials :</p>
                   <p className="text-[10px] text-gray-600 uppercase">{data.initials || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Gender :</p>
                   <p className="text-[10px] text-gray-600">{data.gender || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Date Of Birth :</p>
                   <p className="text-[10px] text-gray-600">{data.dob || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">NIC No :</p>
                   <p className="text-[10px] text-gray-600">{data.nic || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Civil Status :</p>
                   <p className="text-[10px] text-gray-600">{data.civilStatus || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-gray-900">Religion :</p>
                   <p className="text-[10px] text-gray-600">{data.religion || "N/A"}</p>
                </div>
              </div>
            </section>

            <section className="break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-center py-2 text-white" style={{ backgroundColor: navyBlue }}>
                LANGUAGES
              </h2>
              <ul className="p-4 space-y-1">
                {(data.languages || '').split(',').map((lang, i) => (
                  lang.trim() && (
                    <li key={i} className="text-[10px] text-gray-600 flex items-center gap-1.5">
                       <span className="w-1 h-1 bg-black shrink-0"></span>
                       {lang.trim()}
                    </li>
                  )
                ))}
              </ul>
            </section>

            <section className="break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-center py-2 text-white" style={{ backgroundColor: navyBlue }}>
                SKILLS HIGHLIGHT
              </h2>
              <ul className="p-4 space-y-1.5">
                {(data.skills || '').split(',').map((skill, i) => (
                  skill.trim() && (
                    <li key={i} className="text-[10px] text-gray-600 flex items-start gap-1.5 leading-tight">
                       <span className="w-1 h-1 bg-black mt-1 shrink-0"></span>
                       {skill.trim()}
                    </li>
                  )
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div 
      id="resume-document" 
      className="bg-white text-gray-900 shadow-2xl min-h-[1100px] w-full max-w-[900px] mx-auto print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full transition-all duration-300 overflow-hidden"
      style={{ 
        fontFamily: data.fontFamily || 'Inter, sans-serif',
        fontSize: `${data.fontSize || 14}px`,
        lineHeight: data.spacing || 1.2
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            margin: 0;
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          body * { visibility: hidden; }
          #resume-document, #resume-document * { visibility: visible; }
          #resume-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            overflow: hidden;
            page-break-after: avoid;
            page-break-before: avoid;
          }
          .break-inside-avoid {
             page-break-inside: avoid;
          }
          .print-hidden { display: none !important; }
        }
      `}} />
      {template === 'traditional' ? renderTraditional() : (
        template === 'sidebar' ? renderSidebar() : (
          <div className="p-0">
             {template === 'modern' || template === 'classic' || template === 'minimal' ? (
                <>
                  {template === 'modern' && renderModern()}
                  {template === 'classic' && renderClassic()}
                  {template === 'minimal' && renderMinimal()}
                </>
             ) : null}
          </div>
        )
      )}
    </div>
  );
};
