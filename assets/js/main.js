// Della Hair — shared site behaviour
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header scroll state --------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav -------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var closeBtn = document.querySelector(".mobile-nav-close");

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    document.body.classList.add("nav-open");
    toggle && toggle.setAttribute("aria-expanded", "true");
    var firstLink = mobileNav.querySelector("a");
    firstLink && firstLink.focus({ preventScroll: true });
  }
  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
  }
  toggle && toggle.addEventListener("click", openNav);
  closeBtn && closeBtn.addEventListener("click", closeNav);
  mobileNav &&
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* Scroll reveal ------------------------------------------------------------ */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Count-up stats ------------------------------------------------------------ */
  var counters = document.querySelectorAll("[data-count-to]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-count-suffix") || "";
    var decimals = el.getAttribute("data-count-decimals") ? parseInt(el.getAttribute("data-count-decimals"), 10) : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var countIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { countIo.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Testimonial carousel ------------------------------------------------------ */
  var track = document.querySelector(".testimonial-track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".testimonial-slide"));
    var dotsWrap = document.querySelector(".testimonial-dots");
    var current = 0;
    var timer = null;

    slides.forEach(function (slide, i) {
      if (dotsWrap) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", function () { goTo(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      }
    });
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current] && dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current] && dots[current].classList.add("is-active");
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    var nextBtn = document.querySelector(".testimonial-next");
    var prevBtn = document.querySelector(".testimonial-prev");
    nextBtn && nextBtn.addEventListener("click", function () { next(); resetTimer(); });
    prevBtn && prevBtn.addEventListener("click", function () { prev(); resetTimer(); });

    function startTimer() {
      if (reduceMotion) return;
      timer = setInterval(next, 6000);
    }
    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }
    var wrap = document.querySelector(".testimonial-wrap");
    wrap && wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    wrap && wrap.addEventListener("mouseleave", startTimer);
    wrap && wrap.addEventListener("focusin", function () { clearInterval(timer); });
    wrap && wrap.addEventListener("focusout", startTimer);
    startTimer();
  }

  /* Gallery filters ------------------------------------------------------------ */
  var filterBtns = document.querySelectorAll("[data-filter]");
  var galleryItems = document.querySelectorAll("[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  /* Lightbox --------------------------------------------------------------------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var lbClose = lightbox.querySelector(".lightbox-close");
    document.querySelectorAll("[data-lightbox]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var img = trigger.querySelector("img");
        if (!img) return;
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || "";
        if (lbCaption) lbCaption.textContent = trigger.getAttribute("data-caption") || "";
        lightbox.classList.add("is-open");
        document.body.classList.add("nav-open");
        lbClose && lbClose.focus();
      });
    });
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    }
    lbClose && lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* Phone reel click-to-play (keeps page load light — video only fetched on demand) */
  document.querySelectorAll(".phone-mock").forEach(function (mock) {
    var playBtn = mock.querySelector(".phone-play");
    var video = mock.querySelector("video");
    if (!playBtn || !video) return;
    playBtn.addEventListener("click", function () {
      var src = video.getAttribute("data-src");
      if (src && !video.getAttribute("src")) {
        video.setAttribute("src", src);
      }
      video.play();
      playBtn.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      playBtn.classList.remove("is-hidden");
    });
    video.addEventListener("ended", function () {
      playBtn.classList.remove("is-hidden");
    });
  });

  /* Contact form (static hosting friendly — mailto fallback + accessible status) */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var data = new FormData(form);
      var name = data.get("name") || "";
      var service = data.get("service") || "";
      var message = data.get("message") || "";
      var phone = data.get("phone") || "";
      var body = "Name: " + name + "%0D%0APhone: " + phone + "%0D%0AService: " + service + "%0D%0A%0D%0A" + message;
      var mailto = "mailto:hello@dellahair.co.uk?subject=" + encodeURIComponent("New enquiry from website") + "&body=" + encodeURIComponent(decodeURIComponent(body));
      window.location.href = mailto;
      if (status) {
        status.textContent = "Opening your email app to send this enquiry to Della Hair…";
        status.classList.add("is-visible", "success");
      }
    });
  }

  /* Footer year ------------------------------------------------------------------ */
  var yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
