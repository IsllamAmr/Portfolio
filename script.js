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

const typedPhrases = [
  "Junior Mobile App Developer",
  "Flutter Learner and Builder",
  "Networking and Git Enthusiast",
  "Cybersecurity Explorer",
  "Always Learning",
];

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

    const clickedInsideHeader = header.contains(event.target);

    if (!clickedInsideHeader) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
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

initNavigation();
initTyping();
initRevealAnimations();
initActiveSectionTracking();
initFooterYear();
initMotionPreferenceListener();
