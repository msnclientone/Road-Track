"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  Timer,
  User,
  UserPlus,
  Lock,
} from "lucide-react";

import PhoneInput from "@/components/PhoneInput";

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
  const canSignUp = config.canSelfRegister;

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isOwnerPortal =
    portal === "vehicle-owner" || portal === "resort-owner";
  const isIdInput = isOwnerPortal && /^(ROAD[VR]\d)/i.test(email);
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

  // Admin 2FA OTP state
  const [adminOtpMode, setAdminOtpMode] = useState(false);
  const [adminOtpDigits, setAdminOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [adminOtpCountdown, setAdminOtpCountdown] = useState(300);
  const [adminResendCooldown, setAdminResendCooldown] = useState(0);
  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpError, setAdminOtpError] = useState<string | null>(null);
  const adminOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Second OTP (email OTP flow) state
  const [secondOtpMode, setSecondOtpMode] = useState(false);
  const [secondOtpDigits, setSecondOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [secondOtpCountdown, setSecondOtpCountdown] = useState(300);
  const [secondOtpResendCooldown, setSecondOtpResendCooldown] = useState(0);
  const [secondOtpLoading, setSecondOtpLoading] = useState(false);
  const [secondOtpError, setSecondOtpError] = useState<string | null>(null);
  const secondOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    if (!adminOtpMode || adminOtpCountdown <= 0) return;
    const timer = setTimeout(() => setAdminOtpCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [adminOtpMode, adminOtpCountdown]);

  useEffect(() => {
    if (adminResendCooldown <= 0) return;
    const timer = setTimeout(() => setAdminResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [adminResendCooldown]);

  useEffect(() => {
    if (!secondOtpMode || secondOtpCountdown <= 0) return;
    const timer = setTimeout(() => setSecondOtpCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondOtpMode, secondOtpCountdown]);

  useEffect(() => {
    if (secondOtpResendCooldown <= 0) return;
    const timer = setTimeout(() => setSecondOtpResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondOtpResendCooldown]);

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
    setSecondOtpMode(false);
    setSecondOtpDigits(Array(6).fill(""));
    setSecondOtpCountdown(300);
    setSecondOtpResendCooldown(0);
    setSecondOtpError(null);
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

      if (data.requiresOtp) {
        setAdminOtpMode(true);
        setAdminOtpCountdown(300);
        setAdminOtpDigits(Array(6).fill(""));
        setAdminOtpError(null);
        setLoading(false);
        setTimeout(() => adminOtpRefs.current[0]?.focus(), 100);
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

      if (data.requiresSecondOtp) {
        setSecondOtpMode(true);
        setSecondOtpDigits(Array(6).fill(""));
        setSecondOtpCountdown(300);
        setSecondOtpError(null);
        setSecondOtpResendCooldown(0);
        setTimeout(() => secondOtpRefs.current[0]?.focus(), 100);
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

  async function handleAdminVerifyOtp() {
    const code = adminOtpDigits.join("");
    if (code.length !== 6) {
      setAdminOtpError("Please enter the complete 6-digit OTP.");
      return;
    }

    setAdminOtpLoading(true);
    setAdminOtpError(null);

    try {
      const res = await fetch("/api/auth/login/admin-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAdminOtpError(data.error ?? "Invalid OTP.");
        setAdminOtpDigits(Array(6).fill(""));
        setTimeout(() => adminOtpRefs.current[0]?.focus(), 50);
        return;
      }

      sessionStorage.setItem("justLoggedIn", "true");
      setAdminOtpMode(false);
      router.push(data.redirectTo ?? "/admin");
    } catch {
      setAdminOtpError("Unable to verify OTP.");
      setAdminOtpDigits(Array(6).fill(""));
      setTimeout(() => adminOtpRefs.current[0]?.focus(), 50);
    } finally {
      setAdminOtpLoading(false);
    }
  }

  async function handleAdminResendOtp() {
    if (adminResendCooldown > 0) return;

    setAdminOtpLoading(true);
    setAdminOtpError(null);

    try {
      const res = await fetch("/api/auth/login/admin-resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAdminOtpError(data.error ?? "Unable to resend OTP.");
        return;
      }

      setAdminResendCooldown(60);
      setAdminOtpCountdown(300);
      setAdminOtpDigits(Array(6).fill(""));
      setAdminOtpError(null);
      setTimeout(() => adminOtpRefs.current[0]?.focus(), 50);
    } catch {
      setAdminOtpError("Unable to resend OTP.");
    } finally {
      setAdminOtpLoading(false);
    }
  }

  function handleAdminOtpDigitChange(index: number, value: string) {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...adminOtpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] ?? "";
      }
      setAdminOtpDigits(newDigits);
      setAdminOtpError(null);
      const nextEmpty = newDigits.findIndex((d) => !d);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      adminOtpRefs.current[focusIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...adminOtpDigits];
    newDigits[index] = digit;
    setAdminOtpDigits(newDigits);
    setAdminOtpError(null);

    if (digit && index < 5) {
      adminOtpRefs.current[index + 1]?.focus();
    }
  }

  function handleAdminOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (!adminOtpDigits[index] && index > 0) {
        const newDigits = [...adminOtpDigits];
        newDigits[index - 1] = "";
        setAdminOtpDigits(newDigits);
        adminOtpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      adminOtpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      adminOtpRefs.current[index + 1]?.focus();
    }
  }

  async function handleSecondOtpVerify() {
    const code = secondOtpDigits.join("");
    if (code.length !== 6) {
      setSecondOtpError("Please enter the complete 6-digit security code.");
      return;
    }

    setSecondOtpLoading(true);
    setSecondOtpError(null);

    try {
      const res = await fetch("/api/auth/login/otp/verify-second", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSecondOtpError(data.error ?? "Invalid security code.");
        setSecondOtpDigits(Array(6).fill(""));
        setTimeout(() => secondOtpRefs.current[0]?.focus(), 50);
        return;
      }

      sessionStorage.setItem("justLoggedIn", "true");
      setSecondOtpMode(false);
      router.push(data.redirectTo ?? "/admin");
    } catch {
      setSecondOtpError("Unable to verify security code.");
      setSecondOtpDigits(Array(6).fill(""));
      setTimeout(() => secondOtpRefs.current[0]?.focus(), 50);
    } finally {
      setSecondOtpLoading(false);
    }
  }

  async function handleSecondOtpResend() {
    if (secondOtpResendCooldown > 0) return;

    setSecondOtpLoading(true);
    setSecondOtpError(null);

    try {
      const res = await fetch("/api/auth/login/otp/resend-second", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSecondOtpError(data.error ?? "Unable to resend security code.");
        return;
      }

      setSecondOtpResendCooldown(60);
      setSecondOtpCountdown(300);
      setSecondOtpDigits(Array(6).fill(""));
      setSecondOtpError(null);
      setTimeout(() => secondOtpRefs.current[0]?.focus(), 50);
    } catch {
      setSecondOtpError("Unable to resend security code.");
    } finally {
      setSecondOtpLoading(false);
    }
  }

  function handleSecondOtpDigitChange(index: number, value: string) {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...secondOtpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] ?? "";
      }
      setSecondOtpDigits(newDigits);
      setSecondOtpError(null);
      const nextEmpty = newDigits.findIndex((d) => !d);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      secondOtpRefs.current[focusIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...secondOtpDigits];
    newDigits[index] = digit;
    setSecondOtpDigits(newDigits);
    setSecondOtpError(null);

    if (digit && index < 5) {
      secondOtpRefs.current[index + 1]?.focus();
    }
  }

  function handleSecondOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (!secondOtpDigits[index] && index > 0) {
        const newDigits = [...secondOtpDigits];
        newDigits[index - 1] = "";
        setSecondOtpDigits(newDigits);
        secondOtpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      secondOtpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      secondOtpRefs.current[index + 1]?.focus();
    }
  }

  function formatOtpTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
    (item) => item.portal !== portal && item.portal !== "admin",
  );

  return (
    <section className="mx-auto grid max-w-none gap-8 px-5 pb-20 pt-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 2xl:px-12 sm:pt-28">
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

        {adminOtpMode && portal === "admin" ? (
          <div className="grid gap-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
                <Shield className="h-7 w-7 text-coral" />
              </div>
              <h2 className="text-3xl font-black">Verify Super Admin Login</h2>
              <p className="mt-1 text-sm font-semibold text-stone">
                We've sent a 6-digit verification code to your registered email.
              </p>
            </div>

            {adminOtpError ? (
              <div className="rounded-md bg-coral/15 p-3 text-center text-sm font-bold text-coral">
                {adminOtpError}
              </div>
            ) : null}

            <div className="flex justify-center gap-2">
              {adminOtpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { adminOtpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleAdminOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleAdminOtpKeyDown(index, e)}
                  className="h-14 w-12 rounded-lg border-2 border-ink/15 text-center text-xl font-black outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/30 sm:w-14"
                  disabled={adminOtpLoading}
                />
              ))}
            </div>

            <button
              onClick={handleAdminVerifyOtp}
              disabled={adminOtpLoading || adminOtpDigits.join("").length !== 6}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adminOtpLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Verify OTP
            </button>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-stone">
                <Timer className="h-4 w-4" />
                <span className={adminOtpCountdown <= 60 ? "font-bold text-coral" : ""}>
                  {formatOtpTime(adminOtpCountdown)}
                </span>
              </div>
              <button
                onClick={handleAdminResendOtp}
                disabled={adminResendCooldown > 0 || adminOtpLoading}
                className="font-semibold text-coral underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-stone/50 disabled:no-underline"
              >
                {adminResendCooldown > 0 ? `Resend in ${adminResendCooldown}s` : "Resend OTP"}
              </button>
            </div>

            <div className="border-t border-ink/10 pt-4 text-center">
              <button
                onClick={() => {
                  setAdminOtpMode(false);
                  setAdminOtpError(null);
                  setAdminOtpDigits(Array(6).fill(""));
                  setNotice("");
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>
          </div>
        ) : null}

        {secondOtpMode ? (
          <div className="grid gap-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
                <ShieldAlert className="h-7 w-7 text-coral" />
              </div>
              <h2 className="text-3xl font-black">Second Verification Required</h2>
              <p className="mt-1 text-sm font-semibold text-stone">
                A second security code has been sent to the admin security email.
              </p>
            </div>

            {secondOtpError ? (
              <div className="rounded-md bg-coral/15 p-3 text-center text-sm font-bold text-coral">
                {secondOtpError}
              </div>
            ) : null}

            <div className="flex justify-center gap-2">
              {secondOtpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { secondOtpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleSecondOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleSecondOtpKeyDown(index, e)}
                  className="h-14 w-12 rounded-lg border-2 border-ink/15 text-center text-xl font-black outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/30 sm:w-14"
                  disabled={secondOtpLoading}
                />
              ))}
            </div>

            <button
              onClick={handleSecondOtpVerify}
              disabled={secondOtpLoading || secondOtpDigits.join("").length !== 6}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
            >
              {secondOtpLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Verify Security Code
            </button>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-stone">
                <Timer className="h-4 w-4" />
                <span className={secondOtpCountdown <= 60 ? "font-bold text-coral" : ""}>
                  {formatOtpTime(secondOtpCountdown)}
                </span>
              </div>
              <button
                onClick={handleSecondOtpResend}
                disabled={secondOtpResendCooldown > 0 || secondOtpLoading}
                className="font-semibold text-coral underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-stone/50 disabled:no-underline"
              >
                {secondOtpResendCooldown > 0 ? `Resend in ${secondOtpResendCooldown}s` : "Resend Security Code"}
              </button>
            </div>

            <div className="border-t border-ink/10 pt-4 text-center">
              <button
                onClick={() => {
                  setSecondOtpMode(false);
                  setSecondOtpError(null);
                  setSecondOtpDigits(Array(6).fill(""));
                  setNotice("");
                }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        ) : null}

        {!adminOtpMode && !secondOtpMode && mode === "login" && !loginOtpSent ? (
          <form onSubmit={handleLogin} className="grid gap-5">
            <h2 className="text-3xl font-black">Sign in</h2>
            <label className="grid gap-2 text-sm font-black">
              {isOwnerPortal ? "Login ID or Email" : "Email address"}
              <span className="relative">
                {isOwnerPortal && isIdInput ? (
                  <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                ) : (
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone" />
                )}
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={config.emailPlaceholder}
                  type={isOwnerPortal ? "text" : "email"}
                  autoComplete={isOwnerPortal ? "username" : "email"}
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
            <Link
              href="/forgot-password"
              className="-mt-2 text-right text-sm font-bold text-coral hover:underline"
            >
              <Lock className="mr-1 inline h-3.5 w-3.5" />
              Forgot password?
            </Link>
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
              {!isOwnerPortal || !isIdInput ? (
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
              ) : null}
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

        {!adminOtpMode && !secondOtpMode && mode === "login" && loginOtpSent ? (
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
              <p>Please check your Inbox first. If you don't receive it within a minute, check your Spam or Promotions folder.</p>
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
            <PhoneInput
              value={phone}
              onChange={setPhone}
              required
              label="Phone"
              showIcon
              labelClassName="text-sm font-black"
              wrapperClassName="grid gap-2"
            />
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
