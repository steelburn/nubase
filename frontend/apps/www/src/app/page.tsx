import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Brain,
  Clock,
  Database,
  Github,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  Plug,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { Hero } from '@/components/hero';

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

// Ordered by how broadly an app needs them: data & identity, then the deploy
// layer (Assets + Functions), then AI enhancements and scheduling.
const PRIMITIVES: Primitive[] = [
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
    icon: Globe,
    title: 'Assets',
    tag: 'publish frontend',
    body: 'Publish the generated frontend to a public CDN at /assets/v1 — your agent uploads HTML/CSS/JS and gets a live URL. No separate static host.',
    tint: 'var(--nb-mint-soft)',
    ink: 'var(--nb-green-deep)',
  },
  {
    icon: Zap,
    title: 'Functions',
    tag: 'deploy logic',
    body: 'Deploy AI-written backend logic as edge functions at /functions/v1 — per-function secrets, logs, verify_jwt, on a local or Cloudflare runtime.',
    tint: 'var(--nb-yellow-soft)',
    ink: '#b8860b',
  },
  {
    icon: Sparkles,
    title: 'AI Gateway',
    body: 'Bring your own model. One gateway, OpenAI- and Anthropic-compatible, with per-project keys and usage tracking.',
    tint: '#efe6fb',
    ink: '#7c3aed',
  },
  {
    icon: Brain,
    title: 'Memory',
    tag: 'first-class',
    body: 'A real memory layer for AI apps. Facts are extracted, embedded and recalled with a hybrid engine — not a bolted-on vector script.',
    tint: 'var(--nb-mint-soft)',
    ink: 'var(--nb-green-deep)',
  },
  {
    icon: Clock,
    title: 'cron',
    body: 'Schedule recurring jobs — invoke an edge function or a database function on a crontab, run by the control plane with run history.',
    tint: 'var(--nb-orange-soft)',
    ink: '#d8542f',
  },
];

// From prompt to production — the whole point: configure once, then your agent
// builds and ships the app online without a separate hosting account.
const STEPS: { icon: LucideIcon; n: string; title: string; body: string }[] = [
  {
    icon: Plug,
    n: '1',
    title: 'Connect the plugin',
    body: 'One command wires Claude Code or Codex to Nubase over MCP — install-skills, authorize, done.',
  },
  {
    icon: Boxes,
    n: '2',
    title: 'Build with your agent',
    body: 'It models the data, sets up auth and storage, and writes your backend logic against stable APIs.',
  },
  {
    icon: Rocket,
    n: '3',
    title: 'Deploy from the chat',
    body: 'The agent publishes the frontend to Assets, deploys Functions and schedules cron — no separate host.',
  },
  {
    icon: Globe,
    n: '4',
    title: 'It’s live',
    body: 'A public URL, a real backend, recurring jobs running. Generate → live, on infrastructure you own.',
  },
];

const STATS: [string, string][] = [
  ['8', 'modules in one service'],
  ['1', 'command to connect your agent'],
  ['1', 'platform: frontend + backend + cron'],
  ['0', 'vendor lock-in · Apache-2.0'],
];

const INTEGRATIONS = [
  'Claude Code', 'Codex', 'Cursor', 'OpenAI', 'Anthropic', 'PostgreSQL',
  'pgvector', 'Cloudflare R2', 'Cloudflare Workers', 'AWS S3', 'Docker', 'MCP',
];

const LEARN: { icon: LucideIcon; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: Rocket,
    title: 'Deploy an app',
    body: 'Generate → live: model the data, deploy Functions, publish the frontend to Assets and schedule cron — all from your agent.',
    href: '/docs/getting-started',
    cta: 'Read the guide',
  },
  {
    icon: MessagesSquare,
    title: 'Community',
    body: 'Star the repo, open issues, and shape the roadmap. Nubase is Apache-2.0 and built in the open.',
    href: GH,
    cta: 'Join on GitHub',
  },
  {
    icon: LifeBuoy,
    title: 'Self-host',
    body: 'One Docker image bundles Postgres, Redis, the API and Studio. Run unlimited projects on your own box.',
    href: '/docs/concepts',
    cta: 'See the architecture',
  },
];

/* --------------------------------------------------------------------- page */

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />

      {/* ====================================================== HOW IT WORKS */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--nb-green)]">
              From prompt to production
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--nb-ink)] sm:text-5xl">
              Configure once. Ship from the chat.
            </h2>
            <p className="mt-4 text-[var(--nb-dim)]">
              No separate hosting account, no glue scripts. Wire up the plugin once and your agent
              takes a generated app all the way to a live URL.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="nb-card relative flex flex-col p-7">
                  <span className="absolute right-6 top-6 font-display text-4xl font-semibold text-[var(--nb-line)]">
                    {s.n}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nb-mint-soft)] text-[var(--nb-green-deep)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-[var(--nb-ink)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--nb-dim)]">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== TOOLCHAIN */}
      <section className="nb-cream-band py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--nb-green)]">
              Everything in one service
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--nb-ink)] sm:text-5xl">
              Eight modules to ship an app
            </h2>
            <p className="mt-4 text-[var(--nb-dim)]">
              Data and identity, a place to publish the frontend, edge functions for backend logic,
              scheduled jobs, an AI gateway and durable memory — the same per-project token model
              everywhere, isolation by default.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-14 grid overflow-hidden rounded-3xl border border-[var(--nb-line)] bg-white sm:grid-cols-2 lg:grid-cols-4">
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
              PostgREST-style REST, S3 storage, a Workers runtime and MCP for coding agents.
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
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#4a1c0f] sm:text-4xl">
                    Not sure where to start?
                  </h2>
                  <p className="mt-2 max-w-xl text-[#5a2615]">
                    Connect the plugin and tell your agent to build something — you’ll have a live
                    frontend, backend functions and a database running in minutes.
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
              “One command to connect, then my agent shipped the whole thing —{' '}
              <span className="text-[var(--nb-green)]">frontend, backend and a cron job</span>, live
              on a URL. No separate host, no vendor lock-in.”
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
                Turn AI-written code into a real app — in one command.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#0a4636]">
                Free, open and self-hosted under Apache-2.0. Connect the plugin once, then ship the
                frontend, backend and cron from your coding agent.
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
