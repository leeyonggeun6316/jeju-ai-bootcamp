// Google Antigravity Style Interaction Script

// ==================== 1. ANTIGRAVITY GRID-ALIGNED PARTICLES ENGINE ====================
function initAntigravityParticles() {
  const canvas = document.getElementById("antigravity-particles");
  const heroSection = document.getElementById("hero");
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = heroSection.offsetWidth);
  let height = (canvas.height = heroSection.offsetHeight);

  // Consistent unified color (Google Tech Blue)
  const particleColor = "#1A73E8";

  let particles = [];

  const mouse = {
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    active: false,
    radius: 160
  };

  class GridParticle {
    constructor(originX, originY, color, type) {
      this.originX = originX;
      this.originY = originY;
      this.x = originX;
      this.y = originY;
      this.vx = 0;
      this.vy = 0;
      this.size = 2.2; // Perfectly uniform micro dot
      this.type = type; // 'circle' | 'rect'
      this.width = 3.2;
      this.height = 1.8;
      this.color = color;
      this.alpha = 0.55; // Subtle, elegant contrast
      this.rotation = Math.random() * Math.PI;
      this.vRot = 0;
      this.springK = 0.045; // Spring return stiffness
      this.friction = 0.88; // Damping
    }

    update() {
      // 1. Mouse Interaction (Attraction + Flow)
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 1) {
          const force = (1 - dist / mouse.radius);
          
          // Gentle follow towards cursor
          const pull = force * 0.14;
          this.vx += (dx / dist) * pull * 12;
          this.vy += (dy / dist) * pull * 12;

          // Drag along mouse velocity (wind trail)
          this.vx += mouse.vx * force * 0.06;
          this.vy += mouse.vy * force * 0.06;

          // Soft center buffer so it swirls around cursor nicely
          if (dist < 35) {
            const push = (35 - dist) * 0.12;
            this.vx -= (dx / dist) * push;
            this.vy -= (dy / dist) * push;
          }

          this.vRot += (Math.random() - 0.5) * 0.08 * force;
        }
      }

      // 2. Spring force returning to original Grid Home (Order & Structure)
      const homeDx = this.originX - this.x;
      const homeDy = this.originY - this.y;
      this.vx += homeDx * this.springK;
      this.vy += homeDy * this.springK;

      // 3. Friction Damping
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vRot *= 0.92;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.vRot;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;

      if (this.type === "rect") {
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Create clean, ordered grid matrix
  function buildParticleGrid() {
    particles = [];
    const stepX = width < 768 ? 48 : 56; // Clean spacing
    const stepY = width < 768 ? 48 : 52;
    
    // Central text exclusion zone so dots don't clutter the typography
    const centerX = width / 2;
    const centerY = height * 0.42;
    const textZoneWidth = width < 768 ? width * 0.8 : 620;
    const textZoneHeight = width < 768 ? 220 : 250;

    let colorIdx = 0;

    for (let x = 30; x < width - 20; x += stepX) {
      for (let y = 30; y < height - 20; y += stepY) {
        // Subtle organic grid offset (+-4px) for elegant natural tech look
        const jitterX = (Math.sin(x * 12.3 + y * 7.1) * 6);
        const jitterY = (Math.cos(x * 8.7 + y * 11.2) * 6);
        const originX = x + jitterX;
        const originY = y + jitterY;

        // Skip particles directly behind the dense headline text for legibility
        const inTextZone = (
          Math.abs(originX - centerX) < textZoneWidth / 2 &&
          Math.abs(originY - centerY) < textZoneHeight / 2
        );

        // Lower density near center, high crisp alignment around margins
        if (inTextZone && Math.random() > 0.15) {
          continue;
        }

        const type = Math.random() > 0.3 ? "circle" : "rect";
        particles.push(new GridParticle(originX, originY, particleColor, type));
      }
    }
  }

  buildParticleGrid();

  // Track Mouse inside Hero section
  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = currentX;
    mouse.y = currentY;
    mouse.vx = mouse.x - mouse.prevX;
    mouse.vy = mouse.y - mouse.prevY;
    mouse.active = true;
  });

  heroSection.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch support for Mobile
  heroSection.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }, { passive: true });

  heroSection.addEventListener("touchend", () => {
    mouse.active = false;
  });

  // Burst on click
  heroSection.addEventListener("click", (e) => {
    const rect = heroSection.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    particles.forEach(p => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220 && dist > 1) {
        const force = (1 - dist / 220) * 14;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    });
  });

  // Handle Resize
  window.addEventListener("resize", () => {
    width = canvas.width = heroSection.offsetWidth;
    height = canvas.height = heroSection.offsetHeight;
    buildParticleGrid();
  });

  // Animation Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    mouse.vx *= 0.75;
    mouse.vy *= 0.75;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(render);
  }

  render();
}

