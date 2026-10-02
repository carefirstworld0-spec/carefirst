import { createFileRoute } from "@tanstack/react-router";
import { useState, createElement, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Cloud,
  CreditCard,
  FileHeart,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Play,
  Plus,
  ShieldCheck,
  Stethoscope,
  Users,
  Wallet,
  X,
  Clock3,
  Building2,
  Bell,
  BarChart3,
  BedDouble,
  Send,
  Star,
  Zap,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/carefirst-logo-horizontal.png.asset.json";
import doctorClinic from "@/assets/doctor-clinic.jpg";
import { useServerFn } from "@tanstack/react-start";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry-schema";
import { submitEnquiry } from "@/lib/enquiry.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareFirst Software Solutions | Clinic & Hospital Management Software" },
      {
        name: "description",
        content:
          "CareFirst helps clinics and hospitals simplify appointments, patient records, billing and everyday care in one connected platform.",
      },
      { property: "og:title", content: "CareFirst Software Solutions | Healthcare, made simpler" },
      {
        property: "og:description",
        content:
          "A smarter way to manage your clinic or hospital, from appointments to billing and patient care.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const nav = [
  { label: "Why CareFirst", href: "#why" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
];
const features = [
  {
    icon: FileHeart,
    title: "Patient records & EMR",
    copy: "Keep every history, note and document together.",
  },
  {
    icon: CalendarDays,
    title: "Appointments & booking",
    copy: "Keep schedules clear and waiting rooms moving.",
  },
  {
    icon: BedDouble,
    title: "OPD, IPD & beds",
    copy: "Coordinate every visit, admission and available bed.",
  },
  {
    icon: CreditCard,
    title: "Billing & insurance",
    copy: "Make invoices, payments and TPA simpler.",
  },
  {
    icon: Package,
    title: "Pharmacy & inventory",
    copy: "Stay on top of medicines, stock and supplies.",
  },
  {
    icon: FlaskConical,
    title: "Lab & radiology",
    copy: "Bring orders, results and reports into one flow.",
  },
  { icon: Users, title: "Staff & payroll", copy: "Organize teams, roles, shifts and payments." },
  {
    icon: ClipboardList,
    title: "Digital prescriptions",
    copy: "Create clear prescriptions and patient access.",
  },
  {
    icon: Bell,
    title: "WhatsApp & SMS reminders",
    copy: "Help patients remember visits and follow-ups.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    copy: "See the numbers behind better decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Security & backup",
    copy: "Control access and protect important records.",
  },
];
const problems = [
  {
    icon: FileText,
    title: "Paperwork everywhere",
    copy: "Replace scattered files with organized digital records.",
  },
  { icon: Clock3, title: "Long patient queues", copy: "Keep appointments and care teams in sync." },
  {
    icon: Wallet,
    title: "Billing mistakes",
    copy: "Bring more clarity to every charge and payment.",
  },
  {
    icon: BarChart3,
    title: "Not enough visibility",
    copy: "Understand your operations at a glance.",
  },
];
const faqs = [
  [
    "Is there a free trial?",
    "The proposed plans include a 7-day trial. Confirm availability and terms with the CareFirst team before signing up.",
  ],
  [
    "Can you help migrate our existing patient data?",
    "CareFirst can help plan a move from your current records. The exact process depends on your existing system and data format.",
  ],
  [
    "Will our team get training?",
    "Training and onboarding options can be discussed during a demo so your team can get started confidently.",
  ],
  [
    "How is patient data protected?",
    "The planned platform includes role-based access, encryption and backups. Ask for the current security documentation during a demo.",
  ],
  [
    "Can I change or cancel my plan?",
    "Please confirm billing terms, plan changes and cancellation policies with the CareFirst team.",
  ],
  [
    "What support is available?",
    "Support varies by plan. The proposed Grow and Enterprise plans include priority or dedicated support.",
  ],
  [
    "Can we manage more than one branch?",
    "Multi-branch management is included in the proposed Enterprise plan.",
  ],
  [
    "Can the software be customized?",
    "Enterprise integrations and customization can be discussed with the team.",
  ],
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#top" aria-label="CareFirst home" className="inline-flex shrink-0 items-center">
      <img
        src="https://ik.imagekit.io/dn3ch7b5a/WhatsApp_Image_2026-09-28_at_14.06.54-removebg-preview.png?updatedAt=1790594212831"
        alt="CareFirst Software Solutions"
        className={`h-20 w-auto object-contain object-left sm:h-20 md:h-24 ${inverse ? "brightness-0 invert" : ""}`}
      />
    </a>
  );
}
function SectionHeading({
  eyebrow,
  title,
  copy,
  center = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="display-title mt-3 text-3xl text-navy md:text-[42px]">{title}</h2>
      {copy && <p className="mt-4 text-base leading-7 text-muted-foreground">{copy}</p>}
    </div>
  );
}
function MiniDashboard({ variant = "Dashboard" }: { variant?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-2xl shadow-primary/15">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 font-display text-[11px] font-bold text-navy">
          <span className="grid size-5 place-items-center rounded bg-primary text-primary-foreground">
            <HeartPulse size={12} />
          </span>{" "}
          carefirst{" "}
          <span className="hidden font-normal text-muted-foreground sm:inline">/ {variant}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Bell size={13} />
          <span className="grid size-5 place-items-center rounded-full bg-secondary text-[9px] font-bold text-primary">
            DR
          </span>
        </div>
      </div>
      <div className="flex">
        <div className="hidden w-24 shrink-0 space-y-4 border-r border-border bg-muted p-3 sm:block">
          <div className="h-2 w-12 rounded bg-primary/40" />
          <div className="h-2 w-16 rounded bg-border" />
          <div className="h-2 w-12 rounded bg-border" />
          <div className="h-2 w-14 rounded bg-border" />
          <div className="h-2 w-11 rounded bg-border" />
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-display text-sm font-bold text-navy">
                {variant === "Dashboard" ? "Good morning, Dr. Mehta" : variant}
              </div>
              <div className="mt-1 text-[9px] text-muted-foreground">
                Here's what's happening today
              </div>
            </div>
            <span className="rounded bg-secondary px-2 py-1 text-[9px] text-primary">Today</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Appointments", "42", "+12%"],
              ["Patients", "1,284", "+8%"],
              ["Revenue", "₹24.8k", "+16%"],
            ].map(([label, value, change]) => (
              <div key={label} className="rounded border border-border p-2">
                <div className="text-[8px] text-muted-foreground">{label}</div>
                <div className="mt-1 font-display text-xs font-bold text-navy sm:text-base">
                  {value}
                </div>
                <div className="text-[8px] text-success">{change} this month</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-2">
            <div className="rounded border border-border p-3">
              <div className="text-[9px] font-bold text-navy">Patient visits</div>
              <div className="mt-3 flex h-16 items-end gap-1.5 sm:h-24">
                {[35, 50, 43, 67, 55, 78, 65, 90, 74, 95, 69, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${i === 9 ? "bg-orange" : "bg-sky/70"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[7px] text-muted-foreground">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
            </div>
            <div className="rounded border border-border p-3">
              <div className="text-[9px] font-bold text-navy">Upcoming</div>
              <div className="mt-3 space-y-2">
                {["Ananya S.", "Rahul P.", "Priya K."].map((n, i) => (
                  <div key={n} className="flex items-center gap-1.5">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-secondary text-[7px] text-primary">
                      {n[0]}
                    </span>
                    <span className="truncate text-[8px] text-foreground">{n}</span>
                    <span className="ml-auto text-[7px] text-muted-foreground">{10 + i}:00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solution, setSolution] = useState<"clinic" | "hospital">("clinic");
  const [preview, setPreview] = useState("Dashboard");
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const sendEnquiry = useServerFn(submitEnquiry);
  const submitTrial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setFormError("");
    setFieldErrors({});
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as EnquiryInput;
    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors(
        Object.fromEntries(
          Object.entries(errors).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."]),
        ),
      );
      return;
    }
    setSending(true);
    try {
      const result = await sendEnquiry({ data: parsed.data });
      if (result.received) {
        setSubmitted(true);
        form.reset();
      } else setFormError(result.message);
    } catch {
      setFormError("We couldn't receive your request right now. Please try again later.");
    } finally {
      setSending(false);
    }
  };
  return (
    <div id="top" className="overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg">
        <div className="section-wrap flex min-h-[88px] py-2 items-center justify-between gap-4">
          <Brand />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-base font-semibold text-foreground transition-colors hover:text-primary"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex border-navy text-navy font-bold hover:bg-navy hover:text-white transition-colors"
            >
              <a href="/login">Log In</a>
            </Button>
            <Button variant="orange" size="sm" asChild className="hidden sm:inline-flex">
              <a href="/signup">
                Get Free Demo <ArrowUpRight />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-12 w-12"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="section-wrap flex flex-col gap-1 py-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-base font-semibold text-navy"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-md border-2 border-navy py-2.5 text-center text-base font-bold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Log In
              </a>
              <a
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-md bg-orange py-2.5 text-center text-base font-bold text-white transition-colors hover:bg-orange/90"
              >
                Get Free Demo
              </a>
            </div>
          </nav>
        )}
      </header>

      <section className="overflow-hidden border-b border-border bg-background">
        <div className="section-wrap grid items-center gap-8 py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)] md:gap-10 md:py-12 lg:gap-16 lg:py-14">
          <div className="hero-copy min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase text-primary">
              <Activity size={14} className="text-orange" /> Healthcare software, made human
            </div>
            <h1 className="display-title max-w-[620px] text-[clamp(2.4rem,4.6vw,3.75rem)] text-navy">
              Run your clinic <span className="text-primary">smarter.</span> Put care first.
            </h1>
            <p className="mt-5 max-w-[500px] text-base leading-7 text-muted-foreground">
              Appointments, patient records and billing in one clear workspace, so your team can
              focus on the people in front of them.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="orange" size="lg" asChild>
                <a href="/signup">
                  Get Free Demo <ArrowRight />
                </a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-navy/80">
              {["No credit card required", "Easy setup", "Support when you need it"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-success" />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-visual relative min-w-0">
            <div className="relative pb-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary shadow-lg">
                <img
                  src={doctorClinic}
                  alt="Doctor discussing care with a patient while using a tablet"
                  width={1200}
                  height={900}
                  fetchPriority="high"
                  className="hero-photo h-full w-full object-cover"
                />
              </div>
              <div
                className="hero-preview absolute -bottom-1 left-3 w-[min(74%,295px)] rounded-lg border border-border bg-background p-3 shadow-xl sm:-bottom-3 sm:left-5 sm:p-4"
                aria-label="Illustrative product preview"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="flex items-center gap-1.5 font-display text-[11px] font-bold text-navy">
                    <span className="grid size-5 place-items-center rounded bg-primary text-primary-foreground">
                      <HeartPulse size={12} />
                    </span>{" "}
                    carefirst{" "}
                    <span className="font-sans font-normal text-muted-foreground">/ Today</span>
                  </span>
                  <span className="size-1.5 rounded-full bg-success" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["Visits", "42"],
                    ["Patients", "1,284"],
                    ["Billing", "₹24.8k"],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded border border-border p-2">
                      <div className="text-[9px] text-muted-foreground">{label}</div>
                      <div className="mt-1 truncate font-display text-xs font-bold text-navy sm:text-sm">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-primary">
                  <CalendarDays size={13} /> Your practice, at a glance
                </div>
              </div>
            </div>
            <p className="mt-2 text-right text-[10px] text-muted-foreground">
              Illustrative product preview
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-8">
        <div className="section-wrap grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            ["50+", "Clinics"],
            ["10,000+", "Patients managed"],
            ["99.9%", "Uptime"],
            ["100%", "Data Security"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-2xl font-extrabold text-navy md:text-3xl">{v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[10px] text-muted-foreground">
          Illustrative figures — replace with verified CareFirst metrics.
        </p>
      </section>

      <section id="why" className="scroll-mt-24 py-14 md:py-18">
        <div id="about" className="scroll-mt-28" />
        <div className="section-wrap">
          <SectionHeading
            eyebrow="THE EVERYDAY CHALLENGE"
            title="Healthcare is complex. Your software shouldn't be."
            copy="From the front desk to the doctor's room, CareFirst helps your team work with less friction and more focus."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:soft-shadow"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-secondary text-primary">
                  <p.icon size={21} />
                </span>
                <h3 className="mt-6 font-display text-base font-bold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 bg-muted py-20 md:py-24">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="ONE CONNECTED PLATFORM"
            title="Everything you need. Nothing you don't."
            copy="One place for the daily work that keeps your care moving forward."
            center
          />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex gap-4 rounded-lg border border-border/80 bg-background p-5 transition-all hover:-translate-y-1 hover:soft-shadow"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon size={21} />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-navy">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{f.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="scroll-mt-24 py-14 md:py-18">
        <div className="section-wrap grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="BUILT AROUND YOUR CARE"
              title="The right fit for the way you work."
              copy="Whether you're running a neighborhood practice or a growing hospital, your tools should keep up."
            />
            <div
              className="mt-8 inline-flex rounded-lg bg-secondary p-1"
              role="tablist"
              aria-label="Solutions"
            >
              <Button
                variant={solution === "clinic" ? "default" : "ghost"}
                size="sm"
                role="tab"
                aria-selected={solution === "clinic"}
                onClick={() => setSolution("clinic")}
              >
                <Stethoscope /> For Clinics
              </Button>
              <Button
                variant={solution === "hospital" ? "default" : "ghost"}
                size="sm"
                role="tab"
                aria-selected={solution === "hospital"}
                onClick={() => setSolution("hospital")}
              >
                <Building2 /> For Hospitals
              </Button>
            </div>
            <div className="mt-8" role="tabpanel">
              <h3 className="font-display text-xl font-bold text-navy">
                {solution === "clinic"
                  ? "A smoother day at your clinic"
                  : "Connected care across your hospital"}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                {solution === "clinic"
                  ? "From the first booking to the final bill, keep every visit simple, personal and well organized."
                  : "Bring departments, care teams and operational data together in one dependable workspace."}
              </p>
              <ul className="mt-5 space-y-3">
                {(solution === "clinic"
                  ? [
                      "Simple appointment and queue management",
                      "Complete patient histories at your fingertips",
                      "Faster billing and follow-up reminders",
                    ]
                  : [
                      "OPD, IPD and bed management",
                      "Pharmacy, lab and billing connected",
                      "Multi-team workflows and actionable reports",
                    ]
                ).map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-3 text-sm font-medium text-foreground"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-secondary text-primary">
                      <Check size={13} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-6 px-0" asChild>
                <a href="#trial">
                  Explore this solution <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative rounded-lg bg-secondary p-5 sm:p-10">
            <div className="absolute -right-3 -top-4 grid size-14 place-items-center rounded-lg bg-orange text-orange-foreground shadow-lg">
              <HeartPulse size={25} />
            </div>
            <MiniDashboard
              variant={solution === "clinic" ? "Clinic overview" : "Hospital overview"}
            />
            <div className="mt-5 flex items-center justify-between rounded-lg bg-background px-4 py-3 soft-shadow">
              <span className="flex items-center gap-2 text-xs font-semibold text-navy">
                <span className="grid size-7 place-items-center rounded-full bg-secondary text-primary">
                  <CheckCircle2 size={15} />
                </span>{" "}
                Your care, all in one place
              </span>
              <ArrowUpRight size={16} className="text-primary" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-14 md:py-18">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="SIMPLE FROM DAY ONE"
            title="Get started in four easy steps."
            center
          />
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-sky/40 lg:block" />
            {[
              [Plus, "Sign up free", "Tell us a little about your practice."],
              [Users, "Add your team", "Set up your clinic and invite your staff."],
              [FileHeart, "Bring your patients", "Import records and configure your services."],
              [LayoutDashboard, "You're ready to go", "Manage everyday care in one place."],
            ].map(([Icon, title, copy], i) => (
              <div key={String(title)} className="relative text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-md">
                  <span className="font-display text-sm font-bold">0{i + 1}</span>
                </div>
                <div className="mx-auto mt-6 grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  {Icon && createElement(Icon as typeof Plus, { size: 20 })}
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-navy">{String(title)}</h3>
                <p className="mx-auto mt-2 max-w-48 text-sm leading-6 text-muted-foreground">
                  {String(copy)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="py-14 md:py-18">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="A LOOK INSIDE"
            title="Clarity at every click."
            copy="A calm, organized workspace designed for busy healthcare teams."
            center
          />
          <div
            className="mt-9 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Software preview"
          >
            {["Dashboard", "Appointments", "Billing", "Patient Records"].map((t) => (
              <Button
                key={t}
                variant={preview === t ? "default" : "secondary"}
                size="sm"
                role="tab"
                aria-selected={preview === t}
                onClick={() => setPreview(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div
            className="mx-auto mt-8 max-w-3xl rounded-lg bg-secondary p-3 sm:p-8"
            role="tabpanel"
          >
            <MiniDashboard variant={preview} />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Illustrative product preview
          </p>
        </div>
      </section>

      <section id="modules" className="scroll-mt-24 py-14 md:py-20">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="COMPREHENSIVE CAPABILITIES"
            title="Core Modules"
            copy="Everything you need to run your healthcare facility efficiently, built into one platform."
            center
          />
          <div className="mt-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Users,
                  label: "Patient Management",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: CalendarDays,
                  label: "Appointment & Queue",
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                },
                {
                  icon: FileText,
                  label: "OPD / Consultation",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: Wallet,
                  label: "Billing & Invoicing",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
                {
                  icon: Package,
                  label: "Pharmacy & Inventory",
                  color: "text-pink-500",
                  bg: "bg-pink-500/10",
                },
                {
                  icon: FlaskConical,
                  label: "Lab / Diagnostics",
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: BedDouble,
                  label: "IPD / Ward / Bed",
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: BarChart3,
                  label: "Reports & Analytics",
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:border-border hover:shadow-md"
                >
                  <div className={`mb-4 rounded-full p-3 transition-colors ${m.color} ${m.bg}`}>
                    <m.icon size={26} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-navy text-center">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-secondary/30 py-20 md:py-24">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="STRAIGHTFORWARD PLANS"
            title="Find room to grow."
            copy="Choose a starting point that fits your practice. Every proposed plan includes a 7-day free trial."
            center
          />
          <div className="mt-8 flex items-center justify-center gap-4 text-[15px] font-semibold">
            <span className={!yearly ? "text-navy" : "text-muted-foreground"}>Monthly</span>
            <Button
              variant="ghost"
              size="icon"
              role="switch"
              aria-checked={yearly}
              aria-label="Toggle yearly pricing"
              onClick={() => setYearly(!yearly)}
              className={`relative h-[30px] w-[52px] rounded-full p-0 shadow-inner ${yearly ? "bg-primary" : "bg-border"}`}
            >
              <span
                className={`absolute top-1 size-[22px] rounded-full bg-background shadow-sm transition-all ${yearly ? "left-7" : "left-1"}`}
              />
            </Button>
            <span
              className={
                yearly
                  ? "text-navy flex items-center gap-2"
                  : "text-muted-foreground flex items-center gap-2"
              }
            >
              Yearly{" "}
              <span className="rounded-[6px] bg-orange/10 px-2 py-1 text-[11px] font-bold text-orange">
                2 months free
              </span>
            </span>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-4 lg:items-stretch lg:gap-5">
            {[
              {
                name: "Basic",
                tag: "For solo practitioners",
                price: yearly ? "₹7,990" : "₹799",
                items: [
                  "Patient Management",
                  "Appointments & Queue",
                  "OPD / EMR",
                  "E-Prescription",
                  "Billing & Invoicing",
                ],
                highlight: false,
              },
              {
                name: "Grow",
                tag: "For expanding clinics",
                price: yearly ? "₹14,990" : "₹1,499",
                items: [
                  "All Basic features, plus:",
                  "Pharmacy & Inventory",
                  "Lab / Diagnostics",
                  "Staff & HR",
                  "Reports & Analytics",
                ],
                highlight: true,
              },
              {
                name: "Hospital Pro",
                tag: "For full hospitals",
                price: yearly ? "₹21,000" : "₹2,100",
                items: [
                  "All Grow features, plus:",
                  "IPD / Ward / Bed Management",
                  "Insurance & Claims",
                  "Telemedicine",
                  "Patient Portal / App",
                ],
                highlight: false,
              },
              {
                name: "Enterprise",
                tag: "For healthcare chains",
                price: "Custom",
                items: [
                  "All Hospital Pro features, plus:",
                  "Multi-Branch Management",
                  "API & Integrations",
                  "White-label options",
                  "Dedicated Support",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[16px] border p-6 xl:p-8 transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? "border-primary/40 bg-background shadow-[0_12px_40px_rgba(8,122,165,0.12)] lg:scale-[1.04] z-10" : "border-border bg-background hover:shadow-[0_10px_30px_rgba(18,63,93,0.06)]"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-0 right-0 mx-auto w-max rounded-full bg-primary px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-foreground shadow-md">
                    Most popular
                  </div>
                )}
                <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                  {plan.tag}
                </span>
                <h3 className="mt-2 font-display text-2xl xl:text-3xl font-extrabold text-navy">
                  {plan.name}
                </h3>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-4xl xl:text-5xl font-extrabold text-navy tracking-tight">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="mb-1.5 text-sm font-semibold text-muted-foreground">
                      / {yearly ? "yr" : "mo"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground font-medium">
                  {plan.price === "Custom"
                    ? "Tailored to your organization"
                    : yearly
                      ? "Billed yearly (2 months free)"
                      : "Billed monthly"}
                </p>
                <div className="my-6 border-t border-border" />
                <ul className="mb-8 flex-1 space-y-3.5">
                  {plan.items.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[14px] font-medium text-foreground leading-snug"
                    >
                      <CheckCircle2
                        size={18}
                        className={`mt-0.5 shrink-0 ${i === 0 && item.includes("features, plus") ? "text-primary/70" : "text-success"}`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "orange" : "outline"}
                  size="lg"
                  className={`h-[48px] rounded-[8px] text-[15px] font-semibold w-full ${!plan.highlight ? "border-border text-navy hover:bg-secondary" : ""}`}
                  asChild
                >
                  <a href="#trial">
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}{" "}
                    {plan.name === "Enterprise" ? (
                      <ArrowUpRight size={18} className="ml-1.5" />
                    ) : (
                      <ArrowRight size={18} className="ml-1.5" />
                    )}
                  </a>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] text-muted-foreground font-medium">
            Prices and plan details are subject to change. Confirm final availability with
            CareFirst.
          </p>
        </div>
      </section>

      <section id="trial" className="scroll-mt-20 blue-surface py-16 md:py-20">
        <div className="section-wrap grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[.15em] text-primary-foreground/70">
              TAKE THE NEXT STEP
            </span>
            <h2 className="display-title mt-4 text-3xl text-primary-foreground md:text-[42px]">
              Ready to make more room for care?
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-primary-foreground/80">
              Tell us about your practice and we'll help you find the right next step. This is an
              enquiry, not an instant trial activation.
            </p>
            <div className="mt-7 flex flex-wrap gap-4 text-xs text-primary-foreground/90">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={15} /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={15} /> No obligation
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-background p-6 shadow-2xl sm:p-8">
            <h3 className="font-display text-xl font-bold text-navy">Let's get to know you</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your details to request a trial.
            </p>
            {submitted ? (
              <div role="status" className="mt-6 rounded-lg bg-secondary p-5">
                <CheckCircle2 className="text-success" />
                <h4 className="mt-3 font-display font-bold text-navy">Your enquiry was saved</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We have saved your request. Email delivery isn't active yet, so CareFirst has not
                  been notified by email. Your trial has not started.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={submitTrial} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    {
                      name: "name",
                      label: "Your name",
                      placeholder: "Dr. Aditi Sharma",
                      autoComplete: "name",
                    },
                    {
                      name: "phone",
                      label: "Phone number",
                      placeholder: "+91 98765 43210",
                      autoComplete: "tel",
                    },
                    {
                      name: "clinic",
                      label: "Clinic / hospital name",
                      placeholder: "Your practice name",
                    },
                    {
                      name: "email",
                      label: "Work email",
                      placeholder: "you@clinic.com",
                      autoComplete: "email",
                    },
                  ] as const
                ).map((field) => (
                  <label key={field.name} className="text-xs font-semibold text-navy">
                    {field.label}
                    <input
                      name={field.name}
                      type={
                        field.name === "email" ? "email" : field.name === "phone" ? "tel" : "text"
                      }
                      autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
                      placeholder={field.placeholder}
                      maxLength={
                        field.name === "email"
                          ? 255
                          : field.name === "clinic"
                            ? 150
                            : field.name === "phone"
                              ? 25
                              : 100
                      }
                      aria-invalid={!!fieldErrors[field.name]}
                      aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
                      onChange={() => setFieldErrors((errors) => ({ ...errors, [field.name]: "" }))}
                      className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                    />
                    {fieldErrors[field.name] && (
                      <span
                        id={`${field.name}-error`}
                        className="mt-1 block text-xs text-destructive"
                      >
                        {fieldErrors[field.name]}
                      </span>
                    )}
                  </label>
                ))}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                {formError && (
                  <p role="alert" className="text-sm text-destructive sm:col-span-2">
                    {formError}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="orange"
                  size="lg"
                  disabled={sending}
                  className="sm:col-span-2"
                >
                  {sending ? "Sending request…" : "Request Your Free Trial"}{" "}
                  {!sending && <ArrowRight />}
                </Button>
                <p className="text-center text-[11px] leading-5 text-muted-foreground sm:col-span-2">
                  Your enquiry will be saved securely. Email notification is pending setup;
                  submitting does not activate a trial.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="section-wrap">
          <SectionHeading
            eyebrow="FROM THE PEOPLE WE SERVE"
            title="Care that speaks for itself."
            copy="A place for real customer experiences once they are available."
            center
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              "Less time at the desk. More time with patients.",
              "A clearer day for our entire care team.",
              "Everything important in one place.",
            ].map((quote, i) => (
              <div key={quote} className="rounded-lg border border-border p-6">
                <div className="flex gap-1 text-orange" aria-label="Illustrative five-star rating">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-5 font-display text-lg font-semibold leading-7 text-navy">
                  “{quote}”
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                    <Stethoscope size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-navy">Sample testimonial {i + 1}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Replace with a verified customer quote
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft-blue py-16">
        <div className="section-wrap grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow">PEACE OF MIND</span>
            <h2 className="display-title mt-3 text-3xl text-navy">
              Your patients trust you. You can trust your tools.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Designed with the safeguards healthcare teams expect. Confirm current certifications
              and policies with CareFirst.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [LockKeyhole, "Encryption"],
              [Cloud, "Daily backups"],
              [ShieldCheck, "Role-based access"],
              [Zap, "Reliable uptime"],
            ].map(([Icon, label]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-border bg-background p-4 text-center"
              >
                <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  {Icon && createElement(Icon as typeof Plus, { size: 20 })}
                </span>
                <p className="mt-3 text-xs font-bold text-navy">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 py-14 md:py-18">
        <div className="section-wrap grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <SectionHeading
              eyebrow="GOOD TO KNOW"
              title="Questions? We've got answers."
              copy="Here's a starting point for the details people ask about most."
            />
            <div className="mt-7 flex items-center gap-2 text-sm text-primary">
              <CircleHelp size={17} /> Have another question?{" "}
              <a href="/signup" className="font-bold underline">
                Get in touch
              </a>
            </div>
          </div>
          <div className="divide-y divide-border border-t border-b border-border">
            {faqs.map(([question, answer], i) => (
              <div key={question}>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-between rounded-none px-0 py-5 text-left font-display text-sm font-bold whitespace-normal text-navy hover:bg-transparent"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {question}
                  <ChevronDown
                    size={17}
                    className={`ml-4 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </Button>
                {openFaq === i && (
                  <p className="max-w-xl pb-5 text-sm leading-7 text-muted-foreground">{answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-14">
        <div className="section-wrap flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="display-title text-2xl text-primary-foreground md:text-3xl">
              Make every day a better day for care.
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Let's find a simpler way forward, together.
            </p>
          </div>
          <Button variant="orange" size="lg" asChild>
            <a href="/signup">
              Get Free Demo <ArrowRight />
            </a>
          </Button>
        </div>
      </section>

      <footer className="bg-foreground py-14 text-primary-foreground">
        <div className="section-wrap grid gap-10 border-b border-primary-foreground/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <Brand inverse />
            <p className="mt-5 max-w-xs text-sm leading-6 text-primary-foreground/60">
              CareFirst Software Solutions builds intuitive, reliable tools for clinics and
              hospitals—simplifying everyday patient care, records, and operations.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                [Linkedin, "LinkedIn"],
                [Instagram, "Instagram"],
                [Facebook, "Facebook"],
              ].map(([Icon, label]) => (
                <span
                  key={String(label)}
                  title={`${label} profile coming soon`}
                  className="grid size-8 place-items-center rounded border border-primary-foreground/20 text-primary-foreground/60"
                >
                  {Icon && createElement(Icon as typeof Plus, { size: 15 })}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold">Product</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-primary-foreground/60">
              <a href="#features" className="hover:text-primary-foreground transition-colors">
                Features
              </a>
              <a href="#solutions" className="hover:text-primary-foreground transition-colors">
                Solutions
              </a>
              <a href="#modules" className="hover:text-primary-foreground transition-colors">
                Modules
              </a>
              <a href="#pricing" className="hover:text-primary-foreground transition-colors">
                Pricing
              </a>
              <a href="#preview" className="hover:text-primary-foreground transition-colors">
                Product preview
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold">Company</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-primary-foreground/60">
              <a href="#about" className="hover:text-primary-foreground transition-colors">
                About Us
              </a>
              <a href="#why" className="hover:text-primary-foreground transition-colors">
                Why CareFirst
              </a>
              <a href="#faq" className="hover:text-primary-foreground transition-colors">
                FAQs
              </a>
              <a href="/signup" className="hover:text-primary-foreground transition-colors">
                Contact
              </a>
              <a href="/privacy" className="hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary-foreground transition-colors">
                Terms & Conditions
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold">Get in touch</h3>
            <div className="mt-5 space-y-3 text-sm text-primary-foreground/60">
              <a
                href="tel:+917201069892"
                className="flex items-start gap-2 transition-colors hover:text-primary-foreground"
              >
                <Phone size={16} className="mt-0.5 shrink-0 text-orange" />
                <span>+91 72010 69892</span>
              </a>
              <a
                href="mailto:support@carefirst.in"
                className="flex items-start gap-2 transition-colors hover:text-primary-foreground"
              >
                <Mail size={16} className="mt-0.5 shrink-0 text-orange" />
                <span>support@carefirst.in</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange" />
                <span>Sindhu Bhavan Road, Ahmedabad, Gujarat 380059, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-wrap flex flex-col sm:flex-row justify-between gap-4 pt-6 text-xs text-primary-foreground/45">
          <span>
            © {new Date().getFullYear()} CareFirst Software Solutions. All rights reserved.
          </span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-40">
        <a
          href="https://api.whatsapp.com/send?text=I%20am%20interested"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp chat"
          title="WhatsApp chat"
          className="flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:-translate-y-1 focus:outline-none"
        >
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/color/48/whatsapp--v1.png"
            alt="WhatsApp"
            className="size-full"
          />
        </a>
      </div>
    </div>
  );
}
