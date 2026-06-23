"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  Eye,
  EyeOff,
  Phone,
  ShieldAlert,
  User,
  UserPlus,
} from "lucide-react";

import {
  getLoginPortalConfig,
  LOGIN_PORTALS,
  type LoginPortal,
} from "@/lib/auth/login-config";

type AuthMode = "login" | "signup";

type LoginFormProps = {
  portal: LoginPortal;
};

export function LoginForm({ portal }: LoginFormProps) {
  const router = useRouter();
  const config = getLoginPortalConfig(portal);
  const [adminBootstrapAllowed, setAdminBootstrapAllowed] = useState(false);
  const canSignUp = config.canSelfRegister || adminBootstrapAllowed;

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    let mounted = true;
    async function checkAdminBootstrap() {
      if (portal !== "admin") return;

      try {
        const res = await fetch("/api/admin/super-admin-exists");
        const data = await res.json();
        if (!mounted) return;
        setAdminBootstrapAllowed(!data.exists);
      } catch (e) {
        if (mounted) setAdminBootstrapAllowed(false);
      }
    }

    checkAdminBootstrap();

    return () => {
      mounted = false;
    };
  }, [portal]);

  function resetSignupFlow() {
    setOtpSent(false);
    setEmailVerified(false);
    setOtp("");
    setDevCode(null);
    setResendCount(0);
    setSeconds(0);
  }

  function resetLoginOtpFlow() {
    setLoginOtpSent(false);
    setOtp("");
    setDevCode(null);
    setResendCount(0);
    setSeconds(0);
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    resetSignupFlow();
    resetLoginOtpFlow();
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to sign in.");
        return;
      }

      sessionStorage.setItem("justLoggedIn", "true");
      router.push(data.redirectTo ?? config.redirectTo);
    } catch {
      setNotice("Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  async function sendLoginOtp(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setNotice("");
    setDevCode(null);

    if (!email) {
      setNotice("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to send login OTP.");
        return;
      }

      setLoginOtpSent(true);
      setSeconds(30);
      setResendCount((value) => value + 1);
      setNotice(data.message ?? "Login OTP sent. It expires in 5 minutes.");

      if (data.devCode) {
        setDevCode(data.devCode);
      }
    } catch {
      setNotice("Unable to send login OTP right now.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyLoginOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, portal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to verify login OTP.");
        return;
      }

      sessionStorage.setItem("justLoggedIn", "true");
      router.push(data.redirectTo ?? config.redirectTo);
    } catch {
      setNotice("Unable to verify login OTP right now.");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setNotice("");
    setDevCode(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portal: mode === "signup" ? portal : undefined }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to send OTP.");
        return;
      }

      setOtpSent(true);
      setSeconds(30);
      setResendCount((value) => value + 1);
      setNotice(data.message ?? "OTP sent. It expires in 5 minutes.");

      if (data.devCode) {
        setDevCode(data.devCode);
      }
    } catch {
      setNotice("Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, portal: mode === "signup" ? portal : undefined }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to verify OTP.");
        return;
      }

      setEmailVerified(true);
      setNotice(data.message ?? "Email verified. Set your password to finish.");
    } catch {
      setNotice("Unable to verify OTP right now.");
    } finally {
      setLoading(false);
    }
  }

  async function completeRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to complete registration.");
        return;
      }

      sessionStorage.setItem("justLoggedIn", "true");
      router.push(data.redirectTo ?? config.redirectTo);
    } catch {
      setNotice("Unable to complete registration right now.");
    } finally {
      setLoading(false);
    }
  }

  const otherPortals = Object.values(LOGIN_PORTALS).filter(
    (item) => item.portal !== portal,
  );

  return (
    <section className="mx-auto grid max-w-none gap-8 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 2xl:px-12">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
          {config.eyebrow}
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          {config.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-stone">{config.description}</p>

        <div className="mt-8 grid gap-4">
          {(mode === "login"
            ? [
                "Sign in with your password or email OTP.",
                "Login OTP expires after 5 minutes.",
                "Keep your password private and secure.",
                portal === "customer"
                  ? "Browse destinations without signing in."
                  : "Use the credentials assigned to your account.",
              ]
            : [
                "OTP verifies your email during sign up only.",
                "OTP expires after 5 minutes.",
                "Resend is delayed by 30 seconds.",
                "After sign up, use your password to log in.",
              ]
          ).map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-mint" />
              <span className="font-bold text-stone">{item}</span>
            </div>
          ))}
        </div>

        {portal === "admin" && adminBootstrapAllowed ? (
          <div className="mt-8 rounded-lg border border-coral/30 bg-coral/10 p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
              First-time setup
            </p>
            <p className="mt-2 text-sm font-semibold text-stone">
              No Super Admin exists yet. Use the Sign up tab to verify your
              email with OTP and create the first admin account.
            </p>
          </div>
        ) : null}

        {portal === "admin" && !adminBootstrapAllowed ? (
          <div className="mt-8 rounded-lg border border-ink/10 bg-white/70 p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-stone">
              Add another admin
            </p>
            <p className="mt-2 text-sm font-semibold text-stone">
              Already signed in as Super Admin? Create additional admin accounts
              from the admin panel.
            </p>
            <Link
              href="/admin/create-super-admin"
              className="mt-3 inline-flex text-sm font-black text-coral hover:underline"
            >
              Create Super Admin account
            </Link>
          </div>
        ) : null}

        {otherPortals.length > 0 ? (
          <div className="mt-8 rounded-lg border border-ink/10 bg-white/70 p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-stone">
              Other login portals
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {otherPortals.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-black transition hover:border-coral hover:text-coral"
                >
                  {item.eyebrow}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        {canSignUp ? (
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-md bg-ivory p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-black transition ${
                mode === "login"
                  ? "bg-white text-ink shadow-sm"
                  : "text-stone hover:text-ink"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-black transition ${
                mode === "signup"
                  ? "bg-white text-ink shadow-sm"
                  : "text-stone hover:text-ink"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </button>
          </div>
        ) : null}

        {mode === "login" && !loginOtpSent ? (
          <form onSubmit={handleLogin} className="grid gap-5">
            <h2 className="text-3xl font-black">Sign in</h2>
            <label className="grid gap-2 text-sm font-black">
              Email address
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={config.emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Password
              <span className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-3.5 h-5 w-5 text-stone"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                Sign in
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => sendLoginOtp()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 font-black transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                Email OTP
              </button>
            </div>
            {canSignUp ? (
              <p className="text-sm font-semibold text-stone">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-black text-coral hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : null}
          </form>
        ) : null}

        {mode === "login" && loginOtpSent ? (
          <form onSubmit={verifyLoginOtp} className="grid gap-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-black">Login OTP</h2>
                <p className="mt-1 text-sm font-semibold text-stone">
                  Sent to {email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetLoginOtpFlow();
                  setNotice("");
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/15 px-3 text-sm font-black transition hover:border-coral hover:text-coral"
              >
                <Edit3 className="h-4 w-4" />
                Edit email
              </button>
            </div>

            {devCode ? (
              <p className="rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
                Development OTP: {devCode}
              </p>
            ) : null}

            <label className="grid gap-2 text-sm font-black">
              6 digit OTP
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                required
                className="h-12 rounded-md border border-ink/15 bg-ivory px-3 text-base tracking-[0.4em] outline-none focus:border-coral"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={loading}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-coral px-4 font-black text-ink transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Verify login
              </button>
              <button
                type="button"
                disabled={seconds > 0 || resendCount >= 3 || loading}
                onClick={() => sendLoginOtp()}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 font-black transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-50"
              >
                {seconds > 0 ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        ) : null}

        {mode === "signup" && canSignUp && !otpSent ? (
          <form onSubmit={sendOtp} className="grid gap-5">
            <h2 className="text-3xl font-black">
              {portal === "admin" ? "Create Super Admin" : "Create account"}
            </h2>
            <p className="text-sm font-semibold text-stone">
              {portal === "admin"
                ? "Step 1: verify your email with a one-time code to set up the first admin account."
                : "Step 1: verify your email with a one-time code."}
            </p>
            <label className="grid gap-2 text-sm font-black">
              Email address
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={config.emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
              </span>
            </label>
            <button
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Send OTP
            </button>
          </form>
        ) : null}

        {mode === "signup" && canSignUp && otpSent && !emailVerified ? (
          <form onSubmit={verifyOtp} className="grid gap-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-black">Verify email</h2>
                <p className="mt-1 text-sm font-semibold text-stone">
                  Sent to {email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetSignupFlow();
                  setNotice("");
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/15 px-3 text-sm font-black transition hover:border-coral hover:text-coral"
              >
                <Edit3 className="h-4 w-4" />
                Edit email
              </button>
            </div>

            {devCode ? (
              <p className="rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
                Development OTP: {devCode}
              </p>
            ) : null}

            <label className="grid gap-2 text-sm font-black">
              6 digit OTP
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                required
                className="h-12 rounded-md border border-ink/15 bg-ivory px-3 text-base tracking-[0.4em] outline-none focus:border-coral"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={loading}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-coral px-4 font-black text-ink transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Verify
              </button>
              <button
                type="button"
                disabled={seconds > 0 || resendCount >= 3 || loading}
                onClick={() => sendOtp()}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 font-black transition hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-50"
              >
                {seconds > 0 ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-md bg-coral/15 p-4 text-sm font-semibold text-stone">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
              OTP is only needed once during sign up. After that, use your
              password to sign in.
            </div>
          </form>
        ) : null}

        {mode === "signup" && canSignUp && emailVerified ? (
          <form onSubmit={completeRegistration} className="grid gap-5">
            <h2 className="text-3xl font-black">
              {portal === "admin" ? "Finish admin setup" : "Finish sign up"}
            </h2>
            <p className="text-sm font-semibold text-stone">
              Step 2: set your profile and password for {email}.
            </p>
            <label className="grid gap-2 text-sm font-black">
              Full name
              <span className="relative">
                <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Phone with country code
              <span className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Password
              <span className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-3.5 h-5 w-5 text-stone"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Confirm password
              <span className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-12 w-full rounded-md border border-ink/15 bg-ivory px-3 pl-11 text-base outline-none focus:border-coral"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-3.5 h-5 w-5 text-stone"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border border-ink/10 bg-ivory p-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                className="mt-1 size-4 accent-coral"
              />
              <span>
                I accept Road Track{" "}
                <Link href="/terms" className="text-coral hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-coral hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {portal === "admin" ? "Create Super Admin" : "Create account"}
            </button>
          </form>
        ) : null}

        {notice ? (
          <p className="mt-5 rounded-md bg-mint/20 p-3 text-sm font-bold text-stone">
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  );
}
