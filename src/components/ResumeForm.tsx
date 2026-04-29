import React from "react";
import { type ResumeData } from "../services/geminiService";
import { Sparkles, Loader2, Download, ImagePlus, X, Bold, Italic, List, Strikethrough, Code, FileText, FileJson, Languages, Plus, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { exportToDocx, exportToTxt, exportToPdf } from "../services/exportService";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onRefine: () => Promise<void>;
  isRefining: boolean;
  selectedTemplate: 'modern' | 'classic' | 'minimal' | 'sidebar' | 'traditional';
  onTemplateChange: (template: 'modern' | 'classic' | 'minimal' | 'sidebar' | 'traditional') => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ 
  data, 
  onChange, 
  onRefine, 
  isRefining,
  selectedTemplate,
  onTemplateChange 
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = React.useState(false);

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await exportToPdf('resume-document', data.name || 'My');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onChange({ ...data, image: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addCustomSection = () => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Section",
      content: ""
    };
    onChange({ 
      ...data, 
      customSections: [...(data.customSections || []), newSection] 
    });
  };

  const removeCustomSection = (id: string) => {
    onChange({ 
      ...data, 
      customSections: (data.customSections || []).filter(s => s.id !== id) 
    });
  };

  const handleCustomSectionChange = (id: string, field: 'title' | 'content', value: string) => {
    onChange({ 
      ...data, 
      customSections: (data.customSections || []).map(s => 
        s.id === id ? { ...s, [field]: value } : s
      ) 
    });
  };

  const templates: { id: 'modern' | 'classic' | 'minimal' | 'sidebar' | 'traditional'; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'sidebar', name: 'Professional' },
    { id: 'traditional', name: 'Traditional' }
  ];

  const fonts = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Roboto Slab', value: '"Roboto Slab", serif' },
    { name: 'Source Serif Pro', value: '"Source Serif 4", serif' }
  ];

  const [newSkill, setNewSkill] = React.useState("");
  const [newExp, setNewExp] = React.useState({
    title: '',
    company: '',
    type: 'Full Time',
    location: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    description: ''
  });

  const handleAddExp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newExp.title && newExp.company) {
      const startDate = `${newExp.startMonth} ${newExp.startYear}`.trim();
      const endDate = newExp.isCurrent ? 'Present' : `${newExp.endMonth} ${newExp.endYear}`.trim();
      const duration = [startDate, endDate].filter(Boolean).join(' – ');
      
      const typeStr = newExp.type ? ` | ${newExp.type}` : '';
      const location = newExp.location.trim();
      const metaLine = [duration, location].filter(Boolean).join(' | ');
      
      const formattedEntry = `**${newExp.title}** at **${newExp.company}**${typeStr}${metaLine ? `\n${metaLine}` : ''}\n\n${newExp.description}`;
      
      const currentEntries = data.experience ? data.experience.split('\n\n\n').map(s => s.trim()).filter(Boolean) : [];
      const updatedExp = [...currentEntries, formattedEntry].join('\n\n\n');
      onChange({ ...data, experience: updatedExp });
      
      setNewExp({
        title: '',
        company: '',
        type: 'Full Time',
        location: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        isCurrent: false,
        description: ''
      });
    }
  };

   const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newSkill.trim()) {
      const currentSkills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (!currentSkills.includes(newSkill.trim())) {
        const updatedSkills = [...currentSkills, newSkill.trim()].join(', ');
        onChange({ ...data, skills: updatedSkills });
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove).join(', ');
    onChange({ ...data, skills: updatedSkills });
  };

  const removeExp = (indexToRemove: number) => {
    const currentExp = data.experience.split('\n\n\n').map(s => s.trim()).filter(Boolean);
    const updatedExp = currentExp.filter((_, i) => i !== indexToRemove).join('\n\n\n');
    onChange({ ...data, experience: updatedExp });
  };

  const [newEdu, setNewEdu] = React.useState({
    school: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    isCurrent: false,
    location: '',
    description: ''
  });

  const handleAddEdu = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newEdu.school && newEdu.degree) {
      const startDate = newEdu.startYear.trim();
      const endDate = newEdu.isCurrent ? 'Present' : newEdu.endYear.trim();
      const duration = [startDate, endDate].filter(Boolean).join(' – ');
      
      const location = newEdu.location.trim();
      const fieldStr = newEdu.field ? ` in ${newEdu.field}` : '';
      const metaLine = [newEdu.school, location, duration].filter(Boolean).join(' | ');
      
      const formattedEntry = `**${newEdu.degree}**${fieldStr}\n${metaLine}\n\n${newEdu.description}`;
      
      const currentEntries = data.education ? data.education.split('\n\n\n').map(s => s.trim()).filter(Boolean) : [];
      const updatedEdu = [...currentEntries, formattedEntry].join('\n\n\n');
      onChange({ ...data, education: updatedEdu });
      
      setNewEdu({
        school: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        isCurrent: false,
        location: '',
        description: ''
      });
    }
  };

  const removeEdu = (indexToRemove: number) => {
    const currentEdu = data.education.split('\n\n\n').map(s => s.trim()).filter(Boolean);
    const updatedEdu = currentEdu.filter((_, i) => i !== indexToRemove).join('\n\n\n');
    onChange({ ...data, education: updatedEdu });
  };

  const [newRef, setNewRef] = React.useState({
    name: '',
    position: '',
    company: '',
    phone: '',
    email: ''
  });

  const handleAddRef = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newRef.name) {
      const positionInfo = [newRef.position, newRef.company].filter(Boolean).join(' at ');
      const header = `**${newRef.name}**${positionInfo ? ` (${positionInfo})` : ''}`;
      const contactInfo = [newRef.phone, newRef.email].filter(Boolean).join('\n');
      const formattedEntry = `${header}${contactInfo ? `\n${contactInfo}` : ''}`;
      
      const currentEntries = data.references ? data.references.split('\n\n\n').map(s => s.trim()).filter(Boolean) : [];
      const updatedRefs = [...currentEntries, formattedEntry].join('\n\n\n');
      onChange({ ...data, references: updatedRefs });
      setNewRef({ name: '', position: '', company: '', phone: '', email: '' });
    }
  };

  const removeRef = (indexToRemove: number) => {
    const currentRefs = data.references.split('\n\n\n').map(s => s.trim()).filter(Boolean);
    const updatedRefs = currentRefs.filter((_, i) => i !== indexToRemove).join('\n\n\n');
    onChange({ ...data, references: updatedRefs });
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-sm";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2";

  const insertText = (name: string, prefix: string, suffix: string, customValue?: string, customSetter?: (val: string) => void) => {
    const textarea = document.getElementsByName(name)[0] as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    
    if (customSetter) {
       customSetter(newValue);
    } else {
       onChange({ ...data, [name as keyof ResumeData]: newValue });
    }

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const FormatButton = ({ 
    onClick, 
    icon: Icon, 
    title, 
    shortcut 
  }: { 
    onClick: () => void; 
    icon: any; 
    title: string; 
    shortcut: string 
  }) => (
    <div className="relative group/tooltip">
      <button
        onClick={onClick}
        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
      >
        <Icon className="w-4 h-4" />
      </button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium">
        <span className="block font-bold mb-0.5">{title}</span>
        <span className="text-gray-400 font-mono italic">{shortcut}</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
      </div>
    </div>
  );

  const FormattingTools = ({ fieldName, customValue, onCustomChange }: { fieldName: string, customValue?: string, onCustomChange?: (val: string) => void }) => (
    <div className="flex gap-2 mb-2 bg-white/50 p-1 rounded-md w-max border border-gray-100">
      <FormatButton 
        onClick={() => insertText(fieldName, "**", "**", customValue, onCustomChange)}
        icon={Bold}
        title="Bold"
        shortcut="**text**"
      />
      <FormatButton 
        onClick={() => insertText(fieldName, "*", "*", customValue, onCustomChange)}
        icon={Italic}
        title="Italic"
        shortcut="*text*"
      />
      <FormatButton 
        onClick={() => insertText(fieldName, "- ", "", customValue, onCustomChange)}
        icon={List}
        title="Bullet List"
        shortcut="- item"
      />
      <FormatButton 
        onClick={() => insertText(fieldName, "~~", "~~", customValue, onCustomChange)}
        icon={Strikethrough}
        title="Strikethrough"
        shortcut="~~text~~"
      />
      <FormatButton 
        onClick={() => insertText(fieldName, "`", "`", customValue, onCustomChange)}
        icon={Code}
        title="Code Snippet"
        shortcut="`code`"
      />
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-gray-50 h-full overflow-y-auto pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Editor</h2>
        <button
          onClick={onRefine}
          disabled={isRefining}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg active:scale-95"
        >
          {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isRefining ? "Refining..." : "Refine Content"}
        </button>
      </div>

      {/* Template & Color Settings */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        <div>
          <label className={labelClass}>Layout Template</label>
          <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                  selectedTemplate === t.id 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Typography</label>
            <select
              name="fontFamily"
              value={data.fontFamily || 'Inter'}
              onChange={handleChange}
              className={inputClass}
            >
              {fonts.map((f) => (
                <option key={f.name} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Font Size ({data.fontSize || 14}px)</label>
            <input
              type="range"
              name="fontSize"
              min="10"
              max="20"
              step="0.5"
              value={data.fontSize || 14}
              onChange={(e) => onChange({ ...data, fontSize: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>

        <div>
           <label className={labelClass}>Line Spacing ({data.spacing || 1})</label>
           <input
              type="range"
              name="spacing"
              min="0.5"
              max="2"
              step="0.1"
              value={data.spacing || 1}
              onChange={(e) => onChange({ ...data, spacing: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                name="primaryColor"
                value={data.primaryColor || "#2D2E32"} 
                onChange={handleChange}
                className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
              />
              <span className="text-[10px] font-mono text-gray-500 uppercase">{data.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Secondary Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                name="secondaryColor"
                value={data.secondaryColor || "#E8E2DD"} 
                onChange={handleChange}
                className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
              />
              <span className="text-[10px] font-mono text-gray-500 uppercase">{data.secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image Upload */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className={labelClass}>Profile Photo</label>
        <div className="flex items-center gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors relative overflow-hidden group"
          >
            {data.image ? (
              <>
                <img src={data.image} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <ImagePlus className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-1">Upload</span>
              </>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[11px] text-gray-500 leading-tight">
              Recommended: Square image (PNG, JPG) for best results.
            </p>
            {data.image && (
              <button 
                onClick={removeImage}
                className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:underline"
              >
                <X className="w-3 h-3" /> Remove Photo
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Target Role</label>
          <input
            name="targetRole"
            value={data.targetRole}
            onChange={handleChange}
            placeholder="Senior Software Engineer"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Email</label>
          <input
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="+94..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          name="address"
          value={data.address}
          onChange={handleChange}
          placeholder="City, Country"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Languages (comma separated)</label>
        <input
          type="text"
          name="languages"
          value={data.languages || ''}
          onChange={handleChange}
          placeholder="Sinhala, English..."
          className={inputClass}
        />
      </div>

      {selectedTemplate === 'traditional' && (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
            <User className="w-4 h-4" /> Traditional Template: Personal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="fullName" value={data.fullName || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Name with Initials</label>
              <input type="text" name="initials" value={data.initials || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <input type="text" name="gender" value={data.gender || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="text" name="dob" value={data.dob || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NIC No</label>
              <input type="text" name="nic" value={data.nic || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Civil Status</label>
              <input type="text" name="civilStatus" value={data.civilStatus || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Religion</label>
              <input type="text" name="religion" value={data.religion || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Professional Summary</label>
        <FormattingTools fieldName="summary" />
        <textarea
          name="summary"
          value={data.summary}
          onChange={handleChange}
          rows={3}
          placeholder="Briefly describe your career goals and expertise..."
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <label className={labelClass}>Experience</label>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-[10px] text-gray-400 font-medium">
              {data.experience.split(/\s+/).filter(Boolean).length} words | {data.experience.length} chars
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <Languages className="w-3 h-3" />
              Spellcheck Active
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {data.experience.split('\n\n\n').map(s => s.trim()).filter(Boolean).map((exp, i) => (
              <div key={i} className="group relative bg-gray-50 border border-gray-100 p-3 rounded-lg hover:border-gray-300 transition-all">
                <button 
                  onClick={() => removeExp(i)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-sm text-gray-700 whitespace-pre-wrap pr-6">
                  {exp}
                </div>
              </div>
            ))}
            {(!data.experience || data.experience.trim() === "") && (
              <p className="text-[11px] text-gray-400 italic py-4 text-center">No experiences added yet. Fill the form below.</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={newExp.title}
                  onChange={(e) => setNewExp({...newExp, title: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={newExp.company}
                  onChange={(e) => setNewExp({...newExp, company: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Employment Type</label>
                <select
                  value={newExp.type}
                  onChange={(e) => setNewExp({...newExp, type: e.target.value})}
                  className={`${inputClass} !py-2`}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mountain View, CA"
                  value={newExp.location}
                  onChange={(e) => setNewExp({...newExp, location: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Duration</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Month"
                    value={newExp.startMonth}
                    onChange={(e) => setNewExp({...newExp, startMonth: e.target.value})}
                    className={`${inputClass} !py-2 text-center`}
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newExp.startYear}
                    onChange={(e) => setNewExp({...newExp, startYear: e.target.value})}
                    className={`${inputClass} !py-2 text-center`}
                  />
                </div>
                {!newExp.isCurrent ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Month"
                      value={newExp.endMonth}
                      onChange={(e) => setNewExp({...newExp, endMonth: e.target.value})}
                      className={`${inputClass} !py-2 text-center`}
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={newExp.endYear}
                      onChange={(e) => setNewExp({...newExp, endYear: e.target.value})}
                      className={`${inputClass} !py-2 text-center`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500 font-medium">
                    Currently work here
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={newExp.isCurrent}
                  onChange={(e) => setNewExp({...newExp, isCurrent: e.target.checked})}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-[11px] text-gray-600 font-medium">I currently work here</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
              <FormattingTools 
                fieldName="new-exp-desc" 
                customValue={newExp.description} 
                onCustomChange={(val) => setNewExp({...newExp, description: val})} 
              />
              <textarea
                name="new-exp-desc"
                value={newExp.description}
                onChange={(e) => setNewExp({...newExp, description: e.target.value})}
                rows={3}
                placeholder="Key achievements, responsibilities..."
                className={inputClass}
              />
            </div>

            <button
              onClick={handleAddExp}
              disabled={!newExp.title || !newExp.company}
              className="w-full bg-black text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Experience Entry
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <label className={labelClass}>Projects</label>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-[10px] text-gray-400 font-medium">
              {data.projects.split(/\s+/).filter(Boolean).length} words | {data.projects.length} chars
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <Languages className="w-3 h-3" />
              Spellcheck Active
            </div>
          </div>
        </div>
        <FormattingTools fieldName="projects" />
        <textarea
          name="projects"
          value={data.projects}
          onChange={handleChange}
          rows={4}
          spellCheck={true}
          placeholder="Project Title - describe the tech and outcomes..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Skills</label>
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {data.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 group"
              >
                {skill}
                <button 
                  onClick={() => removeSkill(skill)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(!data.skills || data.skills.trim() === "") && (
              <p className="text-[11px] text-gray-400 italic py-1">No skills added yet.</p>
            )}
          </div>
          
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill (e.g. React, Python)"
              className={`${inputClass} !py-2`}
            />
            <button
              type="submit"
              disabled={!newSkill.trim()}
              className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
          <p className="text-[10px] text-gray-400 font-medium italic">
            Tip: You can also just type expertise in several fields, and "Refine Content" will organize them for you.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Education</label>
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.education.split('\n\n\n').map(s => s.trim()).filter(Boolean).map((edu, i) => (
              <div key={i} className="group relative bg-gray-50 border border-gray-100 p-3 rounded-lg hover:border-gray-300 transition-all">
                <button 
                  onClick={() => removeEdu(i)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-sm text-gray-700 whitespace-pre-wrap pr-6">
                  {edu}
                </div>
              </div>
            ))}
            {(!data.education || data.education.trim() === "") && (
              <p className="text-[11px] text-gray-400 italic py-4 text-center">No education added yet. Fill the form below.</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">School / University</label>
                <input
                  type="text"
                  placeholder="e.g. Harvard University"
                  value={newEdu.school}
                  onChange={(e) => setNewEdu({...newEdu, school: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Degree</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Science"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newEdu.field}
                  onChange={(e) => setNewEdu({...newEdu, field: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge, MA"
                  value={newEdu.location}
                  onChange={(e) => setNewEdu({...newEdu, location: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Duration</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Start Year"
                  value={newEdu.startYear}
                  onChange={(e) => setNewEdu({...newEdu, startYear: e.target.value})}
                  className={`${inputClass} !py-2 text-center`}
                />
                {!newEdu.isCurrent ? (
                  <input
                    type="text"
                    placeholder="End Year"
                    value={newEdu.endYear}
                    onChange={(e) => setNewEdu({...newEdu, endYear: e.target.value})}
                    className={`${inputClass} !py-2 text-center`}
                  />
                ) : (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500 font-medium">
                    Currently studying
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={newEdu.isCurrent}
                  onChange={(e) => setNewEdu({...newEdu, isCurrent: e.target.checked})}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-[11px] text-gray-600 font-medium">Currently studying here</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400">Additional info (optional)</label>
              <FormattingTools 
                fieldName="new-edu-desc" 
                customValue={newEdu.description} 
                onCustomChange={(val) => setNewEdu({...newEdu, description: val})} 
              />
              <textarea
                name="new-edu-desc"
                value={newEdu.description}
                onChange={(e) => setNewEdu({...newEdu, description: e.target.value})}
                rows={2}
                placeholder="GPA, Honors, Societies..."
                className={inputClass}
              />
            </div>

            <button
              onClick={handleAddEdu}
              disabled={!newEdu.school || !newEdu.degree}
              className="w-full bg-black text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Achievements</label>
        <FormattingTools fieldName="achievements" />
        <textarea
          name="achievements"
          value={data.achievements}
          onChange={handleChange}
          rows={3}
          placeholder="Awards, certifications, milestones..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>References</label>
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.references.split('\n\n\n').map(s => s.trim()).filter(Boolean).map((ref, i) => (
              <div key={i} className="group relative bg-gray-50 border border-gray-100 p-3 rounded-lg hover:border-gray-300 transition-all">
                <button 
                  onClick={() => removeRef(i)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-sm text-gray-700 whitespace-pre-wrap pr-6">
                  {ref}
                </div>
              </div>
            ))}
            {(!data.references || data.references.trim() === "") && (
              <p className="text-[11px] text-gray-400 italic py-4 text-center">No references added yet. Fill the form below.</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. "
                  value={newRef.name}
                  onChange={(e) => setNewRef({...newRef, name: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Position</label>
                <input
                  type="text"
                  placeholder="e.g. Engineer"
                  value={newRef.position}
                  onChange={(e) => setNewRef({...newRef, position: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. pvt lmt"
                value={newRef.company}
                onChange={(e) => setNewRef({...newRef, company: e.target.value})}
                className={`${inputClass} !py-2`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Phone</label>
                <input
                  type="text"
                  placeholder="+1..."
                  value={newRef.phone}
                  onChange={(e) => setNewRef({...newRef, phone: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400">Email</label>
                <input
                  type="text"
                  placeholder="email@example.com"
                  value={newRef.email}
                  onChange={(e) => setNewRef({...newRef, email: e.target.value})}
                  className={`${inputClass} !py-2`}
                />
              </div>
            </div>

            <button
              onClick={handleAddRef}
              disabled={!newRef.name}
              className="w-full bg-black text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Reference
            </button>
          </div>
        </div>
      </div>

      {/* Custom Sections */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Custom Sections</h3>
          <button
            onClick={addCustomSection}
            className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            <Plus className="w-3 h-3" />
            Add Section
          </button>
        </div>

        <div className="space-y-4">
          {(data.customSections || []).map((section) => (
            <div key={section.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 relative group">
              <button
                onClick={() => removeCustomSection(section.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div>
                <label className={labelClass}>Section Title</label>
                <input
                  value={section.title}
                  onChange={(e) => handleCustomSectionChange(section.id, 'title', e.target.value)}
                  placeholder="e.g., Languages, Volunteer Work"
                  className={inputClass}
                />
              </div>
              
              <div>
                <label className={labelClass}>Content</label>
                <div className="flex justify-between items-end mb-1">
                   <FormattingTools 
                      fieldName={`custom-${section.id}`} 
                      customValue={section.content} 
                      onCustomChange={(val) => handleCustomSectionChange(section.id, 'content', val)} 
                   />
                </div>
                <textarea
                  name={`custom-${section.id}`}
                  value={section.content}
                  onChange={(e) => handleCustomSectionChange(section.id, 'content', e.target.value)}
                  rows={3}
                  placeholder="Details for this section..."
                  className={inputClass}
                />
              </div>
            </div>
          ))}

          {(data.customSections || []).length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">No custom sections added yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 bg-white p-6 rounded-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Export Options</h3>
        
        <button
          onClick={handlePdfExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all group disabled:opacity-50 disabled:cursor-wait"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          {isExporting ? "Generating PDF..." : "Export to PDF"}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => exportToDocx(data)}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all group"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
            DOCX
          </button>
          <button
            onClick={() => exportToTxt(data)}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-green-500 hover:text-green-500 transition-all group"
          >
            <FileJson className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Plain Text
          </button>
        </div>
      </div>
    </div>
  );
};
