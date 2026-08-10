const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

const formatMetric = (element, value) => {
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";
  element.textContent = `${prefix}${value}${suffix}`;
};

const animateMetric = (element) => {
  const target = Number(element.dataset.countTo || 0);
  const duration = Number(element.dataset.duration || 1350);
  const start = performance.now();

  formatMetric(element, 0);

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(target * easeOutCubic(progress));
    formatMetric(element, value);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    formatMetric(element, target);
  };

  requestAnimationFrame(tick);
};

const animateChart = (chart, index) => {
  const path = chart.querySelector("path");
  const dot = chart.querySelector("circle");

  if (!path) {
    return;
  }

  const length = path.getTotalLength();
  const delay = 220 + index * 140;

  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  path.style.transition = `stroke-dashoffset 1120ms cubic-bezier(.22, 1, .36, 1) ${delay}ms`;

  if (dot) {
    dot.style.opacity = "0";
    dot.style.transform = "scale(.35)";
    dot.style.transition = `opacity 240ms ease ${delay + 1020}ms, transform 340ms cubic-bezier(.2, 1.4, .35, 1) ${delay + 1020}ms`;
  }

  requestAnimationFrame(() => {
    path.style.strokeDashoffset = "0";

    if (dot) {
      dot.style.opacity = "1";
      dot.style.transform = "scale(1)";
    }
  });
};

const initHeroStats = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const metrics = document.querySelectorAll("[data-count-to]");
  const charts = document.querySelectorAll(".stat-chart");

  if (prefersReducedMotion) {
    metrics.forEach((metric) => formatMetric(metric, Number(metric.dataset.countTo || 0)));
    return;
  }

  metrics.forEach(animateMetric);
  charts.forEach(animateChart);
};

const initHeroPhoneChat = () => {
  const phone = document.querySelector(".phone-mockup");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!phone) {
    return;
  }

  const playChat = () => {
    phone.classList.add("chat-live");
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    playChat();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.35) {
        return;
      }

      playChat();
      observer.disconnect();
    },
    {
      threshold: 0.35,
    },
  );

  observer.observe(phone);
};

const initReferencesSlider = () => {
  const shell = document.querySelector(".references-shell");
  const windowElement = document.querySelector(".references-logo-window");
  const track = document.querySelector(".references-logo-track");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!shell || !windowElement || !track) {
    return;
  }

  const items = Array.from(track.children);
  let currentIndex = 0;
  let intervalId;

  if (!prefersReducedMotion) {
    shell.classList.add("references-ready");

    requestAnimationFrame(() => {
      shell.classList.add("is-loaded");
    });
  }

  const getMaxIndex = () => {
    const maxOffset = Math.max(track.scrollWidth - windowElement.clientWidth, 0);
    return items.reduce((lastIndex, item, index) => {
      return item.offsetLeft <= maxOffset + item.offsetWidth ? index : lastIndex;
    }, 0);
  };

  const setSlide = (index) => {
    const maxOffset = Math.max(track.scrollWidth - windowElement.clientWidth, 0);
    const offset = Math.min(items[index]?.offsetLeft || 0, maxOffset);
    shell.style.setProperty("--logo-offset", `${offset}px`);
  };

  const nextSlide = () => {
    const maxIndex = getMaxIndex();

    if (maxIndex <= 0) {
      currentIndex = 0;
      setSlide(currentIndex);
      return;
    }

    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    setSlide(currentIndex);
  };

  const restart = () => {
    window.clearInterval(intervalId);
    currentIndex = Math.min(currentIndex, getMaxIndex());
    setSlide(currentIndex);

    if (!prefersReducedMotion) {
      intervalId = window.setInterval(nextSlide, 3000);
    }
  };

  restart();
  window.addEventListener("resize", restart);
};

