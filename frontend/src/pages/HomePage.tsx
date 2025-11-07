import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  Activity,
  Check,
  GitBranch,
  Layers,
  LockKeyhole,
  Plug,
  Server,
  Terminal,
} from 'lucide-react';
import { API_BASE, getCollectionStats } from '../lib/api';

import { UnifiedNavigation } from '../components/UnifiedNavigation';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

// Key value props for users (not tech stack)
const SIGNALS = [
  {
    label: 'Privacy',
    title: 'Local-first',
    description:
      'No telemetry or tracking. Your data stays on your device unless you choose to sync or export.',
  },
  {
    label: 'Open',
    title: 'No vendor lock-in',
    description:
      'Collections and requests are plain JSON. Move, version, or share them however you want.',
  },
  {
    label: 'Free',
    title: 'Truly open source',
    description:
      'No paywalls or feature gates. All core features are available to everyone.',
  },
];

const CAPABILITIES = [
  {
    name: 'Git-native collections',
    description:
      'Export collections as clean JSON. Commit, branch, and diff requests alongside your code without vendor lock-in.',
    icon: GitBranch,
  },
  {
    name: 'Focused request builder',
    description:
      'HTTP method dropdown, URL autocomplete, and JSON body editor with real-time syntax highlighting and validation.',
    icon: Terminal,
  },
  {
    name: 'Local environment variables',
    description:
      'Store API keys, tokens, and base URLs in encrypted local storage. Switch environments with zero cloud dependency.',
    icon: LockKeyhole,
  },
  {
    name: 'Searchable request history',
    description:
      'Every sent request gets saved locally. Filter by URL, method, or status code to replay any previous call instantly.',
    icon: Layers,
  },
  {
    name: 'Built-in CORS proxy',
    description:
      'Route requests through localhost:3001 to bypass browser CORS restrictions. Test any remote API without extra setup.',
    icon: Plug,
  },
  {
    name: 'Response time tracking',
    description:
      'Monitor latency, payload size, and error rates. Export metrics as CSV or integrate with your monitoring dashboard.',
    icon: Activity,
  },
];

const LOOP = [
  {
    step: '01',
    title: 'Frame the call',
    detail:
      'Choose the method, path, and headers in the command palette or via the form—everything responds instantly.',
  },
  {
    step: '02',
    title: 'Probe and learn',
    detail:
      'Send, inspect formatted responses, view raw headers, and annotate notes inline for the next teammate.',
  },
  {
    step: '03',
    title: 'Commit or share',
    detail:
      'Save to history, add it to a collection, export the file, or push it through git. Every flow remains portable.',
  },
];

