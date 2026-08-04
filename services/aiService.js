const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.warn("Failed to initialize Gemini AI model:", err.message);
  }
}

/**
 * Smart resume parser fallback to extract actual text content using regex
 */
const getFallbackResumeAnalysis = (resumeText) => {
  const text = resumeText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract contact & social links
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const fullName = lines[0] || "Candidate";
  
  // Extract technical skills using regex matching
  const commonSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "HTML", "CSS", "React", "Node.js",
    "Express", "MongoDB", "SQL", "PostgreSQL", "MySQL", "Git", "Docker", "AWS", "REST API",
    "GraphQL", "Linux", "Data Analysis", "Machine Learning", "FastAPI", "Django", "Flask", "Tailwind"
  ];
  const detectedSkills = commonSkills.filter(skill => 
    new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i').test(text)
  );

  // Extract Work Experience sections if present in text
  const experience = [];
  const expHeaderIdx = lines.findIndex(l => /work\s+experience|experience|employment/i.test(l));
  if (expHeaderIdx !== -1) {
    const expLines = lines.slice(expHeaderIdx + 1, expHeaderIdx + 12);
    const expText = expLines.join(' ');
    if (expText.length > 10) {
      experience.push({
        jobTitle: expLines[0] || "Software Developer",
        company: expLines[1] || "Company / Organization",
        location: null,
        startDate: "Dates specified in resume",
        endDate: "Present",
        employmentType: null,
        responsibilities: expLines.slice(2, 6).filter(l => l.length > 5),
        technologies: detectedSkills.slice(0, 3)
      });
    }
  }

  // Extract Projects from text if present
  const projects = [];
  const projHeaderIdx = lines.findIndex(l => /projects|portfolio\s+projects/i.test(l));
  if (projHeaderIdx !== -1) {
    const projLines = lines.slice(projHeaderIdx + 1, projHeaderIdx + 10);
    if (projLines.length > 0) {
      projects.push({
        name: projLines[0] || "Technical Project",
        description: projLines.slice(1, 4).join(' ') || "Project details extracted from resume.",
        technologies: detectedSkills.slice(0, 4),
        githubUrl: githubMatch ? `https://${githubMatch[0]}` : null,
        liveDemo: null
      });
    }
  }

  // Extract Education
  const education = [];
  const eduHeaderIdx = lines.findIndex(l => /education|academic/i.test(l));
  if (eduHeaderIdx !== -1) {
    const eduLines = lines.slice(eduHeaderIdx + 1, eduHeaderIdx + 6);
    education.push({
      degree: eduLines[0] || "Degree / Education",
      institution: eduLines[1] || "Institution Name",
      location: null,
      startYear: null,
      endYear: null,
      cgpa: null,
      description: eduLines.slice(2).join(' ')
    });
  }

  return {
    personalInfo: {
      fullName: fullName.length < 40 ? fullName : "Candidate",
      professionalTitle: "Software Developer",
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      location: "Location not specified",
      shortBio: lines.slice(1, 4).join(' ').substring(0, 200) || null
    },
    about: text.substring(0, 400) || null,
    skills: detectedSkills.length > 0 ? detectedSkills : ["JavaScript", "HTML", "CSS", "Git"],
    projects: projects,
    education: education,
    experience: experience,
    certifications: [],
    languages: [{ language: "English", proficiency: "Fluent" }],
    achievements: [],
    socialLinks: {
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null,
      github: githubMatch ? `https://${githubMatch[0]}` : null,
      website: null,
      twitter: null
    }
  };
};

/**
 * Analyze resume text and extract structured data using Gemini AI
 */