// ==================== 2. D-DAY COUNTDOWN TIMER ====================
function initCountdown() {
  const deadline = new Date("2026-10-23T23:59:59+09:00").getTime();
  const timerElement = document.getElementById("dday-timer");

  if (!timerElement) return;

  function update() {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance <= 0) {
      timerElement.textContent = "모집 마감되었습니다";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    timerElement.textContent = `D-${days}일 ${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분`;
  }

  update();
  setInterval(update, 1000);
}

// ==================== 3. REALITY CHECK AUTO-SLIDER (CAROUSEL) ====================
let currentSlide = 0;
const totalSlides = 4;
let sliderInterval = null;

function updateSliderUI() {
  const track = document.getElementById("slider-track");
  const dots = document.querySelectorAll(".slider-dot");

  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  dots.forEach((dot, idx) => {
    if (idx === currentSlide) {
      dot.classList.remove("bg-brand-border");
      dot.classList.add("bg-brand-black");
    } else {
      dot.classList.remove("bg-brand-black");
      dot.classList.add("bg-brand-border");
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSliderUI();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSliderUI();
}

function goToSlide(index) {
  currentSlide = index;
  updateSliderUI();
}

function startSliderAutoPlay() {
  stopSliderAutoPlay();
  sliderInterval = setInterval(nextSlide, 4500);
}

function stopSliderAutoPlay() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

function initSlider() {
  const container = document.getElementById("slider-track");
  if (!container) return;

  startSliderAutoPlay();

  const parentContainer = container.parentElement;
  if (parentContainer) {
    parentContainer.addEventListener("mouseenter", stopSliderAutoPlay);
    parentContainer.addEventListener("mouseleave", startSliderAutoPlay);
  }
}

// ==================== 4. TRACK SELF-DIAGNOSIS LOGIC & CMS ====================
const defaultQuizData = {
  1: {
    q: "🌱 코딩을 전혀 배운 적 없고, 터미널 설치가 두렵다 (실무 비서 AI부터)",
    title: "Stage 01 · 초급 트랙 추천",
    desc: "코딩 걱정 없이 100% 웹 브라우저(Zero-Setup)에서 구글 워크스페이스 AI 봇을 제작하고, 출석만 해도 60만 원 전액 장학금과 메가존클라우드 공식 추천서를 획득하세요."
  },
  2: {
    q: "⚡ 챗GPT는 써봤다. 이력서에 들어갈 상용 AI 웹 서비스를 만들고 싶다",
    title: "Stage 02 · 중급 트랙 추천",
    desc: "AI 환각을 차단하는 5대 실무 메타인지를 체득하고, 이력서에 바로 기재 가능한 상용 배포 URL 웹프로덕트 완성 + 90만 원 장학금과 성산 합숙 우선 선발권을 받으세요."
  },
  3: {
    q: "🚀 2주 무료 호텔 합숙과 총 500만원 해커톤 상금 피칭을 노린다",
    title: "Stage 03 · 고급 트랙 추천",
    desc: "성산 플레이스 캠프 호텔 2주 1인 1실 전액 무료 합숙! GCP 엔터프라이즈 멀티에이전트 구축 및 48시간 해커톤 총 500만 원 상금에 도전하세요."
  },
  4: {
    q: "🔥 기초부터 차근차근 배워서 출석 장학금 최대 270만원을 전액 다 챙기고 싶다",
    title: "Full Track · 올인원 완주 추천",
    desc: "기초부터 엔터프라이즈 호텔 합숙까지 2개월 만에 완성하는 압도적 커리어 로드맵! 출석 장학금 최대 270만 원 전액 지급과 27개 기업 채용 매칭 기회를 잡으세요."
  }
};

let currentSelectedQuizOption = 1;
let currentQuizWorkingData = null;

function getQuizData() {
  try {
    const saved = localStorage.getItem("jeju_quiz_data");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse saved quiz data", e);
  }
  return JSON.parse(JSON.stringify(defaultQuizData));
}

function renderQuizFromData() {
  const data = getQuizData();
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`quiz-q-${i}-text`);
    if (el && data[i]) {
      el.textContent = data[i].q;
    }
  }

  // If result is currently visible, update result text as well
  const resultBox = document.getElementById("quiz-result");
  if (resultBox && !resultBox.classList.contains("hidden")) {
    const titleBox = document.getElementById("quiz-result-title");
    const descBox = document.getElementById("quiz-result-desc");
    if (data[currentSelectedQuizOption]) {
      if (titleBox) titleBox.textContent = data[currentSelectedQuizOption].title;
      if (descBox) descBox.textContent = data[currentSelectedQuizOption].desc;
    }
  }
}

function selectAnswer(optionNum) {
  currentSelectedQuizOption = optionNum;
  const resultBox = document.getElementById("quiz-result");
  const titleBox = document.getElementById("quiz-result-title");
  const descBox = document.getElementById("quiz-result-desc");
  const optionsBox = document.getElementById("quiz-options");
  const data = getQuizData();

  if (data[optionNum]) {
    titleBox.textContent = data[optionNum].title;
    descBox.textContent = data[optionNum].desc;
    
    optionsBox.classList.add("hidden");
    resultBox.classList.remove("hidden");

    if (isAdminActive) {
      if (titleBox) {
        titleBox.setAttribute("contenteditable", "true");
        titleBox.classList.add("admin-editing-field");
      }
      if (descBox) {
        descBox.setAttribute("contenteditable", "true");
        descBox.classList.add("admin-editing-field");
      }
    }
  }
}

function resetQuiz() {
  const resultBox = document.getElementById("quiz-result");
  const optionsBox = document.getElementById("quiz-options");

  resultBox.classList.add("hidden");
  optionsBox.classList.remove("hidden");
}

function openQuizModal(initialTab = 1) {
  currentQuizWorkingData = getQuizData();
  const modal = document.getElementById("admin-quiz-modal");
  if (modal) {
    modal.style.display = "flex";
    switchQuizTab(initialTab);
  }
}

function openQuizModalForCurrent() {
  openQuizModal(currentSelectedQuizOption || 1);
}

function closeQuizModal() {
  const modal = document.getElementById("admin-quiz-modal");
  if (modal) modal.style.display = "none";
}

function switchQuizTab(newTab) {
  const currentTabInput = document.getElementById("admin-quiz-current-tab");
  const prevTab = parseInt(currentTabInput.value, 10);

  // Save current tab inputs to working data
  if (currentQuizWorkingData && currentQuizWorkingData[prevTab]) {
    const qInput = document.getElementById("admin-quiz-q-input");
    const titleInput = document.getElementById("admin-quiz-title-input");
    const descInput = document.getElementById("admin-quiz-desc-input");
    if (qInput && titleInput && descInput) {
      currentQuizWorkingData[prevTab].q = qInput.value.trim();
      currentQuizWorkingData[prevTab].title = titleInput.value.trim();
      currentQuizWorkingData[prevTab].desc = descInput.value.trim();
    }
  }

  // Update tab buttons style
  document.querySelectorAll(".quiz-tab-btn").forEach((btn, idx) => {
    const tabNum = idx + 1;
    if (tabNum === newTab) {
      btn.className = "quiz-tab-btn flex-1 py-2 text-xs font-semibold text-center rounded-t-lg transition border-b-2 border-purple-600 text-purple-600 bg-purple-50/50";
    } else {
      btn.className = "quiz-tab-btn flex-1 py-2 text-xs font-semibold text-center rounded-t-lg transition text-neutral-500 hover:text-neutral-800";
    }
  });

  currentTabInput.value = newTab;
  const tabLabel = document.getElementById("quiz-tab-label");
  if (tabLabel) tabLabel.textContent = `[문항 ${newTab}]`;

  // Populate inputs with new tab data
  if (currentQuizWorkingData && currentQuizWorkingData[newTab]) {
    document.getElementById("admin-quiz-q-input").value = currentQuizWorkingData[newTab].q;
    document.getElementById("admin-quiz-title-input").value = currentQuizWorkingData[newTab].title;
    document.getElementById("admin-quiz-desc-input").value = currentQuizWorkingData[newTab].desc;
  }
}

function handleSaveQuizData(e) {
  e.preventDefault();
  const currentTab = parseInt(document.getElementById("admin-quiz-current-tab").value, 10);
  if (currentQuizWorkingData && currentQuizWorkingData[currentTab]) {
    currentQuizWorkingData[currentTab].q = document.getElementById("admin-quiz-q-input").value.trim();
    currentQuizWorkingData[currentTab].title = document.getElementById("admin-quiz-title-input").value.trim();
    currentQuizWorkingData[currentTab].desc = document.getElementById("admin-quiz-desc-input").value.trim();
  }

  localStorage.setItem("jeju_quiz_data", JSON.stringify(currentQuizWorkingData));
  renderQuizFromData();
  closeQuizModal();
  showToast("🧩 자가진단 퀴즈 문항 및 추천 결과가 성공적으로 저장되었습니다!");
}

// ==================== 5. MINIMALIST FAQ ACCORDION TOGGLE ====================
function toggleFaq(button) {
  const container = button.closest(".faq-item") || button.parentElement;
  const answer = container.querySelector(".faq-answer");
  const icon = button.querySelector("i");
  if (!answer) return;
  const isHidden = answer.classList.contains("hidden");

  document.querySelectorAll(".faq-answer").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll("#faq-list-container i.fa-minus").forEach(el => {
    el.classList.remove("fa-minus");
    el.classList.add("fa-plus");
  });

  if (isHidden) {
    answer.classList.remove("hidden");
    if (icon) {
      icon.classList.remove("fa-plus");
      icon.classList.add("fa-minus");
    }
  } else {
    answer.classList.add("hidden");
    if (icon) {
      icon.classList.remove("fa-minus");
      icon.classList.add("fa-plus");
    }
  }
}

// ==================== 6. SECRET ADMIN MODE ENGINE ====================
let isAdminActive = false;

// Default FAQs
const defaultFaqs = [
  {
    id: 1,
    q: "출석만 해도 정말 최대 270만 원을 받을 수 있나요?",
    a: "네, 맞습니다! 각 트랙별 출석률 80% 이상 충족 시 초급 60만 원, 중급 90만 원, 고급 120만 원이 본인 명의 계좌로 입금되며, 3개 과정을 연속 수강하여 완주하시면 최대 270만 원 전액을 수혜 받으실 수 있습니다."
  },
  {
    id: 2,
    q: "트랙 중복 신청은 어떻게 가능한가요?",
    a: "[초급+중급], [중급+고급], [초급+중급+고급] 형태의 연속 과정은 모두 중복 신청이 가능합니다. 단, 교육 난이도 연계상 [초급 ➔ 고급] 직행 신청은 제한됩니다."
  },
  {
    id: 3,
    q: "성산 플레이스 캠프 호텔 합숙은 개인이 부담하는 비용이 있나요?",
    a: "개인 부담금은 0원입니다. 고급 트랙 선발생 전원 2주간 호텔 1인 1실 및 식사가 100% 국비 지원으로 무료 제공됩니다."
  },
  {
    id: 4,
    q: "코딩이나 컴퓨터 지식이 전혀 없는 비전공자도 가능한가요?",
    a: "네! 초급 트랙(메가존클라우드)은 복잡한 개발 프로그램 설치 없이 웹 브라우저 GUI 환경에서 실습합니다. 비전공자 맞춤 1:1 세팅과 코칭으로 부담 없이 시작하실 수 있습니다."
  }
];

function getStoredPassword() {
  return localStorage.getItem("jeju_admin_pw") || "admin1234";
}

function openAdminModal() {
  const modal = document.getElementById("admin-login-modal");
  const input = document.getElementById("admin-password-input");
  const error = document.getElementById("admin-login-error");
  if (modal) {
    modal.style.display = "flex";
    if (error) error.style.display = "none";
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 100);
    }
  }
}