const FAQ = [
  {
    question: 'Why build another API client?',
    answer:
      'Postman Lite exists for teams that value speed, clarity, and source control. No pop-ups, no cloud sync you never asked for—just tooling you can trust.',
  },
  {
    question: 'How opinionated is the workflow?',
    answer:
      'Not at all. Collections and environments are just structured JSON. Ship them with git, s3, or whichever process your team already uses.',
  },
  {
    question: 'Can we integrate it with CI?',
    answer:
      'Yes. Collections are text-based, so you can lint and run them through your own automation or convert them into smoke tests.',
  },
  {
    question: 'Does it require an account?',
    answer:
      'You can explore locally without signing in. Accounts unlock sync with the backend when you need collaboration.',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    totalCollections: number;
    totalRequests: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getCollectionStats();
        if (mounted)
          setStats(data as { totalCollections: number; totalRequests: number });
      } catch {
        // ignore
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };

    const ping = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch(`${API_BASE}/api/collections`, {
          method: 'GET',
          credentials: 'include',
        });
        const t1 = performance.now();
        if (mounted) {
          setLatency(Math.round(t1 - t0));
          setStatus(res.status);
        }
      } catch {
        if (mounted) {
          setLatency(null);
          setStatus(null);
        }
      }
    };

    loadStats();
    ping();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <UnifiedNavigation variant="homepage" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 md:pt-24">
        <section className="grid items-center gap-10 text-left md:grid-cols-[1.1fr_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-xs uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))]"
            >
              Open source • Free forever
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                The open API client for focused teams
              </h1>
              <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
                Postman Lite is a fast, distraction-free workspace for building,
                testing, and sharing API requests. No ads, no tracking, no
                forced cloud sync—just the essentials for productive API work.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>
                  Save and organize requests in collections you control.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>
                  Replay, edit, and export any call—no vendor lock-in.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>Work locally or sync with your team when you want.</span>
              </li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition hover:bg-[hsl(var(--primary)/.90)]"
                onClick={() => navigate('/app')}
              >
                Open workspace
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground)/.10)]"
                onClick={() =>
                  window
                    .open(
                      'https://github.com/PankajKumardev/Postman-Lite',
                      '_blank'
                    )
                    ?.focus?.()
                }
              >
                View on GitHub
              </Button>
            </div>
          </div>

          <Card className="border shadow-xl bg-[hsl(var(--card))] border-[hsl(var(--border))]">
            <CardHeader className="border-b pb-4 border-[hsl(var(--border))]">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                <span>Preview</span>
                <span className="text-[hsl(var(--primary))]">LIVE</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-3 rounded-lg border p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  <span className="rounded-sm px-2 py-1 font-medium bg-[hsl(var(--muted))] text-[hsl(var(--primary))]">
                    GET
                  </span>
                  <span>{`${API_BASE}/api/collections`}</span>
                </div>
                <div className="rounded-md border p-3 text-xs border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  <div className="mb-2 flex items-center justify-between">
                    <span>Latency</span>
                    <span className="text-[hsl(var(--primary))]">
                      {latency != null ? `${latency} ms` : '—'}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span>Status</span>
                    <span className="text-[hsl(var(--success,120_60%_40%))]">
                      {status ?? '—'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {stats
                      ? JSON.stringify(
                          {
                            totalCollections: stats.totalCollections,
                            totalRequests: stats.totalRequests,
                          },
                          null,
                          2
                        )
                      : '[ { "id": 1, "name": "Payments v2", "requests": 12 } ]'}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Stripe Integration
                </div>
                <div className="mt-3 space-y-2 text-xs text-[hsl(var(--foreground))]">
                  <div className="flex items-center justify-between">
                    <span>Create payment intent</span>
                    <span className="text-[hsl(var(--success,120_60%_40%))]">
                      POST
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capture payment</span>
                    <span className="text-[hsl(var(--success,120_60%_40%))]">
                      POST
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>List customers</span>
                    <span className="text-[hsl(var(--primary))]">GET</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cancel subscription</span>
                    <span className="text-[hsl(var(--destructive))]">
                      DELETE
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {SIGNALS.map(({ label, title, description }) => (
            <Card
              key={title}
              className="border bg-[hsl(var(--card))] border-[hsl(var(--border))]"
            >
              <CardContent className="space-y-3 p-6">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                  {label}
                </span>
                <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  {title}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="border bg-[hsl(var(--card))] border-[hsl(var(--border))]">
            <CardContent className="space-y-3 p-6">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                Stats
              </span>
              <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Your workspace
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {statsLoading
                  ? 'Loading...'
                  : stats
                  ? `${stats.totalCollections} collections · ${stats.totalRequests} requests`
                  : 'No data available'}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 space-y-10">
          <div className="flex flex-col gap-3 text-left">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] md:text-3xl">
              What you can do with Postman Lite
            </h2>
            <p className="max-w-3xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
              Everything you need for API development, nothing you don’t. No
              distractions, no bloat—just a clear, fast workspace for your
              requests and collections.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {CAPABILITIES.map(({ name, description, icon: Icon }) => (
              <Card
                key={name}
                className="flex h-full flex-col border bg-[hsl(var(--card))] border-[hsl(var(--border))]"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-blue-600 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                      {name}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 rounded-2xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-8 md:grid-cols-[1.2fr_minmax(0,0.8fr)] md:p-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] md:text-3xl">
              Your API workflow, simplified
            </h2>
            <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
              From first request to final commit, Postman Lite keeps every step
              clear and under your control.
            </p>
            <div className="space-y-6">
              {LOOP.map(({ step, title, detail }) => (
                <div key={step} className="flex gap-4">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-xs font-semibold text-[hsl(var(--primary))]">
                    {step}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))] md:text-base">
                      {title}
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-[hsl(var(--muted))] border-[hsl(var(--border))] p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
              <span>Workspace status</span>
              <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-[hsl(var(--foreground))]">
              <div className="flex items-center justify-between border-b pb-4 border-[hsl(var(--border))]">
                <span>Collections</span>
                <span className="text-[hsl(var(--primary))]">
                  {stats?.totalCollections ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-4 border-[hsl(var(--border))]">
                <span>Requests</span>
                <span className="text-[hsl(var(--primary))]">
                  {stats?.totalRequests ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latency</span>
                <span className="text-[hsl(var(--primary))]">
                  {latency != null ? `${latency} ms` : '—'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-6 flex flex-col gap-2 text-left md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                Frequently asked
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Clear answers about how Postman Lite works and what it does.
              </p>
            </div>
          </div>
          <Accordion
            type="single"
            collapsible
            className="divide-y rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] divide-[hsl(var(--border))]"
          >
            {FAQ.map(({ question, answer }, index) => (
              <AccordionItem key={question} value={`item-${index + 1}`}>
                <AccordionTrigger className="px-6 text-left text-base font-medium text-[hsl(var(--foreground))] hover:text-blue-600 dark:hover:text-blue-400">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-sm text-[hsl(var(--muted-foreground))]">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-20 flex w-full flex-col items-center gap-4 rounded-2xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] md:text-3xl">
            Try Postman Lite now
          </h2>
          <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
            Import a curl, replay a saved call, or build a new collection in
            minutes. No registration required—just open the workspace and start
            working.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/.90)]"
              onClick={() => navigate('/app')}
            >
              Open Postman Lite
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]"
              onClick={() => navigate('/login')}
            >
              Sign in or create account
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};