const initStoriesBlock = () => {
  const section = document.querySelector(".stories-section");
  const track = section?.querySelector(".stories-track");
  const previousButton = section?.querySelector(".stories-arrow-prev");
  const nextButton = section?.querySelector(".stories-arrow-next");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || !track) {
    return;
  }

  const scrollStories = (direction) => {
    const firstCard = track.querySelector(".story-card");
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : 280;

    section.scrollBy({
      left: distance * direction,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  previousButton?.addEventListener("click", () => scrollStories(-1));
  nextButton?.addEventListener("click", () => scrollStories(1));

  if (prefersReducedMotion) {
    return;
  }

  let readyTimer;
  const mobileThreshold = window.matchMedia("(max-width: 767px)").matches ? 0.06 : 0.24;

  const revealStories = () => {
    section.classList.add("is-visible");
    window.clearTimeout(readyTimer);
    readyTimer = window.setTimeout(() => {
      section.classList.add("story-hover-ready");
    }, 1700);
  };

  section.classList.add("story-armed");

  if (!("IntersectionObserver" in window)) {
    revealStories();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < mobileThreshold) {
        return;
      }

      revealStories();
      observer.disconnect();
    },
    {
      threshold: mobileThreshold,
    },
  );

  observer.observe(section);
};

const initPossibilitiesBlock = () => {
  const section = document.querySelector(".possibilities-section");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || prefersReducedMotion) {
    return;
  }

  const revealPossibilities = () => {
    section.classList.add("is-visible");
  };

  section.classList.add("possibilities-armed");

  if (!("IntersectionObserver" in window)) {
    revealPossibilities();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.18) {
        return;
      }

      revealPossibilities();
      observer.disconnect();
    },
    {
      threshold: 0.18,
    },
  );

  observer.observe(section);
};

const initPlatformBlock = () => {
  const section = document.querySelector(".platform-section");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || prefersReducedMotion) {
    return;
  }

  let readyTimer;

  const revealPlatform = () => {
    section.classList.add("is-visible");
    window.clearTimeout(readyTimer);
    readyTimer = window.setTimeout(() => {
      section.classList.add("platform-hover-ready");
    }, 1500);
  };

  section.classList.add("platform-armed");

  if (!("IntersectionObserver" in window)) {
    revealPlatform();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.18) {
        return;
      }

      revealPlatform();
      observer.disconnect();
    },
    {
      threshold: 0.18,
    },
  );

  observer.observe(section);
};

const initComplianceBlock = () => {
  const section = document.querySelector(".compliance-section");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || prefersReducedMotion) {
    return;
  }

  let readyTimer;

  const revealCompliance = () => {
    section.classList.add("is-visible");
    window.clearTimeout(readyTimer);
    readyTimer = window.setTimeout(() => {
      section.classList.add("compliance-hover-ready");
    }, 1100);
  };

  section.classList.add("compliance-armed");

  if (!("IntersectionObserver" in window)) {
    revealCompliance();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.28) {
        return;
      }

      revealCompliance();
      observer.disconnect();
    },
    {
      threshold: 0.28,
    },
  );

  observer.observe(section);
};

const initFinalResultsBlock = () => {
  const section = document.querySelector(".final-results-section");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || prefersReducedMotion) {
    return;
  }

  let readyTimer;

  const revealFinalResults = () => {
    section.classList.add("is-visible");
    window.clearTimeout(readyTimer);
    readyTimer = window.setTimeout(() => {
      section.classList.add("final-hover-ready");
    }, 1500);
  };

  section.classList.add("final-results-armed");

  if (!("IntersectionObserver" in window)) {
    revealFinalResults();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.18) {
        return;
      }

      revealFinalResults();
      observer.disconnect();
    },
    {
      threshold: 0.18,
    },
  );

  observer.observe(section);
};

window.addEventListener("DOMContentLoaded", () => {
  initHeroStats();
  initHeroPhoneChat();
  initReferencesSlider();
  initStoriesBlock();
  initPossibilitiesBlock();
  initPlatformBlock();
  initComplianceBlock();
  initFinalResultsBlock();
});
