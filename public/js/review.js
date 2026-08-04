/* ==========================================================================
   AI Career Portfolio - Review & Edit JavaScript (Review.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalThemeMode();
  ReviewApp.init();
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

const ReviewApp = {
  resumeData: null,

  init() {
    this.loadData();
    this.bindEvents();
    if (this.resumeData) {
      this.populateForm();
    }
  },

  loadData() {
    const raw = sessionStorage.getItem('currentResumeData');
    if (raw) {
      try {
        this.resumeData = JSON.parse(raw);
      } catch (e) {
        console.error("Error loading resume data", e);
      }
    } else {
      this.resumeData = {
        personalInfo: { fullName: "Eswar MS", professionalTitle: "Full Stack Engineer", email: "eswar@example.com" },
        skills: ["JavaScript", "HTML", "CSS", "Git"],
        projects: [],
        education: [],
        experience: [],
        certifications: []
      };
    }
  },

  populateForm() {
    const info = this.resumeData.personalInfo || {};
    document.getElementById('rev-fullName').value = info.fullName || '';
    document.getElementById('rev-professionalTitle').value = info.professionalTitle || '';
    document.getElementById('rev-email').value = info.email || '';
    document.getElementById('rev-phone').value = info.phone || '';
    document.getElementById('rev-location').value = info.location || '';
    document.getElementById('rev-about').value = this.resumeData.about || info.shortBio || '';

    this.renderSkillsTags();
    this.renderProjectsList();
    this.renderExperienceList();
    this.renderEducationList();
    this.renderCertificationsList();
  },

  renderSkillsTags() {
    const box = document.getElementById('skills-tags-box');
    const skills = this.resumeData.skills || [];
    if (!box) return;

    box.innerHTML = skills.map((s, idx) => `
      <div class="skill-tag-editable">
        <span>${s}</span>
        <i class="fa-solid fa-xmark tag-remove-btn" data-idx="${idx}"></i>
      </div>
    `).join('');

    box.querySelectorAll('.tag-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.idx);
        this.resumeData.skills.splice(index, 1);
        this.renderSkillsTags();
      });
    });
  },

  renderProjectsList() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;
    const projects = this.resumeData.projects || [];

    container.innerHTML = projects.map((p, i) => `
      <div class="item-editor-card" data-index="${i}">
        <div class="item-editor-header">
          <span>Project #${i + 1}</span>
          <button type="button" class="btn-icon danger remove-project-btn" data-idx="${i}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Project Name</label>
            <input type="text" class="form-input proj-name" value="${p.name || ''}">
          </div>
          <div class="form-group">
            <label>GitHub URL</label>
            <input type="text" class="form-input proj-github" value="${p.githubUrl || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-input proj-desc" rows="2">${p.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Technologies (comma separated)</label>
          <input type="text" class="form-input proj-tech" value="${(p.technologies || []).join(', ')}">
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.remove-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx);
        this.resumeData.projects.splice(idx, 1);
        this.renderProjectsList();
      });
    });
  },

  renderExperienceList() {
    const container = document.getElementById('exp-list-container');
    if (!container) return;
    const exp = this.resumeData.experience || [];

    container.innerHTML = exp.map((e, i) => `
      <div class="item-editor-card" data-index="${i}">
        <div class="item-editor-header">
          <span>Experience #${i + 1}</span>
          <button type="button" class="btn-icon danger remove-exp-btn" data-idx="${i}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Job Title</label>
            <input type="text" class="form-input exp-title" value="${e.jobTitle || ''}">
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" class="form-input exp-company" value="${e.company || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <input type="text" class="form-input exp-start" value="${e.startDate || ''}">
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="text" class="form-input exp-end" value="${e.endDate || ''}">
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.remove-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        this.resumeData.experience.splice(idx, 1);
        this.renderExperienceList();
      });
    });
  },

  renderEducationList() {
    const container = document.getElementById('edu-list-container');
    if (!container) return;
    const edu = this.resumeData.education || [];

    container.innerHTML = edu.map((e, i) => `
      <div class="item-editor-card" data-index="${i}">
        <div class="item-editor-header">
          <span>Education #${i + 1}</span>
          <button type="button" class="btn-icon danger remove-edu-btn" data-idx="${i}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Degree</label>
            <input type="text" class="form-input edu-degree" value="${e.degree || ''}">
          </div>
          <div class="form-group">
            <label>Institution</label>
            <input type="text" class="form-input edu-inst" value="${e.institution || ''}">
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.remove-edu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        this.resumeData.education.splice(idx, 1);
        this.renderEducationList();
      });
    });
  },

  renderCertificationsList() {
    const container = document.getElementById('cert-list-container');
    if (!container) return;
    const certs = this.resumeData.certifications || [];

    container.innerHTML = certs.map((c, i) => `
      <div class="item-editor-card" data-index="${i}">
        <div class="item-editor-header">
          <span>Certification #${i + 1}</span>
          <button type="button" class="btn-icon danger remove-cert-btn" data-idx="${i}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Certification Name</label>
            <input type="text" class="form-input cert-name" value="${c.name || ''}">
          </div>
          <div class="form-group">
            <label>Issuing Organization</label>
            <input type="text" class="form-input cert-org" value="${c.organization || ''}">
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.remove-cert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        this.resumeData.certifications.splice(idx, 1);
        this.renderCertificationsList();
      });
    });
  },

  bindEvents() {
    // Add Skill Input Event
    const skillInput = document.getElementById('skills-input-field');
    if (skillInput) {
      skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = skillInput.value.trim();
          if (val) {
            if (!this.resumeData.skills) this.resumeData.skills = [];
            this.resumeData.skills.push(val);
            skillInput.value = '';
            this.renderSkillsTags();
          }
        }
      });
    }

    // Add buttons
    document.getElementById('add-project-btn')?.addEventListener('click', () => {
      if (!this.resumeData.projects) this.resumeData.projects = [];
      this.resumeData.projects.push({ name: "New Project", description: "", technologies: [] });
      this.renderProjectsList();
    });

    document.getElementById('add-exp-btn')?.addEventListener('click', () => {
      if (!this.resumeData.experience) this.resumeData.experience = [];
      this.resumeData.experience.push({ jobTitle: "Job Title", company: "Company Name", startDate: "2023", endDate: "Present" });
      this.renderExperienceList();
    });

    document.getElementById('add-edu-btn')?.addEventListener('click', () => {
      if (!this.resumeData.education) this.resumeData.education = [];
      this.resumeData.education.push({ degree: "Degree", institution: "University" });
      this.renderEducationList();
    });

    document.getElementById('add-cert-btn')?.addEventListener('click', () => {
      if (!this.resumeData.certifications) this.resumeData.certifications = [];
      this.resumeData.certifications.push({ name: "Certification Name", organization: "Issuer" });
      this.renderCertificationsList();
    });

    // Form submit
    document.getElementById('review-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveChanges();
      window.location.href = '/dashboard';
    });

    document.getElementById('save-review-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveChanges();
      alert('Changes saved successfully!');
    });

    document.getElementById('generate-from-review-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveChanges();
      window.location.href = '/dashboard';
    });
  },

  saveChanges() {
    this.resumeData.personalInfo.fullName = document.getElementById('rev-fullName').value;
    this.resumeData.personalInfo.professionalTitle = document.getElementById('rev-professionalTitle').value;
    this.resumeData.personalInfo.email = document.getElementById('rev-email').value;
    this.resumeData.personalInfo.phone = document.getElementById('rev-phone').value;
    this.resumeData.personalInfo.location = document.getElementById('rev-location').value;
    this.resumeData.about = document.getElementById('rev-about').value;

    // Collect DOM inputs for projects
    const projCards = document.querySelectorAll('#projects-list-container .item-editor-card');
    projCards.forEach((card, idx) => {
      if (this.resumeData.projects[idx]) {
        this.resumeData.projects[idx].name = card.querySelector('.proj-name').value;
        this.resumeData.projects[idx].githubUrl = card.querySelector('.proj-github').value;
        this.resumeData.projects[idx].description = card.querySelector('.proj-desc').value;
        const techStr = card.querySelector('.proj-tech').value;
        this.resumeData.projects[idx].technologies = techStr.split(',').map(t => t.trim()).filter(Boolean);
      }
    });

    // Save back to sessionStorage
    sessionStorage.setItem('currentResumeData', JSON.stringify(this.resumeData));
  }
};
