# AI Career Portfolio 🚀

> **"Your Resume. Your Career Roadmap. Your Portfolio. Powered by AI."**

**AI Career Portfolio** is a production-quality, full-stack web application designed for job seekers and software engineers. It seamlessly parses PDF resumes, calculates transparent ATS (Applicant Tracking System) compatibility scores, recommends career domains, builds personalized 10-stage learning roadmaps, features an AI Career Assistant chatbot, integrates with GitHub REST APIs, and generates shareable online developer portfolios.

---

## 🌟 Key Features

1. **AI Resume Parser (`pdf-parse` + Gemini AI)**
   - Upload PDF resumes up to 5 MB.
   - Automatically extracts structured JSON data: contact info, summary, skills, projects, experience, education, certifications, and social links without manual retyping.

2. **ATS Resume Score Analyzer**
   - Calculates a transparent ATS compatibility score between 0 and 100 based on 10 hiring metrics:
     - Contact Information (10 pts)
     - Professional Summary (10 pts)
     - Skills (15 pts)
     - Work Experience (15 pts)
     - Projects (10 pts)
     - Education (10 pts)
     - Keywords (10 pts)
     - Resume Formatting (10 pts)
     - Achievements / Metrics (5 pts)
     - Certifications (5 pts)
   - Displays clear circular progress meters and category breakdowns with best-practice disclaimers.

3. **ATS Improvement Suggestions & Potential Score Prediction**
   - Provides prioritized actionable feedback (Critical, High Priority, Medium Priority, Optional).
   - Each suggestion outlines the **Problem**, **Why It Matters**, **How to Fix**, and a tailored **Before & After Example**.
   - Displays an estimated potential score increase (e.g. 72 ➔ 88).

4. **Career Domain Selector (18 Domains)**
   - Supports 18 specialized domains: Frontend, Backend, Full Stack, Python, Java, Data Science, Data Analytics, Machine Learning, AI, AI Engineering, DevOps, Cloud Computing, Cybersecurity, Mobile, UI/UX, QA, Blockchain, and Game Development.
   - Includes **"Let AI Recommend a Domain"** functionality analyzing resume skills and project alignment.

5. **Personalized Learning Roadmap**
   - Generates a 10-stage learning path categorized into *Already Know*, *Need Improvement*, and *Need to Learn*.
   - Each topic details status badges, difficulty levels, recommended learning resources, and practice mini-projects.

6. **AI Career Assistant Chatbot**
   - Floating interactive chatbot drawer with system context (resume data, target domain, ATS score, missing skills).
   - Generates 7-day study plans, answers domain questions, and provides project suggestions.

7. **GitHub Integration**
   - Fetches live profile statistics (public repos, followers, following) and top repository cards using GitHub REST API.
   - Includes graceful fallbacks if GitHub rate limits or offline.

8. **Generated Professional Portfolio**
   - Instant shareable URL (e.g. `http://localhost:5000/portfolio/:slug`).
   - Live Theme Switcher with 5 visual palettes: *Midnight Purple*, *Ocean Blue*, *Emerald Green*, *Sunset Orange*, and *Rose Gold*.
   - Sticky glassmorphism navbar, hero section with animated typing text, skill cards, project filters, vertical timelines, and working contact form.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (No React used)
- **AI**: Gemini API (`@google/generative-ai`)
- **Resume Processing**: `multer`, `pdf-parse`
- **GitHub**: GitHub REST API (`api.github.com`)
- **Storage**: JSON files only (`data/portfolios.json`) - No external database required
- **Utilities**: `dotenv`, `cors`, `uuid`, `nodemon`

---

## 📁 Project Structure

```
ai-career-portfolio/
│
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── data/
│   └── portfolios.json
│
├── uploads/
│   ├── resumes/
│   └── profiles/
│
├── routes/
│   ├── portfolioRoutes.js
│   ├── resumeRoutes.js
│   ├── githubRoutes.js
│   └── chatRoutes.js
│
├── controllers/
│   ├── portfolioController.js
│   ├── resumeController.js
│   ├── githubController.js
│   └── chatController.js
│
├── services/
│   ├── aiService.js
│   ├── resumeParser.js
│   ├── atsService.js
│   ├── careerService.js
│   ├── githubService.js
│   └── portfolioStorage.js
│
└── public/
    ├── index.html
    ├── dashboard.html
    ├── review.html
    ├── portfolio.html
    │
    ├── css/
    │   ├── style.css
    │   ├── dashboard.css
    │   ├── review.css
    │   └── portfolio.css
    │
    └── js/
        ├── app.js
        ├── dashboard.js
        ├── review.js
        └── portfolio.js
```

---

## 🚀 Installation & Setup

1. **Clone or Extract Project**:
   ```bash
   cd ai-career-portfolio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access in Browser**:
   Open [http://localhost:5000](http://localhost:5000)

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resume/upload` | Upload PDF resume & extract text via pdf-parse |
| `POST` | `/api/resume/analyze` | Gemini AI structured resume extraction |
| `POST` | `/api/resume/ats-score` | Calculate 0–100 ATS score & breakdown |
| `POST` | `/api/resume/career-domain` | AI recommendation for primary & alternative domain |
| `POST` | `/api/resume/roadmap` | Generate 10-stage learning roadmap |
| `POST` | `/api/resume/readiness` | Evaluate overall career readiness score |
| `POST` | `/api/chat` | AI Career Chatbot query with user context |
| `POST` | `/api/portfolio/create` | Save generated portfolio to `data/portfolios.json` |
| `GET` | `/api/portfolio/slug/:slug` | Retrieve portfolio by slug |
| `GET` | `/api/github/:username` | Fetch GitHub profile & public repositories |

---

## 🛡️ License

MIT License &copy; 2026 AI Career Portfolio Team.
