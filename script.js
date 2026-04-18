const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const revealItems = document.querySelectorAll(".reveal");
const skillCards = document.querySelectorAll(".skill-card");
const sections = document.querySelectorAll("main section[id]");
const typedText = document.getElementById("typed-text");
const currentYear = document.getElementById("current-year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const introGame = document.getElementById("intro-game");
const introArena = document.getElementById("intro-arena");
const introSparkZone = document.getElementById("intro-spark-zone");
const introSpark = document.getElementById("intro-spark");
const introName = document.getElementById("intro-name");
const introProgressDots = document.getElementById("intro-progress-dots");
const introScoreStatus = document.getElementById("intro-score-status");
const introFeedback = document.getElementById("intro-feedback");
const introSkip = document.getElementById("intro-skip");
const pageShell = document.querySelector(".page-shell");
const mainContent = document.getElementById("main-content");

const typedPhrases = [
  "Junior Mobile App Developer",
  "Flutter Learner and Builder",
  "Networking and Git Enthusiast",
  "Cybersecurity Explorer",
  "Always Learning",
];

const introRevealWord = "Islam";
const introTargetScore = introRevealWord.length;

const introState = {
  score: 0,
  isClosed: false,
  isComplete: false,
  moveTimeoutId: null,
  driftTimeoutId: null,
  closeTimeoutId: null,
  animationFrameId: null,
  currentX: 0,
  currentY: 0,
  targetX: 0,
  targetY: 0,
  sparkScale: 1,
  sparkOpacity: 1,
};

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimeoutId;

function setMenuState(isOpen) {
  if (!header || !navToggle) {
    return;
  }

  header.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

function handleTyping() {
  if (!typedText) {
    return;
  }

  const phrase = typedPhrases[phraseIndex];
  typedText.textContent = isDeleting
    ? phrase.slice(0, charIndex--)
    : phrase.slice(0, charIndex++);

  if (!isDeleting && charIndex > phrase.length) {
    isDeleting = true;
    typingTimeoutId = window.setTimeout(handleTyping, 1800);
    return;
  }

  if (isDeleting && charIndex < 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typedPhrases.length;
    charIndex = 0;
  }

  typingTimeoutId = window.setTimeout(handleTyping, isDeleting ? 60 : 100);
}

function initTyping() {
  if (!typedText) {
    return;
  }

  if (prefersReducedMotion.matches) {
    typedText.textContent = typedPhrases[0];
    return;
  }

  handleTyping();
}

function initRevealAnimations() {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("visible"));
    skillCards.forEach((card) => {
      const bar = card.querySelector(".skill-bar");

      if (bar) {
        bar.style.width = `${bar.dataset.width}%`;
      }
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const bar = entry.target.querySelector(".skill-bar");

        if (bar) {
          bar.style.width = `${bar.dataset.width}%`;
        }

        skillObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  skillCards.forEach((card) => skillObserver.observe(card));
}

function initActiveSectionTracking() {
  if (!sections.length || !navLinks.length) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    {
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0.1,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function initNavigation() {
  if (!header || !navToggle || !navMenu) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = !header.classList.contains("is-open");
    setMenuState(isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("is-open")) {
      return;
    }

    if (!header.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.body.classList.contains("intro-open")) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) {
      setMenuState(false);
    }
  });
}

function initFooterYear() {
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
}

function initMotionPreferenceListener() {
  prefersReducedMotion.addEventListener("change", () => {
    window.clearTimeout(typingTimeoutId);

    if (typedText) {
      typedText.textContent = "";
    }

    initTyping();
  });
}

function getIntroFocusableElements() {
  if (!introGame) {
    return [];
  }

  const focusableSelector =
    'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

  return [...introGame.querySelectorAll(focusableSelector)].filter(
    (element) => !element.hidden && !element.closest("[hidden]")
  );
}

function clearIntroTimers() {
  window.clearTimeout(introState.moveTimeoutId);
  window.clearTimeout(introState.driftTimeoutId);
  window.clearTimeout(introState.closeTimeoutId);
  window.cancelAnimationFrame(introState.animationFrameId);
  introState.moveTimeoutId = null;
  introState.driftTimeoutId = null;
  introState.closeTimeoutId = null;
  introState.animationFrameId = null;
}

function setIntroFeedback(message) {
  if (introFeedback) {
    introFeedback.textContent = message;
  }
}

function updateIntroScore() {
  if (introProgressDots) {
    introProgressDots.textContent = "";

    for (let index = 0; index < introTargetScore; index += 1) {
      const dot = document.createElement("span");
      dot.className = "intro-progress-dot";

      if (index < introState.score) {
        dot.classList.add("is-active");
      }

      introProgressDots.append(dot);
    }
  }

  if (introScoreStatus) {
    introScoreStatus.textContent = `${introState.score} of ${introTargetScore} letters revealed`;
  }
}

function applySparkState() {
  if (!introSpark) {
    return;
  }

  introSpark.style.setProperty("--spark-x", `${introState.currentX}px`);
  introSpark.style.setProperty("--spark-y", `${introState.currentY}px`);
  introSpark.style.setProperty("--spark-scale", String(introState.sparkScale));
  introSpark.style.setProperty("--spark-opacity", String(introState.sparkOpacity));
}

function renderIntroName() {
  if (!introName) {
    return;
  }

  introName.textContent = "";

  [...introRevealWord].forEach((letter, index) => {
    const letterElement = document.createElement("span");
    letterElement.className = "intro-name-letter";
    letterElement.textContent = letter;

    if (index < introState.score) {
      letterElement.classList.add("is-revealed");
    }

    if (introState.isComplete) {
      letterElement.classList.add("is-final");
    }

    introName.append(letterElement);
  });

  introName.classList.toggle("is-complete", introState.isComplete);
}

function getRandomSparkPosition(minDistance = 0) {
  if (!introSpark || !introSparkZone || introState.isClosed || introState.isComplete) {
    return { x: 0, y: 0 };
  }

  const zoneWidth = introSparkZone.clientWidth;
  const zoneHeight = introSparkZone.clientHeight;
  const sparkSize = introSpark.offsetWidth || 82;
  const padding = 18;

  if (!zoneWidth || !zoneHeight) {
    return { x: 0, y: 0 };
  }

  const maxX = Math.max(padding, zoneWidth - sparkSize - padding);
  const maxY = Math.max(padding, zoneHeight - sparkSize - padding);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const nextX = Math.random() * (maxX - padding) + padding;
    const nextY = Math.random() * (maxY - padding) + padding;
    const distance = Math.hypot(nextX - introState.currentX, nextY - introState.currentY);

    if (distance >= minDistance || attempt === 11) {
      return { x: nextX, y: nextY };
    }
  }

  return { x: padding, y: padding };
}

function setSparkTarget(minDistance = 0) {
  const nextPosition = getRandomSparkPosition(minDistance);

  introState.targetX = nextPosition.x;
  introState.targetY = nextPosition.y;
}

function runSparkMotion() {
  if (!introSpark || introState.isClosed || introState.isComplete) {
    return;
  }

  introState.currentX += (introState.targetX - introState.currentX) * 0.085;
  introState.currentY += (introState.targetY - introState.currentY) * 0.085;
  applySparkState();

  introState.animationFrameId = window.requestAnimationFrame(runSparkMotion);
}

function scheduleSparkDrift(delay = 1200) {
  window.clearTimeout(introState.driftTimeoutId);

  introState.driftTimeoutId = window.setTimeout(() => {
    if (introState.isClosed || introState.isComplete) {
      return;
    }

    setSparkTarget(110);
    scheduleSparkDrift(1050 + Math.random() * 700);
  }, delay);
}

function startSparkMotion() {
  window.cancelAnimationFrame(introState.animationFrameId);
  introState.animationFrameId = window.requestAnimationFrame(runSparkMotion);
  scheduleSparkDrift(900 + Math.random() * 600);
}

function positionSpark(initial = false) {
  const nextPosition = getRandomSparkPosition(initial ? 0 : 110);

  introState.currentX = nextPosition.x;
  introState.currentY = nextPosition.y;
  introState.targetX = nextPosition.x;
  introState.targetY = nextPosition.y;
  applySparkState();
}

function closeIntroGame() {
  if (!introGame || introState.isClosed) {
    return;
  }

  introState.isClosed = true;
  clearIntroTimers();
  introGame.classList.add("is-exiting");
  document.body.classList.remove("intro-open");

  if (pageShell) {
    pageShell.inert = false;
    pageShell.removeAttribute("aria-hidden");
  }

  introState.closeTimeoutId = window.setTimeout(() => {
    introGame.classList.add("is-hidden");

    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus({ preventScroll: true });
    }
  }, prefersReducedMotion.matches ? 20 : 360);
}