const analyzeResume = async (resumeText) => {
  if (!model) {
    console.log("Gemini API not configured, using smart regex resume parser.");
    return getFallbackResumeAnalysis(resumeText);
  }

  try {
    const prompt = `
      You are an expert resume parser. Extract the exact information from the resume text and return it as a pure JSON object without markdown formatting.
      CRITICAL RULE: Do NOT invent or hallucinate any companies, job titles, education, or projects. Only extract what is explicitly written in the resume text.
      If work experience, projects, or education are not present in the text, return an empty array [] for that field.

      Required JSON structure:
      {
        "personalInfo": {
          "fullName": string | null,
          "professionalTitle": string | null,
          "email": string | null,
          "phone": string | null,
          "location": string | null,
          "shortBio": string | null
        },
        "about": string | null,
        "skills": string[],
        "projects": [
          {
            "name": string,
            "description": string,
            "technologies": string[],
            "githubUrl": string | null,
            "liveDemo": string | null
          }
        ],
        "education": [
          {
            "degree": string,
            "institution": string,
            "location": string | null,
            "startYear": string | null,
            "endYear": string | null,
            "cgpa": string | null,
            "description": string | null
          }
        ],
        "experience": [
          {
            "jobTitle": string,
            "company": string,
            "location": string | null,
            "startDate": string,
            "endDate": string | null,
            "employmentType": string | null,
            "responsibilities": string[],
            "technologies": string[]
          }
        ],
        "certifications": [
          {
            "name": string,
            "organization": string,
            "date": string | null,
            "credentialId": string | null,
            "verificationUrl": string | null
          }
        ],
        "languages": [
          {
            "language": string,
            "proficiency": string
          }
        ],
        "achievements": string[],
        "socialLinks": {
          "linkedin": string | null,
          "github": string | null,
          "website": string | null,
          "twitter": string | null
        }
      }

      Resume text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonData;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[0]);
    } else {
      jsonData = JSON.parse(text);
    }

    return validateResumeData(jsonData);
  } catch (error) {
    console.error('Error in analyzeResume Gemini call:', error.message);
    return getFallbackResumeAnalysis(resumeText);
  }
};

/**
 * Validate and clean the resume data
 */
const validateResumeData = (data) => {
  if (!data) return getFallbackResumeAnalysis("");

  return {
    personalInfo: {
      fullName: data.personalInfo?.fullName ?? "Candidate",
      professionalTitle: data.personalInfo?.professionalTitle ?? "Software Developer",
      email: data.personalInfo?.email ?? null,
      phone: data.personalInfo?.phone ?? null,
      location: data.personalInfo?.location ?? null,
      shortBio: data.personalInfo?.shortBio ?? null
    },
    about: data.about ?? null,
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects.map(project => ({
      name: project.name ?? 'Project',
      description: project.description ?? '',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      githubUrl: project.githubUrl ?? null,
      liveDemo: project.liveDemo ?? null
    })) : [],
    education: Array.isArray(data.education) ? data.education.map(edu => ({
      degree: edu.degree ?? '',
      institution: edu.institution ?? '',
      location: edu.location ?? null,
      startYear: edu.startYear ?? null,
      endYear: edu.endYear ?? null,
      cgpa: edu.cgpa ?? null,
      description: edu.description ?? null
    })) : [],
    experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
      jobTitle: exp.jobTitle ?? '',
      company: exp.company ?? '',
      location: exp.location ?? null,
      startDate: exp.startDate ?? '',
      endDate: exp.endDate ?? null,
      employmentType: exp.employmentType ?? null,
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : []
    })) : [],
    certifications: Array.isArray(data.certifications) ? data.certifications.map(cert => ({
      name: cert.name ?? '',
      organization: cert.organization ?? '',
      date: cert.date ?? null,
      credentialId: cert.credentialId ?? null,
      verificationUrl: cert.verificationUrl ?? null
    })) : [],
    languages: Array.isArray(data.languages) ? data.languages.map(lang => ({
      language: typeof lang === 'string' ? lang : (lang.language ?? ''),
      proficiency: lang.proficiency ?? 'Fluent'
    })) : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    socialLinks: {
      linkedin: data.socialLinks?.linkedin ?? null,
      github: data.socialLinks?.github ?? null,
      website: data.socialLinks?.website ?? null,
      twitter: data.socialLinks?.twitter ?? null
    }
  };
};

/**
 * Generate ATS score and breakdown
 */
const calculateATSScore = async (resumeData, careerDomain) => {
  if (!model) {
    return getFallbackATSScore(resumeData, careerDomain);
  }

  try {
    const prompt = `
      You are an ATS (Applicant Tracking System) expert. Analyze the resume data and provide an ATS score out of 100 based on the following categories:
      1. Contact Information (10 points)
      2. Professional Summary (10 points)
      3. Skills (15 points)
      4. Work Experience (15 points)
      5. Projects (10 points)
      6. Education (10 points)
      7. Keywords (10 points)
      8. Resume Formatting (10 points)
      9. Achievements/Metrics (5 points)
      10. Certifications (5 points)

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Career Domain: ${careerDomain || "Full Stack Development"}

      Return pure JSON:
      {
        "score": number (0-100),
        "breakdown": {
          "contactInformation": number (0-10),
          "professionalSummary": number (0-10),
          "skills": number (0-15),
          "workExperience": number (0-15),
          "projects": number (0-10),
          "education": number (0-10),
          "keywords": number (0-10),
          "resumeFormatting": number (0-10),
          "achievementsMetrics": number (0-5),
          "certifications": number (0-5)
        },
        "suggestions": [
          {
            "category": string,
            "priority": "critical" | "high" | "medium" | "optional",
            "problem": string,
            "whyItMatters": string,
            "howToFix": string,
            "example": string
          }
        ],
        "estimatedPotentialScore": number (0-100)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    jsonData.score = Math.max(0, Math.min(100, jsonData.score || 70));
    jsonData.estimatedPotentialScore = Math.max(jsonData.score, Math.min(100, jsonData.estimatedPotentialScore || (jsonData.score + 15)));

    return jsonData;
  } catch (error) {
    console.error('Error in calculateATSScore Gemini call:', error.message);
    return getFallbackATSScore(resumeData, careerDomain);
  }
};

const getFallbackATSScore = (resumeData, careerDomain) => {
  const contactScore = (resumeData.personalInfo?.email && resumeData.personalInfo?.phone) ? 9 : 5;
  const summaryScore = resumeData.about ? 8 : 3;
  const skillsScore = (resumeData.skills?.length >= 5) ? 12 : 7;
  const expScore = (resumeData.experience?.length > 0) ? 12 : 6;
  const projectScore = (resumeData.projects?.length > 0) ? 8 : 4;
  const eduScore = (resumeData.education?.length > 0) ? 9 : 5;
  const kwScore = 7;
  const fmtScore = 8;
  const achScore = (resumeData.achievements?.length > 0) ? 4 : 2;
  const certScore = (resumeData.certifications?.length > 0) ? 4 : 1;

  const totalScore = contactScore + summaryScore + skillsScore + expScore + projectScore + eduScore + kwScore + fmtScore + achScore + certScore;

  const suggestions = [];
  if (!resumeData.about) {
    suggestions.push({
      category: "Professional Summary",
      priority: "critical",
      problem: "Your resume lacks a clear professional summary section.",
      whyItMatters: "ATS parsers and recruiters use summaries to quickly assess your domain alignment and primary focus.",
      howToFix: "Add a 2-3 sentence overview highlighting your core expertise and target role.",
      example: `Driven ${careerDomain || 'Software Developer'} with experience in modern web technologies and building scalable applications.`
    });
  }
  if (!resumeData.skills || resumeData.skills.length < 8) {
    suggestions.push({
      category: "Keywords & Technical Skills",
      priority: "high",
      problem: "Your resume lists relatively few domain-specific keywords.",
      whyItMatters: "ATS filters evaluate keyword density for job role matches.",
      howToFix: "List core technical frameworks, databases, tools, and methodologies explicitly.",
      example: "Add relevant keywords such as REST APIs, Git, Agile, SQL, and Docker to your skills section."
    });
  }

  return {
    score: totalScore,
    breakdown: {
      contactInformation: contactScore,
      professionalSummary: summaryScore,
      skills: skillsScore,
      workExperience: expScore,
      projects: projectScore,
      education: eduScore,
      keywords: kwScore,
      resumeFormatting: fmtScore,
      achievementsMetrics: achScore,
      certifications: certScore
    },
    suggestions,
    estimatedPotentialScore: Math.min(100, totalScore + 16)
  };
};

/**
 * Generate career domain recommendation based on resume data
 */
const recommendCareerDomain = async (resumeData) => {
  if (!model) {
    return getFallbackCareerDomain(resumeData);
  }

  try {
    const prompt = `
      You are a career advisor. Based on the resume data provided, recommend a primary career domain and an alternative domain.
      Consider the user's skills, projects, education, experience, and certifications.

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Available domains:
      1. Frontend Development
      2. Backend Development
      3. Full Stack Development
      4. Python Development
      5. Java Development
      6. Data Science
      7. Data Analytics
      8. Machine Learning
      9. Artificial Intelligence
      10. AI Engineering
      11. DevOps
      12. Cloud Computing
      13. Cybersecurity
      14. Mobile App Development
      15. UI/UX Design
      16. Software Testing / QA
      17. Blockchain
      18. Game Development

      Return pure JSON:
      {
        "primary": string,
        "alternative": string,
        "reason": string
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return jsonData;
  } catch (error) {
    console.error('Error in recommendCareerDomain Gemini call:', error.message);
    return getFallbackCareerDomain(resumeData);
  }
};

const getFallbackCareerDomain = (resumeData) => {
  const skillsStr = (resumeData.skills || []).join(' ').toLowerCase();
  
  if (skillsStr.includes('python') || skillsStr.includes('machine learning') || skillsStr.includes('pandas')) {
    return {
      primary: "Python Development",
      alternative: "Data Science",
      reason: "Your resume highlights Python skills, data handling, and computational logic."
    };
  } else if (skillsStr.includes('react') || skillsStr.includes('html') || skillsStr.includes('css')) {
    return {
      primary: "Full Stack Development",
      alternative: "Frontend Development",
      reason: "Your resume demonstrates strong frontend web technologies combined with application development capabilities."
    };
  } else {
    return {
      primary: "Full Stack Development",
      alternative: "Backend Development",
      reason: "Your technical background provides a solid foundation for end-to-end software development."
    };
  }
};

/**
 * Generate personalized learning roadmap based on resume data and career domain
 */
const generateLearningRoadmap = async (resumeData, careerDomain) => {
  if (!model) {
    return getFallbackLearningRoadmap(resumeData, careerDomain);
  }

  try {
    const prompt = `
      You are a career advisor and learning path creator. Based on the resume data and career domain provided, create a personalized learning roadmap.

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Career Domain: ${careerDomain || "Full Stack Development"}

      Return pure JSON:
      {
        "domain": string,
        "stages": [
          {
            "stageName": string,
            "topics": [
              {
                "topic": string,
                "whyImportant": string,
                "status": "Completed" | "Learning" | "Recommended" | "Missing",
                "difficulty": "Beginner" | "Intermediate" | "Advanced",
                "resources": string[],
                "practiceProject": string
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return jsonData;
  } catch (error) {
    console.error('Error in generateLearningRoadmap Gemini call:', error.message);
    return getFallbackLearningRoadmap(resumeData, careerDomain);
  }
};

const getFallbackLearningRoadmap = (resumeData, careerDomain) => {
  const userSkills = (resumeData.skills || []).map(s => s.toLowerCase());

  const checkStatus = (skillName) => {
    return userSkills.some(s => s.includes(skillName.toLowerCase())) ? "Completed" : "Missing";
  };

  return {
    domain: careerDomain || "Full Stack Development",
    stages: [
      {
        stageName: "Stage 1: Core Fundamentals",
        topics: [
          {
            topic: "HTML5, CSS3 & JavaScript (ES6+)",
            whyImportant: "Foundation for building interactive web applications and user interfaces.",
            status: checkStatus("JavaScript"),
            difficulty: "Beginner",
            resources: ["MDN Web Docs", "freeCodeCamp"],
            practiceProject: "Build a dynamic web app dashboard."
          },
          {
            topic: "Git & Version Control",
            whyImportant: "Essential for code collaboration and tracking changes.",
            status: checkStatus("Git"),
            difficulty: "Beginner",
            resources: ["Git Documentation"],
            practiceProject: "Publish clean repositories on GitHub."
          }
        ]
      },
      {
        stageName: "Stage 2: Backend & Database Fundamentals",
        topics: [
          {
            topic: "Node.js & Express.js REST APIs",
            whyImportant: "Crucial for backend business logic and server routing.",
            status: checkStatus("Node"),
            difficulty: "Intermediate",
            resources: ["Express Docs"],
            practiceProject: "Build a REST API for user authentication."
          }
        ]
      }
    ]
  };
};

/**
 * Generate career readiness score based on resume data
 */
const calculateCareerReadiness = async (resumeData) => {
  if (!model) {
    return getFallbackCareerReadiness(resumeData);
  }

  try {
    const prompt = `
      You are a career advisor. Calculate a career readiness score out of 100 based on the candidate's actual resume data.

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Return pure JSON:
      {
        "score": number (0-100),
        "breakdown": {
          "skills": number (0-100),
          "projects": number (0-100),
          "experience": number (0-100),
          "education": number (0-100),
          "certifications": number (0-100),
          "atsScore": number (0-100)
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return jsonData;
  } catch (error) {
    console.error('Error in calculateCareerReadiness Gemini call:', error.message);
    return getFallbackCareerReadiness(resumeData);
  }
};

const getFallbackCareerReadiness = (resumeData) => {
  const skillsCount = (resumeData.skills || []).length;
  const projectsCount = (resumeData.projects || []).length;
  const expCount = (resumeData.experience || []).length;

  const skillsScore = Math.min(100, Math.max(40, skillsCount * 10));
  const projectsScore = Math.min(100, Math.max(30, projectsCount * 25));
  const expScore = Math.min(100, Math.max(20, expCount * 30));
  const eduScore = resumeData.education?.length ? 85 : 50;
  const certScore = resumeData.certifications?.length ? 80 : 40;
  const atsScore = 72;

  const overall = Math.round(
    (skillsScore * 0.25) +
    (projectsScore * 0.25) +
    (expScore * 0.20) +
    (eduScore * 0.15) +
    (atsScore * 0.15)
  );

  return {
    score: overall,
    breakdown: {
      skills: skillsScore,
      projects: projectsScore,
      experience: expScore,
      education: eduScore,
      certifications: certScore,
      atsScore: atsScore
    }
  };
};

module.exports = {
  model,
  analyzeResume,
  calculateATSScore,
  recommendCareerDomain,
  generateLearningRoadmap,
  calculateCareerReadiness
};