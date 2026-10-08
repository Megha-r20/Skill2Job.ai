import { GoogleGenerativeAI } from '@google/generative-ai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

export const aiService = {
    modelName: null,

    /**
     * Resolves the active Gemini model name based on configuration priority:
     * 1. Per-call override (options.model)
     * 2. Programmatic override (aiService.modelName)
     * 3. Environment variable (process.env.GEMINI_MODEL)
     * 4. Standard default (gemini-2.0-flash)
     */
    getModelName(overrideModel) {
        if (overrideModel && typeof overrideModel === 'string' && overrideModel.trim()) {
            return overrideModel.trim();
        }
        if (this.modelName && typeof this.modelName === 'string' && this.modelName.trim()) {
            return this.modelName.trim();
        }
        if (process.env.GEMINI_MODEL && typeof process.env.GEMINI_MODEL === 'string' && process.env.GEMINI_MODEL.trim()) {
            return process.env.GEMINI_MODEL.trim();
        }
        return DEFAULT_GEMINI_MODEL;
    },

    /**
     * Set default model name programmatically
     */
    setModelName(name) {
        this.modelName = name || null;
    },

    /**
     * Factory to instantiate Gemini GenerativeModel instance
     */
    getModel(overrideModel) {
        const apiKey = process.env.GEMINI_API_KEY || '';
        const ai = new GoogleGenerativeAI(apiKey);
        const modelName = this.getModelName(overrideModel);
        return ai.getGenerativeModel({ model: modelName });
    },
    /**
     * Phase 7 - Real AI Resume Analysis
     */
    async analyzeResume(resumeText, options = {}) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("No GEMINI_API_KEY found, falling back to mock response.");
            return this.mockResumeAnalysis(resumeText);
        }
        try {
            const model = this.getModel(options?.model);
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
        }
        catch (error) {
            console.error("AI Resume Analysis failed:", error);
            throw new Error("Failed to analyze resume with AI.");
        }
    },
    /**
     * Phase 8 - Real Job Description Analysis
     */
    async analyzeJobDescription(description, options = {}) {
        if (!process.env.GEMINI_API_KEY) {
            return this.mockJobAnalysis(description);
        }
        try {
            const model = this.getModel(options?.model);
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
        }
        catch (error) {
            console.error("AI Job Analysis failed:", error);
            throw new Error("Failed to analyze job description with AI.");
        }
    },
    /**
     * Phase 9 - Real Candidate Matching
     */
    async calculateMatchScore(resumeData, jobData, options = {}) {
        if (!process.env.GEMINI_API_KEY) {
            return this.mockMatchScore(resumeData, jobData);
        }
        try {
            const model = this.getModel(options?.model);
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
        }
        catch (error) {
            console.error("AI Match Calculation failed:", error);
            throw new Error("Failed to calculate match score with AI.");
        }
    },
    // Fallbacks for testing without API keys (dynamic data extraction)
    mockResumeAnalysis(text = '') {
        const rawText = String(text || '');
        const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        
        const candidateSkills = [
            'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'Express',
            'Java', 'C++', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker',
            'Kubernetes', 'AWS', 'Git', 'GraphQL', 'Tailwind CSS', 'Redis', 'Linux',
            'Data Structures', 'Algorithms', 'Machine Learning', 'TensorFlow', 'PyTorch'
        ];
        const extractedSkills = candidateSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(rawText);
        });

        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
        const potentialName = lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@') ? lines[0] : 'Candidate';

        return {
            name: potentialName,
            email: emailMatch ? emailMatch[0] : 'candidate@example.com',
            phone: phoneMatch ? phoneMatch[0] : '+1234567890',
            summary: rawText.slice(0, 200).trim() || 'Software engineering candidate profile',
            skills: extractedSkills.length > 0 ? extractedSkills : ['JavaScript', 'React', 'Node.js'],
            experienceYears: rawText.match(/(\d+)\+?\s*years?/i) ? parseInt(rawText.match(/(\d+)\+?\s*years?/i)[1], 10) : 2,
            education: [{ degree: 'B.Tech / B.S. in Computer Science', institution: 'University', year: 2026 }]
        };
    },
    mockJobAnalysis(description = '') {
        const descText = String(description || '');
        const candidateSkills = [
            'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'Express',
            'Java', 'C++', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker',
            'Kubernetes', 'AWS', 'Git', 'GraphQL', 'Tailwind CSS', 'Redis', 'Linux',
            'Data Structures & Algorithms', 'Machine Learning'
        ];
        const matched = candidateSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(descText);
        });

        const requiredSkills = matched.length > 0 ? matched.slice(0, 4) : ['React', 'TypeScript'];
        const preferredSkills = matched.length > 4 ? matched.slice(4) : ['Docker'];

        return {
            requiredSkills,
            preferredSkills,
            experienceRequirements: descText.match(/(\d+)\+?\s*years?/i) ? `${descText.match(/(\d+)\+?\s*years?/i)[1]}+ years` : '0-2 years',
            educationRequirements: "Bachelor's degree in Computer Science or related technical discipline",
            responsibilities: descText.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()).slice(0, 4)
        };
    },
    mockMatchScore(resumeData = {}, jobData = {}) {
        const candidateSkills = Array.isArray(resumeData?.skills) ? resumeData.skills.map(s => String(s).toLowerCase()) : [];
        const requiredSkills = Array.isArray(jobData?.requiredSkills) 
            ? jobData.requiredSkills.map(s => (typeof s === 'string' ? s : s.skillName || '').toLowerCase()).filter(Boolean)
            : ['react', 'typescript'];

        const matched = requiredSkills.filter(req => candidateSkills.some(cs => cs.includes(req) || req.includes(cs)));
        const missing = requiredSkills.filter(req => !candidateSkills.some(cs => cs.includes(req) || req.includes(cs)));

        const skillsMatch = requiredSkills.length > 0 
            ? Math.round((matched.length / requiredSkills.length) * 100) 
            : 80;
        const experienceMatch = 85;
        const overallMatch = Math.round(skillsMatch * 0.7 + experienceMatch * 0.3);

        return {
            overallMatch,
            skillsMatch,
            experienceMatch,
            explanation: `Candidate matches ${matched.length} of ${requiredSkills.length} core job requirements (${skillsMatch}% skills match).`,
            missingSkills: missing.map(m => m.charAt(0).toUpperCase() + m.slice(1))
        };
    }
};
