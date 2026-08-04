/* ==========================================================================
   AI Career Portfolio - Landing Page JavaScript (App.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalThemeMode();
  initParticleCanvas();
  initFormUploads();
  checkExistingSession();
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

/**
 * Animated Canvas Background Particles & Network Lines
 */
function initParticleCanvas() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.floor(width / 20);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(139, 92, 246, ' : 'rgba(59, 130, 246, '
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.6)';
      ctx.fill();

      // Connect particles with network lines
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.color + (1 - dist / 120) * 0.15 + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Handle File Upload Drag-and-Drop & Form Submission
 */
function initFormUploads() {
  const dropzone = document.getElementById('resume-dropzone');
  const fileInput = document.getElementById('resumeFile');
  const previewCard = document.getElementById('resume-preview');
  const pdfName = document.getElementById('pdf-name');
  const pdfSize = document.getElementById('pdf-size');
  const removePdfBtn = document.getElementById('remove-pdf');

  const photoInput = document.getElementById('photoFile');
  const photoImg = document.getElementById('photo-img');
  const defaultAvatarIcon = document.querySelector('.default-avatar-icon');
  const removePhotoBtn = document.getElementById('remove-photo');

  const portfolioForm = document.getElementById('portfolio-form');
  const submitBtn = document.getElementById('submit-btn');
  const formError = document.getElementById('form-error');

  let selectedPdfFile = null;
  let selectedPhotoFile = null;

  // Dropzone drag events
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handlePdfSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handlePdfSelection(e.target.files[0]);
      }
    });
  }

  function handlePdfSelection(file) {
    if (file.type !== 'application/pdf') {
      showError('Only PDF files are accepted. Please select a valid text-based PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('File size exceeds the 5 MB limit. Please upload a smaller PDF.');
      return;
    }

    selectedPdfFile = file;
    pdfName.textContent = file.name;
    pdfSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    dropzone.classList.add('hidden');
    previewCard.classList.remove('hidden');
    hideError();
  }

  if (removePdfBtn) {
    removePdfBtn.addEventListener('click', () => {
      selectedPdfFile = null;
      fileInput.value = '';
      dropzone.classList.remove('hidden');
      previewCard.classList.add('hidden');
    });
  }

  // Profile photo handler
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
          showError('Please upload a valid image file (PNG, JPG, WebP).');
          return;
        }
        selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          photoImg.src = event.target.result;
          photoImg.classList.remove('hidden');
          if (defaultAvatarIcon) defaultAvatarIcon.classList.add('hidden');
          if (removePhotoBtn) removePhotoBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      selectedPhotoFile = null;
      photoInput.value = '';
      photoImg.src = '';
      photoImg.classList.add('hidden');
      if (defaultAvatarIcon) defaultAvatarIcon.classList.remove('hidden');
      removePhotoBtn.classList.add('hidden');
    });
  }

  // Form submission handler
  if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      if (!selectedPdfFile && !fileInput.files[0]) {
        showError('Please select a valid PDF resume file.');
        return;
      }

      setLoadingState(true);

      try {
        const formData = new FormData();
        formData.append('resume', selectedPdfFile || fileInput.files[0]);
        if (selectedPhotoFile) {
          formData.append('photo', selectedPhotoFile);
        }

        const API_BASE = window.API_BASE_URL || '';

        // Upload resume file & extract text
        const uploadRes = await fetch(`${API_BASE}/api/resume/upload`, {
          method: 'POST',
          body: formData
        });

        const uploadData = await parseJsonResponse(uploadRes);
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Unable to read this resume. Please upload a valid text-based PDF.');
        }

        const { resumeText, profilePhotoPath } = uploadData.data;

        // Perform AI Resume Analysis
        const analyzeRes = await fetch(`${API_BASE}/api/resume/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText })
        });

        const parsedResume = await parseJsonResponse(analyzeRes);
        if (!analyzeRes.ok) {
          throw new Error('Failed to analyze resume with AI.');
        }

        // Merge manually typed form overrides
        const manualFullName = document.getElementById('fullName').value.trim();
        const manualTitle = document.getElementById('professionalTitle').value.trim();
        const manualEmail = document.getElementById('email').value.trim();
        const manualPhone = document.getElementById('phone').value.trim();
        const manualLocation = document.getElementById('location').value.trim();
        const manualBio = document.getElementById('shortBio').value.trim();

        if (manualFullName) parsedResume.personalInfo.fullName = manualFullName;
        if (manualTitle) parsedResume.personalInfo.professionalTitle = manualTitle;
        if (manualEmail) parsedResume.personalInfo.email = manualEmail;
        if (manualPhone) parsedResume.personalInfo.phone = manualPhone;
        if (manualLocation) parsedResume.personalInfo.location = manualLocation;
        if (manualBio) parsedResume.personalInfo.shortBio = manualBio;

        // Social links override
        parsedResume.socialLinks = {
          linkedin: document.getElementById('linkedin').value.trim() || parsedResume.socialLinks?.linkedin || null,
          github: document.getElementById('github').value.trim() || parsedResume.socialLinks?.github || null,
          website: document.getElementById('website').value.trim() || parsedResume.socialLinks?.website || null,
          twitter: document.getElementById('twitter').value.trim() || parsedResume.socialLinks?.twitter || null
        };

        if (profilePhotoPath) {
          parsedResume.profilePhoto = profilePhotoPath;
        }

        // Save session state to sessionStorage and localStorage
        sessionStorage.setItem('currentResumeData', JSON.stringify(parsedResume));
        localStorage.setItem('currentResumeData', JSON.stringify(parsedResume));

        // Redirect to dashboard page
        window.location.href = '/dashboard';
      } catch (err) {
        showError(err.message || 'Something went wrong while analyzing your resume. Please try again.');
        setLoadingState(false);
      }
    });
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').classList.add('hidden');
      submitBtn.querySelector('.btn-spinner').classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').classList.remove('hidden');
      submitBtn.querySelector('.btn-spinner').classList.add('hidden');
    }
  }

  function showError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.classList.remove('hidden');
    }
  }

  function hideError() {
    if (formError) {
      formError.textContent = '';
      formError.classList.add('hidden');
    }
  }
}

function checkExistingSession() {
  const data = sessionStorage.getItem('currentResumeData');
  const link = document.getElementById('nav-dashboard-link');
  if (data && link) {
    link.style.display = 'inline-flex';
  }
}

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error(`Server returned HTML (Status ${res.status}). If hosted on a static provider like Tiiny Host, deploy the Node.js backend to Render.com or Railway.`);
    }
    throw new Error(`Server returned non-JSON response (${res.status}).`);
  }
  return await res.json();
}
