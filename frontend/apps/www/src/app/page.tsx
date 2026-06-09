import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Brain,
  Database,
  Github,
  HardDrive,
  KeyRound,
  Layers,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  Network,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
} from 'lucide-react';
import { GoogleOneTap } from '@/components/google-one-tap';

const GH = 'https://github.com/OtterMind/Nubase';

/* ----------------------------------------------------------------- content */

interface Primitive {
  icon: LucideIcon;
  title: string;
  body: string;
  tag?: string;
  tint: string; // icon tile background
  ink: string; // icon color
}

const PRIMITIVES: Primitive[] = [
  {
    icon: Brain,
    title: 'Memory',
    tag: 'first-class',
    body: 'A real memory layer for AI apps. Facts are extracted, embedded and recalled with a hybrid engine — not a bolted-on vector script.',
    tint: 'var(--nb-mint-soft)',
    ink: 'var(--nb-green-deep)',
  },
  {
    icon: Database,
    title: 'Database',
    body: 'An isolated PostgreSQL per project with a PostgREST-compatible REST API, Row Level Security and JWT claims.',
    tint: '#e4eefb',
    ink: '#2563c9',
  },
  {
    icon: KeyRound,
    title: 'Auth',
    body: 'Supabase-style auth, per project: email, OAuth, magic links, MFA / TOTP, OTP and anonymous sign-in.',
    tint: 'var(--nb-orange-soft)',
    ink: '#d8542f',
  },
  {
    icon: HardDrive,
    title: 'Storage',
    body: 'S3 / R2-compatible object storage with public & private buckets, signed URLs and policy-aware access.',
    tint: '#efe6fb',
    ink: '#7c3aed',
  },
  {
    icon: Sparkles,
    title: 'AI Gateway',
    body: 'Bring your own model. One gateway, OpenAI- and Anthropic-compatible, with per-project keys and usage tracking.',
    tint: 'var(--nb-yellow-soft)',
    ink: '#b8860b',
  },
  {
    icon: Network,
    title: 'MCP for agents',
    tag: 'one command',
    body: 'Claude Code & Codex operate Nubase natively over MCP — inspect schema, run SQL, manage auth, read & write memory.',
    tint: 'var(--nb-mint-soft)',
    ink: 'var(--nb-green-deep)',
  },
];

const STATS: [string, string][] = [
  ['6', 'primitives in one service'],
  ['1', 'Docker image to self-host it all'],
  ['∞', 'isolated projects per control plane'],
  ['0', 'vendor lock-in · Apache-2.0'],
];

const INTEGRATIONS = [
  'Claude Code', 'Codex', 'Cursor', 'OpenAI', 'Anthropic', 'PostgreSQL',
  'pgvector', 'Cloudflare R2', 'AWS S3', 'MinIO', 'Docker', 'MCP',
];

const LEARN: { icon: LucideIcon; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: LifeBuoy,
    title: 'Docs & Quickstart',
    body: 'Go from zero to a running backend in minutes. Concepts, REST, Auth, Storage and Memory — all documented.',
    href: '/docs/getting-started',
    cta: 'Read the docs',
  },
  {
    icon: MessagesSquare,
    title: 'Community',
    body: 'Star the repo, open issues, and shape the roadmap. Nubase is Apache-2.0 and built in the open.',
    href: GH,
    cta: 'Join on GitHub',
  },
  {
    icon: Rocket,
    title: 'Self-host',
    body: 'One Docker image bundles Postgres, Redis, the API and Studio. Run unlimited projects on your own box.',
    href: '/docs/concepts',
    cta: 'See the architecture',
  },
];

/* -------------------------------------------------------------- decorations */

function Chip({
  className,
  tint,
  rot = 0,
  children,
}: {
  className?: string;
  tint: string;
  rot?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`nb-chip nb-float pointer-events-none absolute hidden items-center justify-center md:flex ${className ?? ''}`}
      style={{ background: tint, ['--nb-rot' as string]: `${rot}deg`, transform: `rotate(${rot}deg)` }}
    >
      {children}
    </div>
  );
}

