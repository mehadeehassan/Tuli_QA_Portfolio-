import { SimpleChatWidget } from '@/components/site/SimpleChatWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const resumeUrl = '/Tuli_Resume.pdf';
const gmailComposeUrl =
  'https://mail.google.com/mail/?view=cm&fs=1&to=ferdousibegum1108@gmail.com';

const skills = [
  { label: 'Automation Testing', value: 'Playwright · Jest · API flows', icon: Code2 },
  { label: 'Manual Testing', value: 'Functional · Regression · Smoke · UAT', icon: ClipboardCheck },
  { label: 'API Testing', value: 'Postman · backend validation', icon: Terminal },
  { label: 'Defect Tracking', value: 'Jira · Zephyr · TestRail', icon: ShieldCheck },
  { label: 'Data Validation', value: 'MySQL · PhpMyAdmin · SQL', icon: CheckCircle2 },
  { label: 'Agile Delivery', value: 'Scrum · SDLC · STLC · Confluence', icon: Sparkles },
];

const toolGroups = [
  { title: 'Testing', items: ['Playwright', 'Jest', 'Postman', 'Zephyr', 'TestRail'] },
  { title: 'Project & Docs', items: ['Jira', 'Confluence', 'Slack', 'GitHub'] },
  { title: 'Engineering', items: ['JavaScript', 'PHP', 'Laravel', 'MySQL', 'Git'] },
  { title: 'Platforms', items: ['Web Apps', 'Android', 'iOS', 'Linux CLI'] },
];

const timeline = [
  {
    period: 'Feb 2025 - Present',
    role: 'Software Quality Assurance',
    company: 'StarConnect',
    context: 'Web · Android · iOS',
    points: [
      'Executed manual test cases for web, Android, and iOS applications.',
      'Performed functional, regression, smoke, and UAT testing before releases.',
      'Designed, executed, and maintained test cases using Jira, Zephyr, and TestRail.',
      'Conducted automation testing using Playwright and API tests with Jest.',
      'Performed API testing using Postman and validated backend data with MySQL and PhpMyAdmin.',
      'Collaborated with team members via Slack and documented test results in Confluence.',
      'Applied SDLC and STLC methodologies to improve testing practices in an Agile environment.',
    ],
  },
  {
    period: 'Jul 2024 - Dec 2024',
    role: 'Junior SQA Engineer',
    company: 'TMSS',
    context: 'Microfinance web application',
    points: [
      'Performed manual testing on a microfinance web application.',
      'Executed functional, regression, and smoke testing.',
      'Created and executed test cases using Zephyr.',
      'Reported and tracked bugs to ensure timely fixes.',
      'Verified application workflows and business requirements.',
      'Followed SDLC and STLC processes in an Agile environment.',
    ],
  },
];

