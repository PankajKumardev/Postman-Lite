import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  Activity,
  Check,
  GitBranch,
  Layers,
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
    label: 'Simple',
    title: 'Easy to use',
    description:
      'Clean interface for testing APIs. Build and send requests quickly without complexity.',
  },
  {
    label: 'Open',
    title: 'No vendor lock-in',
    description:
      'Collections and requests are plain JSON. Export and share them however you want.',
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
    name: 'Collections Management',
    description:
      'Create, organize, and manage API request collections. Export as JSON for version control and easy sharing.',
    icon: GitBranch,
  },
  {
    name: 'Request Builder',
    description:
      'Build HTTP requests with method selection, URL input, headers, and JSON body editor with syntax highlighting.',
    icon: Terminal,
  },
  {
    name: 'Request History',
    description:
      'View and manage your request history. Replay previous requests instantly without losing any data.',
    icon: Layers,
  },
  {
    name: 'Response Viewer',
    description:
      'View formatted JSON responses, status codes, and response times. Clean interface for analyzing API responses.',
    icon: Activity,
  },
  {
    name: 'JSON Formatting',
    description:
      'Automatic syntax highlighting and formatting for JSON request bodies and responses. Makes reading API data easy.',
    icon: Server,
  },
  {
    name: 'Export & Import',
    description:
      'Export collections as JSON files. Import and share collections with your team or keep them in version control.',
    icon: Check,
  },
];

const LOOP = [
  {
    step: '01',
    title: 'Build your request',
    detail:
      'Select HTTP method, enter URL, add headers and body. Simple form interface makes it quick and easy.',
  },
  {
    step: '02',
    title: 'Send and view response',
    detail:
      'Execute your request and view formatted JSON responses with status codes and response times.',
  },
  {
    step: '03',
    title: 'Save to collection',
    detail:
      'Organize requests in collections. Export as JSON files for backup or sharing with your team.',
  },
];

const FAQ = [
  {
    question: 'What is Postman Lite?',
    answer:
      'Postman Lite is a simple, open-source API testing tool. Build, test, and organize your API requests in a clean interface.',
  },
  {
    question: 'What features does it have?',
    answer:
      'You can create and manage collections, build HTTP requests, view formatted responses, and access your request history.',
  },
  {
    question: 'Is it really free?',
    answer:
      'Yes, completely free and open source. No hidden costs, no premium features, no subscriptions.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No account required. You can use all features without signing up. Create an account only if you want to save data on the server.',
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
      setStatsLoading(true);
      try {
        const data = await getCollectionStats();
        if (mounted) {
          setStats(data as { totalCollections: number; totalRequests: number });
        }
      } catch {
        // User not logged in or error - leave stats as null
        if (mounted) {
          setStats(null);
        }
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
              Open source - Free forever
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                A simple API testing tool
              </h1>
              <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
                Postman Lite is a lightweight tool for testing APIs. Build
                requests, organize collections, and view responses in a clean,
                simple interface.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>Create and organize API requests in collections.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>View formatted JSON responses and status codes.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-[hsl(var(--primary))]" />
                <span>Access request history and replay previous calls.</span>
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
                      {latency != null ? `${latency} ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span>Status</span>
                    <span className="text-[hsl(var(--success,120_60%_40%))]">
                      {status ?? 'N/A'}
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
                Workspace
              </span>
              <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {statsLoading
                  ? 'Loading...'
                  : stats
                  ? 'Your stats'
                  : 'Sign in to view'}
              </p>
              <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                {statsLoading ? (
                  <p>Fetching data...</p>
                ) : stats ? (
                  <>
                    <div className="flex justify-between">
                      <span>Collections</span>
                      <span className="text-[hsl(var(--foreground))]">
                        {stats.totalCollections}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requests</span>
                      <span className="text-[hsl(var(--foreground))]">
                        {stats.totalRequests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency</span>
                      <span className="text-[hsl(var(--primary))]">
                        {latency != null ? `${latency} ms` : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>Login to see your workspace statistics</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 space-y-10">
          <div className="flex flex-col gap-3 text-left">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] md:text-3xl">
              Features
            </h2>
            <p className="max-w-3xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
              Simple and focused features for API testing. Everything you need
              without the complexity.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {CAPABILITIES.map(({ name, description, icon: Icon }) => (
              <Card
                key={name}
                className="flex h-full flex-col border bg-[hsl(var(--card))] border-[hsl(var(--border))]"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--primary))]">
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
              How it works
            </h2>
            <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
              Simple workflow to test your APIs. Create requests, get responses,
              and save them for later.
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
              <Server className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-[hsl(var(--foreground))]">
              <div className="flex items-center justify-between border-b pb-4 border-[hsl(var(--border))]">
                <span>Collections</span>
                <span className="text-[hsl(var(--primary))]">
                  {stats?.totalCollections ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-4 border-[hsl(var(--border))]">
                <span>Requests</span>
                <span className="text-[hsl(var(--primary))]">
                  {stats?.totalRequests ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latency</span>
                <span className="text-[hsl(var(--primary))]">
                  {latency != null ? `${latency} ms` : 'N/A'}
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
                <AccordionTrigger className="px-6 text-left text-base font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]">
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
            Get started with Postman Lite
          </h2>
          <p className="max-w-2xl text-sm text-[hsl(var(--muted-foreground))] md:text-base">
            Start testing your APIs right away. No complex setup required - just
            open and start building requests.
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
              className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/.7)]"
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
