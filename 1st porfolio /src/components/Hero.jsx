import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { personalInfo } from '../data/portfolio.js';
import UnicornStudio from './effects/UnicornStudio.jsx';
import SplitText from './effects/SplitText.jsx';

export default function Hero({ visible = true }) {
  const heroRef = useRef(null);
  const bioRef = useRef(null);
  const ctaRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bioRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: 'power3.out' }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' }
      );

      gsap.fromTo(
        hintRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [visible]);

  return (
    <section ref={heroRef} className="hero-section min-h-screen relative flex items-center justify-center">
      {/* Unicorn Studio Background Effect */}
      <UnicornStudio />

      {/* Decorative Glowing Elements */}
      <div className="aurora-bg">
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
      </div>

      <div className="hero-content relative z-10 max-w-4xl px-6 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-xs font-mono text-violet-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{personalInfo.status}</span>
        </div>

        {/* Subtitle */}
        <p className="hero-subtitle text-xs md:text-sm font-mono tracking-widest uppercase text-violet-400/90 mb-3">
          {personalInfo.subtitle}
        </p>

        {/* Title with React Bits SplitText */}
        <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          <SplitText text="Prabhjot Singh" delay={0.1} duration={0.8} />
        </h1>

        {/* Bio */}
        <p
          ref={bioRef}
          className="hero-bio text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          {personalInfo.bio}
        </p>

        {/* Action Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="#macbook-experience"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('macbook-experience');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-violet-600/30 flex items-center gap-2 group cursor-pointer"
          >
            <span>Explore MacBook Workspace</span>
            <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
          </a>

          <a
            href={personalInfo.resumeUrl}
            download
            className="px-6 py-3 rounded-full border border-gray-700 bg-black/40 hover:bg-white/5 text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200 backdrop-blur-sm flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Resume</span>
          </a>
        </div>

        {/* Scroll Indicator */}
        <div ref={hintRef} className="hero-scroll-hint flex flex-col items-center gap-2">
          <span className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
            Scroll to drop MacBook
          </span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </section>
  );
}
