/* ==========================================================================
   AI Career Portfolio - Dashboard Logic (Dashboard.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalThemeMode();
  DashboardApp.init();
});

function initGlobalThemeMode() {
  const savedMode = localStorage.getItem('theme-mode') || 'dark';
  applyGlobalThemeMode(savedMode);

  const toggleBtns = document.querySelectorAll('#nav-mode-toggle, #mode-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-mode');
      const newMode = isLight ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      applyGlobalThemeMode(newMode);
    });
  });
}

function applyGlobalThemeMode(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  const toggleBtns = document.querySelectorAll('#nav-mode-toggle, #mode-toggle-btn');
  toggleBtns.forEach(btn => {
    const sun = btn.querySelector('.sun-icon');
    const moon = btn.querySelector('.moon-icon');
    if (mode === 'light') {
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = 'inline-block';
      btn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      if (sun) sun.style.display = 'inline-block';
      if (moon) moon.style.display = 'none';
      btn.setAttribute('title', 'Switch to Light Mode');
    }
  });
}

const DashboardApp = {
  resumeData: null,
  atsData: null,
  readinessData: null,
  roadmapData: null,
  selectedDomain: "Full Stack Development",
  selectedTheme: "midnight-purple",
  currentPortfolio: null,

  domainsList: [
    { name: "Frontend Development", icon: "fa-code" },
    { name: "Backend Development", icon: "fa-server" },
    { name: "Full Stack Development", icon: "fa-layer-group" },
    { name: "Python Development", icon: "fa-brands fa-python" },
    { name: "Java Development", icon: "fa-brands fa-java" },
    { name: "Data Science", icon: "fa-chart-network" },
    { name: "Data Analytics", icon: "fa-chart-pie" },
    { name: "Machine Learning", icon: "fa-brain-circuit" },
    { name: "Artificial Intelligence", icon: "fa-wand-magic-sparkles" },
    { name: "AI Engineering", icon: "fa-robot" },
    { name: "DevOps", icon: "fa-infinity" },
    { name: "Cloud Computing", icon: "fa-cloud" },
    { name: "Cybersecurity", icon: "fa-shield-halved" },
    { name: "Mobile App Development", icon: "fa-mobile-screen" },
    { name: "UI/UX Design", icon: "fa-pen-ruler" },
    { name: "Software Testing / QA", icon: "fa-vial" },
    { name: "Blockchain", icon: "fa-cubes" },
    { name: "Game Development", icon: "fa-gamepad" }
  ],

  async init() {
    this.loadSessionData();
    this.setupTabs();
    this.setupChatbot();
    this.renderDomainCards();
    this.setupThemeSelector();

    if (this.resumeData) {
      await this.runAllAnalysis();
    } else {
      this.resumeData = this.getSampleResumeData();
      await this.runAllAnalysis();
    }
  },

  loadSessionData() {
    const raw = sessionStorage.getItem('currentResumeData');
    if (raw) {
      try {
        this.resumeData = JSON.parse(raw);
        const userName = this.resumeData.personalInfo?.fullName || 'Candidate';
        const welcomeEl = document.getElementById('user-welcome-name');
        if (welcomeEl) welcomeEl.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${userName}`;
      } catch (e) {
        console.error("Failed to parse session resume data", e);
      }
    }
  },

  async runAllAnalysis() {
    try {
      // 1. Calculate ATS Score
      const atsRes = await fetch('/api/resume/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: this.resumeData, careerDomain: this.selectedDomain })
      });
      this.atsData = await atsRes.json();
      this.renderATSStats();

      // 2. Calculate Career Readiness Score
      const readinessRes = await fetch('/api/resume/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: this.resumeData })
      });
      this.readinessData = await readinessRes.json();
      this.renderReadinessStats();

      // 3. Generate Learning Roadmap
      const roadmapRes = await fetch('/api/resume/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: this.resumeData, careerDomain: this.selectedDomain })
      });
      this.roadmapData = await roadmapRes.json();
      this.renderRoadmap();

      // Update basic counts
      this.renderCounts();
    } catch (err) {
      console.error("Error during analysis:", err);
    }
  },

  renderATSStats() {
    if (!this.atsData) return;
    const score = this.atsData.score || 70;
    const circle = document.getElementById('ats-progress-circle');
    const scoreNum = document.getElementById('ats-score-num');
    const statusText = document.getElementById('ats-score-status');

    if (scoreNum) scoreNum.textContent = score;

    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }

    if (statusText) {
      if (score >= 80) statusText.textContent = 'Excellent ATS Compatibility';
      else if (score >= 60) statusText.textContent = 'Good ATS Score — Room to Improve';
      else statusText.textContent = 'Requires Priority Improvements';
    }

    this.renderCategoryBreakdown();
    this.renderSuggestions();
  },

  renderReadinessStats() {
    if (!this.readinessData) return;
    const score = this.readinessData.score || 68;
    const circle = document.getElementById('readiness-progress-circle');
    const scoreNum = document.getElementById('readiness-score-num');
    const statusText = document.getElementById('readiness-status');

    if (scoreNum) scoreNum.textContent = score;

    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }

    if (statusText) {
      statusText.textContent = score >= 75 ? 'High Industry Readiness' : 'Moderate Job Readiness';
    }
  },

  renderCategoryBreakdown() {
    const list = document.getElementById('overview-breakdown-list');
    const catGrid = document.getElementById('ats-category-details');
    if (!this.atsData || !this.atsData.breakdown) return;

    const breakdown = this.atsData.breakdown;
    const maxMap = {
      contactInformation: 10,
      professionalSummary: 10,
      skills: 15,
      workExperience: 15,
      projects: 10,
      education: 10,
      keywords: 10,
      resumeFormatting: 10,
      achievementsMetrics: 5,
      certifications: 5
    };

    const labelMap = {
      contactInformation: 'Contact Information',
      professionalSummary: 'Professional Summary',
      skills: 'Technical Skills',
      workExperience: 'Work Experience',
      projects: 'Projects',
      education: 'Education',
      keywords: 'Domain Keywords',
      resumeFormatting: 'Resume Formatting',
      achievementsMetrics: 'Achievements & Metrics',
      certifications: 'Certifications'
    };

    if (list) {
      list.innerHTML = Object.keys(breakdown).slice(0, 5).map(key => {
        const val = breakdown[key] || 0;
        const max = maxMap[key] || 10;
        const pct = Math.round((val / max) * 100);
        return `
          <div class="breakdown-item-bar">
            <div class="breakdown-item-header">
              <span>${labelMap[key] || key}</span>
              <span>${val} / ${max} pts</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (catGrid) {
      catGrid.innerHTML = Object.keys(breakdown).map(key => {
        const val = breakdown[key] || 0;
        const max = maxMap[key] || 10;
        const pct = Math.round((val / max) * 100);
        return `
          <div class="category-card">
            <h4>
              <span>${labelMap[key] || key}</span>
              <span class="gradient-text">${val} / ${max}</span>
            </h4>
            <div class="progress-track mt-2">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderSuggestions() {
    const overviewList = document.getElementById('overview-suggestions-list');
    const mainContainer = document.getElementById('suggestions-container');
    const curScoreEl = document.getElementById('current-score-val');
    const potScoreEl = document.getElementById('potential-score-val');

    if (!this.atsData) return;

    if (curScoreEl) curScoreEl.textContent = this.atsData.score || 72;
    if (potScoreEl) potScoreEl.textContent = this.atsData.estimatedPotentialScore || 88;

    const suggestions = this.atsData.suggestions || [];

    if (overviewList) {
      if (suggestions.length === 0) {
        overviewList.innerHTML = `<p class="text-muted">Your resume meets core ATS best practices! No critical issues found.</p>`;
      } else {
        overviewList.innerHTML = suggestions.slice(0, 3).map(s => `
          <div class="suggestion-card ${s.priority || 'medium'} mt-2">
            <div class="suggestion-header">
              <strong>${s.category || 'Resume Formatting'}</strong>
              <span class="suggestion-priority-tag ${s.priority || 'medium'}">${s.priority || 'Medium'}</span>
            </div>
            <p class="text-muted font-sm">${s.problem}</p>
          </div>
        `).join('');
      }
    }

    if (mainContainer) {
      if (suggestions.length === 0) {
        mainContainer.innerHTML = `
          <div class="card glass-card text-center py-5">
            <i class="fa-solid fa-circle-check text-emerald font-large mb-3"></i>
            <h3>Great Job! No High-Priority ATS Errors Found</h3>
            <p class="text-muted">Your resume formatted cleanly. You can proceed to launch your portfolio.</p>
          </div>
        `;
      } else {
        mainContainer.innerHTML = suggestions.map(s => `
          <div class="suggestion-card ${s.priority || 'medium'}">
            <div class="suggestion-header">
              <h4 class="m-0">${s.category || 'ATS Optimization'}</h4>
              <span class="suggestion-priority-tag ${s.priority || 'medium'}">${s.priority || 'Medium Priority'}</span>
            </div>

            <p><strong>Problem:</strong> ${s.problem}</p>
            <p class="text-muted mt-1"><strong>Why it matters:</strong> ${s.whyItMatters}</p>

            <div class="suggestion-box-content">
              <strong>How to fix:</strong> ${s.howToFix}
              ${s.example ? `<div class="example-box"><strong>Example:</strong> ${s.example}</div>` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  },

  renderRoadmap() {
    const container = document.getElementById('roadmap-stages-container');
    const domainText = document.getElementById('roadmap-domain-name');

    if (domainText) domainText.textContent = this.selectedDomain;

    if (!container || !this.roadmapData || !this.roadmapData.stages) return;

    container.innerHTML = this.roadmapData.stages.map((stage, idx) => `
      <div class="stage-block">
        <h3 class="stage-title"><i class="fa-solid fa-layer-group"></i> ${stage.stageName || `Stage ${idx + 1}`}</h3>
        <div class="topics-grid">
          ${(stage.topics || []).map(t => `
            <div class="topic-card">
              <div>
                <div class="topic-header">
                  <span class="topic-name">${t.topic}</span>
                  <span class="status-badge-chip ${t.status || 'Recommended'}">${t.status || 'Recommended'}</span>
                </div>
                <p class="topic-why">${t.whyImportant || ''}</p>
              </div>
              <div class="topic-footer">
                <span class="practice-project-tag"><i class="fa-solid fa-code-fork"></i> Practice: ${t.practiceProject || 'Build a demo app'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  renderCounts() {
    const skillsCountEl = document.getElementById('skills-count');
    const missingEl = document.getElementById('missing-skills-count');
    const domainEl = document.getElementById('selected-domain-text');

    const skills = this.resumeData?.skills || [];
    if (skillsCountEl) skillsCountEl.textContent = skills.length;
    if (domainEl) domainEl.textContent = this.selectedDomain;

    let missingCount = 0;
    if (this.roadmapData && this.roadmapData.stages) {
      missingCount = this.roadmapData.stages.flatMap(s => s.topics || []).filter(t => t.status === 'Missing' || t.status === 'Recommended').length;
    }
    if (missingEl) missingEl.textContent = `${missingCount} Target Skills to Master`;
  },

  renderDomainCards() {
    const grid = document.getElementById('domains-grid');
    if (!grid) return;

    grid.innerHTML = this.domainsList.map(d => `
      <div class="domain-select-card ${d.name === this.selectedDomain ? 'selected' : ''}" data-domain="${d.name}">
        <div class="domain-icon"><i class="fa-solid ${d.icon}"></i></div>
        <div class="domain-name">${d.name}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.domain-select-card').forEach(card => {
      card.addEventListener('click', async () => {
        grid.querySelectorAll('.domain-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedDomain = card.dataset.domain;
        await this.runAllAnalysis();
      });
    });

    const recommendBtn = document.getElementById('ai-recommend-domain-btn');
    const resultBox = document.getElementById('ai-recommendation-result');

    if (recommendBtn) {
      recommendBtn.addEventListener('click', async () => {
        recommendBtn.disabled = true;
        recommendBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing Resume...`;

        try {
          const res = await fetch('/api/resume/career-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData: this.resumeData })
          });

          const rec = await res.json();
          this.selectedDomain = rec.primary || "Full Stack Development";

          if (resultBox) {
            resultBox.innerHTML = `
              <div class="mt-3">
                <span class="badge glow-purple">Primary Match</span>
                <h4 class="gradient-text font-large mt-1">${rec.primary}</h4>
                <p class="text-muted mt-2">${rec.reason}</p>
                <div class="mt-2 text-dim font-sm">Alternative suggestion: <strong>${rec.alternative}</strong></div>
              </div>
            `;
            resultBox.classList.remove('hidden');
          }

          this.renderDomainCards();
          await this.runAllAnalysis();
        } catch (err) {
          console.error("Failed to get recommendation", err);
        } finally {
          recommendBtn.disabled = false;
          recommendBtn.innerHTML = `<i class="fa-solid fa-robot"></i> Recommend Domain`;
        }
      });
    }
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.dashboard-tabs-nav .tab-btn[data-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const activeContent = document.getElementById(`tab-${target}`);
        if (activeContent) activeContent.classList.add('active');
      });
    });

    const changeDomainBtn = document.getElementById('change-domain-btn');
    if (changeDomainBtn) {
      changeDomainBtn.addEventListener('click', () => {
        const domainTab = document.querySelector('[data-tab="domain"]');
        if (domainTab) domainTab.click();
      });
    }

    const generateBannerBtn = document.getElementById('generate-portfolio-banner-btn');
    if (generateBannerBtn) {
      generateBannerBtn.addEventListener('click', () => {
        const portfolioTab = document.querySelector('[data-tab="portfolio"]');
        if (portfolioTab) portfolioTab.click();
      });
    }
  },

  setupThemeSelector() {
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedTheme = card.dataset.theme;
      });
    });

    const generateBtn = document.getElementById('final-generate-btn');
    const resultBox = document.getElementById('portfolio-url-result');
    const urlInput = document.getElementById('shareable-url-input');
    const copyBtn = document.getElementById('copy-url-btn');
    const viewBtn = document.getElementById('view-portfolio-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Generating Portfolio...`;

        try {
          const payload = {
            theme: this.selectedTheme,
            personalInfo: this.resumeData.personalInfo,
            careerDomain: {
              selected: this.selectedDomain,
              recommended: this.selectedDomain,
              reason: "AI Analyzed Fit"
            },
            skills: this.resumeData.skills || [],
            projects: this.resumeData.projects || [],
            education: this.resumeData.education || [],
            experience: this.resumeData.experience || [],
            certifications: this.resumeData.certifications || [],
            languages: this.resumeData.languages || [],
            achievements: this.resumeData.achievements || [],
            atsAnalysis: this.atsData || {},
            careerReadiness: this.readinessData || {},
            learningRoadmap: this.roadmapData || {},
            socialLinks: this.resumeData.socialLinks || {},
            profilePhoto: this.resumeData.profilePhoto || null
          };

          const API_BASE = window.API_BASE_URL || '';
          const res = await fetch(`${API_BASE}/api/portfolio/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          this.currentPortfolio = await res.json();
          sessionStorage.setItem('currentResumeData', JSON.stringify(this.currentPortfolio));
          localStorage.setItem('currentResumeData', JSON.stringify(this.currentPortfolio));
          const portfolioUrl = `${window.location.origin}/portfolio/${this.currentPortfolio.slug}`;

          if (urlInput) urlInput.value = portfolioUrl;
          if (viewBtn) viewBtn.href = `/portfolio/${this.currentPortfolio.slug}`;
          if (resultBox) resultBox.classList.remove('hidden');

          resultBox.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
          console.error("Failed to generate portfolio:", err);
        } finally {
          generateBtn.disabled = false;
          generateBtn.innerHTML = `<i class="fa-solid fa-rocket"></i> Generate & Save Portfolio Now`;
        }
      });
    }

    if (copyBtn && urlInput) {
      copyBtn.addEventListener('click', () => {
        urlInput.select();
        navigator.clipboard.writeText(urlInput.value);
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Link`, 2000);
      });
    }
  },

  setupChatbot() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesBox = document.getElementById('chat-messages');

    if (trigger && windowEl) {
      trigger.addEventListener('click', () => windowEl.classList.toggle('hidden'));
    }
    if (closeBtn && windowEl) {
      closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));
    }

    const sendMessage = async (userText) => {
      const msg = userText || input.value.trim();
      if (!msg) return;

      if (input) input.value = '';

      const userBubble = document.createElement('div');
      userBubble.className = 'chat-msg user';
      userBubble.innerHTML = `<div class="msg-bubble">${msg}</div>`;
      messagesBox.appendChild(userBubble);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      const typingBubble = document.createElement('div');
      typingBubble.className = 'chat-msg bot';
      typingBubble.innerHTML = `<div class="msg-bubble"><i class="fa-solid fa-circle-notch fa-spin"></i> Career AI is thinking...</div>`;
      messagesBox.appendChild(typingBubble);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      try {
        const contextPayload = {
          careerDomain: { selected: this.selectedDomain },
          atsAnalysis: this.atsData,
          skills: this.resumeData?.skills,
          personalInfo: this.resumeData?.personalInfo,
          projects: this.resumeData?.projects,
          learningRoadmap: this.roadmapData
        };

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, context: contextPayload })
        });

        const data = await res.json();
        typingBubble.remove();

        const botBubble = document.createElement('div');
        botBubble.className = 'chat-msg bot';
        
        let formattedMsg = data.message || "I'm here to guide your career path!";
        formattedMsg = formattedMsg.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        botBubble.innerHTML = `<div class="msg-bubble">${formattedMsg}</div>`;
        messagesBox.appendChild(botBubble);
        messagesBox.scrollTop = messagesBox.scrollHeight;
      } catch (err) {
        typingBubble.remove();
        const errBubble = document.createElement('div');
        errBubble.className = 'chat-msg bot';
        errBubble.innerHTML = `<div class="msg-bubble text-rose">Sorry, I ran into an error. Please try again.</div>`;
        messagesBox.appendChild(errBubble);
      }
    };

    if (sendBtn) {
      sendBtn.addEventListener('click', () => sendMessage());
    }
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }

    document.querySelectorAll('.chat-quick-chips .chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        if (windowEl.classList.contains('hidden')) {
          windowEl.classList.remove('hidden');
        }
        sendMessage(chip.dataset.prompt);
      });
    });
  },

  getSampleResumeData() {
    return {
      personalInfo: {
        fullName: "Candidate",
        professionalTitle: "Software Developer",
        email: "candidate@example.com",
        phone: "+1 234 567 8900",
        location: "Remote",
        shortBio: "Passionate developer focused on software engineering."
      },
      skills: ["JavaScript", "HTML", "CSS", "Git"],
      projects: [],
      education: [],
      experience: [],
      certifications: [],
      languages: [{ language: "English", proficiency: "Native" }],
      socialLinks: {}
    };
  }
};
