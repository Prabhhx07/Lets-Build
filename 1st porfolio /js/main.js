document.addEventListener("DOMContentLoaded", () => {
  // Page transition overlay and player state
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

  // Hide preloader after page load and brief intro animation
  const preloader = document.getElementById("preloader");
  if (preloader) {
    // Show the combined greetings (set in HTML) and hide preloader
    // after a short, consistent delay so all languages are visible.
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
      // Ensure music is enabled by default: set UI and attempt to start playback
      try {
        localStorage.setItem("musicEnabled", "true");
        setMusicButtonState(true);
        // create track early so browser can start loading it
        if (!musicState.track) musicState.track = createRequestedTrack();
        // attempt to play; if blocked, startMusic will handle failure
        startMusic();
      } catch (e) {}
    }

    // allow user to click the preloader to dismiss immediately
    preloader.addEventListener("click", hidePreloader, { once: true });

    // fallback hide after short delay
    window.setTimeout(hidePreloader, 1600);
  }
  // After attempting auto-start, if the track exists but is paused
  // (autoplay likely blocked), prompt user to click to enable.
  window.setTimeout(() => {
    try {
      if (musicState.track && musicState.track.paused) {
        if (musicToggle) {
          musicToggle.textContent = "Click to enable music";
          musicToggle.classList.add("requires-interaction");
          setMusicButtonState(false);
        }
      }
    } catch (e) {}
  }, 2200);
  // After preloader is hidden, reveal hero and start typing
  window.setTimeout(() => {
    try {
      document.body.classList.add("loaded");
    } catch (e) {}
    if (typeof typeWriter === "function") {
      try {
        typeWriter();
      } catch (e) {}
    }
  }, 3200);

  function createRequestedTrack() {
    // Use the user-provided Strawberry Guy track in the music folder
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
    if (!musicToggle) {
      return;
    }

    musicToggle.textContent = isActive ? "Music On" : "Music Off";
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
      // If autoplay is blocked, indicate the toggle requires user interaction
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

  // Intersection Observer for Fade-in Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });

  // Typing Effect
  const roleElement = document.querySelector(".role");
  const roleText = "Full-stack developer | DSA learner | Game-dev explorer";
  let charIndex = 0;

  function typeWriter() {
    if (!roleElement) return;
    if (charIndex < roleText.length) {
      roleElement.textContent += roleText.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 60);
    } else {
      // When typing finishes, optionally start/change other UI loops
      if (typeof changeGreeting === "function") {
        changeGreeting();
      }
    }
  }

  // Navbar Scroll Effect (Optional: add background on scroll)
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    } else {
      navbar.style.boxShadow = "none";
    }
  });

  // Mobile Navigation
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li");

  hamburger.addEventListener("click", () => {
    // Toggle Nav
    navLinks.classList.toggle("nav-active");
    hamburger.classList.toggle("active");

    // Animate Links
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

  // Close menu when clicking a link
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

  // Theme Switcher
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check saved theme
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
    // Dispatch custom event for particles.js to listen to
    const event = new CustomEvent("themeChange", { detail: { theme: theme } });
    window.dispatchEvent(event);
  }
});