/* --------------------------------------------------------------------- page */

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Google One Tap — auto-hidden unless the backend has Google configured. */}
      <GoogleOneTap />

      {/* ============================================================== HERO */}
      <section className="nb-mint-band relative">
        <div className="pointer-events-none absolute inset-0 nb-dots-light opacity-60" />
        {/* big soft blobs */}
        <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 nb-blob bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -right-24 -top-10 h-80 w-80 nb-blob bg-[var(--nb-yellow)]/25 blur-2xl" />

        {/* floating accent chips */}
        <Chip className="left-[6%] top-[22%] h-16 w-16" tint="var(--nb-yellow)" rot={-8}>
          <Sparkles className="h-7 w-7 text-[#4a3a00]" />
        </Chip>
        <Chip className="right-[8%] top-[30%] h-16 w-16" tint="var(--nb-orange)" rot={10}>
          <Brain className="h-7 w-7 text-white" />
        </Chip>
        <Chip className="left-[12%] bottom-[16%] h-14 w-14" tint="#ffffff" rot={6}>
          <Database className="h-6 w-6 text-[var(--nb-green-deep)]" />
        </Chip>
        <Chip className="right-[12%] bottom-[20%] h-14 w-14" tint="var(--nb-charcoal)" rot={-6}>
          <Terminal className="h-6 w-6 text-[var(--nb-mint)]" />
        </Chip>

        <div className="container relative py-20 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="nb-reveal inline-flex items-center gap-2 rounded-full bg-[#07382c]/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#07382c]" style={{ animationDelay: '60ms' }}>
              <span className="relative flex h-2 w-2">
                <span className="nb-pulse absolute inline-flex h-full w-full rounded-full bg-[#07382c]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#07382c]" />
              </span>
              Free · Open source · Apache-2.0
            </div>

            <h1 className="nb-reveal mt-7 text-balance font-display text-5xl font-semibold leading-[1.04] text-[#07382c] sm:text-6xl lg:text-[5rem]" style={{ animationDelay: '120ms' }}>
              The AI-native backend
              <br className="hidden sm:block" /> with{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">real memory</span>
                <span className="absolute inset-x-0 bottom-1 -z-0 h-4 rounded-full bg-[var(--nb-yellow)]" />
              </span>
              .
            </h1>

            <p className="nb-reveal mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-[#0a4636]" style={{ animationDelay: '180ms' }}>
              Memory, Database, Auth, Storage and an AI&nbsp;Gateway in one free, self-hostable
              service — built for AI apps and coding agents. Connect Claude or Codex in a single
              command.
            </p>

            <div className="nb-reveal mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '260ms' }}>
              <Link
                href="/studio/login"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--nb-ink)] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#07382c]/20 transition-transform hover:-translate-y-0.5"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={GH}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-[var(--nb-ink)] shadow-lg shadow-[#07382c]/10 transition-transform hover:-translate-y-0.5"
              >
                <Star className="h-4 w-4" /> Star on GitHub
              </Link>
            </div>

            {/* terminal command card */}
            <div className="nb-reveal mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl bg-[var(--nb-charcoal)] text-left shadow-2xl shadow-[#07382c]/30" style={{ animationDelay: '340ms' }}>
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/50">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-orange)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-yellow)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--nb-mint)]" />
                </span>
                <span className="ml-2">one command — free, instant</span>
              </div>
              <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-7 text-white/85">
