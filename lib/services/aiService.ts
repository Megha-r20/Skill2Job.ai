import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const aiService = {
  /**
   * Phase 7 - Real AI Resume Analysis
   */
  async analyzeResume(resumeText: string) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, falling back to mock response.");
      return this.mockResumeAnalysis(resumeText);
    }
    
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze the following resume text and extract a structured JSON response.
        Do not include markdown blocks, just return valid JSON.
        Required schema:
        {
          "name": "string",
          "email": "string",
          "phone": "string",
          "summary": "string",
          "skills": ["string"],
          "experienceYears": number,
          "education": [{"degree": "string", "institution": "string", "year": number}]
        }
        Resume Text:
        ${resumeText}
      `;
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Resume Analysis failed:", error);
      throw new Error("Failed to analyze resume with AI.");
    }
  },

  /**
   * Phase 8 - Real Job Description Analysis
   */
  async analyzeJobDescription(description: string) {
    if (!process.env.GEMINI_API_KEY) {
      return this.mockJobAnalysis(description);
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze this job description and extract structured requirements.
        Return strictly valid JSON.
        Schema:
        {
          "requiredSkills": ["string"],
          "preferredSkills": ["string"],
          "experienceRequirements": "string",
          "educationRequirements": "string",
          "responsibilities": ["string"]
        }
        Job Description:
        ${description}
      `;
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Job Analysis failed:", error);
      throw new Error("Failed to analyze job description with AI.");
    }
  },

  /**
   * Phase 9 - Real Candidate Matching
   */
  async calculateMatchScore(resumeData: any, jobData: any) {
    if (!process.env.GEMINI_API_KEY) {
      return this.mockMatchScore();
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Calculate a match score between the candidate and the job.
        Explain the reasoning clearly so the recruiter understands WHY.
        Return strictly valid JSON.
        Schema:
        {
          "overallMatch": number (0-100),
          "skillsMatch": number (0-100),
          "experienceMatch": number (0-100),
          "explanation": "string (Why did they get this score?)",
          "missingSkills": ["string"]
        }
        Candidate Data:
        ${JSON.stringify(resumeData)}
        
        Job Requirements:
        ${JSON.stringify(jobData)}
      `;
      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Match Calculation failed:", error);
      throw new Error("Failed to calculate match score with AI.");
    }
  },

  // Fallbacks for testing without API keys
  mockResumeAnalysis(text: string) {
    return {
      name: "Mock User",
      email: "mock@example.com",
      phone: "+1234567890",
      summary: "Experienced software engineer",
      skills: ["React", "TypeScript", "Node.js"],
      experienceYears: 4,
      education: [{ degree: "B.S. Computer Science", institution: "Mock University", year: 2020 }]
    };
  },
  mockJobAnalysis(text: string) {
    return {
      requiredSkills: ["React", "TypeScript"],
      preferredSkills: ["GraphQL"],
      experienceRequirements: "3+ years",
      educationRequirements: "Bachelor's degree",
      responsibilities: ["Develop UI components"]
    };
  },
  mockMatchScore() {
    return {
      overallMatch: 85,
      skillsMatch: 90,
      experienceMatch: 80,
      explanation: "Strong skills match. Has required React and TypeScript.",
      missingSkills: ["GraphQL"]
    };
  }
};