function closeAdminModal() {
  const modal = document.getElementById("admin-login-modal");
  if (modal) modal.style.display = "none";
}

function handleAdminLogin(e) {
  e.preventDefault();
  const input = document.getElementById("admin-password-input");
  const error = document.getElementById("admin-login-error");
  const currentPw = getStoredPassword();

  if (input.value === currentPw) {
    closeAdminModal();
    enterAdminMode();
  } else {
    if (error) error.style.display = "block";
    input.select();
  }
}

function enterAdminMode() {
  isAdminActive = true;
  const toolbar = document.getElementById("admin-toolbar");
  if (toolbar) toolbar.style.display = "flex";

  const addFaqBtn = document.getElementById("admin-add-faq-btn");
  if (addFaqBtn) addFaqBtn.classList.remove("hidden");

  // Show FAQ admin controls
  document.querySelectorAll(".admin-faq-controls").forEach(el => el.classList.remove("hidden"));

  // Make all data-editable fields editable
  document.querySelectorAll("[data-editable]").forEach(el => {
    el.setAttribute("contenteditable", "true");
    el.classList.add("admin-editing-field");
  });

  showToast("🔧 관리자 수정 모드가 활성화되었습니다! 화면의 글자를 클릭해 수정하세요.");
}

function exitAdminMode() {
  isAdminActive = false;
  const toolbar = document.getElementById("admin-toolbar");
  if (toolbar) toolbar.style.display = "none";

  const addFaqBtn = document.getElementById("admin-add-faq-btn");
  if (addFaqBtn) addFaqBtn.classList.add("hidden");

  document.querySelectorAll(".admin-faq-controls").forEach(el => el.classList.add("hidden"));

  document.querySelectorAll("[data-editable]").forEach(el => {
    el.removeAttribute("contenteditable");
    el.classList.remove("admin-editing-field");
  });

  showToast("관리자 모드가 종료되었습니다.");
}