function finishIntroGame() {
  if (!introArena || !introSparkZone || !introSpark) {
    return;
  }

  introState.isComplete = true;
  introState.sparkScale = 0;
  introState.sparkOpacity = 0;
  applySparkState();
  renderIntroName();
  setIntroFeedback("Islam");
  introArena.classList.add("is-unlocking");
  introSparkZone.classList.add("is-finished");

  introState.moveTimeoutId = window.setTimeout(() => {
    introSpark.hidden = true;
    closeIntroGame();
  }, prefersReducedMotion.matches ? 80 : 900);
}

function catchSpark() {
  if (!introSpark || introState.isClosed || introState.isComplete) {
    return;
  }

  clearIntroTimers();

  introState.score = Math.min(introState.score + 1, introTargetScore);
  updateIntroScore();
  renderIntroName();

  const revealedWord = introRevealWord.slice(0, introState.score);
  setIntroFeedback(revealedWord);

  introState.sparkScale = 0.7;
  introState.sparkOpacity = 0;
  applySparkState();
  introSparkZone?.classList.add("is-hit");

  if (introState.score >= introTargetScore) {
    finishIntroGame();
    return;
  }

  introState.moveTimeoutId = window.setTimeout(() => {
    introSparkZone?.classList.remove("is-hit");
    introState.sparkScale = 1;
    introState.sparkOpacity = 1;
    applySparkState();
    setSparkTarget(140);
    startSparkMotion();
  }, prefersReducedMotion.matches ? 40 : 170);
}

