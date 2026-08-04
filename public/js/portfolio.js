/* ==========================================================================
   AI Career Portfolio - Generated Portfolio Logic (Portfolio.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  PortfolioApp.init();
});

const PortfolioApp = {
  data: null,

  async init() {
    this.setupThemeSwitcher();
    this.setupDownloadPortfolio();
    this.setupMobileMenu();
    await this.loadPortfolioData();
  },

  async loadPortfolioData() {
    // 1. Get slug from URL path e.g. /portfolio/eswar-ms
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    const API_BASE = window.API_BASE_URL || '';

    if (slug && slug !== 'portfolio' && slug !== 'portfolio.html') {
      try {
        const res = await fetch(`${API_BASE}/api/portfolio/slug/${slug}`);
        if (res.ok) {
          this.data = await res.json();
        }
      } catch (err) {
        console.warn("Could not fetch portfolio by slug from server:", err);
      }
    }

    // Fallback to sessionStorage or localStorage if slug not found
    if (!this.data) {
      const raw = sessionStorage.getItem('currentResumeData') || localStorage.getItem('currentResumeData');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          this.data = {
            personalInfo: parsed.personalInfo,
            careerDomain: parsed.careerDomain || { selected: "Full Stack Development" },
            skills: parsed.skills || [],
            projects: parsed.projects || [],
            education: parsed.education || [],
            experience: parsed.experience || [],
            certifications: parsed.certifications || [],
            socialLinks: parsed.socialLinks || {},
            profilePhoto: parsed.profilePhoto || null,
            theme: parsed.theme || "midnight-purple"
          };
        } catch (e) {
          console.error("Failed to parse session data", e);
        }
      }
    }

    if (this.data) {
      this.renderPortfolio();
    } else {
      console.warn("No portfolio data found in server or session.");
    }
  },

  renderPortfolio() {
    const info = this.data.personalInfo || {};
    const name = info.fullName || 'Professional Developer';
    const role = info.professionalTitle || this.data.careerDomain?.selected || 'Software Engineer';

    document.getElementById('page-title').textContent = `${name} | Portfolio`;
    document.getElementById('nav-brand-name').textContent = name;
    document.getElementById('hero-name').textContent = name;
    document.getElementById('hero-title-role').textContent = role;

    // Apply theme
    if (this.data.theme) {
      this.setTheme(this.data.theme);
    }

    // Profile photo
    if (this.data.profilePhoto) {
      const img = document.getElementById('hero-profile-img');
      const icon = document.querySelector('.hero-avatar-icon');
      if (img) {
        img.src = '/' + this.data.profilePhoto.replace(/\\/g, '/');
        img.classList.remove('hidden');
        if (icon) icon.classList.add('hidden');
      }
    }

    // Animated Typing Text
    this.startTypingEffect([
      role,
      this.data.careerDomain?.selected || 'Full Stack Developer',
      'Problem Solver & Builder'
    ]);

    // Social Links
    this.renderSocialLinks();

    // About Section
    document.getElementById('about-bio').textContent = this.data.about || info.shortBio || 'Dedicated technology enthusiast with passion for building scalable digital solutions.';
    document.getElementById('about-location').textContent = info.location || 'Remote';
    document.getElementById('about-domain').textContent = this.data.careerDomain?.selected || role;
    document.getElementById('about-email').textContent = info.email || 'N/A';

    // Skills
    this.renderSkills();

    // Projects
    this.renderProjects();

    // Experience
    this.renderExperience();

    // Education
    this.renderEducation();

    // GitHub Integration
    const githubInput = info.github || this.data.socialLinks?.github;
    if (githubInput) {
      this.fetchAndRenderGitHub(githubInput);
    } else {
      const ghSection = document.getElementById('github');
      const ghNav = document.getElementById('nav-github-link');
      if (ghSection) ghSection.style.display = 'none';
      if (ghNav) ghNav.style.display = 'none';
    }

    // Contact details
    document.getElementById('contact-email-val').textContent = info.email || 'N/A';
    document.getElementById('contact-phone-val').textContent = info.phone || 'N/A';
    document.getElementById('contact-location-val').textContent = info.location || 'Remote';
  },

  setTheme(themeName) {
    const isLight = document.body.classList.contains('light-mode');
    document.body.className = `theme-${themeName}${isLight ? ' light-mode' : ''}`;
    this.currentThemeName = themeName;
    document.querySelectorAll('.theme-dot-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
  },

  setupThemeSwitcher() {
    // Theme color dots
    document.querySelectorAll('.theme-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });

    // Light / Dark mode toggle
    const savedMode = localStorage.getItem('theme-mode') || 'dark';
    this.applyThemeMode(savedMode);

    const toggleBtns = document.querySelectorAll('#mode-toggle-btn, #nav-mode-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newMode = isLight ? 'dark' : 'light';
        localStorage.setItem('theme-mode', newMode);
        this.applyThemeMode(newMode);
      });
    });
  },

  applyThemeMode(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    const toggleBtns = document.querySelectorAll('#mode-toggle-btn, #nav-mode-toggle');
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
  },

  setupDownloadPortfolio() {
    const downloadBtn = document.getElementById('download-portfolio-btn');
    const heroDownloadBtn = document.getElementById('hero-download-btn');
    const menu = document.getElementById('download-dropdown-menu');
    const pdfOpt = document.getElementById('download-pdf-opt');
    const printOpt = document.getElementById('print-pdf-opt');
    const htmlOpt = document.getElementById('download-html-opt');
    const jsonOpt = document.getElementById('download-json-opt');

    if (downloadBtn && menu) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!downloadBtn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add('hidden');
        }
      });
    }

    if (heroDownloadBtn) {
      heroDownloadBtn.addEventListener('click', () => {
        if (menu) {
          menu.classList.remove('hidden');
          menu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          this.downloadPdfDirect();
        }
      });
    }

    if (pdfOpt) {
      pdfOpt.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
        this.downloadPdfDirect();
      });
    }

    if (printOpt) {
      printOpt.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
        window.print();
      });
    }

    if (jsonOpt) {
      jsonOpt.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
        this.downloadJson();
      });
    }

    if (htmlOpt) {
      htmlOpt.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
        this.downloadStandaloneHtml();
      });
    }
  },

  async downloadPdfDirect() {
    const name = (this.data?.personalInfo?.fullName || 'Portfolio').replace(/\s+/g, '_');
    const filename = `${name}_Portfolio.pdf`;

    if (typeof html2pdf !== 'undefined') {
      const elementsToHide = document.querySelectorAll(
        '.portfolio-action-group, .sticky-nav, .mobile-toggle, #particles-canvas'
      );

      const originalStyles = [];
      elementsToHide.forEach(el => {
        originalStyles.push({ el, display: el.style.display });
        el.style.display = 'none';
      });

      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        await html2pdf().set(opt).from(document.body).save();
      } catch (err) {
        console.error('Direct PDF download error, falling back to print window:', err);
        window.print();
      } finally {
        originalStyles.forEach(item => {
          item.el.style.display = item.display;
        });
      }
    } else {
      window.print();
    }
  },

  downloadJson() {
    if (!this.data) return;
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = (this.data.personalInfo?.fullName || 'Portfolio').replace(/\s+/g, '_');
    a.href = url;
    a.download = `${name}_Portfolio_Data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadStandaloneHtml() {
    const name = (this.data?.personalInfo?.fullName || 'Developer').replace(/\s+/g, '_');
    const fullHtml = document.documentElement.outerHTML;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_Portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  startTypingEffect(phrases) {
    const textEl = document.getElementById('typing-text');
    if (!textEl) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = phrases[phraseIndex];
      if (isDeleting) {
        textEl.textContent = current.substring(0, charIndex--);
      } else {
        textEl.textContent = current.substring(0, charIndex++);
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === current.length + 1) {
        speed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
      }

      setTimeout(type, speed);
    }

    type();
  },

  renderSocialLinks() {
    const row = document.getElementById('hero-social-row');
    const links = this.data.socialLinks || {};

    let html = '';
    if (links.github) html += `<a href="${links.github}" target="_blank" class="social-icon-btn"><i class="fa-brands fa-github"></i></a>`;
    if (links.linkedin) html += `<a href="${links.linkedin}" target="_blank" class="social-icon-btn"><i class="fa-brands fa-linkedin"></i></a>`;
    if (links.website) html += `<a href="${links.website}" target="_blank" class="social-icon-btn"><i class="fa-solid fa-globe"></i></a>`;
    if (links.twitter) html += `<a href="${links.twitter}" target="_blank" class="social-icon-btn"><i class="fa-brands fa-x-twitter"></i></a>`;

    if (row) row.innerHTML = html;
  },

  renderSkills() {
    const container = document.getElementById('portfolio-skills-container');
    const skills = this.data.skills || [];

    if (!container) return;

    if (skills.length === 0) {
      container.innerHTML = `<p class="text-muted text-center">No skills listed yet.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="skill-category-card glass-card">
        <h3><i class="fa-solid fa-layer-group text-purple"></i> Technical Skills</h3>
        <div class="skill-tags-flex">
          ${skills.map(s => `<span class="skill-chip">${s}</span>`).join('')}
        </div>
      </div>
    `;
  },

  renderProjects() {
    const container = document.getElementById('portfolio-projects-container');
    const projects = this.data.projects || [];

    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `<p class="text-muted text-center col-span-full">No projects specified in resume. Use the Review page to add your projects!</p>`;
      return;
    }

    const renderGrid = (items) => {
      container.innerHTML = items.map(p => `
        <div class="project-card glass-card">
          <div>
            <div class="project-title-row">
              <h3>${p.name || 'Project'}</h3>
              <i class="fa-solid fa-laptop-code text-purple"></i>
            </div>
            <p class="text-muted font-sm">${p.description || ''}</p>
            <div class="skill-tags-flex mt-3">
              ${(p.technologies || []).map(t => `<span class="skill-chip">${t}</span>`).join('')}
            </div>
          </div>
          <div class="project-links">
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="btn btn-outline btn-sm"><i class="fa-brands fa-github"></i> Repository</a>` : ''}
            ${p.liveDemo ? `<a href="${p.liveDemo}" target="_blank" class="btn btn-primary btn-sm"><i class="fa-solid fa-up-right-from-square"></i> Live Demo</a>` : ''}
          </div>
        </div>
      `).join('');
    };

    renderGrid(projects);

    document.querySelectorAll('.projects-filter-bar .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.projects-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        if (filter === 'all') {
          renderGrid(projects);
        } else {
          const filtered = projects.filter(p => {
            const str = (p.name + ' ' + p.description + ' ' + (p.technologies || []).join(' ')).toLowerCase();
            return str.includes(filter);
          });
          renderGrid(filtered.length > 0 ? filtered : projects);
        }
      });
    });
  },

  renderExperience() {
    const container = document.getElementById('portfolio-experience-timeline');
    const exp = this.data.experience || [];
    if (!container) return;

    if (exp.length === 0) {
      container.innerHTML = `<p class="text-muted text-center py-4">No work experience listed in resume.</p>`;
      return;
    }

    container.innerHTML = exp.map(e => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content glass-card">
          <h3>${e.jobTitle || 'Role'}</h3>
          <span class="text-purple font-sm font-weight-600">${e.company || ''} ${e.startDate ? `(${e.startDate} - ${e.endDate || 'Present'})` : ''}</span>
          <ul class="mt-2 text-muted font-sm">
            ${(e.responsibilities || []).map(r => `<li>• ${r}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  },

  renderEducation() {
    const container = document.getElementById('portfolio-education-container');
    const edu = this.data.education || [];
    if (!container) return;

    if (edu.length === 0) {
      container.innerHTML = `<p class="text-muted text-center">No education details provided.</p>`;
      return;
    }

    container.innerHTML = edu.map(e => `
      <div class="glass-card p-4">
        <h3><i class="fa-solid fa-graduation-cap text-purple"></i> ${e.degree || 'Degree'}</h3>
        <p class="text-muted mt-1">${e.institution || 'University'} ${e.startYear ? `(${e.startYear} - ${e.endYear || ''})` : ''}</p>
        ${e.description ? `<p class="font-sm text-dim mt-2">${e.description}</p>` : ''}
      </div>
    `).join('');
  },

  async fetchAndRenderGitHub(input) {
    const banner = document.getElementById('github-profile-box');
    const container = document.getElementById('github-repos-container');
    const ghSection = document.getElementById('github');
    const ghNav = document.getElementById('nav-github-link');

    try {
      const cleanUser = input.replace(/^https?:\/\/github.com\//i, '').replace(/^@/, '').split('/')[0];
      const API_BASE = window.API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/github/${cleanUser}`);

      if (!res.ok) {
        throw new Error('GitHub API user error');
      }

      const ghData = await res.json();
      const p = ghData.profile;

      if (banner) {
        banner.innerHTML = `
          <div>
            <div class="github-stat-num text-purple">${p.public_repos}</div>
            <div class="text-muted font-sm">Repositories</div>
          </div>
          <div>
            <div class="github-stat-num text-emerald">${p.followers}</div>
            <div class="text-muted font-sm">Followers</div>
          </div>
          <div>
            <div class="github-stat-num text-amber">${p.following}</div>
            <div class="text-muted font-sm">Followers</div>
          </div>
        `;
      }

      if (container && ghData.repositories) {
        container.innerHTML = ghData.repositories.map(r => `
          <div class="repo-card glass-card">
            <h4><a href="${r.html_url}" target="_blank" class="text-main">${r.name}</a></h4>
            <p class="text-muted font-sm mt-1">${r.description || 'No description provided.'}</p>
            <div class="flex-between mt-3 font-xs text-dim">
              <span><i class="fa-solid fa-circle text-purple"></i> ${r.language || 'Code'}</span>
              <span><i class="fa-solid fa-star text-gold"></i> ${r.stargazers_count}</span>
              <span><i class="fa-solid fa-code-fork"></i> ${r.forks_count}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.warn("GitHub integration fallback: Hiding GitHub section cleanly.", err.message);
      if (ghSection) ghSection.style.display = 'none';
      if (ghNav) ghNav.style.display = 'none';
    }
  },

  setupMobileMenu() {
    const toggle = document.getElementById('portfolio-mobile-toggle');
    const links = document.getElementById('portfolio-nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('hidden'));
    }
  }
};