// Password Change
function openChangePwModal() {
  const modal = document.getElementById("admin-pw-modal");
  const p1 = document.getElementById("admin-new-pw");
  const p2 = document.getElementById("admin-new-pw-confirm");
  const error = document.getElementById("admin-pw-error");
  if (modal) {
    modal.style.display = "flex";
    if (p1) p1.value = "";
    if (p2) p2.value = "";
    if (error) error.style.display = "none";
    setTimeout(() => p1 && p1.focus(), 100);
  }
}

function closeChangePwModal() {
  const modal = document.getElementById("admin-pw-modal");
  if (modal) modal.style.display = "none";
}

function handleAdminChangePassword(e) {
  e.preventDefault();
  const p1 = document.getElementById("admin-new-pw").value;
  const p2 = document.getElementById("admin-new-pw-confirm").value;
  const error = document.getElementById("admin-pw-error");

  if (p1 !== p2) {
    if (error) error.style.display = "block";
    return;
  }

  localStorage.setItem("jeju_admin_pw", p1);
  closeChangePwModal();
  showToast("🔑 관리자 비밀번호가 성공적으로 변경되었습니다!");
}

// Text Edits Save & Load
function saveAllEdits() {
  const edits = {};
  document.querySelectorAll("[data-editable]").forEach(el => {
    const key = el.getAttribute("data-editable");
    edits[key] = el.innerHTML;
  });

  localStorage.setItem("jeju_bootcamp_edits", JSON.stringify(edits));

  // Also sync quiz questions & currently active result to jeju_quiz_data
  try {
    const quizData = getQuizData();
    for (let i = 1; i <= 4; i++) {
      const qEl = document.getElementById(`quiz-q-${i}-text`);
      if (qEl && quizData[i]) {
        quizData[i].q = qEl.textContent.trim();
      }
    }
    const resTitleEl = document.getElementById("quiz-result-title");
    const resDescEl = document.getElementById("quiz-result-desc");
    if (resTitleEl && resDescEl && quizData[currentSelectedQuizOption]) {
      const tText = resTitleEl.textContent.trim();
      const dText = resDescEl.textContent.trim();
      if (tText) quizData[currentSelectedQuizOption].title = tText;
      if (dText) quizData[currentSelectedQuizOption].desc = dText;
    }
    localStorage.setItem("jeju_quiz_data", JSON.stringify(quizData));
  } catch (e) {
    console.error("Failed to sync quiz data", e);
  }

  showToast("💾 모든 수정사항이 브라우저에 안전하게 저장되었습니다!");
}

