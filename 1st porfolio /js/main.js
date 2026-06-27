document.addEventListener("DOMContentLoaded", () => {
  const pageTransition = document.createElement("div");
  pageTransition.className = "page-transition-overlay";
  document.body.appendChild(pageTransition);

  const musicToggle = document.getElementById("music-toggle");
  const musicState = {
    context: null,
    masterGain: null,
    filter: null,
    oscillators: [],
    track: null,
    isPlaying: false,
  };

  const preloader = document.getElementById("preloader");
  if (preloader) {
    function hidePreloader() {
      try {
        preloader.classList.add("preloader-hidden");
      } catch (e) {}
      try {
        preloader.style.display = "none";
      } catch (e) {}
      try {
        document.body.classList.add("loaded");
      } catch (e) {}
      try {
        if (typeof typeWriter === "function") typeWriter();
      } catch (e) {}

      try {
        localStorage.setItem("musicEnabled", "true");
        setMusicButtonState(true);

        if (!musicState.track) musicState.track = createRequestedTrack();

        startMusic();
      } catch (e) {}
    }

    preloader.addEventListener("click", hidePreloader, { once: true });
  }

  function createRequestedTrack() {
    const trackPath = encodeURI(
      "music/Strawberry_Guy_-_Mrs_Magic_Strings_Version_(mp3.pm).mp3",
    );
    const track = new Audio(trackPath);
    track.loop = true;
    track.preload = "auto";
    track.volume = 0.38;
    return track;
  }

  function createAmbientMusic() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      return null;
    }

    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextConstructor();
    const filter = context.createBiquadFilter();
    const masterGain = context.createGain();

    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.8;

    masterGain.gain.value = 0;

    const output = context.createGain();
    output.gain.value = 0.28;

    const chordFrequencies = [130.81, 164.81, 196, 261.63];
    const oscillators = chordFrequencies.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();

      oscillator.type = index < 2 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      voiceGain.gain.value = index === 0 ? 0.16 : 0.08;

      oscillator.connect(voiceGain);
      voiceGain.connect(filter);
      oscillator.start();

      return { oscillator, voiceGain };
    });

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.045;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    filter.connect(masterGain);
    masterGain.connect(output);
    output.connect(context.destination);

    return { context, filter, masterGain, oscillators, lfo };
  }

  function setMusicButtonState(isActive) {
    if (!musicToggle) return;
    const label = musicToggle.querySelector("#music-fab-label");
    if (label) label.textContent = isActive ? "Music On" : "Music Off";
    else musicToggle.textContent = isActive ? "Music On" : "Music Off";
    musicToggle.classList.toggle("is-active", isActive);
    musicToggle.setAttribute("aria-pressed", String(isActive));
  }

  async function startMusic() {
    if (!musicState.track) {
      musicState.track = createRequestedTrack();
    }

    try {
      await musicState.track.play();
      musicState.isPlaying = true;
      setMusicButtonState(true);
      localStorage.setItem("musicEnabled", "true");
      localStorage.setItem("musicMode", "track");
      return true;
    } catch (error) {
      console.error("Requested track could not be played:", error);

      try {
        setMusicButtonState(false);
        if (musicToggle) {
          musicToggle.textContent = "Click to enable music";
          musicToggle.classList.add("requires-interaction");
        }
      } catch (e) {}
      localStorage.setItem("musicEnabled", "false");
      localStorage.setItem("musicMode", "off");
      return false;
    }
  }

  async function stopMusic() {
    if (musicState.track) {
      musicState.track.pause();
      musicState.track.currentTime = 0;
    }

    if (!musicState.context || !musicState.masterGain) {
      musicState.isPlaying = false;
      setMusicButtonState(false);
      localStorage.setItem("musicEnabled", "false");
      localStorage.setItem("musicMode", "off");
      return;
    }

    const now = musicState.context.currentTime;
    musicState.masterGain.gain.cancelScheduledValues(now);
    musicState.masterGain.gain.setTargetAtTime(0, now, 0.12);

    window.setTimeout(async () => {
      if (musicState.context && musicState.context.state !== "closed") {
        await musicState.context.suspend();
      }
    }, 260);

    musicState.isPlaying = false;
    setMusicButtonState(false);
    localStorage.setItem("musicEnabled", "false");
    localStorage.setItem("musicMode", "off");
  }

  if (musicToggle) {
    setMusicButtonState(false);
    musicToggle.addEventListener("click", async () => {
      if (musicState.isPlaying) {
        await stopMusic();
        return;
      }

      await startMusic();
    });
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });

  const roleElement = document.querySelector(".role");
  const roleText = "Full-stack developer | Video-Editor | Game-dev explorer";
  let charIndex = 0;

  function typeWriter() {
    if (!roleElement) return;
    if (charIndex < roleText.length) {
      roleElement.textContent += roleText.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 60);
    } else {
      if (typeof changeGreeting === "function") {
        changeGreeting();
      }
    }
  }

  const navbar = document.querySelector(".navbar");
  const scrollProgress = document.getElementById("scroll-progress");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    } else {
      navbar.style.boxShadow = "none";
    }

    if (scrollProgress) {
      const scrollTotal =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollTotal) * 100;
      scrollProgress.style.width = scrollPercent + "%";
    }
  });

  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active");
    hamburger.classList.toggle("active");

    links.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = "";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.3
        }s`;
      }
    });
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-active");
      hamburger.classList.remove("active");
      links.forEach((link) => {
        link.style.animation = "";
      });
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (!targetSection) {
        return;
      }

      event.preventDefault();

      document.body.classList.add("page-transitioning");
      pageTransition.classList.add("is-visible");
      window.history.pushState(null, "", targetId);

      window.setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);

      window.setTimeout(() => {
        document.body.classList.remove("page-transitioning");
        pageTransition.classList.remove("is-visible");
      }, 560);
    });
  });

  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.setAttribute("data-theme", savedTheme);
    updateToggleIcon(savedTheme);
    updateParticles(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateToggleIcon(newTheme);
    updateParticles(newTheme);
  });

  function updateToggleIcon(theme) {
    themeToggle.textContent = theme === "light" ? "🌙" : "☀";
  }

  function updateParticles(theme) {
    const event = new CustomEvent("themeChange", { detail: { theme: theme } });
    window.dispatchEvent(event);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll(".stat-number");
          counters.forEach((counter) => {
            const target = +counter.getAttribute("data-target");
            const duration = 2000;
            const increment = target / (duration / 16);

            let current = 0;
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
              } else {
                counter.innerText = target + (target > 10 ? "+" : "");
              }
            };
            updateCounter();
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  const statsSection = document.getElementById("stats");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 250) {
        current = section.getAttribute("id");
      }
    });

    document.querySelectorAll(".nav-links a").forEach((a) => {
      a.classList.remove("active");
      if (a.getAttribute("href") === `#${current}`) {
        a.classList.add("active");
      }
    });
  });
});
