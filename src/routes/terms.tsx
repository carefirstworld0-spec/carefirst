import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsAndConditions,
})

function TermsAndConditions() {
  const lastUpdated = "September 29, 2026"

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="font-display font-bold text-navy">CareFirst</div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-12 border-b border-border pb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText size={32} />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-base font-medium text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-foreground">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement made between you (the "User", "Client", or "Healthcare Provider") and CareFirst Software Solutions ("CareFirst", "we", "us", or "our"), concerning your access to and use of the CareFirst healthcare management platform and related services. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">2. Description of Service</h2>
            <p>
              CareFirst is a cloud-based Enterprise Resource Planning (ERP) and management software designed for clinics, polyclinics, and hospitals. Our service includes modules for patient registration, appointment scheduling, electronic medical records (EMR), billing, pharmacy, and laboratory management.
            </p>
            <p>
              <strong>Not Medical Advice:</strong> The CareFirst platform is an administrative and record-keeping tool. It is not intended to provide medical advice, diagnosis, or treatment. Healthcare providers are solely responsible for all medical decisions and patient care.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">3. User Accounts and Security</h2>
            <p>
              You must register for an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">4. Data Ownership and Privacy</h2>
            <p>
              <strong>Your Data:</strong> As a healthcare provider, you retain all rights, title, and interest in and to the patient data and clinic information you input into the CareFirst platform. You grant CareFirst a limited license to process this data solely for the purpose of providing the Service.
            </p>
            <p>
              <strong>Compliance:</strong> You represent and warrant that you have all necessary rights and consents to upload patient data into our platform in compliance with applicable healthcare laws (such as HIPAA, GDPR, or local data protection regulations). Please review our Privacy Policy for details on how we protect your data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">5. Subscriptions and Payments</h2>
            <p>
              Access to certain premium modules of CareFirst requires a paid subscription. Billing occurs on a recurring basis as outlined in your specific contract. All fees are non-refundable unless otherwise required by law or explicitly stated in your service agreement. We reserve the right to suspend service for non-payment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">6. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Upload or transmit any malicious code, viruses, or harmful materials.</li>
              <li>Attempt to gain unauthorized access to our systems, servers, or other clients' data.</li>
              <li>Use the platform in any manner that violates applicable local, state, national, or international healthcare regulations.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CareFirst shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use or inability to use the Service. Our total liability shall not exceed the amount you paid us for the Service during the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">8. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we determine, in our sole discretion, violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy">9. Contact Information</h2>
            <p>
              For questions regarding these Terms, please contact our legal team at:
            </p>
            <div className="mt-4 rounded-lg bg-secondary/50 p-6 text-center">
              <p className="font-semibold text-navy">legal@carefirst.world</p>
              <p className="mt-1 text-sm text-muted-foreground">CareFirst Software Solutions, Inc.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