function loadSavedEdits() {
  try {
    const saved = localStorage.getItem("jeju_bootcamp_edits");
    if (!saved) return;
    const edits = JSON.parse(saved);
    Object.keys(edits).forEach(key => {
      const el = document.querySelector(`[data-editable="${key}"]`);
      if (el) {
        el.innerHTML = edits[key];
      }
    });
  } catch (err) {
    console.error("Error loading saved edits:", err);
  }
}

// FAQ Management
function getStoredFaqs() {
  try {
    const raw = localStorage.getItem("jeju_bootcamp_faqs");
    return raw ? JSON.parse(raw) : defaultFaqs;
  } catch (e) {
    return defaultFaqs;
  }
}

function saveFaqs(faqs) {
  localStorage.setItem("jeju_bootcamp_faqs", JSON.stringify(faqs));
}

function renderFaqs() {
  const container = document.getElementById("faq-list-container");
  if (!container) return;

  const faqs = getStoredFaqs();
  container.innerHTML = faqs.map(faq => `
    <div class="py-6 faq-item" data-faq-id="${faq.id}">
      <div class="flex items-start justify-between gap-4">
        <button onclick="toggleFaq(this)" class="w-full text-left font-bold text-brand-black text-base flex justify-between items-center group">
          <span class="faq-question-text group-hover:text-brand-blue transition">${faq.q}</span>
          <i class="fa-solid fa-plus text-xs text-brand-muted transition-transform"></i>
        </button>
        <div class="admin-faq-controls ${isAdminActive ? "" : "hidden"} flex-shrink-0 flex items-center gap-2">
          <button onclick="editFaqItem(${faq.id})" class="p-1.5 text-xs text-brand-muted hover:text-brand-blue" title="수정"><i class="fa-solid fa-pen"></i></button>
          <button onclick="deleteFaqItem(${faq.id})" class="p-1.5 text-xs text-brand-muted hover:text-rose-500" title="삭제"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <div class="faq-answer hidden text-xs sm:text-sm text-brand-muted leading-relaxed mt-4">
        <span class="faq-answer-text">${faq.a}</span>
      </div>
    </div>
  `).join("");
}

