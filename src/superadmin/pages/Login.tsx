import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Lock, Mail, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { ref, get, child } from 'firebase/database'

export function SuperAdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const dbRef = ref(db)
      const snapshot = await get(child(dbRef, 'superAdminCredentials'))

      if (snapshot.exists()) {
        const admins = snapshot.val()
        let userExists = false
        let isValidAdmin = false

        for (const uid in admins) {
          const admin = admins[uid]
          if (admin.email === email && admin.role === 'superadmin') {
            userExists = true
            if (admin.password === password) {
              isValidAdmin = true
            }
            break
          }
        }

        if (isValidAdmin) {
          localStorage.setItem('superadmin_email', email)
          localStorage.setItem('superadmin_role', 'superadmin')
          navigate({ to: "/superadmin" })
        } else if (!userExists) {
          setErrorMsg('User does not exist.')
        } else {
          setErrorMsg('Email and password is wrong.')
        }
      } else {
        setErrorMsg('User does not exist.')
      }
    } catch (error: any) {
      setErrorMsg('Email and password is wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[24px] bg-card shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-border">

        {/* Left side: Branding & Visuals (Hidden on mobile) */}
        <div className="hidden w-1/2 flex-col justify-between bg-navy p-12 text-primary-foreground lg:flex relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -left-[20%] -top-[20%] h-[140%] w-[140%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 via-navy to-navy opacity-60" />

          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="inline-flex shrink-0 items-center hover:opacity-90 transition-opacity -ml-4">
              <img src="https://ik.imagekit.io/dn3ch7b5a/WhatsApp_Image_2026-09-28_at_14.06.54-removebg-preview.png?updatedAt=1790594212831" alt="CareFirst" className="h-28 sm:h-36 lg:h-40 w-auto object-contain object-left brightness-0 invert" />
            </Link>
          </div>

          <div className="relative z-10 mt-auto">
            <h1 className="font-display text-[42px] font-extrabold leading-[1.1] tracking-[-1px]">
              Manage your healthcare <br />
              <span className="text-primary">network securely.</span>
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-[1.6] text-primary-foreground/80 font-medium">
              Welcome to the CareFirst Super Admin console. Get centralized oversight, instant operational insights, and complete control over your hospital ecosystem.
            </p>

            <div className="mt-12 flex items-center gap-6 text-[14px] font-semibold text-primary-foreground/90">
              <span className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-success" /> End-to-end encryption
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="w-full bg-card p-8 sm:p-12 lg:w-1/2 xl:p-16 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-[360px]">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-display text-[32px] font-extrabold text-navy tracking-tight">Welcome back</h2>
              <p className="mt-2 text-[15px] text-muted-foreground font-medium">Please sign in to your admin account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {errorMsg && (
                <div className="rounded-[8px] bg-destructive/15 p-3 text-sm font-semibold text-destructive">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[12px] font-bold capitalize text-navy/80">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-[52px] w-full rounded-[8px] border border-border bg-background pl-[42px] pr-4 text-[15px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="admin@carefirst.world"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold capitalize text-navy/80">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-[52px] w-full rounded-[8px] border border-border bg-background pl-[42px] pr-4 text-[15px] font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="orange"
                  disabled={isLoading}
                  className="h-[54px] w-full rounded-[8px] text-[16px] font-semibold shadow-md transition-all hover:bg-orange/90"
                >
                  {isLoading ? "Signing in..." : "Sign In to Dashboard"}
                  {!isLoading && <ArrowRight size={18} className="ml-2" />}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-[13px] text-muted-foreground font-medium">
              By signing in, you agree to our <a href="#" className="font-semibold text-navy hover:underline">Terms</a> and <a href="#" className="font-semibold text-navy hover:underline">Privacy Policy</a>.
            </div>

            <div className="mt-8 lg:hidden text-center">
              <Link to="/" className="text-[14px] font-bold text-primary hover:underline">
                &larr; Back to CareFirst Website
              </Link>
            </div>

            <div className="flex justify-center items-baseline gap-1.5 mt-8">
              <span className="text-[14px] font-medium text-slate-500">
                Powered by
              </span>
              <span className="text-[18px] font-extrabold text-navy font-display tracking-tight">
                CareFirst
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