const navItems = ['About', 'Skills', 'Experience', 'Projects', 'Contact'];

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.title = 'Ferdousi Begum Tuli | QA Engineer';
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" onClick={closeMenu}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.3)]">
              <span className="font-mono text-sm font-bold">&lt;/&gt;</span>
            </span>
            <span className="font-mono text-sm font-semibold tracking-tight">tuli.qa</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle color theme"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="hidden rounded-full px-4 sm:flex" asChild>
              <a href={resumeUrl} target="_blank" rel="noreferrer">
                Resume <Download className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="border-t border-border/60 bg-card px-5 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={closeMenu}
                className="block border-b border-border/50 py-3 text-sm text-muted-foreground last:border-0"
              >
                {item}
              </a>
            ))}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center gap-2 py-3 text-sm font-medium text-primary"
            >
              Download resume <Download className="h-4 w-4" />
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        {/* <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 overflow-hidden px-5 py-20 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:py-24"> */}
        {/* <div
            className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          /> */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div
            className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:py-24">
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Available for QA opportunities
              </div>
              <p className="mb-4 font-mono text-sm text-muted-foreground">Hello, I’m</p>
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-7xl">
                Ferdousi Begum <span className="text-primary">Tuli</span>
              </h1>
              <div className="mt-6 flex items-center gap-3 font-mono text-lg text-muted-foreground sm:text-xl">
                <span className="text-primary">&gt;</span>
                <span>Software Quality Assurance Engineer</span>
              </div>
              <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                I test products with curiosity, structure, and a sharp eye for the details that
                shape a reliable user experience. From manual scenarios to automated API checks, I
                help teams ship with confidence.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button className="rounded-full px-5" asChild>
                  <a href="#contact">
                    Let’s work together <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="rounded-full px-5" asChild>
                  <a href="#experience">
                    View experience <ArrowDownRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-primary" /> ferdousibegum1108@gmail.com
                </a>
                <a
                  href="tel:+8801627832102"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 text-primary" /> +880 1627 832102
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
              <div
                className="absolute -inset-5 rounded-[2rem] border border-primary/15"
                aria-hidden="true"
              />
              <Card className="relative overflow-hidden border-primary/20 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur">
                <CardHeader className="border-b border-border/60 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
                      <span className="h-2.5 w-2.5 rounded-full bg-chart-4" />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      quality_report.json
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6 font-mono text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-chart-4">{`{`}</span>
                    <span className="ml-3">
                      "engineer": <span className="text-primary">"Tuli"</span>,
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="ml-3">
                      "focus": <span className="text-primary">"quality"</span>,
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="ml-3">"automation": [</span>
                  </div>
                  <div className="ml-6 space-y-2 text-chart-4">
                    <div>"Playwright",</div>
                    <div>"Jest",</div>
                    <div>"Postman"</div>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="ml-3">],</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="ml-3">
                      "status": <span className="text-chart-4">"ready_to_ship"</span>
                    </span>
                  </div>
                  <div className="text-chart-4">{`}`}</div>
                  <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-5 text-xs text-chart-4">
                    <CheckCircle2 className="h-4 w-4" /> all critical paths verified
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <SectionLabel>About me</SectionLabel>
              <h2 className="max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">
                Quality is not a final step. It’s a way of building.
              </h2>
            </div>
            <div className="max-w-3xl space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                I’m a Software Quality Assurance Engineer focused on creating clear, repeatable, and
                meaningful testing practices across web, Android, and iOS applications.
              </p>
              <p>
                My work blends hands-on manual testing with automation, API validation, backend data
                checks, and close collaboration with product teams. I care about finding the right
                bugs early, explaining them clearly, and helping teams turn feedback into better
                products.
              </p>
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-2xl font-semibold text-foreground">2+</p>
                  <p className="text-sm">years in QA</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-2xl font-semibold text-foreground">3</p>
                  <p className="text-sm">platforms tested</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-2xl font-semibold text-foreground">7+</p>
                  <p className="text-sm">core QA practices</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="border-y border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
            <SectionLabel>What I do</SectionLabel>
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                A practical QA toolkit for confident releases.
              </h2>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Structured testing from the first requirement to the final release signal.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map(({ label, value, icon: Icon }) => (
                <Card
                  key={label}
                  className="group border-border/70 bg-background/60 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40"
                >
                  <CardContent className="p-6">
                    <Icon className="mb-8 h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <SectionLabel>Experience</SectionLabel>
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Experience that keeps the user in focus.
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              /career.log · dhaka, bangladesh
            </p>
          </div>
          <div className="space-y-10">
            {timeline.map((job) => (
              <article
                key={job.company}
                className="grid gap-5 border-t border-border/70 pt-7 lg:grid-cols-[0.34fr_0.66fr]"
              >
                <div>
                  <p className="font-mono text-sm text-primary">{job.period}</p>
                  <h3 className="mt-2 text-xl font-semibold">{job.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company} · {job.context}
                  </p>
                </div>
                <ul className="space-y-3">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="border-y border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
            <SectionLabel>Selected work</SectionLabel>
            <h2 className="mb-10 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Testing work that makes product behavior visible.
            </h2>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="border-primary/25 bg-primary/5">
                <CardContent className="p-6">
                  <div className="mb-12 flex items-center justify-between">
                    <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-xs text-primary">
                      OPEN SOURCE
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">MockWave QA</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Manual feature verification, API testing with Postman, and automated API
                    coverage using Jest.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Jest', 'Postman', 'API testing'].map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-12 flex items-center justify-between">
                    <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
                      CASE STUDY
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Microfinance Workflow QA</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Functional, regression, and smoke testing of workflows and business requirements
                    for a microfinance web application.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Zephyr', 'Regression', 'UAT'].map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-12 flex items-center justify-between">
                    <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
                      QA SYSTEM
                    </span>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Release Confidence</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    A cross-platform quality practice covering web, Android, iOS, backend data, test
                    documentation, and Agile collaboration.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Playwright', 'MySQL', 'Jira'].map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <SectionLabel>Tools & technologies</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolGroups.map((group) => (
              <div key={group.title} className="rounded-xl border border-border/70 bg-card/40 p-5">
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  {group.title}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/30">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionLabel>Education</SectionLabel>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Bachelor of Science in Computer Science & Engineering
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Northern University Bangladesh · Dhaka
                  </p>
                  <p className="mt-1 font-mono text-xs text-primary">2025 - Present</p>
                </div>
              </div>
              <div className="mt-8 border-t border-border/70 pt-6">
                <p className="font-semibold">Diploma in Computer Science & Technology</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Feni Computer Institute · Feni, Bangladesh
                </p>
              </div>
            </div>
            <div>
              <SectionLabel>Coursework</SectionLabel>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold">
                    Web Application Development with PHP and Laravel
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Ostad · June 2024 to December 2024
                  </p>
                  <a
                    href="https://ostad.app"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View course platform <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 p-8 sm:p-12">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative max-w-2xl">
              <SectionLabel>Contact</SectionLabel>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Let’s make quality a product advantage.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Have a product to test, a release to strengthen, or a QA process to build? I’d love
                to hear what you’re working on.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="rounded-full px-5" asChild>
                  <a href="mailto:ferdousibegum1108@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Send an email <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="rounded-full px-5" asChild>
                  <a href={resumeUrl} target="_blank" rel="noreferrer">
                    Download resume <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>

                <a
                  href="tel:+8801627832102"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="h-4 w-4" /> Phone
                </a>

                <a
                  href="https://www.linkedin.com/in/ferdousi-begum-tuli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>

                <a
                  href="https://github.com/ferdousibegumtuli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Ferdousi Begum Tuli · Built for quality.</p>
          <p className="font-mono text-xs">manual minds · automated confidence</p>
        </div>
      </footer>
      <SimpleChatWidget title="Tuli QA Assistant" placeholder="Ask about Tuli’s QA experience..." />
    </div>
  );
}
