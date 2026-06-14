'use client';

import Link from 'next/link';
import { motion, MotionConfig, type Variants } from 'motion/react';
import {
  ArrowRight,
  Brain,
  Clock,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  type LucideIcon,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { GoogleOneTap } from '@/components/google-one-tap';
import { Spotlight } from '@/components/spotlight';

const GH = 'https://github.com/OtterMind/Nubase';

// The eight modules, in importance order — the line that says, at a glance,
// exactly what an agent gets to ship a real app.
const MODULES: { icon: LucideIcon; label: string }[] = [
  { icon: Database, label: 'Database' },
  { icon: KeyRound, label: 'Auth' },
  { icon: HardDrive, label: 'Storage' },
  { icon: Globe, label: 'Assets' },
  { icon: Zap, label: 'Functions' },
  { icon: Sparkles, label: 'AI Gateway' },
  { icon: Brain, label: 'Memory' },
  { icon: Clock, label: 'cron' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Hero() {
  return (
    // reducedMotion="user" makes every Motion entrance (and the spotlights)
    // skip transform/scale animation when the visitor prefers reduced motion.
    <MotionConfig reducedMotion="user">
    <section className="relative overflow-hidden bg-[#06231b] text-white">
      {/* Google One Tap — auto-hidden unless the backend has Google configured. */}
      <GoogleOneTap />

      {/* atmosphere: layered depth instead of a flat fill */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0c4a36_0%,#06231b_55%,#041a14_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000_30%,transparent_80%)]" />
      <Spotlight className="-top-40 left-0 md:-top-32 md:left-10" fill="#34e1a8" />
      <Spotlight className="-top-60 right-0 hidden md:block" fill="#f5d36b" delay={0.25} />
      {/* thin top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container relative z-10 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div variants={item} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--nb-mint)] backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--nb-mint)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--nb-mint)]" />
              </span>
              Free · Open source · Apache-2.0
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-8 text-balance font-display text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-[5.25rem]"
          >
            Turn AI-written code
            <br className="hidden sm:block" /> into{' '}
            <span className="bg-gradient-to-r from-[var(--nb-mint)] via-[#7df3c7] to-[#f5d36b] bg-clip-text text-transparent">
              real apps
            </span>
            <span className="text-[var(--nb-mint)]">.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/70"
          >
            Configure the plugin once — then your coding agent ships the whole app online:
            a published frontend, backend functions, data, auth and cron, on infrastructure you own.
          </motion.p>

          {/* the eight modules — the core capability, said at a glance */}
          <motion.ul
            variants={item}
            className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2"
          >
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.label}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition-colors hover:border-[var(--nb-mint)]/40 hover:text-white">
                    <Icon className="h-3.5 w-3.5 text-[var(--nb-mint)]" />
                    {m.label}
                  </span>
                </li>
              );
            })}
          </motion.ul>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/studio/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--nb-mint)] px-6 py-3 text-base font-semibold text-[#06231b] shadow-[0_8px_30px_-8px_rgba(52,225,168,0.55)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nb-mint)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06231b]"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={GH}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#06231b]"
            >
              <Star className="h-4 w-4" /> Star on GitHub
            </Link>
          </motion.div>

          {/* terminal — connect once, ship from the chat */}
          <motion.div
            variants={item}
            className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left shadow-2xl shadow-black/50 backdrop-blur"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/55">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-orange)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-yellow)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-mint)]" />
              </span>
              <span className="ml-2">configure once — then ship from the chat</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-7 text-white/85">
<span className="text-white/55"># 1 · connect your AI coding agent (Claude Code / Codex)</span>{'\n'}
<span className="text-white">npx -y </span><span className="text-[var(--nb-mint)]">nubase_cli@latest</span><span className="text-white"> install-skills</span>{'\n\n'}
<span className="text-white/55"># 2 · then just ask — the agent deploys it for you</span>{'\n'}
<span className="text-[var(--nb-yellow)]">“build a notes app and put it online”</span>{'\n'}
<span className="text-white/55"># → frontend on Assets · API on Functions · cron scheduled · live</span>
            </pre>
          </motion.div>
        </div>
      </motion.div>

      {/* soft transition into the white page below */}
      <div className="relative -mb-px">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-12 w-full md:h-16" aria-hidden="true">
          <path d="M0 80 L0 40 C 360 0 1080 0 1440 40 L1440 80 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
    </MotionConfig>
  );
}
