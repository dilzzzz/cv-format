/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import { refineResumeContent, type ResumeData } from './services/geminiService';
import { FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_DATA: ResumeData = {
  name: '',
  targetRole: '',
  summary: '',
  experience: '',
  skills: '',
  education: '',
  projects: '',
  achievements: '',
  email: '',
  phone: '',
  address: '',
  references: '',
  primaryColor: '#2D2E32',
  secondaryColor: '#E8E2DD',
  fontFamily: 'Inter',
  fontSize: 14,
  spacing: 1,
  gender: '',
  dob: '',
  nic: '',
  civilStatus: '',
  religion: '',
  initials: '',
  fullName: '',
  languages: '',
  customSections: [],
};

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [isRefining, setIsRefining] = useState(false);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'sidebar' | 'traditional'>('traditional');

  const handleRefine = useCallback(async () => {
    setIsRefining(true);
    try {
      const refined = await refineResumeContent(resumeData);
      setResumeData(refined);
    } finally {
      setIsRefining(false);
    }
  }, [resumeData]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="h-12 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-black p-1 rounded-lg">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">ProResume Craft</span>
        </div>
      </nav>

      <main className="flex flex-col lg:flex-row h-[calc(100vh-48px)] print:h-auto overflow-hidden">
        {/* Left Side: Form */}
        <section className="flex-1 overflow-auto border-r border-gray-100 print:hidden">
          <ResumeForm
            data={resumeData}
            onChange={setResumeData}
            onRefine={handleRefine}
            isRefining={isRefining}
            selectedTemplate={template}
            onTemplateChange={setTemplate}
          />
        </section>

        {/* Right Side: Preview */}
        <section className="flex-1 overflow-auto bg-gray-100 p-8 flex flex-col items-center print:bg-white print:p-0 relative">
          <div className="absolute top-4 right-8 flex items-center gap-2 bg-white/50 backdrop-blur px-3 py-1 rounded-full border border-gray-200 z-10 print:hidden">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Preview</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={template}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="w-full flex justify-center"
            >
              <ResumePreview data={resumeData} template={template} />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Global CSS for printing */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          nav, section:first-of-type, .print\\:hidden {
            display: none !important;
          }
          main {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          section:last-of-type {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          #resume-document {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
