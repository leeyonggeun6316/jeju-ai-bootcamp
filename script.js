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

// ==================== 4. TRACK SELF-DIAGNOSIS LOGIC ====================
const trackRecommendations = {
  1: {
    title: "Stage 01 · 초급 트랙 추천",
    desc: "코딩 걱정 없이 100% 웹 브라우저(Zero-Setup)에서 구글 워크스페이스 AI 봇을 제작하고, 출석만 해도 60만 원 전액 장학금과 메가존클라우드 공식 추천서를 획득하세요."
  },
  2: {
    title: "Stage 02 · 중급 트랙 추천",
    desc: "AI 환각을 차단하는 5대 실무 메타인지를 체득하고, 이력서에 바로 기재 가능한 상용 배포 URL 웹프로덕트 완성 + 90만 원 장학금과 성산 합숙 우선 선발권을 받으세요."
  },
  3: {
    title: "Stage 03 · 고급 트랙 추천",
    desc: "성산 플레이스 캠프 호텔 2주 1인 1실 전액 무료 합숙! GCP 엔터프라이즈 멀티에이전트 구축 및 48시간 해커톤 총 500만 원 상금에 도전하세요."
  },
  4: {
    title: "Full Track · 올인원 완주 추천",
    desc: "기초부터 엔터프라이즈 호텔 합숙까지 2개월 만에 완성하는 압도적 커리어 로드맵! 출석 장학금 최대 270만 원 전액 지급과 27개 기업 채용 매칭 기회를 잡으세요."
  }
};

function selectAnswer(optionNum) {
  const resultBox = document.getElementById("quiz-result");
  const titleBox = document.getElementById("quiz-result-title");
  const descBox = document.getElementById("quiz-result-desc");
  const optionsBox = document.getElementById("quiz-options");

  if (trackRecommendations[optionNum]) {
    titleBox.textContent = trackRecommendations[optionNum].title;
    descBox.textContent = trackRecommendations[optionNum].desc;
    
    optionsBox.classList.add("hidden");
    resultBox.classList.remove("hidden");
  }
}

function resetQuiz() {
  const resultBox = document.getElementById("quiz-result");
  const optionsBox = document.getElementById("quiz-options");

  resultBox.classList.add("hidden");
  optionsBox.classList.remove("hidden");
}

// ==================== 5. MINIMALIST FAQ ACCORDION TOGGLE ====================
function toggleFaq(button) {
  const answer = button.parentElement.querySelector(".faq-answer");
  const icon = button.querySelector("i");
  const isHidden = answer.classList.contains("hidden");

  document.querySelectorAll(".faq-answer").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll("#faq i").forEach(el => {
    el.classList.remove("fa-minus");
    el.classList.add("fa-plus");
  });

  if (isHidden) {
    answer.classList.remove("hidden");
    icon.classList.remove("fa-plus");
    icon.classList.add("fa-minus");
  } else {
    answer.classList.add("hidden");
    icon.classList.remove("fa-minus");
    icon.classList.add("fa-plus");
  }
}

// Initialize All Systems
document.addEventListener("DOMContentLoaded", () => {
  initAntigravityParticles();
  initCountdown();
  initSlider();
});