function openAddFaqModal() {
  const modal = document.getElementById("admin-faq-modal");
  document.getElementById("admin-faq-modal-title").textContent = "새 FAQ 질문 추가";
  document.getElementById("admin-faq-target-id").value = "";
  document.getElementById("admin-faq-q-input").value = "";
  document.getElementById("admin-faq-a-input").value = "";
  if (modal) modal.style.display = "flex";
}

function editFaqItem(id) {
  const faqs = getStoredFaqs();
  const item = faqs.find(f => f.id === id);
  if (!item) return;

  const modal = document.getElementById("admin-faq-modal");
  document.getElementById("admin-faq-modal-title").textContent = "FAQ 질문 수정";
  document.getElementById("admin-faq-target-id").value = item.id;
  document.getElementById("admin-faq-q-input").value = item.q;
  document.getElementById("admin-faq-a-input").value = item.a;
  if (modal) modal.style.display = "flex";
}

function closeFaqModal() {
  const modal = document.getElementById("admin-faq-modal");
  if (modal) modal.style.display = "none";
}

function handleSaveFaq(e) {
  e.preventDefault();
  const idVal = document.getElementById("admin-faq-target-id").value;
  const q = document.getElementById("admin-faq-q-input").value.trim();
  const a = document.getElementById("admin-faq-a-input").value.trim();

  let faqs = getStoredFaqs();
  if (idVal) {
    const id = parseInt(idVal, 10);
    faqs = faqs.map(f => f.id === id ? { ...f, q, a } : f);
    showToast("FAQ 질문이 수정되었습니다.");
  } else {
    const newId = Date.now();
    faqs.push({ id: newId, q, a });
    showToast("새 FAQ 질문이 추가되었습니다.");
  }

  saveFaqs(faqs);
  renderFaqs();
  closeFaqModal();
}

