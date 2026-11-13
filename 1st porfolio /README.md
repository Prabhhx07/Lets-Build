# Prabhjot Singh — Interactive MacBook Portfolio

An ultra-modern, non-vibecoded portfolio featuring a 3D MacBook drop sequence, realistic macOS windowing system, smooth scrolling, and reactive WebGL motion.

## 🚀 Key Features

1. **Preloader Animation**
   - High-performance GSAP entrance animation with character-by-character text reveal, progress fill, and percentage counter.
   - Smoothly slides up and unmounts once assets and DOM are ready.

2. **3D MacBook Drop & Lid-Opening (GSAP + ScrollTrigger)**
   - Pinned 3D CSS perspective container (`perspective: 1800px`).
   - As the user scrolls:
     - **0% → 35%**: MacBook drops from top of screen into center with acceleration and settled physics.
     - **35% → 75%**: 3D display lid smoothly hinges open (`rotateX: -90deg → 0deg`).
     - **75% → 100%**: Backlight wakes up, screen activates, and MacBook aligns for direct interaction.

3. **Interactive macOS Desktop System**
   - **Menu Bar**: Live clock, battery indicator, Apple menu, and quick navigation.
   - **Draggable Windows**: Powered by `react-draggable` with z-index focus management and macOS traffic lights (`close`, `minimize`, `maximize`).
   - **Window Content**:
     - 👤 **About**: Bio, work philosophy, and interests.
     - 🚀 **Projects**: Interactive cards that launch live apps or GitHub repos in a new tab.
     - ⚡ **Skills**: Categorized frontend, backend, and tooling chips.
     - 📬 **Contact**: Direct email trigger and social links.
   - **Interactive Dock**: Bouncing icon magnification, status indicators, and desktop tooltips.

4. **React Bits Effects**
   - `SplitText`: Character kinetic entrance animations.
   - `SpotlightCard`: Radial cursor spotlight tracking on project cards.
   - `CustomCursor`: Smooth magnetic cursor with interactive element detection.

5. **Smooth Scrolling with Lenis**
   - Wrapped with `lenis` and synced with `gsap.ticker` and `ScrollTrigger.update`.

6. **Unicorn Studio Design**
   - Integrated `UnicornStudio` component with fluid motion shader and particle canvas, supporting direct embed via `projectId` prop or `data-us-project`.

---

## 🛠️ Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **GSAP (GreenSock) & ScrollTrigger**
- **Lenis** (Butter-smooth scroll)
- **Framer Motion**
- **react-draggable**

---

## 💻 Development & Deployment

### Start Local Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```
