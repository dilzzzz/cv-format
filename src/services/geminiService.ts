import { GoogleGenAI, Type } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
};

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  name: string;
  targetRole: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
  projects: string;
  achievements: string;
  email: string;
  phone: string;
  address: string;
  references: string;
  image?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  fontSize?: number;
  spacing?: number;
  gender?: string;
  dob?: string;
  nic?: string;
  civilStatus?: string;
  religion?: string;
  initials?: string;
  fullName?: string;
  languages?: string;
  customSections?: CustomSection[];
}

export const refineResumeContent = async (data: ResumeData): Promise<ResumeData> => {
  const prompt = `
    You are a professional executive resume writer. 
    Transform the following raw user details into a high-impact, modern, and ATS-friendly resume content.
    
    Guidelines:
    - Use active, strong verbs (e.g., "Spearheaded", "Engineered", "Optimized").
    - Include measurable achievements if possible based on input (e.g., "Increased efficiency by 20%").
    - Keep bullet points concise and professional.
    - Organize skills into logical categories.
    - Ensure a consistent tone.

    User Input:
    Name: ${data.name}
    Job Title: ${data.targetRole}
    Contact Email: ${data.email}
    Contact Phone: ${data.phone}
    Address: ${data.address}
    Raw Experience: ${data.experience}
    Raw Skills: ${data.skills}
    Raw Education: ${data.education}
    Raw Projects: ${data.projects}
    Raw Achievements: ${data.achievements}
    Raw References: ${data.references}

    Return the output as a valid JSON object matching the input structure.
  `;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            summary: { type: Type.STRING },
            experience: { type: Type.STRING },
            skills: { type: Type.STRING },
            education: { type: Type.STRING },
            projects: { type: Type.STRING },
            achievements: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            references: { type: Type.STRING },
          },
          required: ["name", "targetRole", "summary", "experience", "skills", "education", "projects", "achievements", "email", "phone", "address", "references"],
        },
      },
    });

    const refined = JSON.parse(response.text || "{}");
    return { 
      ...refined, 
      image: data.image,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      fontFamily: data.fontFamily,
      fontSize: data.fontSize,
      spacing: data.spacing
    }; // Preserve visuals
  } catch (error) {
    console.error("Error refining resume content:", error);
    return data; // Return original data on failure
  }
};
