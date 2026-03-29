/**
 * 个人主页 — 原生 JavaScript
 * 功能：移动端导航、平滑滚动增强、滚动显现、轮播图、回到顶部
 */

(function () {
  "use strict";

  /* ---------- 移动端导航折叠 ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navMenu.classList.toggle("is-open", !open);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
      });
    });
  }

  /* ---------- 锚点平滑滚动（与 CSS scroll-behavior 互补：聚焦可访问性） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- 滚动时元素淡入 / 上移 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 轮播图 ---------- */
  function initCarousel(root) {
    const track = root.querySelector("[data-track]");
    const slides = root.querySelectorAll(".carousel-slide");
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    const dotsContainer = root.querySelector("[data-carousel-dots]");
    if (!track || !slides.length) return;

    let index = 0;
    const total = slides.length;

    function goTo(i) {
      index = (i + total) % total;
      /* 百分比相对于 .carousel-track 自身宽度；每张占轨道的 1/total */
      track.style.transform = "translateX(-" + (100 * index) / total + "%)";
      slides.forEach(function (s, j) {
        s.classList.toggle("is-active", j === index);
      });
      if (dotsContainer) {
        dotsContainer.querySelectorAll(".carousel-dot").forEach(function (dot, j) {
          dot.classList.toggle("is-active", j === index);
          dot.setAttribute("aria-selected", String(j === index));
        });
      }
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-label", "第 " + (i + 1) + " 张");
        btn.setAttribute("aria-selected", String(i === 0));
        btn.addEventListener("click", function () {
          goTo(i);
        });
        dotsContainer.appendChild(btn);
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1); });

    /* 随幻灯片数量设置轨道宽度（若以后增删图片，只需改 HTML） */
    track.style.width = total * 100 + "%";
    slides.forEach(function (slide) {
      slide.style.width = 100 / total + "%";
    });

    // 键盘：在轮播容器聚焦时切换
    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      }
    });

    goTo(0);
  }

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) initCarousel(carousel);

  /* ---------- 回到顶部按钮显隐与点击 ---------- */
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    function toggleBackTop() {
      if (window.scrollY > 400) {
        backBtn.classList.add("is-visible");
      } else {
        backBtn.classList.remove("is-visible");
      }
    }
    toggleBackTop();
    window.addEventListener("scroll", toggleBackTop, { passive: true });
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
