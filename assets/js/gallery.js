document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const track = gallery.querySelector("[data-gallery-track]");
  const previousButton = document.querySelector("[data-gallery-prev]");
  const nextButton = document.querySelector("[data-gallery-next]");
  const toggleButton = document.querySelector("[data-gallery-toggle]");
  const status = document.querySelector("[data-gallery-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  let busy = false;
  let paused = reducedMotion.matches;
  let touchStartX = 0;

  const step = () => {
    const slide = track.querySelector(".gallery-slide");
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return slide.getBoundingClientRect().width + gap;
  };

  const announce = () => {
    const caption = track.querySelector("figcaption");
    if (caption) status.textContent = caption.textContent.trim();
  };

  const moveNext = () => {
    if (busy) return;
    busy = true;
    track.style.transition = "transform .65s cubic-bezier(.22,.61,.36,1)";
    track.style.transform = `translateX(-${step()}px)`;
    track.addEventListener("transitionend", () => {
      track.append(track.firstElementChild);
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      busy = false;
      announce();
    }, { once: true });
  };

  const movePrevious = () => {
    if (busy) return;
    busy = true;
    track.prepend(track.lastElementChild);
    track.style.transition = "none";
    track.style.transform = `translateX(-${step()}px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      track.style.transition = "transform .65s cubic-bezier(.22,.61,.36,1)";
      track.style.transform = "translateX(0)";
    }));
    track.addEventListener("transitionend", () => {
      busy = false;
      announce();
    }, { once: true });
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!paused && !document.hidden) timer = window.setInterval(moveNext, 4800);
  };

  const updateToggle = () => {
    toggleButton.textContent = paused ? "Play" : "Pause";
    toggleButton.setAttribute("aria-pressed", String(paused));
    toggleButton.setAttribute("aria-label", paused ? "Start automatic slideshow" : "Pause automatic slideshow");
  };

  previousButton.addEventListener("click", () => { movePrevious(); start(); });
  nextButton.addEventListener("click", () => { moveNext(); start(); });
  toggleButton.addEventListener("click", () => { paused = !paused; updateToggle(); start(); });
  gallery.addEventListener("mouseenter", stop);
  gallery.addEventListener("mouseleave", start);
  gallery.addEventListener("focusin", stop);
  gallery.addEventListener("focusout", start);
  gallery.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].clientX;
    stop();
  }, { passive: true });
  gallery.addEventListener("touchend", event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) distance < 0 ? moveNext() : movePrevious();
    start();
  }, { passive: true });
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", event => {
    paused = event.matches;
    updateToggle();
    start();
  });

  updateToggle();
  announce();
  start();
});