function deleteFaqItem(id) {
  if (!confirm("정말 이 질문을 삭제하시겠습니까?")) return;
  let faqs = getStoredFaqs();
  faqs = faqs.filter(f => f.id !== id);
  saveFaqs(faqs);
  renderFaqs();
  showToast("FAQ 질문이 삭제되었습니다.");
}

// Export Updated HTML for Deployment
function exportUpdatedHtml() {
  saveAllEdits();
  exitAdminMode();

  const fullHtml = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "index.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  enterAdminMode();
  showToast("📥 최신 수정본 index.html 다운로드가 완료되었습니다!");
}

// Lightweight Toast Notification
function showToast(msg) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "fixed bottom-6 right-6 z-[200] bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>${msg}</span>`;
  toast.classList.remove("translate-y-12", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-12", "opacity-0");
  }, 3200);
}

// ==================== 7. GOOGLE FORM APPLY LINK MANAGEMENT ====================
function getApplyUrl() {
  return localStorage.getItem("jeju_apply_url") || "https://forms.google.com";
}

function getHeaderBtnText() {
  return localStorage.getItem("jeju_header_btn_text") || "수강신청하기";
}

function getHeroBtnText() {
  return localStorage.getItem("jeju_apply_btn_text") || "구글 폼으로 지원서 작성하기";
}

function openLinkModal(target = "general") {
  const modal = document.getElementById("admin-link-modal");
  const title = document.getElementById("admin-link-modal-title");
  const urlInput = document.getElementById("admin-form-url-input");
  const headerInput = document.getElementById("admin-header-text-input");
  const heroInput = document.getElementById("admin-hero-text-input");

  if (modal) {
    modal.style.display = "flex";
    if (urlInput) urlInput.value = getApplyUrl();
    if (headerInput) headerInput.value = getHeaderBtnText();
    if (heroInput) heroInput.value = getHeroBtnText();

    if (target === "header") {
      if (title) title.textContent = "상단 [수강신청하기] 버튼 및 신청 링크 수정";
      setTimeout(() => headerInput && headerInput.focus(), 100);
    } else if (target === "hero") {
      if (title) title.textContent = "메인 [구글 폼 지원서] 버튼 및 신청 링크 수정";
      setTimeout(() => heroInput && heroInput.focus(), 100);
    } else {
      if (title) title.textContent = "신청 링크 및 버튼 문구 변경";
      setTimeout(() => urlInput && urlInput.focus(), 100);
    }
  }
}