<span className="text-white/40"># connect your AI coding agent (Claude Code / Codex)</span>{'\n'}
<span className="text-white">npx -y </span><span className="text-[var(--nb-mint)]">nubase_cli@latest</span><span className="text-white"> install-skills</span>{'\n\n'}
<span className="text-white/40"># or self-host the whole stack</span>{'\n'}
<span className="text-white">docker run -p 3000:3000 -p 9999:9999 </span><span className="text-[var(--nb-mint)]">ottermind/nubase</span>
              </pre>
            </div>
          </div>
        </div>

        {/* soft wave divider into white */}
        <div className="relative -mb-px">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-12 w-full md:h-16" aria-hidden="true">
            <path d="M0 80 L0 40 C 360 0 1080 0 1440 40 L1440 80 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ======================================================== TOOLCHAIN */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--nb-green)]">
              Everything in one service
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--nb-ink)] sm:text-5xl">
              The Nubase backend toolchain
            </h2>
            <p className="mt-4 text-[var(--nb-dim)]">
              One backend, six primitives. Built for AI from the ground up — Memory as a first-class
              citizen, the same per-project token model everywhere, and isolation by default.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRIMITIVES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="nb-card flex flex-col p-7">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: p.tint, color: p.ink }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {p.tag && (
                      <span className="rounded-full bg-[var(--nb-mint-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--nb-green-deep)]">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[var(--nb-ink)]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--nb-dim)]">{p.body}</p>
                </div>
              );
            })}
          </div>

          {/* stats strip */}
          <div className="mt-14 grid overflow-hidden rounded-3xl border border-[var(--nb-line)] bg-[var(--nb-bg-2)] sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(([n, label], i) => (
              <div key={label} className={`p-7 ${i > 0 ? 'border-t border-[var(--nb-line)] sm:border-t-0 sm:border-l lg:border-t-0' : ''}`}>
                <div className="font-display text-5xl font-semibold nb-gradient-text">{n}</div>
                <div className="mt-2 text-sm text-[var(--nb-dim)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== INTEGRATIONS */}
      <section className="nb-yellow-band relative overflow-hidden py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 nb-dots opacity-30" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a5c00]">
              Plays well with your stack
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[#3a2d00] sm:text-5xl">
              Use your favorite tools
            </h2>
            <p className="mt-4 text-[#5e4a00]">
              Nubase speaks the protocols you already use — OpenAI &amp; Anthropic APIs,
              PostgREST-style REST, S3 storage and MCP for coding agents.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {INTEGRATIONS.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-2xl bg-white px-4 py-5 text-center font-display text-base font-semibold text-[var(--nb-ink)] shadow-[0_10px_30px_-22px_rgba(74,45,0,0.7)] transition-transform hover:-translate-y-1"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= ORANGE CTA */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container">
          <div className="nb-orange-band relative overflow-hidden rounded-[2rem] px-8 py-12 lg:px-16 lg:py-14">
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 nb-blob bg-white/15 blur-2xl" />
            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
              <div className="flex items-center gap-5">
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/25 sm:flex">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#4a1c0f] sm:text-4xl">
                    Not sure where to start?
                  </h2>
                  <p className="mt-2 max-w-xl text-[#5a2615]">
                    Tell your AI coding agent to wire up Nubase, or follow the quickstart — you’ll
                    have memory, a database and auth running in minutes.
                  </p>
                </div>
              </div>
              <Link
                href="/docs/getting-started"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--nb-ink)] px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Read the quickstart <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= TESTIMONIAL */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--nb-line)] bg-[var(--nb-bg-2)] px-8 py-12 text-center lg:px-14">
            <Quote className="mx-auto h-9 w-9 text-[var(--nb-mint)]" />
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-[var(--nb-ink)] sm:text-[28px]">
              “One image, one command — and my agent had a real backend with{' '}
              <span className="text-[var(--nb-green)]">durable memory</span>, auth and storage. No
              vendor lock-in, no per-seat pricing.”
            </p>
            <div className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--nb-dim)]">
              Built for AI-native apps &amp; AI coding
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= LEARN/GROW */}
      <section className="nb-cream-band py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--nb-green)]">
              Learn, explore, grow
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--nb-ink)] sm:text-5xl">
              Everything you need to ship
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {LEARN.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="nb-card flex flex-col p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nb-mint-soft)] text-[var(--nb-green-deep)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[var(--nb-ink)]">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--nb-dim)]">{c.body}</p>
                  <Link
                    href={c.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nb-green)] transition-colors hover:text-[var(--nb-green-deep)]"
                  >
                    {c.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* trust row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-[var(--nb-dim)]">
            {[
              [ShieldCheck, 'Isolation by default'],
              [Layers, 'Multi-project control plane'],
              [Boxes, 'Bring your own model'],
              [Github, 'Apache-2.0, free forever'],
            ].map(([Ic, t]) => {
              const I = Ic as LucideIcon;
              return (
                <span key={t as string} className="inline-flex items-center gap-2">
                  <I className="h-4 w-4 text-[var(--nb-green)]" /> {t as string}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= FINAL CTA */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="nb-mint-band relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute inset-0 nb-dots-light opacity-50" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 nb-blob bg-[var(--nb-yellow)]/30 blur-2xl" />
            <div className="relative">
              <Github className="mx-auto h-8 w-8 text-[#07382c]" />
              <h2 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-semibold text-[#07382c] sm:text-5xl">
                Give your AI app real memory — in one line.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#0a4636]">
                Free, open and self-hosted under Apache-2.0. A durable memory layer and a real
                backend from day one.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/studio/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--nb-ink)] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#07382c]/20 transition-transform hover:-translate-y-0.5"
                >
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={GH}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-[var(--nb-ink)] shadow-lg shadow-[#07382c]/10 transition-transform hover:-translate-y-0.5"
                >
                  <Star className="h-4 w-4" /> Star on GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
