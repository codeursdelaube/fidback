"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── OTP Input Component (6 boxes) ───────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("").slice(0, 6);
    arr[i] = char;
    // Fill blanks
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next.trimEnd());
    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={`w-12 h-14 text-center text-xl font-black rounded-2xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
            value[i]
              ? "border-indigo-500 bg-indigo-50 text-indigo-900"
              : "border-slate-200 bg-slate-50 text-slate-900"
          } ${disabled ? "opacity-50" : ""}`}
        />
      ))}
    </div>
  );
}

/* ─── Verify OTP Page ──────────────────────────────────────────────────────── */
export default function VerifyOtpPage({
  email,
  redirectTo = "/app",
  otpType = "email",
  onBack,
}: {
  email: string;
  redirectTo?: string;
  otpType?: "email" | "signup";
  onBack?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  /* Countdown for resend */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* Auto-submit when 6 digits entered */
  useEffect(() => {
    if (otp.length === 6 && !loading && !success) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function handleVerify() {
    if (otp.length !== 6) { setError("Entrez les 6 chiffres du code."); return; }
    setError(null);
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: otpType,
      });

      if (verifyError) {
        if (
          verifyError.message.includes("Token has expired") ||
          verifyError.message.includes("expired")
        ) {
          throw new Error("Ce code a expiré. Cliquez sur « Renvoyer le code » pour en recevoir un nouveau.");
        }
        if (
          verifyError.message.includes("Token not found") ||
          verifyError.message.includes("invalid") ||
          verifyError.message.includes("Invalid")
        ) {
          throw new Error("Code incorrect. Vérifiez les 6 chiffres reçus dans votre email.");
        }
        throw new Error(verifyError.message);
      }

      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1200);
    } catch (err: any) {
      setError(err.message || "Code invalide. Réessayez.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendError) throw new Error(resendError.message);
      setResendCooldown(60);
    } catch (err: any) {
      setError("Impossible de renvoyer le code. Réessayez dans quelques instants.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl p-8 shadow-xl space-y-7">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Vérification par code OTP</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Un code à 6 chiffres a été envoyé à<br />
          <span className="font-bold text-slate-800">{email}</span>
        </p>
      </div>

      {/* Success state */}
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-emerald-700">Email vérifié avec succès !</p>
          <p className="text-xs text-slate-500">Redirection en cours...</p>
        </div>
      ) : (
        <>
          {/* Error */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP boxes */}
          <div className="space-y-4">
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <p className="text-center text-[11px] text-slate-400">
              Saisissez le code ou collez-le directement
            </p>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Vérifier et activer mon compte</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-xs text-slate-400">
                Renvoi possible dans{" "}
                <span className="font-bold text-slate-600">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Renvoyer le code OTP</span>
              </button>
            )}
          </div>

          {/* Back */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Corriger mon email</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