function closeLinkModal() {
  const modal = document.getElementById("admin-link-modal");
  if (modal) modal.style.display = "none";
}

function handleSaveApplyLink(e) {
  e.preventDefault();
  const urlInput = document.getElementById("admin-form-url-input");
  const headerInput = document.getElementById("admin-header-text-input");
  const heroInput = document.getElementById("admin-hero-text-input");

  const newUrl = urlInput.value.trim();
  const newHeader = headerInput.value.trim();
  const newHero = heroInput.value.trim();

  if (newUrl) localStorage.setItem("jeju_apply_url", newUrl);
  if (newHeader) localStorage.setItem("jeju_header_btn_text", newHeader);
  if (newHero) localStorage.setItem("jeju_apply_btn_text", newHero);

  applySavedLinkSettings();
  closeLinkModal();
  showToast("🔗 구글 폼 링크와 버튼 글자(헤더/메인)가 모두 저장되었습니다!");
}

function applySavedLinkSettings() {
  const url = getApplyUrl();
  const headerText = getHeaderBtnText();
  const heroText = getHeroBtnText();

  // Update all apply buttons href
  document.querySelectorAll(".apply-btn-link").forEach(btn => {
    btn.setAttribute("href", url);
  });

  // Update header button text
  document.querySelectorAll(".apply-btn-text").forEach(el => {
    el.textContent = headerText;
  });

  // Update hero button text
  const heroBtnText = document.querySelector(".apply-hero-btn-text");
  if (heroBtnText) {
    heroBtnText.textContent = heroText;
  }
}

function handleApplyClick(e, target = "hero") {
  if (isAdminActive) {
    e.preventDefault();
    openLinkModal(target);
  } else {
    // Normal user: proceed to the target URL
    const url = getApplyUrl();
    e.currentTarget.setAttribute("href", url);
  }
}

// Keyboard Shortcuts: Alt + A, Ctrl + Shift + E, Ctrl + Shift + A
document.addEventListener("keydown", (e) => {
  const isAltA = e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA");
  const isCtrlShiftE = e.ctrlKey && e.shiftKey && (e.key === "e" || e.key === "E" || e.code === "KeyE");
  const isCtrlShiftA = e.ctrlKey && e.shiftKey && (e.key === "a" || e.key === "A" || e.code === "KeyA");

  if (isAltA || isCtrlShiftE || isCtrlShiftA) {
    e.preventDefault();
    if (isAdminActive) {
      exitAdminMode();
    } else {
      openAdminModal();
    }
  }
});

// Expose functions globally to window
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.handleAdminLogin = handleAdminLogin;
window.enterAdminMode = enterAdminMode;
window.exitAdminMode = exitAdminMode;
window.openChangePwModal = openChangePwModal;
window.closeChangePwModal = closeChangePwModal;
window.handleAdminChangePassword = handleAdminChangePassword;
window.saveAllEdits = saveAllEdits;
window.exportUpdatedHtml = exportUpdatedHtml;
window.openAddFaqModal = openAddFaqModal;
window.editFaqItem = editFaqItem;
window.deleteFaqItem = deleteFaqItem;
window.closeFaqModal = closeFaqModal;
window.handleSaveFaq = handleSaveFaq;
window.openLinkModal = openLinkModal;
window.closeLinkModal = closeLinkModal;
window.handleSaveApplyLink = handleSaveApplyLink;
window.handleApplyClick = handleApplyClick;
window.openQuizModal = openQuizModal;
window.openQuizModalForCurrent = openQuizModalForCurrent;
window.closeQuizModal = closeQuizModal;
window.switchQuizTab = switchQuizTab;
window.handleSaveQuizData = handleSaveQuizData;
window.renderQuizFromData = renderQuizFromData;

// Initialize All Systems
document.addEventListener("DOMContentLoaded", () => {
  initAntigravityParticles();
  initCountdown();
  initSlider();
  renderFaqs();
  renderQuizFromData();
  loadSavedEdits();
  applySavedLinkSettings();
});


