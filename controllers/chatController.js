const { model } = require('../services/aiService');

/**
 * Handle AI Career Assistant chatbot requests
 */
const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const domain = context?.careerDomain?.selected || context?.careerDomain?.recommended || 'Tech Developer';
    const atsScore = context?.atsAnalysis?.score || 'N/A';
    const skills = (context?.skills || []).join(', ') || 'Not specified';
    const name = context?.personalInfo?.fullName || context?.personal?.fullName || 'User';

    const systemContext = `
You are "Career AI Assistant", an expert career advisor, technical mentor, and ATS consultant.
You are helping ${name}, who is aiming for a career as a ${domain}.

Current User Profile Context:
- Target Domain: ${domain}
- Current ATS Score: ${atsScore} / 100
- Existing Skills: ${skills}
- Portfolio Projects Count: ${(context?.projects || []).length}
- Missing Skills / Learning Focus: ${(context?.learningRoadmap?.stages || []).flatMap(s => s.topics || []).filter(t => t.status === 'Missing' || t.status === 'Learning').map(t => t.topic).join(', ') || 'None identified yet'}

Instructions:
1. Provide practical, highly actionable, encouraging, and clear answers.
2. If the user asks for a study plan (e.g. "Create a 7-day study plan"), format it day-by-day (Day 1 to Day 7) with specific topics, target outcomes, and practice mini-projects based on their missing skills.
3. If asked about ATS score improvement, give 2-3 high-impact tips tailored to their domain.
4. Base all advice strictly on the user's actual background and target domain. Do not invent fake work experience or metrics.
    `;

    const prompt = `${systemContext}\n\nUser Question: ${message}`;

    let reply = "";
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        reply = response.text();
      } catch (err) {
        console.warn("Gemini chat model error:", err.message);
        reply = getFallbackChatResponse(message, domain, skills, atsScore);
      }
    } else {
      reply = getFallbackChatResponse(message, domain, skills, atsScore);
    }

    res.status(200).json({ message: reply });
  } catch (error) {
    console.error('Error in chatWithAI:', error.message);
    res.status(500).json({ message: 'Failed to generate AI response. Please try again.' });
  }
};

/**
 * Intelligent chat fallback responses
 */
const getFallbackChatResponse = (message, domain, skills, atsScore) => {
  const msg = message.toLowerCase();

  if (msg.includes('study plan') || msg.includes('7-day') || msg.includes('schedule') || msg.includes('week')) {
    return `### 📅 7-Day Personalized Study Plan for ${domain}

**Day 1: Technical Foundations**
- Study core language patterns & modern features.
- *Practice*: Refactor existing codebase or complete 3 coding challenges.

**Day 2: System & API Design**
- Master RESTful endpoints, request lifecycle, and status codes.
- *Practice*: Build a lightweight REST API with basic CRUD operations.

**Day 3: Database & Data Persistence**
- Focus on schema design, query optimization, and indexing.
- *Practice*: Connect your API to a database with clean queries.

**Day 4: Authentication & Security**
- Learn JWT tokens, password hashing, and input validation.
- *Practice*: Add auth middleware to your API project.

**Day 5: Version Control & GitHub Showcase**
- Clean up git commit history, write comprehensive README documentation.
- *Practice*: Push clean project repository to GitHub with architecture diagram.

**Day 6: Resume & ATS Optimization**
- Optimize resume bullet points with action verbs and quantifiable metrics.
- *Practice*: Re-run ATS Analyzer on your updated resume.

**Day 7: Mock Interview & Portfolio Review**
- Review key domain interview questions and polish your live portfolio.
- *Practice*: Share your AI Career Portfolio link with mentors.`;
  }

  if (msg.includes('ats') || msg.includes('score') || msg.includes('improve resume')) {
    return `To raise your current ATS score (${atsScore}/100) for **${domain}**:
1. **Incorporate High-Density Keywords**: Add exact technical terms like *REST API, Git, Docker, System Architecture* into your Experience and Skills sections.
2. **Quantify Bullet Points**: Use the Google XYZ formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*).
3. **Add a Strong Professional Summary**: Include a 3-sentence summary emphasizing your target domain (**${domain}**).`;
  }

  if (msg.includes('learn next') || msg.includes('skills missing')) {
    return `Based on your goal to excel as a **${domain}**, your immediate learning priorities are:
1. Master API design & asynchronous programming.
2. Build end-to-end projects with database persistence.
3. Learn containerization basics with Docker to showcase deployment readiness.`;
  }

  return `Great question! As your **Career AI Assistant**, I recommend focusing on deepening your expertise in **${domain}**. Keep building production-ready projects, documenting them on GitHub, and updating your resume metrics. Let me know if you want a 7-day study plan, ATS tips, or project ideas!`;
};

module.exports = {
  chatWithAI
};