(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const clock = document.getElementById("clock");
  const tick = () => {
    if (!clock) return;
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    clock.textContent = `Lahore — ${time}`;
  };
  tick();
  setInterval(tick, 30_000);

  /* ——— Tigran: split letters ——— */
  document.querySelectorAll(".name-line").forEach((line) => {
    const text = line.dataset.text || "";
    line.innerHTML = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      span.style.transitionDelay = `${0.05 + i * 0.045}s`;
      line.appendChild(span);
    });
  });

  /* ——— ThevertMenthe: loader counter ——— */
  const loader = document.getElementById("loader");
  const loaderNum = document.getElementById("loader-num");
  const finishReady = () => {
    document.body.classList.add("is-ready");
    loader?.classList.add("is-done");
  };

  if (loader && loaderNum && !reduceMotion) {
    let n = 0;
    const iv = setInterval(() => {
      n += 7 + Math.floor(Math.random() * 9);
      if (n >= 100) {
        n = 100;
        loaderNum.textContent = "100";
        clearInterval(iv);
        setTimeout(finishReady, 200);
        return;
      }
      loaderNum.textContent = String(n);
    }, 40);
  } else {
    finishReady();
  }

  /* ——— Work accordion ——— */
  document.querySelectorAll(".work-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".work-item");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ——— Copy email ——— */
  const email = "wajeehaaslam597@gmail.com";
  const copyBtn = document.getElementById("copy-email");
  const toast = document.getElementById("copy-toast");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      if (toast) toast.textContent = "Email copied — say hi anytime.";
    } catch {
      if (toast) toast.textContent = email;
    }
  });

  /* ——— Tigran: play scrolls to work ——— */
  document.getElementById("play-btn")?.addEventListener("click", () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  });

  /* ——— Reveals ——— */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ——— Midlife-inspired machine / keyboard ——— */
  (() => {
    const screen = document.getElementById("machine-screen-text");
    const pads = [...document.querySelectorAll(".pad")];
    const autoBtn = document.getElementById("autoplay-btn");
    const recordBtn = document.getElementById("record-btn");
    if (!pads.length || !screen) return;

    const NOTE_FREQ = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
    };

    let audioCtx = null;
    let autoplayTimer = null;

    const ensureAudio = () => {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    };

    const playTone = (note) => {
      const ctx = ensureAudio();
      if (!ctx) return;
      const freq = NOTE_FREQ[note] || 440;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    };

    const writeScreen = (label) => {
      const lines = [
        "WAJEEHA OS v1.0",
        "SYSTEM STATUS: LIVE",
        "",
        `> ${label}`,
        "Signal routed.",
      ];
      screen.textContent = lines.join("\n");
    };

    const hitPad = (pad) => {
      const label = pad.dataset.label || "tone";
      const note = pad.dataset.note || "A4";
      const action = pad.dataset.action;

      pad.classList.add("is-hit");
      setTimeout(() => pad.classList.remove("is-hit"), 160);
      playTone(note);
      writeScreen(label);

      if (action === "email") {
        // mailto handled by <a href>, still play tone + update screen
        return;
      } else if (action === "linkedin") {
        window.open("https://linkedin.com/in/wajeeha-aslam", "_blank", "noopener");
      } else if (action === "github") {
        window.open("https://github.com/WajeehaAslam", "_blank", "noopener");
      }
    };

    pads.forEach((pad) => {
      pad.addEventListener("pointerdown", (e) => {
        // Don't block real mailto / external links
        if (pad.tagName === "A" && pad.getAttribute("href")?.startsWith("mailto:")) {
          hitPad(pad);
          return;
        }
        e.preventDefault();
        hitPad(pad);
      });
    });

    autoBtn?.addEventListener("click", () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        autoBtn.classList.remove("is-on");
        screen.textContent = "WAJEEHA OS v1.0\nSYSTEM STATUS: READY\n\nAutoplay stopped.";
        return;
      }
      ensureAudio();
      autoBtn.classList.add("is-on");
      let i = 0;
      const sequence = pads.filter((p) => !p.dataset.action);
      autoplayTimer = setInterval(() => {
        hitPad(sequence[i % sequence.length]);
        i += 1;
      }, 420);
    });

    recordBtn?.addEventListener("click", () => {
      ensureAudio();
      playTone("E4");
      writeScreen("Opening mail…");
    });
  })();

  if (reduceMotion || !finePointer) return;

  /* ——— Custom cursor ——— */
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x;
  let cy = y;

  if (cursor && dot) {
    document.body.classList.add("has-cursor");
    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
  }

  /* ——— ThevertMenthe: ink trail ——— */
  const canvas = document.getElementById("ink-canvas");
  const ctx = canvas?.getContext("2d");
  let inkPoints = [];

  const resizeInk = () => {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  if (canvas && ctx) {
    resizeInk();
    window.addEventListener("resize", resizeInk);
    window.addEventListener("mousemove", (e) => {
      inkPoints.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (inkPoints.length > 48) inkPoints.shift();
    });
  }

  /* ——— Heat Bureau: floating work preview ——— */
  const preview = document.getElementById("work-preview");
  const previewTitle = preview?.querySelector(".work-preview-title");
  const previewStat = preview?.querySelector(".work-preview-stat");
  const previewIndex = preview?.querySelector(".work-preview-index");
  let px = x;
  let py = y;

  document.querySelectorAll(".work-item").forEach((item, i) => {
    item.addEventListener("mouseenter", () => {
      if (!preview) return;
      preview.style.setProperty("--preview-accent", item.dataset.accent || "#c8ff3d");
      if (previewTitle) previewTitle.textContent = item.dataset.preview || "";
      if (previewStat) previewStat.textContent = item.dataset.stat || "";
      if (previewIndex) previewIndex.textContent = String(i + 1).padStart(2, "0");
      preview.classList.add("is-on");
      cursor?.classList.add("is-active");
    });
    item.addEventListener("mouseleave", () => {
      preview?.classList.remove("is-on");
      cursor?.classList.remove("is-active");
    });
  });

  /* ——— Magnetic buttons (Heat / Thibaut) ——— */
  document.querySelectorAll(".magnet").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * 0.22}px, ${my * 0.22}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
    el.addEventListener("mouseenter", () => cursor?.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursor?.classList.remove("is-active"));
  });

  document.querySelectorAll("a:not(.magnet), button:not(.magnet)").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor?.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursor?.classList.remove("is-active"));
  });

  /* ——— Hero orb parallax (Getty depth) ——— */
  const orb = document.querySelector("#hero-portrait");

  const loop = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    if (cursor) {
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }

    px += (x - px) * 0.12;
    py += (y - py) * 0.12;
    if (preview?.classList.contains("is-on")) {
      preview.style.left = `${px}px`;
      preview.style.top = `${py}px`;
    }

    if (orb) {
      const ox = (x / window.innerWidth - 0.5) * 30;
      const oy = (y / window.innerHeight - 0.5) * 20;
      orb.style.translate = `${ox}px ${oy}px`;
    }

    if (ctx && canvas) {
      ctx.fillStyle = "rgba(8, 8, 10, 0.1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 1; i < inkPoints.length; i += 1) {
        const a = inkPoints[i - 1];
        const b = inkPoints[i];
        b.life *= 0.965;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(200, 255, 61, ${0.4 * b.life})`;
        ctx.lineWidth = 2.2 * b.life;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      inkPoints = inkPoints.filter((p) => p.life > 0.04);
    }

    requestAnimationFrame(loop);
  };
  loop();
})();
