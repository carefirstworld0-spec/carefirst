import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const lastUpdated = "September 29, 2026";

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="font-display font-bold text-navy">CareFirst</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-12 border-b border-border pb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield size={32} />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-foreground">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">1. Introduction</h2>
            <p>
              Welcome to CareFirst. We are committed to protecting the privacy and security of your
              personal information and the sensitive healthcare data managed within our platform.
              This Privacy Policy explains how CareFirst ("we," "our," or "us") collects, uses,
              shares, and protects information when you use our healthcare management software,
              website, and related services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">2. Information We Collect</h2>
            <p>
              We collect information to provide, manage, and improve our services to healthcare
              providers:
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account Information:</strong> Name, email
                address, phone number, clinic/hospital details, and billing information when you
                register for an account.
              </li>
              <li>
                <strong className="text-foreground">Patient Data (Processor Role):</strong>{" "}
                Healthcare providers (our customers) input patient health information (PHI) into
                CareFirst. We act strictly as a data processor for this information. The healthcare
                provider remains the data controller.
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> We automatically collect
                diagnostic and usage metrics (such as IP address, browser type, and interaction
                logs) to ensure system stability and security.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">
              3. How We Use Your Information
            </h2>
            <p>We use the collected data exclusively for the following purposes:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>To provide, operate, and maintain the CareFirst platform.</li>
              <li>To securely process billing and subscription payments.</li>
              <li>To send administrative notifications, security alerts, and support messages.</li>
              <li>
                To monitor and analyze platform performance and prevent fraudulent or unauthorized
                access.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">
              4. Data Security & Compliance
            </h2>
            <p>
              Security is our highest priority. We implement robust, industry-standard technical and
              organizational measures to protect your data and patient records against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                All data transmitted between your browser and our servers is encrypted using
                TLS/SSL.
              </li>
              <li>Data at rest is secured using AES-256 encryption.</li>
              <li>
                We enforce strict role-based access controls and continuously monitor our
                infrastructure for vulnerabilities.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">
              5. Sharing Your Information
            </h2>
            <p>
              We do not sell, rent, or trade your personal information or patient data. We may share
              information only in the following circumstances:
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Service Providers:</strong> With trusted
                third-party vendors (e.g., cloud hosting, payment processors) who require access to
                operate our services and who are bound by strict confidentiality agreements.
              </li>
              <li>
                <strong className="text-foreground">Legal Requirements:</strong> If required to do
                so by law or in response to valid requests by public authorities.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to access, correct, delete, or
              restrict the processing of your personal data. To exercise these rights regarding your
              account information, please contact us. Note that requests regarding specific patient
              records must be directed to the respective healthcare provider (the data controller).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices,
              please contact our Data Protection Officer at:
            </p>
            <div className="mt-4 rounded-lg bg-secondary/50 p-6 text-center">
              <p className="font-semibold text-navy">privacy@carefirst.world</p>
              <p className="mt-1 text-sm text-muted-foreground">
                CareFirst Software Solutions, Inc.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