function handleArenaClick(event) {
  if (introState.isClosed || introState.isComplete) {
    return;
  }

  if (event.target === introSpark || introSpark?.contains(event.target)) {
    catchSpark();
    return;
  }

  setIntroFeedback("Catch the glow.");
}

function resetIntroGame() {
  if (!introSpark || !introArena || !introSparkZone) {
    return;
  }

  clearIntroTimers();
  introState.score = 0;
  introState.isClosed = false;
  introState.isComplete = false;

  introGame?.classList.remove("is-exiting", "is-hidden");
  introArena.classList.remove("is-unlocking");
  introSparkZone.classList.remove("is-hit", "is-finished");
  introSpark.hidden = false;
  introState.sparkScale = 1;
  introState.sparkOpacity = 1;

  updateIntroScore();
  renderIntroName();
  setIntroFeedback("Catch the first spark.");

  window.requestAnimationFrame(() => {
    positionSpark(true);
    startSparkMotion();
  });
}

function trapIntroFocus(event) {
  const focusableElements = getIntroFocusableElements();

  if (!focusableElements.length) {
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function handleIntroKeydown(event) {
  if (!introGame || introState.isClosed) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeIntroGame();
    return;
  }

  if (event.key === "Tab") {
    trapIntroFocus(event);
    return;
  }

  if (
    !introState.isComplete &&
    (document.activeElement === introArena || document.activeElement === introSpark) &&
    (event.key === " " || event.key === "Enter")
  ) {
    event.preventDefault();
    catchSpark();
  }
}

function initIntroGame() {
  if (!introGame || !introArena || !introSparkZone || !introSpark || !introSkip) {
    return;
  }

  document.body.classList.add("intro-open");

  if (pageShell) {
    pageShell.inert = true;
    pageShell.setAttribute("aria-hidden", "true");
  }

  introSparkZone.addEventListener("click", handleArenaClick);
  introSkip.addEventListener("click", closeIntroGame);
  introGame.addEventListener("keydown", handleIntroKeydown);
  window.addEventListener("resize", () => {
    if (!introState.isClosed && !introState.isComplete) {
      positionSpark();
    }
  });

  resetIntroGame();
}

initIntroGame();
initNavigation();
initTyping();
initRevealAnimations();
initActiveSectionTracking();
initFooterYear();
initMotionPreferenceListener();
